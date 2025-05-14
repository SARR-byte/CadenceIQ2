import { createClient } from 'npm:@supabase/supabase-js@2.39.1';

export const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);