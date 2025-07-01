// Script để check format của cart data
// Chạy trong browser console để debug

console.log('🔍 Checking cart data format...');

const cartData = localStorage.getItem('pos-cart');
if (cartData) {
    const parsedData = JSON.parse(cartData);
    console.log('📋 Full cart data:', parsedData);

    if (parsedData.cart && Array.isArray(parsedData.cart)) {
        console.log('🛒 Cart items:', parsedData.cart);

        parsedData.cart.forEach((item, index) => {
            console.log(`Item ${index}:`, {
                service: item.service,
                serviceId: item.service?.id,
                serviceIdType: typeof item.service?.id,
                serviceName: item.service?.name,
                servicePrice: item.service?.price,
                quantity: item.quantity
            });
        });
    } else {
        console.log('❌ Cart is not an array or missing');
    }
} else {
    console.log('❌ No cart data found');
}

console.log('✨ Cart format check complete!');
