/*
  # Enable Public Read Access for Test Content Tables

  ## Overview
  This migration ensures that all test content (tests, sections, questions, question_options)
  is readable by authenticated users. This is necessary because:

  1. Test content is educational material that all users should access
  2. User-specific data (answers, sessions, notes) is stored separately with strict RLS
  3. Test content is read-only for users (only admins can modify via service role)

  ## Tables Affected
  - tests: LSAT PrepTest metadata
  - sections: Test sections (LR, RC, etc.)
  - questions: Individual test questions with passages
  - question_options: Answer choices for questions

  ## Security Model
  - SELECT: Available to all authenticated users
  - INSERT/UPDATE/DELETE: Restricted to service role only (managed separately)
  - Row Level Security: Enabled but permissive for reads
*/

-- ============================================================================
-- 1. TESTS TABLE - Enable RLS and Add Public Read Policy
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Tests are readable by authenticated users" ON tests;
DROP POLICY IF EXISTS "Tests are readable by all users" ON tests;

-- Create policy allowing all authenticated users to read tests
CREATE POLICY "Tests are readable by authenticated users"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Also allow anon users to browse tests (uncomment if needed)
-- CREATE POLICY "Tests are readable by anonymous users"
--   ON tests FOR SELECT
--   TO anon
--   USING (true);

-- ============================================================================
-- 2. SECTIONS TABLE - Enable RLS and Add Public Read Policy
-- ============================================================================

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sections are readable by authenticated users" ON sections;
DROP POLICY IF EXISTS "Sections are readable by all users" ON sections;

CREATE POLICY "Sections are readable by authenticated users"
  ON sections FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 3. QUESTIONS TABLE - Enable RLS and Add Public Read Policy
-- ============================================================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Questions are readable by all users" ON questions;

CREATE POLICY "Questions are readable by authenticated users"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 4. QUESTION_OPTIONS TABLE - Enable RLS and Add Public Read Policy
-- ============================================================================

ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Question options are readable by authenticated users" ON question_options;
DROP POLICY IF EXISTS "Question options are readable by all users" ON question_options;

CREATE POLICY "Question options are readable by authenticated users"
  ON question_options FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Tests are readable by authenticated users" ON tests IS
  'Allow all authenticated users to read test metadata. Test content is educational material.';

COMMENT ON POLICY "Sections are readable by authenticated users" ON sections IS
  'Allow all authenticated users to read section data. Sections belong to tests and are educational content.';

COMMENT ON POLICY "Questions are readable by authenticated users" ON questions IS
  'Allow all authenticated users to read questions. Questions are educational content.';

COMMENT ON POLICY "Question options are readable by authenticated users" ON question_options IS
  'Allow all authenticated users to read answer options. These are part of educational content.';

-- ============================================================================
-- 6. VERIFY POLICIES
-- ============================================================================

-- Log successful policy creation
DO $$
BEGIN
  RAISE NOTICE 'Successfully created public read policies for test content tables';
  RAISE NOTICE 'Tables affected: tests, sections, questions, question_options';
  RAISE NOTICE 'Access level: SELECT for authenticated users';
END $$;
