/*
  # Initial schema setup for users and integrations
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to Supabase Auth user
      - `stripe_customer_id` (text) - Stripe customer reference
      - `subscription_status` (text) - Current subscription state
      - `subscription_tier` (text) - User's subscription level
      - `api_key_hash` (text) - Hashed OpenAI API key
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to read/update their own data
    - Add policy for service role to manage all records
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id text UNIQUE,
  subscription_status text CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'incomplete')),
  subscription_tier text CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  api_key_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON users
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();