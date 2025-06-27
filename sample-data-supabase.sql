-- Sample data for testing
-- Run this AFTER disabling RLS
-- Insert sample services
INSERT INTO public.services (
        name,
        description,
        price,
        duration,
        category,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Rửa xe cơ bản',
        'Rửa xe bên ngoài cơ bản',
        50000,
        30,
        'Rửa xe',
        NOW(),
        NOW()
    ),
    (
        'Rửa xe cao cấp',
        'Rửa xe bên ngoài + làm sạch nội thất',
        100000,
        60,
        'Rửa xe',
        NOW(),
        NOW()
    ),
    (
        'Đánh bóng xe',
        'Đánh bóng và làm sạch toàn diện',
        200000,
        120,
        'Chăm sóc',
        NOW(),
        NOW()
    ),
    (
        'Vệ sinh nội thất',
        'Vệ sinh ghế, thảm, taplo',
        80000,
        45,
        'Nội thất',
        NOW(),
        NOW()
    ),
    (
        'Rửa xe express',
        'Rửa xe nhanh trong 15 phút',
        30000,
        15,
        'Rửa xe',
        NOW(),
        NOW()
    );
-- Insert sample customers
INSERT INTO public.customers (
        name,
        email,
        phone,
        joined_at,
        tags,
        membership_id,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Nguyễn Văn A',
        'nguyenvana@gmail.com',
        '0901234567',
        NOW(),
        'VIP',
        NULL,
        NOW(),
        NOW()
    ),
    (
        'Trần Thị B',
        'tranthib@gmail.com',
        '0912345678',
        NOW(),
        'Regular',
        NULL,
        NOW(),
        NOW()
    ),
    (
        'Lê Văn C',
        'levanc@gmail.com',
        '0923456789',
        NOW(),
        'New',
        NULL,
        NOW(),
        NOW()
    ),
    (
        'Phạm Thị D',
        'phamthid@gmail.com',
        '0934567890',
        NOW(),
        'Regular',
        NULL,
        NOW(),
        NOW()
    ),
    (
        'Hoàng Văn E',
        'hoangvane@gmail.com',
        '0945678901',
        NOW(),
        'VIP',
        NULL,
        NOW(),
        NOW()
    );
-- Insert sample vehicles (will work after customers are inserted)
INSERT INTO public.vehicles (
        customer_id,
        make,
        model,
        year,
        color,
        license_plate,
        notes,
        status,
        wash_status,
        wash_count,
        "createdAt",
        "updatedAt"
    )
VALUES (
        1,
        'Toyota',
        'Camry',
        2022,
        'Đen',
        '30A-12345',
        'Xe của khách VIP',
        'active',
        'No active wash',
        3,
        NOW(),
        NOW()
    ),
    (
        2,
        'Honda',
        'Civic',
        2021,
        'Trắng',
        '51B-67890',
        'Xe thường xuyên',
        'active',
        'No active wash',
        1,
        NOW(),
        NOW()
    ),
    (
        3,
        'Hyundai',
        'Accent',
        2023,
        'Xanh',
        '29C-54321',
        'Xe mới',
        'active',
        'No active wash',
        0,
        NOW(),
        NOW()
    ),
    (
        4,
        'Mazda',
        'CX-5',
        2022,
        'Đỏ',
        '43D-98765',
        'SUV gia đình',
        'active',
        'No active wash',
        2,
        NOW(),
        NOW()
    ),
    (
        5,
        'Ford',
        'Ranger',
        2021,
        'Xám',
        '15E-11111',
        'Xe bán tải',
        'active',
        'No active wash',
        5,
        NOW(),
        NOW()
    );