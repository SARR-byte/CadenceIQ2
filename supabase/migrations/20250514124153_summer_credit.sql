/*
  # API request tracking and rate limiting
  
  1. New Tables
    - `api_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to users table
      - `service` (text) - API service used (openai/stripe)
      - `endpoint` (text) - Specific API endpoint called
      - `status_code` (integer) - Response status code
      - `created_at` (timestamptz) - Request timestamp
      - `request_duration_ms` (integer) - API call duration
      
  2. Security
    - Enable RLS on api_requests table
    - Add policies for users to read their own requests
    - Add policy for service role to manage all records
*/

CREATE TABLE IF NOT EXISTS api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  service text NOT NULL CHECK (service IN ('openai', 'stripe')),
  endpoint text NOT NULL,
  status_code integer,
  created_at timestamptz DEFAULT now(),
  request_duration_ms integer,
  
  -- Index for efficient querying of recent requests (rate limiting)
  CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)
);

CREATE INDEX api_requests_user_service_idx ON api_requests (user_id, service, created_at DESC);

ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own requests
CREATE POLICY "Users can read own requests"
  ON api_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role has full access to requests"
  ON api_requests
  TO service_role
  USING (true)
  WITH CHECK (true);