import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripePromise: Promise<any> | null = null;

// Initialize Stripe with singleton pattern to prevent multiple initializations
function getStripe() {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
    
    if (!stripeKey) {
      throw new Error('Missing Stripe publishable key. Please check your environment variables.');
    }

    if (!stripeKey.startsWith('pk_')) {
      throw new Error('Invalid Stripe publishable key format. Key must start with "pk_".');
    }

    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
}

export async function createCheckoutSession() {
  try {
    const stripe = await getStripe();
    
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