/*
  # Add Development-Friendly RLS Policies for Schedule System

  1. Changes
    - Updates RLS policies to allow anonymous users to access schedules for the mock user UUID
    - Removes foreign key constraint from user_schedules.user_id to auth.users(id)
    - Maintains security for authenticated users while enabling development testing

  2. Security
    - Authenticated users can only access their own schedules
    - Anonymous users can only access schedules for UUID: 00000000-0000-0000-0000-000000000000
    - All other RLS protections remain intact
*/

-- ============================================================================
-- Remove Foreign Key Constraint
-- ============================================================================
-- Remove the FK constraint to auth.users since we want to allow the mock UUID

ALTER TABLE user_schedules
  DROP CONSTRAINT IF EXISTS user_schedules_user_id_fkey;

-- ============================================================================
-- user_schedules: Allow anon users to manage schedules
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own schedules" ON user_schedules;
CREATE POLICY "Users can view their own schedules"
  ON user_schedules FOR SELECT
  USING (
    -- Authenticated users can see their own schedules
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
    OR
    -- Anon users can see schedules for the mock user UUID
    (auth.role() = 'anon' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  );

DROP POLICY IF EXISTS "Users can insert their own schedules" ON user_schedules;
CREATE POLICY "Users can insert their own schedules"
  ON user_schedules FOR INSERT
  WITH CHECK (
    -- Authenticated users can insert their own schedules
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
    OR
    -- Anon users can insert schedules for the mock user UUID
    (auth.role() = 'anon' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  );

DROP POLICY IF EXISTS "Users can update their own schedules" ON user_schedules;
CREATE POLICY "Users can update their own schedules"
  ON user_schedules FOR UPDATE
  USING (
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
    OR
    (auth.role() = 'anon' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WITH CHECK (
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
    OR
    (auth.role() = 'anon' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  );

DROP POLICY IF EXISTS "Users can delete their own schedules" ON user_schedules;
CREATE POLICY "Users can delete their own schedules"
  ON user_schedules FOR DELETE
  USING (
    (auth.role() = 'authenticated' AND auth.uid() = user_id)
    OR
    (auth.role() = 'anon' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- ============================================================================
-- scheduled_items: Allow anon users to manage items
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can view their own scheduled items"
  ON scheduled_items FOR SELECT
  USING (
    -- Authenticated users
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    -- Anon users can see items for mock user schedules
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can insert their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can insert their own scheduled items"
  ON scheduled_items FOR INSERT
  WITH CHECK (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can update their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can update their own scheduled items"
  ON scheduled_items FOR UPDATE
  USING (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  )
  WITH CHECK (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can delete their own scheduled items" ON scheduled_items;
CREATE POLICY "Users can delete their own scheduled items"
  ON scheduled_items FOR DELETE
  USING (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

-- ============================================================================
-- schedule_milestones: Allow anon users to manage milestones
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own milestones" ON schedule_milestones;
CREATE POLICY "Users can view their own milestones"
  ON schedule_milestones FOR SELECT
  USING (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can insert their own milestones" ON schedule_milestones;
CREATE POLICY "Users can insert their own milestones"
  ON schedule_milestones FOR INSERT
  WITH CHECK (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can update their own milestones" ON schedule_milestones;
CREATE POLICY "Users can update their own milestones"
  ON schedule_milestones FOR UPDATE
  USING (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  )
  WITH CHECK (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );

DROP POLICY IF EXISTS "Users can delete their own milestones" ON schedule_milestones;
CREATE POLICY "Users can delete their own milestones"
  ON schedule_milestones FOR DELETE
  USING (
    (auth.role() = 'authenticated' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = auth.uid()))
    OR
    (auth.role() = 'anon' AND
     user_schedule_id IN (SELECT id FROM user_schedules WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid))
  );
