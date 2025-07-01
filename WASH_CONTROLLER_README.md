# Smart Wash Controller - Booking Management System

## Tổng quan

Hệ thống quản lý trạng thái rửa xe với tích hợp database hoàn chỉnh. Cho phép theo dõi và quản lý các booking rửa xe qua nhiều trạng thái khác nhau.

## Tính năng chính

### 1. **Quản lý Booking** 
- Hiển thị danh sách booking với thông tin đầy đủ
- Chọn booking để quản lý trạng thái
- Hiển thị thông tin khách hàng, xe, dịch vụ

### 2. **State Management**
- **Draft** → **In Progress** → **Departed** → **Completed**
- **Draft** → **Booked** → **In Progress** → **Departed** → **Completed**
- **Cancel** có sẵn từ trạng thái Booked và In Progress

### 3. **Database Integration**
- **bookings**: Cập nhật booking_state_id để thay đổi trạng thái
- **booking_state**: Bảng lookup chứa các trạng thái có thể có
- **vehicles**: Cập nhật wash_status dựa trên trạng thái booking
- **booking_services**: Liên kết booking với các services được chọn

## Cách sử dụng

### 1. Migration Database Structure (Mới)
```bash
# Chạy migration sang cấu trúc mới
node setup-new-booking-state.js

# Hoặc chạy SQL migration trực tiếp
# Xem file: migrate-booking-state.sql
```

### 2. Setup dữ liệu ban đầu (Cũ - nếu chưa migration)
```bash
# Tạo customers, vehicles, services mẫu
node setup-wash-data.js

# Tạo các booking mẫu để test
node create-bookings.js
```

### 3. Kiểm tra file môi trường
Đảm bảo bạn có file `.env.local` với:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Truy cập trang test
```
http://localhost:3000/wash-test
```

### 5. Sử dụng interface
1. **Chọn booking**: Click vào card booking trong grid
2. **Xem thông tin**: Kiểm tra chi tiết booking được chọn
3. **Quản lý trạng thái**: Sử dụng Smart Wash Controller
4. **Theo dõi tiến trình**: Xem status cập nhật real-time

## Cấu trúc Database

### Bảng chính được sử dụng:

#### `booking_state` 
- Bảng chứa các trạng thái độc lập (id, state_name, description)
- Không chứa booking_id, là bảng lookup/reference
- Định nghĩa các trạng thái có thể có: draft, booked, in_progress, departed, completed, cancelled

#### `bookings`
- Thông tin booking chính (id, customer_id, vehicle_id, booking_state_id, total_price, etc.)
- Chứa booking_state_id tham chiếu đến booking_state.id
- Liên kết với customer, vehicle và current state

#### `booking_services`
- Chứa booking_id và service_id
- Many-to-many relationship giữa bookings và services
- Liên kết booking với các dịch vụ được chọn

#### `vehicles`
- Được tham chiếu từ bookings qua vehicle_id
- Cập nhật wash_status theo trạng thái booking
- Theo dõi last_wash_at và wash_count

### Quan hệ Database:
```
bookings (many) ←→ (1) booking_state
   ↓ booking_state_id
bookings.booking_state_id → booking_state.id

bookings (1) ←→ (many) booking_services  
   ↓ booking_id
booking_services.booking_id → bookings.id

bookings (many) ←→ (1) vehicles
   ↓ vehicle_id  
bookings.vehicle_id → vehicles.id

bookings (many) ←→ (1) customers
   ↓ customer_id
bookings.customer_id → customers.id
```

## State Flow

```
Draft (Transient, không lưu DB)
  ↓ Start
In Progress (Đang rửa)
  ↓ Finish  
Departed (Xe đã rời khỏi)
  ↓ Finish
Completed (Hoàn thành)

Alternative flow:
Draft → Manual Confirm → Booked → Start → In Progress → ...

Cancel available từ: Booked, In Progress
```

## Database Operations Flow

Khi chuyển trạng thái booking, hệ thống thực hiện:

1. **Lấy booking_state_id hiện tại** từ `bookings` table:
   ```sql
   SELECT booking_state_id FROM bookings WHERE id = ?
   ```

2. **Tìm state mới** trong `booking_state` table:
   ```sql
   SELECT id FROM booking_state WHERE state_name = 'new_state'
   ```

3. **Cập nhật booking với state mới**:
   ```sql
   UPDATE bookings SET booking_state_id = new_state_id WHERE id = booking_id
   ```

4. **Cập nhật vehicle wash status** trong `vehicles`:
   ```sql
   UPDATE vehicles SET wash_status = wash_status_text WHERE id = vehicle_id
   ```

### Bảng booking_state structure:
```sql
CREATE TABLE booking_state (
  id SERIAL PRIMARY KEY,
  state_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER
);

INSERT INTO booking_state (state_name, description, sort_order) VALUES
('draft', 'Booking đang được tạo', 1),
('booked', 'Booking đã được xác nhận', 2),
('in_progress', 'Đang thực hiện rửa xe', 3),
('departed', 'Xe đã rời khỏi trạm rửa', 4),
('completed', 'Hoàn thành dịch vụ', 5),
('cancelled', 'Booking đã bị hủy', 6);
```

## Components

### `SmartWashController`
- Component chính để quản lý trạng thái
- Tích hợp với BookingStateManager
- Hiển thị actions và history

### `DemoWashController` 
- Interface để browse và chọn bookings
- Hiển thị danh sách booking dạng card
- Tích hợp SmartWashController

### `BookingService`
- Service layer để tương tác với database
- Create booking với services
- Update vehicle wash status
- Create transactions

### `BookingStateManager`
- Quản lý state transitions
- Validation rules
- History tracking

## API Integration

Hệ thống tương tác với Supabase database:
- Real-time updates
- Relational queries với JOIN
- Transaction handling
- Error handling

## Màn hình hiển thị

1. **Booking Grid**: Cards hiển thị thông tin booking
2. **Selected Booking**: Summary của booking được chọn  
3. **Wash Controller**: Controls để chuyển đổi trạng thái
4. **State History**: Lịch sử các thay đổi

## Benefits

- **Real-time tracking**: Cập nhật trạng thái ngay lập tức
- **Complete audit**: Đầy đủ lịch sử trong database
- **User-friendly**: Interface trực quan dễ sử dụng
- **Scalable**: Cấu trúc database có thể mở rộng
- **Reliable**: Validation và error handling
