/*
  # Add access tokens table for one-time purchase flow

  1. New Tables
    - `access_tokens`
      - `id` (uuid, primary key)
      - `token` (text, unique)
      - `created_at` (timestamp)
      - `used` (boolean)
      - `last_used` (timestamp)
      
  2. Security
    - Enable RLS on `access_tokens` table
    - Add policy for service role to manage tokens
    - Add policy for public to validate tokens
*/

CREATE TABLE IF NOT EXISTS access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  used boolean DEFAULT false,
  last_used timestamptz
);

ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage tokens"
  ON access_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can validate tokens"
  ON access_tokens
  FOR SELECT
  TO public
  USING (true);