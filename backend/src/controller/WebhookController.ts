import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../api/prismaClient.js';

export class WebhookController {
    public handleClerkWebhook = async (req: Request, res: Response): Promise<void> => {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            console.error('Missing CLERK_WEBHOOK_SECRET');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        // Get the headers
        const svix_id = req.headers["svix-id"] as string;
        const svix_timestamp = req.headers["svix-timestamp"] as string;
        const svix_signature = req.headers["svix-signature"] as string;

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            res.status(400).json({ error: 'Error occured -- no svix headers' });
            return;
        }

        // Get the body
        const body = (req as any).rawBody || req.body;
        // Note: req.body might be an object if parsed by express.json(), but we need raw string/buffer for svix.
        // We will configure the route to pass the raw body.

        const payloadString = body.toString();

        // Create a new Svix instance with your secret.
        const wh = new Webhook(WEBHOOK_SECRET);

        let evt: any;

        // Attempt to verify the incoming webhook
        // If successful, the payload will be available from 'evt'
        // If the verification fails, error out and  return error code
        try {
            evt = wh.verify(payloadString, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err: any) {
            console.log('Error verifying webhook:', err.message);
            res.status(400).json({
                success: false,
                message: err.message
            });
            return;
        }

        const { id } = evt.data;
        const eventType = evt.type;

        // console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
        // console.log('Webhook body:', evt.data);

        if (eventType === 'user.created' || eventType === 'user.updated') {
            const { id: authUserId, email_addresses, first_name, last_name, image_url } = evt.data;

            const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id)?.email_address || email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            try {
                await prisma.appUser.upsert({
                    where: { authUserId: authUserId },
                    update: {
                        email: primaryEmail,
                        name: name,
                        profileImage: image_url,
                    },
                    create: {
                        authUserId: authUserId,
                        email: primaryEmail,
                        name: name,
                        profileImage: image_url,
                        credits: 10 // explicit default though schema has it
                    }
                });
                // console.log(`User ${authUserId} upserted successfully`);
            } catch (error) {
                console.error('Error upserting user:', error);
                res.status(500).json({
                    success: false,
                    message: "Database error"
                });
                return;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Webhook received'
        });
    }
}
