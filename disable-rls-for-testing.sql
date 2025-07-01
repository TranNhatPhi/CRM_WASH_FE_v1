-- Disable RLS for booking_state table to allow testing
-- Run this in Supabase SQL Editor
-- First check current RLS status
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'booking_state';
-- Disable RLS for testing
ALTER TABLE booking_state DISABLE ROW LEVEL SECURITY;
-- Test insert
INSERT INTO booking_state (booking_id, old_state, current_state)
VALUES (999, NULL, 'draft') ON CONFLICT DO NOTHING;
-- Verify insert worked
SELECT *
FROM booking_state
WHERE booking_id = 999;
-- If you want to re-enable RLS later with proper policies:
-- ALTER TABLE booking_state ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations for all users" 
-- ON booking_state 
-- FOR ALL 
-- TO public 
-- USING (true) 
-- WITH CHECK (true);