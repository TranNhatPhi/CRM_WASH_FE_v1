-- Check current RLS policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'booking_state';
-- Check if RLS is enabled
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'booking_state';
-- If no policies exist, create them
-- First, disable RLS temporarily for testing
ALTER TABLE booking_state DISABLE ROW LEVEL SECURITY;
-- Or create proper policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON booking_state;
DROP POLICY IF EXISTS "Allow public read access" ON booking_state;
-- Enable RLS
ALTER TABLE booking_state ENABLE ROW LEVEL SECURITY;
-- Create policy to allow all operations for all users (for testing)
CREATE POLICY "Allow all operations for all users" ON booking_state FOR ALL TO public USING (true) WITH CHECK (true);
-- Alternative: Create policy for authenticated users only
-- CREATE POLICY "Allow all operations for authenticated users" 
-- ON booking_state 
-- FOR ALL 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);
-- Test insert
INSERT INTO booking_state (booking_id, old_state, current_state)
VALUES (999, NULL, 'draft');
-- Check if insert worked
SELECT *
FROM booking_state
WHERE booking_id = 999;