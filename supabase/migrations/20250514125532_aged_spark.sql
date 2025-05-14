/*
  # Create secrets table and policies

  1. New Tables
    - `secrets`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `secrets` table
    - Add policy for service role to manage secrets
    - Add policy for authenticated users to read specific secrets
*/

CREATE TABLE IF NOT EXISTS secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Only service role can manage secrets
CREATE POLICY "Service role can manage secrets"
  ON secrets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only read specific secrets
CREATE POLICY "Users can read allowed secrets"
  ON secrets
  FOR SELECT
  TO authenticated
  USING (key = 'OPENAI_API_KEY');

-- Update updated_at on changes
CREATE TRIGGER update_secrets_updated_at
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();