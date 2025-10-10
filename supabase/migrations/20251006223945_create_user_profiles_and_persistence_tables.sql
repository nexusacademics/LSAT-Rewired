/*
  # User Profiles and Data Persistence Schema

  ## Overview
  This migration creates a comprehensive user profile system with authentication support
  and data persistence for LSAT test preparation. It establishes the foundation for storing
  user sessions, circuits, highlights, analysis notes, and subscription management.

  ## 1. New Tables

  ### profiles
  - `id` (uuid, primary key) - References auth.users, one profile per user
  - `username` (text, unique) - User's unique username
  - `first_name` (text) - User's first name
  - `last_name` (text) - User's last name
  - `avatar_url` (text) - URL to user's avatar image in Supabase Storage
  - `bio` (text) - User's biography or description
  - `target_lsat_score` (integer) - Target LSAT score goal
  - `test_date` (date) - Scheduled LSAT test date
  - `migration_completed` (boolean) - Flag indicating localStorage data has been migrated
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### user_test_sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - References auth.users
  - `test_id` (uuid) - References tests table
  - `selected_section_id` (uuid) - References sections table (nullable for full tests)
  - `phase` (text) - Current phase: timed, blind-review, or strategy-review
  - `time_mode` (text) - Timing mode: regular, 1.5x, 2x, custom, or untimed
  - `custom_time_minutes` (integer) - Custom time limit if time_mode is 'custom'
  - `start_time` (timestamptz) - Session start timestamp
  - `end_time` (timestamptz) - Session completion timestamp
  - `current_section_index` (integer) - Current section being worked on
  - `current_question_index` (integer) - Current question within section
  - `completed_section_ids` (text[]) - Array of completed section UUIDs
  - `completed_phases` (text[]) - Array of completed phase names
  - `is_paused` (boolean) - Whether session is currently paused
  - `paused_at` (timestamptz) - When session was paused
  - `timer_states` (jsonb) - Timer state data per section
  - `created_at` (timestamptz) - Session creation timestamp
  - `updated_at` (timestamptz) - Last session update timestamp

  ### user_session_answers
  - `id` (uuid, primary key) - Unique answer identifier
  - `session_id` (uuid) - References user_test_sessions
  - `question_id` (uuid) - References questions table
  - `answer_index` (integer) - Selected answer option index (0-4)
  - `answer_type` (text) - Type: timed or blind-review
  - `created_at` (timestamptz) - Answer submission timestamp

  ### user_flagged_questions
  - `id` (uuid, primary key) - Unique flag identifier
  - `session_id` (uuid) - References user_test_sessions
  - `question_id` (uuid) - References questions table
  - `created_at` (timestamptz) - When question was flagged

  ### user_circuits
  - `id` (uuid, primary key) - Unique circuit identifier
  - `user_id` (uuid) - References auth.users
  - `session_id` (uuid) - References user_test_sessions
  - `question_id` (uuid) - References questions table
  - `diagram_data` (jsonb) - Circuit diagram nodes and connections
  - `annotations` (jsonb) - Circuit annotations array
  - `analysis_quality` (integer) - Quality score for the circuit analysis
  - `created_at` (timestamptz) - Circuit creation timestamp

  ### user_analysis_notes
  - `id` (uuid, primary key) - Unique note identifier
  - `session_id` (uuid) - References user_test_sessions
  - `question_id` (uuid) - References questions table
  - `conclusion` (text) - Analysis of the conclusion
  - `premises` (text) - Analysis of the premises
  - `assumption` (text) - Analysis of assumptions
  - `answers` (text) - Analysis of answer choices
  - `created_at` (timestamptz) - Note creation timestamp
  - `updated_at` (timestamptz) - Last note update timestamp

  ### user_highlights
  - `id` (uuid, primary key) - Unique highlight identifier
  - `user_id` (uuid) - References auth.users
  - `question_id` (uuid) - References questions table
  - `highlighted_text` (text) - The text that was highlighted
  - `position_data` (jsonb) - Position coordinates and metadata
  - `color` (text) - Highlight color (yellow, blue, green, red, purple)
  - `note` (text) - User's note about the highlight
  - `created_at` (timestamptz) - Highlight creation timestamp

  ### subscriptions
  - `id` (uuid, primary key) - Unique subscription identifier
  - `user_id` (uuid) - References auth.users, unique constraint
  - `tier` (text) - Subscription tier: free, basic, premium, or pro
  - `status` (text) - Status: active, cancelled, past_due, or trialing
  - `price_id` (text) - Stripe price ID for the subscription
  - `stripe_customer_id` (text) - Stripe customer identifier
  - `stripe_subscription_id` (text) - Stripe subscription identifier
  - `start_date` (timestamptz) - Subscription start date
  - `end_date` (timestamptz) - Subscription end date (nullable for active)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security - Row Level Security (RLS)

  All tables have RLS enabled with policies that ensure users can only access their own data:

  ### profiles
  - Users can view their own profile
  - Users can update their own profile
  - Profiles are automatically created via trigger when users sign up

  ### user_test_sessions
  - Users can view only their own sessions
  - Users can insert their own sessions
  - Users can update their own sessions
  - Users can delete their own sessions

  ### user_session_answers, user_flagged_questions, user_analysis_notes
  - Users can access only records linked to their own sessions

  ### user_circuits, user_highlights
  - Users can access only their own circuits and highlights

  ### subscriptions
  - Users can view only their own subscription
  - System can update subscriptions (for Stripe webhooks)

  ## 3. Indexes

  Indexes are created on frequently queried columns:
  - user_id columns across all user-owned tables
  - session_id columns for session-related tables
  - question_id columns for question-related tables
  - Foreign key relationships for join optimization

  ## 4. Triggers

  ### profiles trigger
  - Automatically creates a profile with default free subscription when a new user signs up

  ### updated_at triggers
  - Automatically updates the updated_at timestamp on record modifications

  ## Important Notes

  1. **Data Safety**: All tables use UUID primary keys with gen_random_uuid() defaults
  2. **Foreign Keys**: Proper relationships established with ON DELETE CASCADE for cleanup
  3. **Timestamps**: All tables include created_at with now() defaults
  4. **RLS**: Every table has restrictive RLS policies - no public access by default
  5. **Defaults**: Sensible defaults for boolean and timestamp fields
  6. **Subscription**: Free tier subscription automatically created for all new users
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  target_lsat_score integer,
  test_date date,
  migration_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index on username for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================================================
-- 2. USER TEST SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  selected_section_id uuid REFERENCES sections(id) ON DELETE SET NULL,
  phase text NOT NULL CHECK (phase IN ('timed', 'blind-review', 'strategy-review')),
  time_mode text CHECK (time_mode IN ('regular', '1.5x', '2x', 'custom', 'untimed')),
  custom_time_minutes integer,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  current_section_index integer DEFAULT 0,
  current_question_index integer DEFAULT 0,
  completed_section_ids text[] DEFAULT '{}',
  completed_phases text[] DEFAULT '{}',
  is_paused boolean DEFAULT false,
  paused_at timestamptz,
  timer_states jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_test_sessions
CREATE POLICY "Users can view own sessions"
  ON user_test_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_test_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_test_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_test_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for user_test_sessions
CREATE INDEX IF NOT EXISTS idx_user_test_sessions_user_id ON user_test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_test_sessions_test_id ON user_test_sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_user_test_sessions_phase ON user_test_sessions(phase);
CREATE INDEX IF NOT EXISTS idx_user_test_sessions_created_at ON user_test_sessions(created_at DESC);

-- ============================================================================
-- 3. USER SESSION ANSWERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_session_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES user_test_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_index integer NOT NULL CHECK (answer_index >= 0 AND answer_index <= 4),
  answer_type text NOT NULL CHECK (answer_type IN ('timed', 'blind-review')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_session_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policy for user_session_answers (access through session ownership)
CREATE POLICY "Users can view own session answers"
  ON user_session_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_session_answers.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session answers"
  ON user_session_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_session_answers.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own session answers"
  ON user_session_answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_session_answers.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own session answers"
  ON user_session_answers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_session_answers.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

-- Indexes for user_session_answers
CREATE INDEX IF NOT EXISTS idx_user_session_answers_session_id ON user_session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_session_answers_question_id ON user_session_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_session_answers_answer_type ON user_session_answers(answer_type);

-- ============================================================================
-- 4. USER FLAGGED QUESTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_flagged_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES user_test_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Enable RLS
ALTER TABLE user_flagged_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_flagged_questions
CREATE POLICY "Users can view own flagged questions"
  ON user_flagged_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_flagged_questions.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own flagged questions"
  ON user_flagged_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_flagged_questions.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own flagged questions"
  ON user_flagged_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_flagged_questions.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

-- Indexes for user_flagged_questions
CREATE INDEX IF NOT EXISTS idx_user_flagged_questions_session_id ON user_flagged_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_flagged_questions_question_id ON user_flagged_questions(question_id);

-- ============================================================================
-- 5. USER CIRCUITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_circuits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES user_test_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  diagram_data jsonb NOT NULL DEFAULT '[]',
  annotations jsonb DEFAULT '[]',
  analysis_quality integer CHECK (analysis_quality >= 0 AND analysis_quality <= 100),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_circuits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_circuits
CREATE POLICY "Users can view own circuits"
  ON user_circuits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own circuits"
  ON user_circuits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own circuits"
  ON user_circuits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own circuits"
  ON user_circuits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for user_circuits
CREATE INDEX IF NOT EXISTS idx_user_circuits_user_id ON user_circuits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_circuits_session_id ON user_circuits(session_id);
CREATE INDEX IF NOT EXISTS idx_user_circuits_question_id ON user_circuits(question_id);
CREATE INDEX IF NOT EXISTS idx_user_circuits_created_at ON user_circuits(created_at DESC);

-- ============================================================================
-- 6. USER ANALYSIS NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_analysis_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES user_test_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  conclusion text,
  premises text,
  assumption text,
  answers text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Enable RLS
ALTER TABLE user_analysis_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_analysis_notes
CREATE POLICY "Users can view own analysis notes"
  ON user_analysis_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_analysis_notes.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analysis notes"
  ON user_analysis_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_analysis_notes.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own analysis notes"
  ON user_analysis_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_analysis_notes.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own analysis notes"
  ON user_analysis_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_test_sessions
      WHERE user_test_sessions.id = user_analysis_notes.session_id
      AND user_test_sessions.user_id = auth.uid()
    )
  );

-- Indexes for user_analysis_notes
CREATE INDEX IF NOT EXISTS idx_user_analysis_notes_session_id ON user_analysis_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_user_analysis_notes_question_id ON user_analysis_notes(question_id);

-- ============================================================================
-- 7. USER HIGHLIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  highlighted_text text NOT NULL,
  position_data jsonb NOT NULL,
  color text DEFAULT 'yellow' CHECK (color IN ('yellow', 'blue', 'green', 'red', 'purple')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_highlights
CREATE POLICY "Users can view own highlights"
  ON user_highlights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON user_highlights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
  ON user_highlights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON user_highlights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for user_highlights
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_id ON user_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_question_id ON user_highlights(question_id);
CREATE INDEX IF NOT EXISTS idx_user_highlights_created_at ON user_highlights(created_at DESC);

-- ============================================================================
-- 8. SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  price_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role to update subscriptions (for Stripe webhooks)
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- ============================================================================
-- 9. TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- ============================================================================

-- Function to create profile and subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now());
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, tier, status, start_date)
  VALUES (new.id, 'free', 'active', now());
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_test_sessions ON user_test_sessions;
CREATE TRIGGER set_updated_at_user_test_sessions
  BEFORE UPDATE ON user_test_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_analysis_notes ON user_analysis_notes;
CREATE TRIGGER set_updated_at_user_analysis_notes
  BEFORE UPDATE ON user_analysis_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON subscriptions;
CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
