import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

let stripe: Awaited<ReturnType<typeof loadStripe>> | null = null;

// Initialize stripe with better error handling
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

export async function createCheckoutSession(user: User, priceId: string) {
  // Ensure Stripe is initialized before creating checkout session
  await initializeStripe();

  try {
    const { data: { session_url }, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { price_id: priceId },
      }
    );

    if (error) throw error;
    return session_url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Unable to start checkout process. Please try again later.');
  }
}

export async function createCustomerPortalSession(user: User) {
  // Ensure Stripe is initialized before creating portal session
  await initializeStripe();

  try {
    const { data: { portal_url }, error } = await supabase.functions.invoke(
      'create-portal-session'
    );

    if (error) throw error;
    return portal_url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Unable to access customer portal. Please try again later.');
  }
}

export async function handleSubscriptionChange(
  user: User,
  subscription: any
) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_tier: subscription.items.data[0].price.nickname,
      })
      .eq('id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription status. Please contact support.');
  }
}