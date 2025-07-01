import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentPageLogic() {
    try {
        console.log('🧪 Testing Payment page booking creation logic...\n');

        // Test data similar to what Payment page would use
        const customerInfo = {
            name: 'trần nhật phi',
            phone: '0941931851',
            email: 'phivt1234@gmail.com'
        };

        const carInfo = {
            licensePlate: '11111111'
        };

        const cart = [
            { service: { id: 'service_1', name: 'Cut & Polish', price: 45 }, quantity: 1 },
            { service: { id: 'service_2', name: 'Carpet Steam', price: 25 }, quantity: 1 }
        ];

        const total = cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);

        console.log('📝 Using existing customer data:');
        console.log('Customer:', customerInfo);
        console.log('Vehicle:', carInfo);
        console.log('Cart total:', total);

        // Step 1: Find existing customer (like Payment page does)
        console.log('\n👤 Step 1: Finding existing customer...');
        let customerId = null;

        const { data: existingCustomer, error: customerCheckError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', customerInfo.phone)
            .single();

        if (customerCheckError && customerCheckError.code !== 'PGRST116') {
            console.error('❌ Error checking customer:', customerCheckError);
        }

        if (existingCustomer) {
            customerId = existingCustomer.id;
            console.log('✅ Found existing customer:', customerId);
        } else {
            console.log('❌ Customer not found, would need to create');
            customerId = 1; // Fallback
        }

        // Step 2: Find existing vehicle
        console.log('\n🚗 Step 2: Finding existing vehicle...');
        let vehicleId = null;

        const { data: existingVehicle, error: vehicleCheckError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('license_plate', carInfo.licensePlate)
            .single();

        if (vehicleCheckError && vehicleCheckError.code !== 'PGRST116') {
            console.error('❌ Error checking vehicle:', vehicleCheckError);
        }

        if (existingVehicle) {
            vehicleId = existingVehicle.id;
            console.log('✅ Found existing vehicle:', vehicleId);
        } else {
            console.log('❌ Vehicle not found, would need to create');
            vehicleId = 1; // Fallback
        }

        // Step 3: Get booking state
        console.log('\n📊 Step 3: Getting booking state...');
        let stateId = 3; // Default

        const { data: bookingState, error: stateError } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'in_progress')
            .single();

        if (stateError) {
            console.error('❌ Error getting state:', stateError);
        } else {
            stateId = bookingState.id;
            console.log('✅ Found state:', stateId);
        }

        // Step 4: Create booking (EXACTLY like Payment page)
        console.log('\n📋 Step 4: Creating booking...');
        const bookingData = {
            customer_id: customerId,
            vehicle_id: vehicleId,
            booking_state_id: stateId,
            date: new Date().toISOString().split('T')[0],
            total_price: total,
            notes: `Booking created from POS at ${new Date().toLocaleString()}\nCustomer: ${customerInfo.name}\nVehicle: ${carInfo.licensePlate}`,
            created_by: 1, // Required field - using admin user ID
            updated_by: 1, // Required field - using admin user ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('📝 Booking data:', JSON.stringify(bookingData, null, 2));

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Error creating booking:', bookingError);
            console.log('Error details:', {
                code: bookingError.code,
                message: bookingError.message,
                details: bookingError.details,
                hint: bookingError.hint
            });
            throw bookingError;
        }

        console.log('✅ Booking created successfully with ID:', booking.id);

        // Step 5: Add services
        console.log('\n🛠️ Step 5: Adding services...');
        const bookingServices = cart.map(item => ({
            booking_id: booking.id,
            service_id: parseInt(item.service.id.replace('service_', '')) || 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));

        console.log('Service data:', bookingServices);

        const { error: servicesError } = await supabase
            .from('booking_services')
            .insert(bookingServices);

        if (servicesError) {
            console.error('❌ Error adding services:', servicesError);
        } else {
            console.log('✅ Services added successfully');
        }

        // Verify the booking
        console.log('\n🔍 Step 6: Verifying booking...');
        const { data: verifyBooking, error: verifyError } = await supabase
            .from('bookings')
            .select(`
                id,
                total_price,
                notes,
                customers(name, phone),
                vehicles(license_plate),
                booking_state(state_name)
            `)
            .eq('id', booking.id)
            .single();

        if (verifyError) {
            console.error('❌ Error verifying booking:', verifyError);
        } else {
            console.log('✅ Booking verification:', JSON.stringify(verifyBooking, null, 2));
        }

        console.log('\n🎉 Payment page logic test completed successfully!');
        console.log(`📋 Booking ID: ${booking.id}`);

        return booking.id;

    } catch (error) {
        console.error('💥 Test failed:', error);
        throw error;
    }
}

// Run the test
testPaymentPageLogic().then((bookingId) => {
    console.log(`\n✨ SUCCESS! Booking ${bookingId} created successfully!`);
    console.log('The Payment page logic should now work correctly.');
    process.exit(0);
}).catch(error => {
    console.error('💥 FAILED! Payment page logic has issues:', error);
    process.exit(1);
});
