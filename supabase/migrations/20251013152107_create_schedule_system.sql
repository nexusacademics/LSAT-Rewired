/*
  # Create Schedule System Tables

  ## Overview
  This migration creates the complete database schema for the LSAT study schedule system,
  including preset schedule templates, user schedule tracking, scheduled items, and milestones.

  ## New Tables
  
  ### 1. schedule_options
  Stores preset schedule templates (3 static options for v1.0)
  - `id` (uuid, primary key)
  - `name` (varchar) - Display name like "Accelerated 12-Week Plan"
  - `description` (text) - Detailed description of the schedule
  - `duration_weeks` (integer) - Total duration in weeks
  - `intensity_level` (varchar) - 'light', 'moderate', or 'intensive'
  - `weekly_hours` (integer) - Expected hours per week
  - `focus_areas` (jsonb) - Array of focus areas like ["LR", "RC"]
  - `curriculum_structure` (jsonb) - JSON structure defining the schedule template
  - `is_active` (boolean) - Whether option is available to users
  - `display_order` (integer) - Sort order for display
  - `created_at`, `updated_at` (timestamptz)

  ### 2. user_schedules
  Tracks which schedule each user has selected and their progress
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users) - User who owns this schedule
  - `schedule_option_id` (uuid, nullable foreign key) - Links to preset template (null for custom)
  - `is_custom_schedule` (boolean) - True for AI-generated schedules
  - `start_date` (date) - When user started this schedule
  - `target_test_date` (date) - User's target LSAT test date
  - `status` (varchar) - 'active', 'paused', 'completed', or 'abandoned'
  - `progress_percentage` (decimal) - Auto-calculated progress (0-100)
  - `created_at`, `updated_at` (timestamptz)
  - UNIQUE constraint: Only one active schedule per user

  ### 3. scheduled_items
  Individual schedule entries (lessons, Triple Review sessions, practice tests, rest days)
  - `id` (uuid, primary key)
  - `user_schedule_id` (uuid, foreign key) - Links to user's schedule
  - `scheduled_date` (date) - When this item is scheduled
  - `item_type` (varchar) - Type: 'lr_curriculum', 'rc_curriculum', 'triple_review_timed', etc.
  - `title` (varchar) - Display title of the item
  - `description` (text) - Detailed description
  - `estimated_hours` (decimal) - Expected time to complete
  - `completed_hours` (decimal) - Actual time spent
  - `status` (varchar) - 'pending', 'in_progress', 'completed', or 'skipped'
  - `preptest_number` (integer) - PrepTest number for test-related items
  - `section_type` (varchar) - 'LR' or 'RC' for section-specific items
  - `section_number` (integer) - 1 or 2 for multi-section types
  - `curriculum_lesson_id` (varchar) - Identifier for curriculum lessons
  - `day_in_sequence` (integer) - Position in overall schedule
  - `completion_date` (timestamptz) - When item was completed
  - `notes` (text) - User notes about this item
  - `created_at`, `updated_at` (timestamptz)

  ### 4. schedule_milestones
  Key achievements and checkpoints in the study schedule
  - `id` (uuid, primary key)
  - `user_schedule_id` (uuid, foreign key) - Links to user's schedule
  - `milestone_date` (date) - Target date for milestone
  - `title` (varchar) - Milestone name
  - `description` (text) - Details about the milestone
  - `milestone_type` (varchar) - Type: 'phase_complete', 'preptest_milestone', etc.
  - `is_achieved` (boolean) - Whether milestone has been reached
  - `achieved_at` (timestamptz) - When milestone was achieved
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - schedule_options: Public read for active options
  - user_schedules: Users can only access their own schedules
  - scheduled_items: Users can only access items from their schedules
  - schedule_milestones: Users can only access milestones from their schedules

  ## Functions
  - Auto-update timestamp trigger for updated_at columns
  - Progress calculation function for user_schedules

  ## Indexes
  - Optimized queries for fetching next scheduled items
  - Fast lookups for user schedules and items by date
  - Efficient filtering by status
*/

-- ============================================================================
-- TABLE: schedule_options
-- ============================================================================

CREATE TABLE IF NOT EXISTS schedule_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  intensity_level VARCHAR(20) NOT NULL CHECK (intensity_level IN ('light', 'moderate', 'intensive')),
  weekly_hours INTEGER NOT NULL,
  focus_areas JSONB DEFAULT '[]'::jsonb,
  curriculum_structure JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_options_active 
  ON schedule_options(is_active, display_order);

