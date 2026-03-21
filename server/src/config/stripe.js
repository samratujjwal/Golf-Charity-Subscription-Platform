import Stripe from 'stripe';
import { ApiError } from '../utils/ApiError.js';

let stripeInstance = null;

export function getStripeClient() {
  if (stripeInstance) {
    return stripeInstance;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ApiError(500, 'STRIPE_SECRET_KEY is not configured');
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeInstance;
}
