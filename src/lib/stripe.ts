import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with improved error handling and logging
async function initializeStripe(retries = 3, delay = 2000) {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripeKey) {
    console.error('Stripe initialization failed: Missing publishable key');
    throw new Error('Stripe configuration error: Missing publishable key. Please check your environment variables.');
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
      console.error(`Stripe initialization attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        console.error('All Stripe initialization attempts failed');
        break;
      }
      
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt)); // Exponential backoff
    }
  }

  throw new Error(`Failed to initialize Stripe after ${retries} attempts. ${lastError?.message || ''}`);
}

export async function createCheckoutSession() {
  try {
    // Initialize Stripe with retries
    const stripe = await initializeStripe();
    
    if (!stripe) {
      throw new Error('Stripe initialization failed');
    }

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