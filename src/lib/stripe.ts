import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with retries
async function initializeStripe(retries = 3, delay = 1000) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey) {
    throw new Error('Stripe publishable key is missing. Please check your environment variables.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const stripe = await loadStripe(stripeKey);
      if (!stripe) throw new Error('Failed to initialize Stripe');
      return stripe;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function createCheckoutSession() {
  try {
    // Initialize Stripe with retries
    await initializeStripe();

    // Create checkout session via Supabase Edge Function
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { 
          mode: 'payment',
          amount: 995 // $9.95 in cents
        }
      }
    );

    if (error) throw error;
    if (!data?.session_url) {
      throw new Error('Invalid response: Missing checkout session URL');
    }

    return data.session_url;
  } catch (error) {
    console.error('Payment error:', error);
    if (error instanceof Error) {
      throw new Error(`Payment system error: ${error.message}`);
    }
    throw new Error('Payment system error. Please try again later.');
  }
}