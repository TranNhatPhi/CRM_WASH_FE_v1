'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPaymentTest() {
    const router = useRouter();

    useEffect(() => {
        // Setup sample cart data
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

        // Redirect to payment page after 1 second
        setTimeout(() => {
            router.push('/payment');
        }, 1000);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Setting up test data...</h2>
                <p className="text-gray-600">Redirecting to payment page...</p>
            </div>
        </div>
    );
}
