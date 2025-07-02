/**
 * Setup test data cho "Pay Later" workflow
 */

// Setup cart data với trạng thái in-progress nhưng chưa thanh toán
const testCartData = {
    cart: [
        {
            service: {
                id: "leather-clean",
                name: "Leather Clean",
                price: 30.25
            },
            quantity: 1,
            subtotal: 30.25
        },
        {
            service: {
                id: "carpet-steam",
                name: "Carpet Steam",
                price: 30.25
            },
            quantity: 1,
            subtotal: 30.25
        }
    ],
    customer: {
        name: "Trần Nhật Phi",
        phone: "0123456789",
        vehiclePlate: "222",
        isVIP: false
    },
    customerInfo: {
        name: "Trần Nhật Phi",
        phone: "0123456789",
        isVip: false
    },
    carInfo: {
        licensePlate: "222",
        customer: "Trần Nhật Phi",
        time: "9:56 AM",
        total: 66.55,
        status: "in-progress", // Booking đang in-progress
        paymentStatus: "unpaid", // Chưa thanh toán
        bookingId: 54, // Booking ID giả định 
        notes: "Payment Status: unpaid\\nStatus updated to in_progress at 7/2/2025, 9:54:58 AM"
    },
    viewOnly: false // Cho phép payment và actions
};

console.log('🔧 Setting up test data for "Pay Later" workflow...');
console.log('📋 Test Data:');
console.log(`   Car: ${testCartData.carInfo.licensePlate}`);
console.log(`   Customer: ${testCartData.carInfo.customer}`);
console.log(`   Status: ${testCartData.carInfo.status}`);
console.log(`   Payment: ${testCartData.carInfo.paymentStatus}`);
console.log(`   Total: $${testCartData.carInfo.total}`);
console.log(`   Booking ID: ${testCartData.carInfo.bookingId}`);

console.log('\\n🚀 To test:');
console.log('1. Copy the following to localStorage in browser console:');
console.log(`localStorage.setItem('pos-cart', '${JSON.stringify(testCartData)}');`);
console.log('2. Navigate to /payment page');
console.log('3. Try clicking "Finish WASH" button');
console.log('4. Test both "Complete Payment First" and "Finish & Pay Later" options');

console.log('\\n✨ Expected behavior:');
console.log('✅ Shows payment status indicator: "⏳ PENDING"');
console.log('✅ Shows message: "💰 Pay now or finish wash & pay later"');
console.log('✅ Finish WASH button available');
console.log('✅ Clicking Finish WASH shows payment options dialog');
console.log('✅ Can choose to pay first or pay later');

// Output the localStorage command for easy copy-paste
const localStorageCommand = `localStorage.setItem('pos-cart', '${JSON.stringify(testCartData)}');`;
console.log('\\n📋 localStorage Command (copy this):');
console.log('─'.repeat(50));
console.log(localStorageCommand);
console.log('─'.repeat(50));
