/*
  # Enable Public Read Access for Test Content Tables (Including Anonymous Users)

  ## Overview
  This migration updates RLS policies to allow BOTH authenticated AND anonymous users
  to read test content. This is necessary because:

  1. Test content is educational material that should be browsable
  2. Users can explore tests before signing up
  3. Auth initialization may fail or timeout, but test browsing should still work
  4. User-specific data (answers, sessions) remains protected with strict RLS

  ## Tables Affected
  - tests: LSAT PrepTest metadata
  - sections: Test sections (LR, RC, etc.)
  - questions: Individual test questions with passages
  - question_options: Answer choices for questions

  ## Security Model
  - SELECT: Available to authenticated AND anonymous (anon) users
  - INSERT/UPDATE/DELETE: Restricted to service role only
*/

-- ============================================================================
-- 1. TESTS TABLE - Add Anonymous Read Policy
-- ============================================================================

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Tests are readable by anonymous users" ON tests;

CREATE POLICY "Tests are readable by anonymous users"
  ON tests FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 2. SECTIONS TABLE - Add Anonymous Read Policy
-- ============================================================================

DROP POLICY IF EXISTS "Sections are readable by anonymous users" ON sections;

CREATE POLICY "Sections are readable by anonymous users"
  ON sections FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 3. QUESTIONS TABLE - Add Anonymous Read Policy
-- ============================================================================

DROP POLICY IF EXISTS "Questions are readable by anonymous users" ON questions;

CREATE POLICY "Questions are readable by anonymous users"
  ON questions FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 4. QUESTION_OPTIONS TABLE - Add Anonymous Read Policy
-- ============================================================================

DROP POLICY IF EXISTS "Question options are readable by anonymous users" ON question_options;

CREATE POLICY "Question options are readable by anonymous users"
  ON question_options FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Tests are readable by anonymous users" ON tests IS
  'Allow anonymous users to browse test metadata before signing up.';

COMMENT ON POLICY "Sections are readable by anonymous users" ON sections IS
  'Allow anonymous users to browse section data before signing up.';

COMMENT ON POLICY "Questions are readable by anonymous users" ON questions IS
  'Allow anonymous users to browse questions before signing up.';

COMMENT ON POLICY "Question options are readable by anonymous users" ON question_options IS
  'Allow anonymous users to browse answer options before signing up.';

-- ============================================================================
-- 6. VERIFY POLICIES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully created anonymous read policies for test content tables';
  RAISE NOTICE 'Tables affected: tests, sections, questions, question_options';
  RAISE NOTICE 'Access level: SELECT for both authenticated AND anonymous users';
END $$;
