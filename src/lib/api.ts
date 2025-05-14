import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface APIRequestLog {
  service: 'openai' | 'stripe';
  endpoint: string;
  statusCode: number;
  durationMs: number;
}

export async function logAPIRequest(
  user: User,
  request: APIRequestLog
): Promise<void> {
  const { error } = await supabase
    .from('api_requests')
    .insert({
      user_id: user.id,
      service: request.service,
      endpoint: request.endpoint,
      status_code: request.statusCode,
      request_duration_ms: request.durationMs,
    });

  if (error) {
    console.error('Error logging API request:', error);
    throw error;
  }
}

export async function checkRateLimit(
  user: User,
  service: 'openai' | 'stripe'
): Promise<boolean> {
  const timeWindow = new Date();
  timeWindow.setMinutes(timeWindow.getMinutes() - 1);

  const { count, error } = await supabase
    .from('api_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('service', service)
    .gte('created_at', timeWindow.toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    throw error;
  }

  // Rate limits: OpenAI - 60 requests/minute, Stripe - 100 requests/minute
  const limit = service === 'openai' ? 60 : 100;
  return (count || 0) < limit;
}

export async function getUserSubscriptionTier(user: User): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription tier:', error);
    throw error;
  }

  return data.subscription_tier;
}