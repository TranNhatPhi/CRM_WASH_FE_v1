/**
 * Quick test to verify booking creation works with sample data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBookingCreationWithSampleData() {
    console.log('🧪 Testing booking creation with sample payment data...\n');

    // Simulate the exact data structure from payment page
    const sampleData = {
        customerInfo: {
            name: 'Phi',
            phone: '+84123456789',
            email: 'phi@example.com'
        },
        carInfo: {
            licensePlate: '11f1',
            customer: 'Phi',
            make: 'Toyota',
            model: 'Camry',
            color: 'Silver',
            status: 'pending'
        },
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
            }
        ],
        total: 146.30,
        paymentComplete: false,
        paymentMethod: ''
    };

    try {
        console.log('📝 Creating booking with data:', {
            customer: sampleData.customerInfo.name,
            vehicle: sampleData.carInfo.licensePlate,
            total: sampleData.total,
            services: sampleData.cart.length
        });

        const currentTime = new Date().toISOString();

        // Step 1: Create customer
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
                name: sampleData.customerInfo.name,
                phone: sampleData.customerInfo.phone,
                email: sampleData.customerInfo.email,
                createdAt: currentTime,
                updatedAt: currentTime
            })
            .select()
            .single();

        if (customerError) {
            console.error('❌ Customer creation failed:', customerError);
            return;
        }
        console.log('✅ Customer created:', customer.id);

        // Step 2: Create vehicle
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
                license_plate: sampleData.carInfo.licensePlate,
                make: sampleData.carInfo.make,
                model: sampleData.carInfo.model,
                color: sampleData.carInfo.color,
                customer_id: customer.id,
                status: 'active',
                createdAt: currentTime,
                updatedAt: currentTime
            })
            .select()
            .single();

        if (vehicleError) {
            console.error('❌ Vehicle creation failed:', vehicleError);
            return;
        }
        console.log('✅ Vehicle created:', vehicle.id);

        // Step 3: Get booking state
        const { data: bookingState } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'in_progress')
            .single();

        const stateId = bookingState?.id || 3; // fallback
        console.log('✅ Using booking state:', stateId);

        // Step 4: Create booking
        const paymentStatus = sampleData.paymentComplete ? 'paid' : 'unpaid';
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_id: customer.id,
                vehicle_id: vehicle.id,
                date: currentTime,
                booking_state_id: stateId,
                total_price: sampleData.total,
                notes: `Payment Status: ${paymentStatus} | Test from script`,
                created_by: 1,
                status: 'active',
                createdAt: currentTime,
                updatedAt: currentTime
            })
            .select()
            .single();

        if (bookingError) {
            console.error('❌ Booking creation failed:', bookingError);
            return;
        }
        console.log('✅ Booking created:', booking.id);

        console.log('\n🎉 SUCCESS! Booking creation works with sample data');
        console.log('📋 Created:');
        console.log(`   Customer: ${customer.name} (ID: ${customer.id})`);
        console.log(`   Vehicle: ${vehicle.license_plate} (ID: ${vehicle.id})`);
        console.log(`   Booking: #${booking.id} - $${booking.total_price}`);
        console.log(`   Status: ${paymentStatus}`);
        console.log('\n🌐 Check POS Dashboard: http://localhost:3000/pos-dashboard');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testBookingCreationWithSampleData();
