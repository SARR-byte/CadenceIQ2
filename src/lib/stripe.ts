import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(user: User, priceId: string) {
  const { data: { session_url }, error } = await supabase.functions.invoke(
    'create-checkout-session',
    {
      body: { price_id: priceId },
    }
  );

  if (error) throw error;
  return session_url;
}

export async function createCustomerPortalSession(user: User) {
  const { data: { portal_url }, error } = await supabase.functions.invoke(
    'create-portal-session'
  );

  if (error) throw error;
  return portal_url;
}

export async function handleSubscriptionChange(
  user: User,
  subscription: any
) {
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_tier: subscription.items.data[0].price.nickname,
    })
    .eq('id', user.id);

  if (error) throw error;
}