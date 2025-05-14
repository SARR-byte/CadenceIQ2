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

    if (!mode || !amount) {
      throw new Error('Missing required parameters');
    }

    // Generate access token
    const token = createHash('sha256')
      .update(crypto.randomUUID() + Date.now().toString())
      .toString('hex')
      .slice(0, 32);

    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Missing origin header');
    }

    // Create Stripe checkout session
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
      success_url: `${origin}/access/${token}`,
      cancel_url: `${origin}/payment`,
    });

    // Store access token
    await supabase
      .from('access_tokens')
      .insert([{ token }]);

    return new Response(
      JSON.stringify({ session_url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});