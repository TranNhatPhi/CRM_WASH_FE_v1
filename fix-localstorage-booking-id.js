// Script để update bookingId vào localStorage cho current session
// Chạy script này trong browser console để fix localStorage

console.log('🔧 Updating localStorage with latest booking ID...');

// Get current cart data
const cartData = localStorage.getItem('pos-cart');
if (cartData) {
    const parsedData = JSON.parse(cartData);
    console.log('Current cart data:', parsedData);

    // Update with latest booking ID (từ kết quả database check)
    if (parsedData.carInfo) {
        parsedData.carInfo.bookingId = 30; // Latest booking ID from database
        parsedData.carInfo.status = 'in-progress';

        // Update localStorage
        localStorage.setItem('pos-cart', JSON.stringify(parsedData));
        console.log('✅ Updated cart data with booking ID 30');
        console.log('Updated data:', parsedData);

        // Also show in console for verification
        console.log('🎯 Booking ID:', parsedData.carInfo.bookingId);
        console.log('🚗 License Plate:', parsedData.carInfo.licensePlate);
        console.log('👤 Customer:', parsedData.customerInfo.name);
        console.log('💰 Total:', parsedData.cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0));
    }
} else {
    console.log('❌ No cart data found in localStorage');
}

console.log('✨ localStorage update complete!');
