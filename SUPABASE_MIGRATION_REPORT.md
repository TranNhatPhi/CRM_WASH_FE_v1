# API Migration to Supabase Direct Queries

## Tổng quan
Đã chuyển đổi thành công từ việc gọi backend API endpoint sang sử dụng Supabase client trực tiếp.

## Các thay đổi chính

### 1. Tạo Supabase Client mới
- **File**: `src/lib/supabase-client.ts`
- **Chức năng**: 
  - Định nghĩa types phù hợp với database schema
  - Cung cấp helper functions cho CRUD operations
  - Hỗ trợ pagination và relationships

### 2. Cập nhật API Routes

#### Customers API (`src/app/api/customers/route.ts`)
- **GET**: Lấy danh sách customers với pagination
- **POST**: Tạo customer mới
- **PUT**: Cập nhật customer
- **DELETE**: Xóa customer

#### Vehicles API (`src/app/api/vehicles/route.ts`)
- **GET**: Lấy danh sách vehicles với pagination và customer info
- **POST**: Tạo vehicle mới
- **PUT**: Cập nhật vehicle
- **DELETE**: Xóa vehicle

#### Vehicles by ID (`src/app/api/vehicles/[id]/route.ts`)
- **GET**: Lấy thông tin vehicle theo ID
- **PUT**: Cập nhật vehicle theo ID
- **DELETE**: Xóa vehicle theo ID

#### Vehicles Pagination (`src/app/api/vehicles/pagination/route.ts`)
- **GET**: Tương tự vehicles/route.ts nhưng optimized cho pagination
- **POST**: Tạo vehicle mới

#### Services API (`src/app/api/services/route.ts`)
- **GET**: Lấy danh sách services
- **POST**: Tạo service mới
- **PUT**: Cập nhật service
- **DELETE**: Xóa service

#### Customers-Vehicles API (`src/app/api/customers-vehicles/route.ts`)
- **POST**: Tạo customer và vehicle trong một transaction
- **GET**: Lấy customer và vehicles của họ

#### Vehicles Test API (`src/app/api/vehicles/test/route.ts`)
- **GET**: Test connection với Supabase
- **POST**: Test tạo vehicle mới

### 3. API mới được thêm

#### Bookings API (`src/app/api/bookings/route.ts`)
- **GET**: Lấy danh sách bookings với pagination
- **POST**: Tạo booking mới

#### Transactions API (`src/app/api/transactions/route.ts`)
- **GET**: Lấy danh sách transactions với pagination  
- **POST**: Tạo transaction mới

## Database Schema được hỗ trợ

### Tables:
- `customers` - Thông tin khách hàng
- `vehicles` - Thông tin phương tiện
- `services` - Danh sách dịch vụ
- `bookings` - Đơn đặt lịch
- `booking_services` - Services trong booking
- `transactions` - Giao dịch thanh toán
- `memberships` - Gói thành viên
- `users` - Người dùng hệ thống
- `roles` - Vai trò người dùng
- `messages` - Tin nhắn

### Relationships:
- Customers ↔ Vehicles (1:N)
- Customers ↔ Bookings (1:N)
- Vehicles ↔ Bookings (1:N)
- Bookings ↔ Transactions (1:N)
- Services ↔ Booking Services (N:M qua bảng trung gian)

## Cách sử dụng

### Import và sử dụng DB helper:
```typescript
import { DB } from '@/lib/supabase-client';

// Lấy customers với pagination
const { data, error, count } = await DB.customers.getAll(1, 10);

// Tạo customer mới
const { data, error } = await DB.customers.create({
  name: 'John Doe',
  phone: '0123456789',
  email: 'john@example.com'
});
```

### API Response Format:
Tất cả API đều trả về format chuẩn:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... },
  "error": null // chỉ có khi có lỗi
}
```

### Error Handling:
- Validation errors: 400
- Not found: 404  
- Server errors: 500
- Tất cả errors đều được log và trả về thông tin chi tiết

## Lưu ý quan trọng

1. **Environment Variables**: Đảm bảo có đầy đủ biến môi trường trong `.env.local`
2. **Database Permissions**: Kiểm tra RLS policies trong Supabase
3. **Type Safety**: Tất cả operations đều có type checking
4. **Error Handling**: Comprehensive error handling với meaningful messages
5. **Backward Compatibility**: API response format tương thích với frontend hiện tại

## Testing

Sử dụng test endpoint để kiểm tra:
- `GET /api/vehicles/test` - Test Supabase connection
- `POST /api/vehicles/test` - Test creating data

## Migration Benefits

1. **Performance**: Direct database access, no extra API layer
2. **Real-time**: Có thể dễ dàng thêm real-time subscriptions
3. **Type Safety**: Full TypeScript support
4. **Simplified Architecture**: Ít layers hơn, dễ maintain
5. **Cost Effective**: Không cần maintain separate backend server
