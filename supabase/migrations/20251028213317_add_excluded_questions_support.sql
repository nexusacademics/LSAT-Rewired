/*
  # Add Support for Excluded Questions

  1. Changes
    - Adds is_excluded boolean column to questions table
    - Adds excluded_reason text column to questions table
    - Both default to NULL/false for existing questions

  2. Purpose
    - Some PrepTests have questions removed by LSAC after publication
    - These questions should remain visible but not count toward scoring
    - Example: PrepTest 139, Section 4, Question 19

  3. Security
    - No RLS changes needed - inherits from questions table
*/

-- Add is_excluded column to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT false;

-- Add excluded_reason column to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS excluded_reason TEXT DEFAULT NULL;

-- Create an index for quick filtering of excluded questions
CREATE INDEX IF NOT EXISTS idx_questions_is_excluded
  ON questions(is_excluded)
  WHERE is_excluded = true;

-- Mark PrepTest 139, Section 4, Question 19 as excluded
UPDATE questions
SET 
  is_excluded = true,
  excluded_reason = 'Question removed by LSAC'
WHERE id = '11551225-69f5-45d0-b94c-186566ef56bf'; -- This is question 19 from the query above
