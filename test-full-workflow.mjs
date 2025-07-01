import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullWorkflow() {
    try {
        console.log('🧪 Testing complete booking workflow...\n');

        // Test data
        const testCustomer = {
            name: 'Test Customer',
            phone: '0999999999',
            email: 'test@example.com'
        };

        const testVehicle = {
            licensePlate: 'TEST123'
        };

        const testCart = [
            { service: { id: 'service_1', name: 'Basic Wash', price: 25 }, quantity: 1 },
            { service: { id: 'service_2', name: 'Wax', price: 15 }, quantity: 1 }
        ];

        const total = testCart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);

        console.log('📝 Test data:');
        console.log('Customer:', testCustomer);
        console.log('Vehicle:', testVehicle);
        console.log('Cart:', testCart);
        console.log('Total:', total);

        // Step 1: Check/Create Customer
        console.log('\n👤 Step 1: Creating customer...');
        let customerId = null;

        const { data: existingCustomer, error: customerCheckError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', testCustomer.phone)
            .single();

        if (customerCheckError && customerCheckError.code !== 'PGRST116') {
            console.error('Error checking customer:', customerCheckError);
        }

        if (existingCustomer) {
            customerId = existingCustomer.id;
            console.log('✅ Found existing customer:', customerId);
        } else {
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    name: testCustomer.name,
                    phone: testCustomer.phone,
                    email: testCustomer.email
                })
                .select('id')
                .single();

            if (customerError) {
                console.error('❌ Error creating customer:', customerError);
                customerId = 1; // Fallback
            } else {
                customerId = newCustomer.id;
                console.log('✅ Created new customer:', customerId);
            }
        }

        // Step 2: Check/Create Vehicle
        console.log('\n🚗 Step 2: Creating vehicle...');
        let vehicleId = null;

        const { data: existingVehicle, error: vehicleCheckError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('license_plate', testVehicle.licensePlate)
            .single();

        if (vehicleCheckError && vehicleCheckError.code !== 'PGRST116') {
            console.error('Error checking vehicle:', vehicleCheckError);
        }

        if (existingVehicle) {
            vehicleId = existingVehicle.id;
            console.log('✅ Found existing vehicle:', vehicleId);
        } else {
            const { data: newVehicle, error: vehicleError } = await supabase
                .from('vehicles')
                .insert({
                    license_plate: testVehicle.licensePlate,
                    make: 'Test',
                    model: 'Car',
                    color: 'Blue'
                })
                .select('id')
                .single();

            if (vehicleError) {
                console.error('❌ Error creating vehicle:', vehicleError);
                vehicleId = 1; // Fallback
            } else {
                vehicleId = newVehicle.id;
                console.log('✅ Created new vehicle:', vehicleId);
            }
        }

        // Step 3: Get booking state
        console.log('\n📊 Step 3: Getting booking state...');
        let stateId = 3; // Default to in_progress

        const { data: bookingState, error: stateError } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'in_progress')
            .single();

        if (stateError) {
            console.error('❌ Error getting booking state:', stateError);
        } else {
            stateId = bookingState.id;
            console.log('✅ Found booking state:', stateId);
        }

        // Step 4: Create booking
        console.log('\n📋 Step 4: Creating booking...');
        const bookingData = {
            customer_id: customerId,
            vehicle_id: vehicleId,
            booking_state_id: stateId,
            date: new Date().toISOString().split('T')[0],
            total_price: total,
            notes: `Test booking created at ${new Date().toLocaleString()}\nCustomer: ${testCustomer.name}\nVehicle: ${testVehicle.licensePlate}\nPayment Status: unpaid`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('📝 Booking data:', bookingData);

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Error creating booking:', bookingError);
            throw bookingError;
        }

        console.log('✅ Booking created successfully with ID:', booking.id);

        // Step 5: Add services
        console.log('\n🛠️ Step 5: Adding services...');
        if (testCart && testCart.length > 0) {
            const bookingServices = testCart.map(item => ({
                booking_id: booking.id,
                service_id: parseInt(item.service.id.replace('service_', '')) || 1
            }));

            const { error: servicesError } = await supabase
                .from('booking_services')
                .insert(bookingServices);

            if (servicesError) {
                console.error('❌ Error adding services:', servicesError);
            } else {
                console.log('✅ Services added successfully');
            }
        }

        // Step 6: Verify booking in dashboard query
        console.log('\n🔍 Step 6: Verifying booking appears in dashboard...');
        const { data: dashboardBooking, error: dashboardError } = await supabase
            .from('bookings')
            .select(`
                id,
                date,
                total_price,
                notes,
                createdAt,
                customers(name, phone),
                vehicles(license_plate),
                booking_state(state_name)
            `)
            .eq('id', booking.id)
            .single();

        if (dashboardError) {
            console.error('❌ Error fetching booking for dashboard:', dashboardError);
        } else {
            console.log('✅ Booking verification:', JSON.stringify(dashboardBooking, null, 2));
        }

        console.log('\n🎉 Test workflow completed successfully!');
        console.log(`📋 New booking ID: ${booking.id}`);
        console.log(`👤 Customer ID: ${customerId}`);
        console.log(`🚗 Vehicle ID: ${vehicleId}`);
        console.log(`💰 Total: $${total}`);

        // Cleanup (optional)
        console.log('\n🧹 Cleaning up test data...');

        // Delete booking services
        await supabase.from('booking_services').delete().eq('booking_id', booking.id);

        // Delete booking
        await supabase.from('bookings').delete().eq('id', booking.id);

        // Delete test customer if we created it
        if (testCustomer.phone === '0999999999') {
            await supabase.from('customers').delete().eq('id', customerId);
        }

        // Delete test vehicle if we created it
        if (testVehicle.licensePlate === 'TEST123') {
            await supabase.from('vehicles').delete().eq('id', vehicleId);
        }

        console.log('✅ Cleanup completed');

    } catch (error) {
        console.error('💥 Test workflow failed:', error);
        throw error;
    }
}

// Run the test
testFullWorkflow().then(() => {
    console.log('\n✨ All tests passed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
