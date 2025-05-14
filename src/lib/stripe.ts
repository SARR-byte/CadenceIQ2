import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with improved error handling and logging
async function initializeStripe(retries = 3, delay = 2000) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripeKey) {
    throw new Error('Missing Stripe publishable key. Please check your environment variables.');
  }

  if (!stripeKey.startsWith('pk_')) {
    throw new Error('Invalid Stripe publishable key format. Key must start with "pk_".');
  }

  // Check if we can reach Stripe's CDN
  try {
    const response = await fetch('https://js.stripe.com/v3/');
    if (!response.ok) {
      throw new Error(`Unable to reach Stripe CDN: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error('Network error: Unable to load Stripe resources. Please check your internet connection.');
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to initialize Stripe (attempt ${attempt}/${retries})`);
      const stripe = await loadStripe(stripeKey);
      
      if (!stripe) {
        throw new Error('Stripe initialization returned null');
      }
      
      console.log('Stripe successfully initialized');
      return stripe;
    } catch (error) {
      lastError = error;
      console.warn(`Stripe initialization attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        console.error('All Stripe initialization attempts failed');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
  throw new Error(`Unable to initialize Stripe payment system: ${errorMessage}. Please try refreshing the page. If the issue persists, contact support.`);
}

export async function createCheckoutSession() {
  try {
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
      throw new Error(`Payment system error: ${error.message}`);
    }
    throw new Error('Payment system error. Please try again later.');
  }
}