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
    // Add error handling and retry logic for loadStripe
    let retries = 3;
    while (retries > 0) {
      try {
        stripe = await loadStripe(stripePublishableKey);
        if (stripe) break;
      } catch (loadError) {
        console.warn(`Attempt to load Stripe failed. Retries remaining: ${retries - 1}`);
        retries--;
        if (retries === 0) throw loadError;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
      }
    }
    
    if (!stripe) {
      throw new Error('Failed to initialize Stripe after multiple attempts');
    }
    
    return stripe;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    throw new Error('Payment system is currently unavailable. Please try again later.');
  }
}

export async function createCheckoutSession() {
  try {
    // Initialize Stripe first
    await initializeStripe();

    // Make sure we have a valid Stripe instance before proceeding
    if (!stripe) {
      throw new Error('Stripe is not properly initialized');
    }

    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { mode: 'payment', amount: 995 }
      }
    );

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.session_url) {
      throw new Error('Invalid response from checkout session creation');
    }

    return data.session_url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (error.message.includes('configuration')) {
      throw new Error('Payment system configuration error. Please contact support.');
    }
    throw new Error('Unable to start checkout process. Please try again later.');
  }
}