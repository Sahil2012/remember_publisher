import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { stripe } from "../utils/stripe.js";
import prisma from "../api/prismaClient.js";
import { InternalServerError, NotFoundError, BadRequestError } from "../exception/HttpError.js";
import { ErrorCode } from "../exception/errorCodes.js";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export const createCheckoutSessionHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND));
        }

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            return next(new InternalServerError("Stripe price ID is not configured.", ErrorCode.INTERNAL_SERVER_ERROR));
        }

        let customerId = user.stripeCustomerId;

        // Create Stripe Customer if one does not exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await prisma.appUser.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${req.headers.origin || "http://localhost:3000"}/billing?success=true`,
            cancel_url: `${req.headers.origin || "http://localhost:3000"}/billing?canceled=true`,
            client_reference_id: user.id,
        });

        res.status(200).json({ url: session.url });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};

export const createPortalSessionHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user || !user.stripeCustomerId) {
            return next(new BadRequestError("No active Stripe customer found for this user.", ErrorCode.BAD_REQUEST));
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${req.headers.origin || "http://localhost:3000"}/billing`,
        });

        res.status(200).json({ url: portalSession.url });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};

export const stripeWebhookHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const signature = req.headers["stripe-signature"] as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body, // This MUST be the raw body (Buffer)
            signature,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook signature verification failed:`, error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const userId = session.client_reference_id;
                
                if (userId) {
                    const subscriptionId = session.subscription as string;
                    
                    // Retrieve subscription to get current_period_end
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    
                    await prisma.appUser.update({
                        where: { id: userId },
                        data: {
                            isSubscribed: true,
                            stripeSubscriptionId: subscriptionId,
                            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        },
                    });

                    // Log transaction
                    await prisma.transaction.create({
                        data: {
                            userId: userId,
                            stripeEventId: event.id,
                            amount: session.amount_total ? session.amount_total / 100 : 0,
                            currency: session.currency || "aud",
                            status: session.payment_status,
                            type: 'checkout.session.completed',
                        }
                    });
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;
                
                if (subscriptionId) {
                    const user = await prisma.appUser.findUnique({
                        where: { stripeSubscriptionId: subscriptionId }
                    });

                    if (user) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                        await prisma.appUser.update({
                            where: { id: user.id },
                            data: {
                                isSubscribed: true,
                                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            },
                        });

                        await prisma.transaction.create({
                            data: {
                                userId: user.id,
                                stripeEventId: event.id,
                                amount: invoice.amount_paid / 100,
                                currency: invoice.currency,
                                status: invoice.status || "succeeded",
                                type: 'invoice.payment_succeeded',
                            }
                        });
                    }
                }
                break;
            }
            case 'customer.subscription.deleted':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                
                const user = await prisma.appUser.findUnique({
                    where: { stripeSubscriptionId: subscription.id }
                });

                if (user) {
                    await prisma.appUser.update({
                        where: { id: user.id },
                        data: {
                            isSubscribed: subscription.status === 'active' || subscription.status === 'trialing',
                            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            stripePriceId: subscription.items.data[0]?.price.id,
                        },
                    });
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send({ received: true });
    } catch (error: any) {
        console.error('Error handling webhook event:', error);
        res.status(500).send('Internal Server Error');
    }
};

export const syncSubscriptionHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND));
        }

        if (!user.stripeCustomerId) {
            return res.status(200).json({ isSubscribed: false });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'all',
            limit: 1,
        });

        if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const isSubscribed = subscription.status === 'active' || subscription.status === 'trialing';

            await prisma.appUser.update({
                where: { id: user.id },
                data: {
                    isSubscribed,
                    stripeSubscriptionId: subscription.id,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    stripePriceId: subscription.items.data[0]?.price.id,
                },
            });

            return res.status(200).json({ isSubscribed });
        }

        return res.status(200).json({ isSubscribed: false });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};
