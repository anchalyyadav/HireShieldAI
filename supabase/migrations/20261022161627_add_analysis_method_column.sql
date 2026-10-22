/*
# Add analysis_method column to scans table

1. Modified Tables
- `scans` — added `analysis_method` column (text, nullable)
  - Stores which analysis engine produced the result: 'ai', 'rule-based', 'preview', or 'auto'
  - Nullable so existing rows (if any) are not affected
  - No CHECK constraint to keep it flexible for future methods

2. Security
- No RLS or policy changes — existing policies already cover the new column via table-level grants
*/
ALTER TABLE scans ADD COLUMN IF NOT EXISTS analysis_method text;
