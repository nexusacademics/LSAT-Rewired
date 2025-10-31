/*
  # Create Test History Tracking System

  ## Overview
  This migration creates a comprehensive test history tracking system that records
  every question attempt, section completion, and test completion across all phases
  (timed, blind review, and strategy review). This enables detailed performance
  analytics and historical review capabilities.

  ## New Tables

  ### 1. question_attempts
  Records every individual question attempt with complete metadata
  - `id` (uuid, primary key) - Unique identifier for the attempt
  - `user_id` (uuid, foreign key to auth.users) - User who made the attempt
  - `session_id` (varchar) - Links to the TestSession.id from localStorage
  - `question_id` (varchar) - Question identifier from test data
  - `test_id` (varchar) - Test identifier (e.g., "LSAC114")
  - `test_name` (varchar) - Display name of test (e.g., "PrepTest 114")
  - `section_id` (varchar) - Section identifier
  - `section_name` (varchar) - Section display name
  - `section_order` (integer) - Section number (1-4)
  - `question_order` (integer) - Question number within section
  - `question_type` (varchar) - LSAT question type (Must Be True, Flaw, etc.)
  - `attempt_timestamp` (timestamptz) - When the attempt was made
  - `phase` (varchar) - Phase during attempt: timed, blind-review, or strategy-review
  - `selected_answer_index` (integer) - Index of answer selected (0-4)
  - `correct_answer_index` (integer) - Index of correct answer
  - `is_correct` (boolean) - Whether answer was correct
  - `time_spent_seconds` (integer) - Time spent on this question
  - `has_circuit` (boolean) - Whether a circuit diagram was created
  - `circuit_quality_score` (integer) - Quality score if circuit exists (0-100)
  - `was_flagged` (boolean) - Whether question was flagged for review
  - `notes` (text) - User notes/analysis for this question
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. section_completions
  Aggregates section-level performance data
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key to auth.users) - User who completed section
  - `session_id` (varchar) - Links to TestSession.id
  - `test_id` (varchar) - Test identifier
  - `test_name` (varchar) - Test display name
  - `section_id` (varchar) - Section identifier
  - `section_name` (varchar) - Section display name
  - `section_order` (integer) - Section number
  - `section_type` (varchar) - LR or RC
  - `completion_timestamp` (timestamptz) - When section was completed
  - `phase` (varchar) - Phase completed: timed, blind-review, or strategy-review
  - `total_questions` (integer) - Total questions in section
  - `questions_answered` (integer) - Number of questions answered
  - `questions_correct` (integer) - Number answered correctly
  - `accuracy_percentage` (decimal) - Percentage correct
  - `total_time_seconds` (integer) - Total time for section
  - `average_time_per_question` (decimal) - Average seconds per question
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. test_completions
  Tracks full test or partial test session completions
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key to auth.users) - User who completed test
  - `session_id` (varchar) - Links to TestSession.id
  - `test_id` (varchar) - Test identifier
  - `test_name` (varchar) - Test display name
  - `completion_timestamp` (timestamptz) - When test/session was completed
  - `phase` (varchar) - Phase completed: timed, blind-review, or strategy-review
  - `time_mode` (varchar) - Time mode for timed phase (regular, 1.5x, 2x, custom, untimed)
  - `is_full_test` (boolean) - Whether all 4 sections were completed
  - `sections_completed` (integer) - Number of sections completed
  - `total_questions` (integer) - Total questions across all sections
  - `questions_correct` (integer) - Total correct across all sections
  - `overall_accuracy` (decimal) - Overall percentage correct
  - `total_time_minutes` (integer) - Total time for test in minutes
  - `created_at` (timestamptz) - Record creation timestamp

  ## Indexes
  - Composite indexes on user_id with various fields for efficient queries
  - Indexes on timestamps for chronological sorting
  - Indexes on test_id and section_id for filtering
  - Index on question_type for performance analysis by type

  ## Security
  - RLS enabled on all tables
  - Users can only access their own history data
  - Policies for SELECT, INSERT, UPDATE, and DELETE operations

  ## Important Notes
  - Multiple attempts of the same question are tracked separately with timestamps
  - Each phase (timed, blind-review, strategy-review) creates separate attempt records
  - Section and test completions aggregate data from question attempts
  - session_id links to the localStorage session data structure
*/

