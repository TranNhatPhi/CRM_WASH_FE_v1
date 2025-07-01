-- Migration script to change booking state structure
-- From: booking_state contains booking_id
-- To: bookings contains booking_state_id
-- Step 1: Create new booking_state table structure
DROP TABLE IF EXISTS "public"."booking_state_new";
CREATE TABLE "public"."booking_state_new" (
    "id" SERIAL PRIMARY KEY,
    "state_name" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Step 2: Insert predefined states
INSERT INTO "public"."booking_state_new" (state_name, description, sort_order)
VALUES ('draft', 'Booking đang được tạo', 1),
    ('booked', 'Booking đã được xác nhận', 2),
    ('in_progress', 'Đang thực hiện rửa xe', 3),
    ('departed', 'Xe đã rời khỏi trạm rửa', 4),
    ('completed', 'Hoàn thành dịch vụ', 5),
    ('cancelled', 'Booking đã bị hủy', 6);
-- Step 3: Add booking_state_id column to bookings table
ALTER TABLE "public"."bookings"
ADD COLUMN "booking_state_id" INTEGER;
-- Step 4: Update existing bookings with corresponding state IDs
UPDATE "public"."bookings"
SET booking_state_id = (
        CASE
            WHEN status = 'draft' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'draft'
            )
            WHEN status = 'booked' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'booked'
            )
            WHEN status = 'in_progress' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'in_progress'
            )
            WHEN status = 'departed' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'departed'
            )
            WHEN status = 'completed' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'completed'
            )
            WHEN status = 'cancelled' THEN (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'cancelled'
            )
            ELSE (
                SELECT id
                FROM booking_state_new
                WHERE state_name = 'draft'
            )
        END
    );
-- Step 5: Make booking_state_id NOT NULL and add foreign key
ALTER TABLE "public"."bookings"
ALTER COLUMN "booking_state_id"
SET NOT NULL;
ALTER TABLE "public"."bookings"
ADD CONSTRAINT "fk_bookings_booking_state" FOREIGN KEY ("booking_state_id") REFERENCES "public"."booking_state_new"("id");
-- Step 6: Create index for performance
CREATE INDEX "idx_bookings_booking_state_id" ON "public"."bookings" ("booking_state_id");
-- Step 7: Drop old booking_state table and rename new one
DROP TABLE IF EXISTS "public"."booking_state";
ALTER TABLE "public"."booking_state_new"
    RENAME TO "booking_state";
-- Step 8: Drop old status column from bookings (optional, keep for backup)
-- ALTER TABLE "public"."bookings" DROP COLUMN "status";
-- Step 9: Create view for easy querying
CREATE OR REPLACE VIEW "public"."bookings_with_state" AS
SELECT b.*,
    bs.state_name as current_state,
    bs.description as state_description,
    bs.sort_order as state_order
FROM bookings b
    JOIN booking_state bs ON b.booking_state_id = bs.id;
-- Verify the migration
SELECT b.id,
    b.status as old_status,
    bs.state_name as new_state,
    bs.description
FROM bookings b
    JOIN booking_state bs ON b.booking_state_id = bs.id
LIMIT 10;