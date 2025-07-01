-- Script để xóa và tạo lại bảng booking_state một cách an toàn
-- Chạy script này trong Supabase SQL Editor
-- 1. Xóa ràng buộc foreign key từ bảng bookings (nếu có)
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS bookings_booking_state_id_fkey;
-- 2. Xóa bảng booking_state (nếu có)
DROP TABLE IF EXISTS booking_state CASCADE;
-- 3. Tạo lại bảng booking_state với cấu trúc mới
CREATE TABLE booking_state (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Thêm dữ liệu mặc định cho các trạng thái
INSERT INTO booking_state (name, description)
VALUES ('pending', 'Booking đang chờ xử lý'),
    ('confirmed', 'Booking đã được xác nhận'),
    ('in_progress', 'Đang thực hiện dịch vụ'),
    ('washing', 'Đang rửa xe'),
    ('drying', 'Đang sấy khô'),
    ('completed', 'Hoàn thành dịch vụ'),
    ('cancelled', 'Booking đã bị hủy'),
    ('no_show', 'Khách hàng không đến');
-- 5. Thêm lại foreign key constraint cho bảng bookings (nếu cột booking_state_id đã tồn tại)
DO $$ BEGIN -- Kiểm tra nếu cột booking_state_id tồn tại
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings'
        AND column_name = 'booking_state_id'
) THEN -- Thêm foreign key constraint
ALTER TABLE bookings
ADD CONSTRAINT bookings_booking_state_id_fkey FOREIGN KEY (booking_state_id) REFERENCES booking_state(id);
-- Cập nhật tất cả booking_state_id = null thành 1 (pending)
UPDATE bookings
SET booking_state_id = 1
WHERE booking_state_id IS NULL;
END IF;
END $$;
-- 6. Hiển thị kết quả
SELECT 'Bảng booking_state đã được tạo lại thành công!' as message;
SELECT *
FROM booking_state
ORDER BY id;