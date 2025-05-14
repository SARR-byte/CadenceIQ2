import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripePromise: Promise<any> | null = null;

// Initialize Stripe with singleton pattern and proper error handling
async function getStripe() {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!stripeKey) {
      throw new Error('Missing Stripe publishable key');
    }

    stripePromise = loadStripe(stripeKey);
  }
  
  const stripe = await stripePromise;
  if (!stripe) {
    stripePromise = null; // Reset for retry
    throw new Error('Failed to load Stripe');
  }
  
  return stripe;
}

export async function createCheckoutSession() {
  try {
    const stripe = await getStripe();

    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { 
          mode: 'payment',
          amount: 995 // $9.95 in cents
        }
      }
    );

    if (error) {
      throw error;
    }
    
    if (!data?.session_url) {
      throw new Error('Invalid response from payment service');
    }

    return data.session_url;
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Payment system error'
    );
  }
}