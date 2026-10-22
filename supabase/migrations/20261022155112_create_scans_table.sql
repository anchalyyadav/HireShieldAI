/*
# Create scans table

1. New Tables
- `scans` — stores results of job/internship message scam analyses
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `message_text` (text, not null) — the original message pasted by the user
  - `risk_level` (text, not null, CHECK in 'low','medium','high') — overall risk classification
  - `risk_score` (int, not null, CHECK 0-100) — numeric risk score
  - `risk_label` (text) — human-readable label like "HIGH", "MEDIUM", "LOW"
  - `summary` (text) — AI-generated summary of findings
  - `red_flags` (jsonb, default '[]') — array of detected warning signs
  - `recommendations` (jsonb, default '[]') — array of safety recommendations
  - `is_preview` (boolean, default false) — true if analysis ran in preview mode (no AI key)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `scans`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated` only (app requires sign-in).
- Owner-scoped CRUD: each authenticated user can only access their own scans.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the WITH CHECK.

3. Indexes
- `idx_scans_user_created` on (user_id, created_at DESC) for fast "recent scans" queries.
*/
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score int NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_label text,
  summary text,
  red_flags jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON scans TO authenticated;

DROP POLICY IF EXISTS "select_own_scans" ON scans;
CREATE POLICY "select_own_scans" ON scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scans" ON scans;
CREATE POLICY "insert_own_scans" ON scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_scans" ON scans;
CREATE POLICY "update_own_scans" ON scans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_scans" ON scans;
CREATE POLICY "delete_own_scans" ON scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scans_user_created ON scans (user_id, created_at DESC);
