// Test script để setup cart data với trạng thái đã thanh toán (viewOnly = true)
// Chạy script này trong browser console để test

const paidCartData = {
    cart: [
        {
            service: {
                id: 'basic-wash',
                name: 'Basic Wash',
                price: 15.00
            },
            quantity: 1,
            subtotal: 15.00
        },
        {
            service: {
                id: 'premium-wax',
                name: 'Premium Wax & Polish',
                price: 35.00
            },
            quantity: 1,
            subtotal: 35.00
        },
        {
            service: {
                id: 'interior-cleaning',
                name: 'Interior Deep Clean',
                price: 25.00
            },
            quantity: 2,
            subtotal: 50.00
        }
    ],
    carInfo: {
        licensePlate: 'ABC123',
        color: 'Silver',
        status: 'finished', // Đã hoàn thành
        total: 100.00,
        bookingId: 'booking_123'
    },
    customerInfo: {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        isVip: true
    },
    viewOnly: true // Trạng thái đã thanh toán - chỉ xem
};

console.log('Thiết lập cart data cho trạng thái đã thanh toán...');
localStorage.setItem('pos-cart', JSON.stringify(paidCartData));
console.log('✅ Đã thiết lập cart data');
console.log('📋 Cart data:', paidCartData);
console.log('🔄 Reload trang để xem kết quả');

// Hiển thị thông tin mong đợi
console.log('\n🎯 Kết quả mong đợi:');
console.log('✓ Hiển thị 3 items trong cart');
console.log('✓ Mỗi item có dấu tick xanh (✓) và text "Đã thanh toán"');
console.log('✓ Giá tiền hiển thị màu xanh');
console.log('✓ Background items có viền xanh nhạt');
console.log('✓ Tổng tiền: $100.00');
console.log('✓ Trạng thái: "Car Status: Finished"');
