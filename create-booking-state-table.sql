-- Create booking_state table for tracking state changes
-- One-to-many relationship: 1 booking can have many booking states
CREATE TABLE IF NOT EXISTS booking_state (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    old_state VARCHAR(50),
    current_state VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Foreign key constraint to bookings table
    CONSTRAINT fk_booking_state_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
-- Create indexes for faster queries (separate statements for PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_booking_state_booking_id ON booking_state (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_state_timestamp ON booking_state (timestamp);
CREATE INDEX IF NOT EXISTS idx_booking_state_current_state ON booking_state (current_state);
-- Add RLS (Row Level Security) if needed
ALTER TABLE booking_state ENABLE ROW LEVEL SECURITY;
-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON booking_state FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Optional: Create policy for public read access
-- CREATE POLICY "Allow public read access" 
-- ON booking_state 
-- FOR SELECT 
-- TO public 
-- USING (true);
-- Add comments for documentation
COMMENT ON TABLE booking_state IS 'Tracks state changes for bookings - one booking can have multiple state changes';
COMMENT ON COLUMN booking_state.id IS 'Primary key for booking state record';
COMMENT ON COLUMN booking_state.booking_id IS 'Foreign key reference to bookings table';
COMMENT ON COLUMN booking_state.old_state IS 'Previous state before the change (can be null for initial state)';
COMMENT ON COLUMN booking_state.current_state IS 'Current state after the change';
COMMENT ON COLUMN booking_state.timestamp IS 'When this state change occurred';
-- Sample insert to demonstrate usage
-- INSERT INTO booking_state (booking_id, old_state, current_state) VALUES 
-- (1, NULL, 'pending'),
-- (1, 'pending', 'confirmed'),
-- (1, 'confirmed', 'in_progress'),
-- (1, 'in_progress', 'completed');