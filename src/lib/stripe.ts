import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripe: Awaited<ReturnType<typeof loadStripe>> | null = null;

async function initializeStripe() {
  if (stripe) return stripe;

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripePublishableKey) {
    console.error('Stripe publishable key is missing from environment variables');
    throw new Error('Payment system configuration error. Please contact support.');
  }

  try {
    stripe = await loadStripe(stripePublishableKey);
    
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    return stripe;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    throw new Error('Payment system is currently unavailable. Please try again later.');
  }
}

export async function createCheckoutSession() {
  await initializeStripe();

  try {
    const { data: { session_url }, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { mode: 'payment', amount: 995 }
      }
    );

    if (error) throw error;
    return session_url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Unable to start checkout process. Please try again later.');
  }
}