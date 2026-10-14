import Stripe from 'stripe';
import { env } from '../config/env';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : undefined;

export const paymentsEnabled = () => Boolean(stripe);

export async function createPaymentIntent(amountCents: number, orderId: string, email: string) {
  if (!stripe) return undefined;
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    receipt_email: email,
    automatic_payment_methods: { enabled: true },
    metadata: { orderId },
  });
}

export async function isPaymentSucceeded(paymentIntentId: string): Promise<boolean> {
  if (!stripe) return false;
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status === 'succeeded';
}
