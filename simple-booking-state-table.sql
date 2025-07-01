-- Simple version without RLS for testing
-- Drop existing table and recreate with new structure
-- booking_state is now a lookup table, bookings table has booking_state_id foreign key
-- 1. Drop foreign key constraint from bookings table if exists
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS bookings_booking_state_id_fkey;
-- 2. Drop existing booking_state table
DROP TABLE IF EXISTS booking_state CASCADE;
-- 3. Create booking_state as lookup table (not history table)
CREATE TABLE booking_state (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Create indexes for performance
CREATE INDEX idx_booking_state_name ON booking_state (state_name);
CREATE INDEX idx_booking_state_sort_order ON booking_state (sort_order);
CREATE INDEX idx_booking_state_active ON booking_state (is_active);
-- 5. Insert predefined states (lookup data) - matching UI states
INSERT INTO booking_state (state_name, description, sort_order)
VALUES ('pending', 'Pending - Chờ xử lý', 1),
    ('in_progress', 'In Progress - Đang thực hiện', 2),
    ('finished', 'Finished - Hoàn thành', 3),
    ('cancelled', 'Cancelled - Đã hủy', 4),
    ('no_show', 'No Show - Không đến', 5);
-- 6. Add booking_state_id column to bookings table if not exists
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_state_id INTEGER;
-- 7. Add foreign key constraint
ALTER TABLE bookings
ADD CONSTRAINT bookings_booking_state_id_fkey FOREIGN KEY (booking_state_id) REFERENCES booking_state(id);
-- 8. Update existing bookings to use default state (pending)
UPDATE bookings
SET booking_state_id = (
        SELECT id
        FROM booking_state
        WHERE state_name = 'pending'
    )
WHERE booking_state_id IS NULL;
-- 9. Test queries
SELECT 'Booking states created:' as message;
SELECT id,
    state_name,
    description,
    sort_order
FROM booking_state
ORDER BY sort_order;
SELECT 'Sample booking with state:' as message;
SELECT b.id,
    b.booking_state_id,
    bs.state_name,
    bs.description
FROM bookings b
    LEFT JOIN booking_state bs ON b.booking_state_id = bs.id
LIMIT 5;