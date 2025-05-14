import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripePromise: Promise<any> | null = null;

// Initialize Stripe with singleton pattern and proper error handling
async function getStripe() {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!stripeKey || stripeKey.trim() === '') {
      throw new Error('Stripe publishable key is missing or empty. Please check your .env file.');
    }

    try {
      stripePromise = loadStripe(stripeKey);
    } catch (error) {
      stripePromise = null; // Reset for retry
      throw new Error(`Failed to initialize Stripe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      stripePromise = null; // Reset for retry
      throw new Error('Failed to load Stripe - stripe instance is null');
    }
    return stripe;
  } catch (error) {
    stripePromise = null; // Reset for retry
    throw new Error(`Failed to load Stripe: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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