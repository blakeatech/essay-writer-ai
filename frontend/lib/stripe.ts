import Stripe from 'stripe';

if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_KEY is not set');
}

export const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY!, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
  typescript: true,
});