-- ============================================================================
-- TABLE: question_attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  question_id VARCHAR(100) NOT NULL,
  test_id VARCHAR(50) NOT NULL,
  test_name VARCHAR(100) NOT NULL,
  section_id VARCHAR(50) NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  section_order INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  question_type VARCHAR(100),
  attempt_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('timed', 'blind-review', 'strategy-review')),
  selected_answer_index INTEGER CHECK (selected_answer_index >= 0 AND selected_answer_index <= 4),
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index <= 4),
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  has_circuit BOOLEAN DEFAULT false,
  circuit_quality_score INTEGER CHECK (circuit_quality_score >= 0 AND circuit_quality_score <= 100),
  was_flagged BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_question_attempts_user
  ON question_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user_test
  ON question_attempts(user_id, test_id);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user_timestamp
  ON question_attempts(user_id, attempt_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user_question
  ON question_attempts(user_id, question_id, phase);

CREATE INDEX IF NOT EXISTS idx_question_attempts_question_type
  ON question_attempts(user_id, question_type, phase);

CREATE INDEX IF NOT EXISTS idx_question_attempts_session
  ON question_attempts(session_id);

-- ============================================================================
-- TABLE: section_completions
-- ============================================================================

CREATE TABLE IF NOT EXISTS section_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  test_id VARCHAR(50) NOT NULL,
  test_name VARCHAR(100) NOT NULL,
  section_id VARCHAR(50) NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  section_order INTEGER NOT NULL,
  section_type VARCHAR(10) CHECK (section_type IN ('LR', 'RC')),
  completion_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('timed', 'blind-review', 'strategy-review')),
  total_questions INTEGER NOT NULL,
  questions_answered INTEGER NOT NULL,
  questions_correct INTEGER NOT NULL,
  accuracy_percentage DECIMAL(5,2) NOT NULL,
  total_time_seconds INTEGER DEFAULT 0,
  average_time_per_question DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_section_completions_user
  ON section_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_section_completions_user_test
  ON section_completions(user_id, test_id);

CREATE INDEX IF NOT EXISTS idx_section_completions_user_timestamp
  ON section_completions(user_id, completion_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_section_completions_session
  ON section_completions(session_id);

CREATE INDEX IF NOT EXISTS idx_section_completions_section_type
  ON section_completions(user_id, section_type, phase);

-- ============================================================================
-- TABLE: test_completions
-- ============================================================================

CREATE TABLE IF NOT EXISTS test_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  test_id VARCHAR(50) NOT NULL,
  test_name VARCHAR(100) NOT NULL,
  completion_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('timed', 'blind-review', 'strategy-review')),
  time_mode VARCHAR(20) CHECK (time_mode IN ('regular', '1.5x', '2x', 'custom', 'untimed')),
  is_full_test BOOLEAN DEFAULT false,
  sections_completed INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_correct INTEGER NOT NULL,
  overall_accuracy DECIMAL(5,2) NOT NULL,
  total_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_test_completions_user
  ON test_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_test_completions_user_test
  ON test_completions(user_id, test_id);

CREATE INDEX IF NOT EXISTS idx_test_completions_user_timestamp
  ON test_completions(user_id, completion_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_test_completions_session
  ON test_completions(session_id);

CREATE INDEX IF NOT EXISTS idx_test_completions_phase
  ON test_completions(user_id, phase);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_completions ENABLE ROW LEVEL SECURITY;

-- question_attempts: Users can only see/modify their own attempts
DROP POLICY IF EXISTS "Users can view their own question attempts" ON question_attempts;
CREATE POLICY "Users can view their own question attempts"
  ON question_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own question attempts" ON question_attempts;
CREATE POLICY "Users can insert their own question attempts"
  ON question_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own question attempts" ON question_attempts;
CREATE POLICY "Users can update their own question attempts"
  ON question_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own question attempts" ON question_attempts;
CREATE POLICY "Users can delete their own question attempts"
  ON question_attempts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- section_completions: Users can only see/modify their own completions
DROP POLICY IF EXISTS "Users can view their own section completions" ON section_completions;
CREATE POLICY "Users can view their own section completions"
  ON section_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own section completions" ON section_completions;
CREATE POLICY "Users can insert their own section completions"
  ON section_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own section completions" ON section_completions;
CREATE POLICY "Users can update their own section completions"
  ON section_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own section completions" ON section_completions;
CREATE POLICY "Users can delete their own section completions"
  ON section_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- test_completions: Users can only see/modify their own completions
DROP POLICY IF EXISTS "Users can view their own test completions" ON test_completions;
CREATE POLICY "Users can view their own test completions"
  ON test_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own test completions" ON test_completions;
CREATE POLICY "Users can insert their own test completions"
  ON test_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own test completions" ON test_completions;
CREATE POLICY "Users can update their own test completions"
  ON test_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own test completions" ON test_completions;
CREATE POLICY "Users can delete their own test completions"
  ON test_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
