import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with improved error handling and exponential backoff
async function initializeStripe(maxRetries = 3) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
  
  if (!stripeKey) {
    throw new Error('Missing Stripe publishable key. Please check your environment variables.');
  }

  if (!stripeKey.startsWith('pk_')) {
    throw new Error('Invalid Stripe publishable key format. Key must start with "pk_".');
  }

  let attempt = 0;
  const maxDelay = 8000; // Maximum delay of 8 seconds

  while (attempt < maxRetries) {
    try {
      // Exponential backoff delay
      if (attempt > 0) {
        const delay = Math.min(Math.pow(2, attempt) * 1000, maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Stripe initialization returned null');
      }
      
      console.log('Stripe successfully initialized');
      return stripe;
    } catch (error) {
      attempt++;
      console.warn(`Stripe initialization attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(
          error instanceof Error 
            ? `Failed to load Stripe.js: ${error.message}` 
            : 'Failed to load Stripe.js'
        );
      }
    }
  }

  throw new Error('Unable to initialize Stripe after maximum retries');
}

export async function createCheckoutSession() {
  try {
    // Pre-check environment variable
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Stripe publishable key is not configured');
    }

    const stripe = await initializeStripe();
    
    if (!stripe) {
      throw new Error('Stripe initialization failed');
    }

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
      console.error('Checkout session creation failed:', error);
      throw error;
    }
    
    if (!data?.session_url) {
      throw new Error('Invalid response: Missing checkout session URL');
    }

    return data.session_url;
  } catch (error) {
    console.error('Payment error:', error);
    if (error instanceof Error) {
      // Provide more specific error messages based on the error type
      const message = error.message.includes('publishable key')
        ? 'Payment system configuration error. Please contact support.'
        : error.message.includes('Stripe.js')
        ? 'Unable to load payment system. Please check your internet connection and try again.'
        : `Payment system error: ${error.message}`;
      throw new Error(message);
    }
    throw new Error('Payment system error. Please try again later.');
  }
}