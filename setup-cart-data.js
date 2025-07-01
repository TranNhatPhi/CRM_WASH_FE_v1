/**
 * Script để setup sample cart data trong localStorage cho testing
 */

console.log('🛒 Setting up sample cart data for payment page testing...');

const sampleCartData = {
    cart: [
        {
            service: {
                id: '1',
                name: 'Cut & Polish',
                price: 45.00
            },
            quantity: 1,
            subtotal: 45.00
        },
        {
            service: {
                id: '2',
                name: 'Mini Detail',
                price: 40.00
            },
            quantity: 1,
            subtotal: 40.00
        },
        {
            service: {
                id: '3',
                name: 'Premium Wash',
                price: 61.30
            },
            quantity: 1,
            subtotal: 61.30
        }
    ],
    carInfo: {
        licensePlate: '11f1',
        customer: 'Phi',
        make: 'Toyota',
        model: 'Camry',
        color: 'Silver',
        status: 'pending'
    },
    customerInfo: {
        name: 'Phi',
        phone: '+84123456789',
        email: 'phi@example.com'
    }
};

// Set data in localStorage
localStorage.setItem('pos-cart', JSON.stringify(sampleCartData));

console.log('✅ Sample cart data set successfully!');
console.log('🔄 Refresh payment page to load this data');
console.log('Data:', sampleCartData);

// Also log the raw data to verify
console.log('Raw localStorage data:', localStorage.getItem('pos-cart'));
