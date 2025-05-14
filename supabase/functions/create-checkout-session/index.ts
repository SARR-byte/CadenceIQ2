import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { stripe } from '../_shared/stripe.ts';
import { supabase } from '../_shared/supabase.ts';
import { createHash } from 'https://deno.land/std@0.196.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mode, amount } = await req.json();

    // Generate a unique access token
    const token = createHash('sha256')
      .update(crypto.randomUUID() + Date.now().toString())
      .toString('hex')
      .slice(0, 32);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CadenceIQ - Contact Management',
              description: 'One-time purchase for lifetime access',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.get('origin')}/access/${token}`,
      cancel_url: `${req.headers.get('origin')}/payment`,
    });

    // Store the access token
    const { error: tokenError } = await supabase
      .from('access_tokens')
      .insert([{ token }]);

    if (tokenError) throw tokenError;

    return new Response(
      JSON.stringify({ session_url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});