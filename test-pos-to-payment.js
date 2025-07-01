// Test script để mô phỏng click từ POS Dashboard
console.log('Testing POS Dashboard to Payment navigation...');

// Mô phỏng data structure như POS Dashboard
const testServiceData = {
    id: 'booking_123',
    licensePlate: '11111111',
    customer: 'Matsuda Itsuki',
    customerPhone: '11-995-0804',
    time: '3:02 PM',
    status: 'finished',
    paymentStatus: 'paid', // Test với trạng thái đã thanh toán
    total: 106.70,
    services: ['Hand Wax', 'Leather Clean', 'Interior Steam'] // Services names
};

// Tạo cart items từ services (giống logic trong handleCarPayment)
let cartItems = [];

if (testServiceData.services && testServiceData.services.length > 0) {
    console.log('Creating cart items from services:', testServiceData.services);
    cartItems = testServiceData.services.map((serviceName, index) => ({
        service: {
            id: `service_${index}`,
            name: serviceName,
            price: testServiceData.total / testServiceData.services.length // Distribute total
        },
        quantity: 1,
        subtotal: testServiceData.total / testServiceData.services.length
    }));
}

console.log('Generated cart items:', cartItems);

// Tạo transaction data cho paid booking
const paidTransactionData = {
    cart: cartItems, // Bây giờ có cart items thay vì empty
    customer: {
        name: testServiceData.customer,
        phone: testServiceData.customerPhone,
        vehiclePlate: testServiceData.licensePlate,
        isVIP: false
    },
    carInfo: {
        licensePlate: testServiceData.licensePlate,
        customer: testServiceData.customer,
        time: testServiceData.time,
        total: testServiceData.total,
        status: testServiceData.status,
        paymentStatus: 'paid',
        bookingId: testServiceData.id,
        paidAmount: testServiceData.total
    },
    viewOnly: true
};

console.log('\n🔧 Set localStorage data:');
console.log('localStorage.setItem("pos-cart", ' + JSON.stringify(JSON.stringify(paidTransactionData)) + ');');

console.log('\n🎯 Expected result:');
console.log('✓ Cart shows 3 items: Hand Wax, Leather Clean, Interior Steam');
console.log('✓ Each item shows ✓ and "Đã thanh toán"');
console.log('✓ Each item price: $' + (testServiceData.total / testServiceData.services.length).toFixed(2));
console.log('✓ Total: $' + testServiceData.total);
console.log('✓ Green styling for paid items');

// Store the data
if (typeof window !== 'undefined') {
    localStorage.setItem('pos-cart', JSON.stringify(paidTransactionData));
    console.log('\n✅ Data stored! Navigate to /payment to test');
}