-- ============================================================================
-- TABLE: user_schedules
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_option_id UUID REFERENCES schedule_options(id) ON DELETE SET NULL,
  is_custom_schedule BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  target_test_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partial unique index for active schedules (allows multiple non-active)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_schedules_one_active 
  ON user_schedules(user_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_schedules_user 
  ON user_schedules(user_id);

CREATE INDEX IF NOT EXISTS idx_user_schedules_active 
  ON user_schedules(user_id, status) 
  WHERE status = 'active';

-- ============================================================================
-- TABLE: scheduled_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_schedule_id UUID NOT NULL REFERENCES user_schedules(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  item_type VARCHAR(30) NOT NULL CHECK (item_type IN (
    'lr_curriculum', 
    'rc_curriculum', 
    'triple_review_timed', 
    'triple_review_blind', 
    'triple_review_strategy', 
    'full_practice_test',
    'full_practice_test_blind',
    'full_practice_test_strategy',
    'rest_day'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_hours DECIMAL(4,2) NOT NULL,
  completed_hours DECIMAL(4,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  preptest_number INTEGER,
  section_type VARCHAR(10) CHECK (section_type IN ('LR', 'RC', NULL)),
  section_number INTEGER CHECK (section_number IN (1, 2, NULL)),
  curriculum_lesson_id VARCHAR(50),
  day_in_sequence INTEGER,
  completion_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_items_schedule 
  ON scheduled_items(user_schedule_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_items_date 
  ON scheduled_items(user_schedule_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_scheduled_items_status 
  ON scheduled_items(user_schedule_id, status);

CREATE INDEX IF NOT EXISTS idx_scheduled_items_next_pending 
  ON scheduled_items(user_schedule_id, scheduled_date, status) 
  WHERE status = 'pending';

-- ============================================================================
-- TABLE: schedule_milestones
-- ============================================================================

CREATE TABLE IF NOT EXISTS schedule_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_schedule_id UUID NOT NULL REFERENCES user_schedules(id) ON DELETE CASCADE,
  milestone_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  milestone_type VARCHAR(30) CHECK (milestone_type IN (
    'phase_complete', 
    'preptest_milestone', 
    'halfway_point', 
    'final_week', 
    'custom'
  )),
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_milestones_schedule 
  ON schedule_milestones(user_schedule_id);

CREATE INDEX IF NOT EXISTS idx_schedule_milestones_date 
  ON schedule_milestones(user_schedule_id, milestone_date);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS update_schedule_options_updated_at ON schedule_options;
CREATE TRIGGER update_schedule_options_updated_at 
  BEFORE UPDATE ON schedule_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_schedules_updated_at ON user_schedules;
CREATE TRIGGER update_user_schedules_updated_at 
  BEFORE UPDATE ON user_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_items_updated_at ON scheduled_items;
CREATE TRIGGER update_scheduled_items_updated_at 
  BEFORE UPDATE ON scheduled_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate schedule progress
CREATE OR REPLACE FUNCTION calculate_schedule_progress(schedule_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items
  FROM scheduled_items
  WHERE user_schedule_id = schedule_id AND status != 'skipped';
  
  SELECT COUNT(*) INTO completed_items
  FROM scheduled_items
  WHERE user_schedule_id = schedule_id AND status = 'completed';
  
  IF total_items = 0 THEN
    RETURN 0.00;
  END IF;
  
  RETURN ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE schedule_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_milestones ENABLE ROW LEVEL SECURITY;

-- schedule_options: Everyone can read active options
DROP POLICY IF EXISTS "Anyone can view active schedule options" ON schedule_options;
CREATE POLICY "Anyone can view active schedule options"
  ON schedule_options FOR SELECT
  USING (is_active = true);

-- user_schedules: Users can only see/modify their own schedules
DROP POLICY IF EXISTS "Users can view their own schedules" ON user_schedules;
CREATE POLICY "Users can view their own schedules"
  ON user_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own schedules" ON user_schedules;
CREATE POLICY "Users can insert their own schedules"
  ON user_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own schedules" ON user_schedules;
CREATE POLICY "Users can update their own schedules"
  ON user_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own schedules" ON user_schedules;
CREATE POLICY "Users can delete their own schedules"
  ON user_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- scheduled_items: Users can only see/modify items from their schedules
DROP POLICY IF EXISTS "Users can view their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can view their own scheduled items"
  ON scheduled_items FOR SELECT
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can insert their own scheduled items"
  ON scheduled_items FOR INSERT
  TO authenticated
  WITH CHECK (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can update their own scheduled items"
  ON scheduled_items FOR UPDATE
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can delete their own scheduled items"
  ON scheduled_items FOR DELETE
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

-- schedule_milestones: Users can only see/modify milestones from their schedules
DROP POLICY IF EXISTS "Users can view their own milestones" ON schedule_milestones;
CREATE POLICY "Users can view their own milestones"
  ON schedule_milestones FOR SELECT
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own milestones" ON schedule_milestones;
CREATE POLICY "Users can insert their own milestones"
  ON schedule_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own milestones" ON schedule_milestones;
CREATE POLICY "Users can update their own milestones"
  ON schedule_milestones FOR UPDATE
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own milestones" ON schedule_milestones;
CREATE POLICY "Users can delete their own milestones"
  ON schedule_milestones FOR DELETE
  TO authenticated
  USING (
    user_schedule_id IN (
      SELECT id FROM user_schedules WHERE user_id = auth.uid()
    )
  );