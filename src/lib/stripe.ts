import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripe: Awaited<ReturnType<typeof loadStripe>> | null = null;
let stripeLoadAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function initializeStripe() {
  if (stripe) return stripe;

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripePublishableKey) {
    console.error('Stripe publishable key is missing from environment variables');
    throw new Error('Payment system configuration error: Missing Stripe key');
  }

  try {
    console.log('Loading Stripe.js with key:', stripePublishableKey.substring(0, 8) + '...');
    stripe = await loadStripe(stripePublishableKey);
    
    if (stripe) {
      console.log('Stripe.js loaded successfully');
      return stripe;
    }
    
    throw new Error('Failed to initialize Stripe (stripe instance is null)');
  } catch (error) {
    console.error('Stripe initialization error:', error);
    throw new Error(`Payment system initialization failed: ${error.message}`);
  }
}

export async function createCheckoutSession() {
  try {
    // Initialize Stripe first
    const stripeInstance = await initializeStripe();

    // Make sure we have a valid Stripe instance before proceeding
    if (!stripeInstance) {
      throw new Error('Stripe failed to initialize properly');
    }

    console.log('Creating checkout session...');
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { mode: 'payment', amount: 995 }
      }
    );

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Checkout session creation failed: ${error.message}`);
    }

    if (!data?.session_url) {
      throw new Error('Invalid response: Missing checkout session URL');
    }

    console.log('Checkout session created successfully');
    return data.session_url;
  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('configuration')) {
      throw new Error('Payment system configuration error. Please contact support.');
    } else if (error.message.includes('Stripe.js')) {
      throw new Error('Payment system failed to load. Please refresh the page and try again.');
    } else if (error.message.includes('checkout session')) {
      throw new Error('Unable to start checkout process. Please try again in a few moments.');
    }
    
    throw new Error('Payment system error. Please try again later.');
  }
}