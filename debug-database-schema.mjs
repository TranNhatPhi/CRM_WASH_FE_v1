import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDatabaseSchema() {
    try {
        console.log('🔍 Checking database schema and data...\n');

        // Check booking_state table
        console.log('📋 Checking booking_state table:');
        const { data: bookingStates, error: stateError } = await supabase
            .from('booking_state')
            .select('*');

        if (stateError) {
            console.error('❌ Error fetching booking states:', stateError);
        } else {
            console.log('✅ Booking states:', bookingStates);
        }

        // Check customers table
        console.log('\n👥 Checking customers table:');
        const { data: customers, error: customersError } = await supabase
            .from('customers')
            .select('id, name, phone, email')
            .limit(5);

        if (customersError) {
            console.error('❌ Error fetching customers:', customersError);
        } else {
            console.log('✅ Sample customers:', customers);
        }

        // Check vehicles table
        console.log('\n🚗 Checking vehicles table:');
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, license_plate, make, model, color')
            .limit(5);

        if (vehiclesError) {
            console.error('❌ Error fetching vehicles:', vehiclesError);
        } else {
            console.log('✅ Sample vehicles:', vehicles);
        }

        // Check services table
        console.log('\n🛠️ Checking services table:');
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('id, name, price')
            .limit(5);

        if (servicesError) {
            console.error('❌ Error fetching services:', servicesError);
        } else {
            console.log('✅ Sample services:', services);
        }

        // Check bookings table schema
        console.log('\n📊 Checking bookings table schema:');
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .limit(3);

        if (bookingsError) {
            console.error('❌ Error fetching bookings:', bookingsError);
        } else {
            console.log('✅ Sample bookings:', bookings);
        }

        // Test creating a minimal booking
        console.log('\n🧪 Testing minimal booking creation:');

        // Get required IDs
        const { data: testState } = await supabase
            .from('booking_state')
            .select('id')
            .limit(1)
            .single();

        const { data: testCustomer } = await supabase
            .from('customers')
            .select('id')
            .limit(1)
            .single();

        const { data: testVehicle } = await supabase
            .from('vehicles')
            .select('id')
            .limit(1)
            .single();

        if (testState && testCustomer && testVehicle) {
            const testBookingData = {
                customer_id: testCustomer.id,
                vehicle_id: testVehicle.id,
                booking_state_id: testState.id,
                date: new Date().toISOString().split('T')[0],
                total_price: 25.00,
                notes: 'Test booking from debug script',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('📝 Test booking data:', testBookingData);

            const { data: testBooking, error: testError } = await supabase
                .from('bookings')
                .insert(testBookingData)
                .select('id')
                .single();

            if (testError) {
                console.error('❌ Error creating test booking:', testError);

                // Check for specific error types
                if (testError.code) {
                    console.log(`Error code: ${testError.code}`);
                }
                if (testError.details) {
                    console.log(`Error details: ${testError.details}`);
                }
                if (testError.hint) {
                    console.log(`Error hint: ${testError.hint}`);
                }
            } else {
                console.log('✅ Test booking created successfully:', testBooking.id);

                // Clean up test booking
                await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', testBooking.id);

                console.log('🧹 Test booking cleaned up');
            }
        } else {
            console.log('⚠️ Missing required data for test booking');
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Run the debug function
debugDatabaseSchema().then(() => {
    console.log('\n✨ Database schema debug complete');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
});
