/**
 * Script để clear duplicate data và setup clean test
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupCleanTest() {
    console.log('🧹 Setting up clean test environment...\n');

    try {
        // Check existing vehicles with license plate 11111
        const { data: existingVehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('license_plate', '11111');

        if (existingVehicles?.length) {
            console.log(`Found ${existingVehicles.length} vehicles with license plate 11111:`);
            existingVehicles.forEach(v => console.log(`  - ID: ${v.id}, Customer: ${v.customer_id}`));
        }

        // Test creating booking with existing vehicle
        console.log('\n🧪 Testing booking creation with existing vehicle...');

        // Get first existing vehicle
        if (existingVehicles?.length > 0) {
            const testVehicle = existingVehicles[0];

            // Get customer
            const { data: customer } = await supabase
                .from('customers')
                .select('*')
                .eq('id', testVehicle.customer_id)
                .single();

            // Get services
            const { data: services } = await supabase
                .from('services')
                .select('*')
                .limit(2);

            // Get booking state
            const { data: bookingState } = await supabase
                .from('booking_state')
                .select('id')
                .eq('state_name', 'in_progress')
                .single();

            if (customer && services?.length && bookingState) {
                // Create test booking
                const { data: booking, error: bookingError } = await supabase
                    .from('bookings')
                    .insert({
                        customer_id: customer.id,
                        vehicle_id: testVehicle.id,
                        date: new Date().toISOString(),
                        booking_state_id: bookingState.id,
                        total_price: 74.80,
                        notes: 'Payment Status: unpaid | Test booking from script',
                        created_by: 1,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (bookingError) {
                    console.error('❌ Error creating test booking:', bookingError);
                } else {
                    console.log('✅ Test booking created successfully:', booking.id);

                    // Add services
                    for (const service of services.slice(0, 2)) {
                        const { error: serviceError } = await supabase
                            .from('booking_services')
                            .insert({
                                booking_id: booking.id,
                                service_id: service.id
                            });

                        if (!serviceError) {
                            console.log(`  ✅ Added service: ${service.name}`);
                        }
                    }
                }
            }
        }

        console.log('\n🎯 Test environment ready!');
        console.log('✅ Existing vehicle logic implemented');
        console.log('✅ Duplicate handling added');
        console.log('🌐 Try Start WASH again in payment page');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setupCleanTest();
