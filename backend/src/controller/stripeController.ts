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

        const { plan } = req.body;
        const monthlyPriceId = process.env.STRIPE_PRICE_ID;
        const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;

        let priceId = monthlyPriceId; // Default

        if (plan === 'yearly') {
            priceId = yearlyPriceId;
        } else if (plan === 'monthly') {
            priceId = monthlyPriceId;
        }

        if (!priceId) {
            return next(new InternalServerError("Stripe price ID is not configured.", ErrorCode.INTERNAL_SERVER_ERROR));
        }

        let customerId = user.stripeCustomerId;

        // Validate existing customer ID works in current Stripe mode
        if (customerId) {
            try {
                await stripe.customers.retrieve(customerId);
            } catch {
                console.warn(`⚠️ Stale Stripe customer ID ${customerId} — creating a new live customer.`);
                customerId = null;
                await prisma.appUser.update({ where: { id: user.id }, data: { stripeCustomerId: null } });
            }
        }

        // Create Stripe Customer if one does not exist (or was just cleared)
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
            mode: plan === 'yearly' ? 'payment' : 'subscription',
            allow_promotion_codes: true,
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

    // req.rawBody is captured by the express.json({ verify }) in server.ts.
    // This guarantees the raw, unmodified bytes regardless of any middleware
    // that may parse or transform req.body later in the chain.
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!rawBody) {
        console.error("Stripe webhook: rawBody is missing — body was not captured correctly.");
        return res.status(400).send("Webhook Error: raw body unavailable.");
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
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
                const customerId = session.customer as string;

                console.log(`[Stripe Webhook] Checkout session completed. User: ${userId}, Customer: ${customerId}, Mode: ${session.mode}`);

                if (userId || customerId) {
                    const user = userId 
                        ? await prisma.appUser.findUnique({ where: { id: userId } })
                        : await prisma.appUser.findUnique({ where: { stripeCustomerId: customerId } });

                    if (!user) {
                        console.error(`[Stripe Webhook] User not found for userId: ${userId} or customerId: ${customerId}`);
                        break;
                    }

                    const targetUserId = user.id;

                    if (session.mode === 'subscription') {
                        const subscriptionId = session.subscription as string;
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                        await prisma.appUser.update({
                            where: { id: targetUserId },
                            data: {
                                isSubscribed: true,
                                stripeSubscriptionId: subscriptionId,
                                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                stripePriceId: subscription.items.data[0]?.price.id,
                            },
                        });
                        console.log(`[Stripe Webhook] Subscription fulfilled for user ${targetUserId}`);
                    } else if (session.mode === 'payment') {
                        // For one-time yearly payments, set access for 1 year
                        const oneYearFromNow = new Date();
                        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

                        // Extract price ID from line items if possible, or just use what we know
                        // Since we only have one one-time price currently:
                        const priceId = process.env.STRIPE_YEARLY_PRICE_ID;

                        await prisma.appUser.update({
                            where: { id: targetUserId },
                            data: {
                                isSubscribed: true,
                                stripeCurrentPeriodEnd: oneYearFromNow,
                                stripePriceId: priceId,
                                stripeSubscriptionId: null,
                            },
                        });
                        console.log(`[Stripe Webhook] One-time payment (Yearly) fulfilled for user ${targetUserId}. New Period End: ${oneYearFromNow}`);
                    }

                    // Log transaction
                    await prisma.transaction.create({
                        data: {
                            userId: targetUserId,
                            stripeEventId: event.id,
                            amount: session.amount_total ? session.amount_total / 100 : 0,
                            currency: session.currency || "aud",
                            status: session.payment_status,
                            type: `checkout.session.completed.${session.mode}`,
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

        // No recurring subscription found — check for recent one-time payment sessions
        const sessions = await stripe.checkout.sessions.list({
            customer: user.stripeCustomerId,
            limit: 5,
        });

        const latestPaidSession = sessions.data.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (s: any) => s.mode === 'payment' && s.payment_status === 'paid'
        );

        if (latestPaidSession) {
            console.log(`💰 Sync: One-time payment session found: ${latestPaidSession.id}`);
            const oneYearFromNow = new Date(latestPaidSession.created * 1000);
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

            await prisma.appUser.update({
                where: { id: user.id },
                data: {
                    isSubscribed: true,
                    stripeCurrentPeriodEnd: oneYearFromNow,
                    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID,
                    stripeSubscriptionId: null,
                },
            });

            // Also log the transaction if not already done
            const existingTx = await prisma.transaction.findUnique({
                where: { stripeEventId: latestPaidSession.id },
            });
            if (!existingTx) {
                await prisma.transaction.create({
                    data: {
                        userId: user.id,
                        stripeEventId: latestPaidSession.id,
                        amount: latestPaidSession.amount_total ? latestPaidSession.amount_total / 100 : 0,
                        currency: latestPaidSession.currency || 'aud',
                        status: latestPaidSession.payment_status,
                        type: 'checkout.session.completed.payment',
                    },
                });
            }

            return res.status(200).json({ isSubscribed: true });
        }

        // Fallback: if the database already has a future period end (set by webhook), honour it
        if (user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date()) {
            return res.status(200).json({ isSubscribed: true });
        }


        return res.status(200).json({ isSubscribed: false });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};

export const getSubscriptionDetailsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND));
        }

        // Fetch transaction history
        const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        if (!user.stripeSubscriptionId) {
            // Check for one-time access
            const isCurrentlySubscribed = user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date();

            // Use the earliest transaction as the purchase/member-since date
            const startDate = transactions.length > 0
                ? transactions[transactions.length - 1].createdAt
                : null;

            return res.status(200).json({
                isSubscribed: isCurrentlySubscribed,
                status: isCurrentlySubscribed ? 'active' : 'inactive',
                currentPeriodEnd: user.stripeCurrentPeriodEnd,
                startDate,
                isOneTimePayment: true,
                transactions: transactions.map(t => ({
                    id: t.id,
                    amount: t.amount,
                    currency: t.currency,
                    status: t.status,
                    createdAt: t.createdAt,
                    type: t.type
                })),
            });
        }

        // Fetch latest info from Stripe — guard against stale/test-mode IDs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let subscription: any = null;
        try {
            subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        } catch (stripeErr: any) {
            console.warn(`⚠️ Could not retrieve Stripe subscription ${user.stripeSubscriptionId}: ${stripeErr.message}`);
        }

        if (!subscription) {
            // Subscription ID is invalid (e.g., created in test mode, now running live)
            // Fall back to DB state so billing page still loads
            const isCurrentlySubscribed = user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date();
            const startDate = transactions.length > 0
                ? transactions[transactions.length - 1].createdAt
                : null;

            return res.status(200).json({
                isSubscribed: !!isCurrentlySubscribed,
                status: isCurrentlySubscribed ? 'active' : 'inactive',
                currentPeriodEnd: user.stripeCurrentPeriodEnd,
                startDate,
                isOneTimePayment: false,
                transactions: transactions.map(t => ({
                    id: t.id,
                    amount: t.amount,
                    currency: t.currency,
                    status: t.status,
                    createdAt: t.createdAt,
                    type: t.type
                })),
            });
        }

        return res.status(200).json({
            isSubscribed: user.isSubscribed,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            startDate: new Date(subscription.start_date * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                currency: t.currency,
                status: t.status,
                createdAt: t.createdAt,
                type: t.type
            })),
        });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};

export const cancelSubscriptionHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user || !user.stripeSubscriptionId) {
            return next(new BadRequestError("No active subscription found.", ErrorCode.BAD_REQUEST));
        }

        const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        // Also update our database representation immediately
        await prisma.appUser.update({
            where: { id: user.id },
            data: {
                isSubscribed: subscription.status === 'active' || subscription.status === 'trialing',
                // Webhook will also handle this, but this makes the UI snappy
            },
        });

        res.status(200).json({
            message: "Subscription will be canceled at the end of the current billing period.",
            cancelAtPeriodEnd: true,
        });
    } catch (error: any) {
        next(new InternalServerError(error.message, ErrorCode.INTERNAL_SERVER_ERROR));
    }
};
