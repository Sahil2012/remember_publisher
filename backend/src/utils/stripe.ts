import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing from .env');
}

export const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
});
