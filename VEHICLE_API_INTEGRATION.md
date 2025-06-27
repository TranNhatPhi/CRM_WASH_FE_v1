# Vehicle API Integration Guide

## Overview
Đã thành công tích hợp API pagination cho trang Cars, thay thế data cứng bằng dữ liệu thực từ Backend.

## API Endpoints

### 1. `/api/vehicles/pagination`
- **Method**: GET
- **Description**: Lấy danh sách xe với phân trang
- **Parameters**:
  - `page` (optional): Số trang (default: 1)
  - `limit` (optional): Số lượng items per page (default: 10)

**Example Request:**
```
GET /api/vehicles/pagination?page=1&limit=5
```

**Response Format:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách xe thành công!",
  "data": {
    "vehicles": [...],
    "total": 9,
    "page": 1,
    "limit": 5
  }
}
```

## Configuration

### Environment Variables
Thêm vào `.env.local`:
```
BACKEND_URL=http://localhost:5000
```

## Features Implemented

✅ **API Integration**: Thay thế generateCarData() bằng API calls  
✅ **Pagination**: Phân trang thực từ backend  
✅ **Loading States**: Loading spinner khi fetch data  
✅ **Error Handling**: Fallback to mock data khi backend unavailable  
✅ **Real-time Data**: Data được cập nhật từ API  
✅ **Type Safety**: TypeScript interfaces cho API responses  

## Testing

### Test API Endpoint
1. Mở browser console tại http://localhost:3000/cars
2. Chạy: `testVehiclesPagination(1, 5)`

### Direct API Test
- Test URL: http://localhost:3000/api/vehicles/pagination?page=1&limit=5

## Backend Integration

### Khi backend sẵn sàng:
1. Cập nhật `BACKEND_URL` trong `.env.local`
2. Backend endpoint cần match format:
   ```
   GET {BACKEND_URL}/api/vehicles/pagination?page={page}&limit={limit}
   ```

### Fallback Behavior
- Nếu backend không available, API sẽ trả về mock data
- Frontend vẫn hoạt động bình thường với mock data

## Next Steps
1. **Connect to real backend**: Cập nhật BACKEND_URL
2. **Add search functionality**: Implement search trên API
3. **Add filters**: Status, wash status filters
4. **Add CRUD operations**: Create, Update, Delete vehicles
5. **Add authentication**: JWT tokens cho API calls

## File Structure
```
src/
├── app/
│   ├── api/
│   │   └── vehicles/
│   │       └── pagination/
│   │           └── route.ts     # API endpoint
│   └── cars/
│       └── page.tsx            # Updated Cars page
├── types/
│   └── index.ts               # Updated with API types
└── utils/
    └── testApi.ts            # API testing utilities
```
