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

async function checkTableSchemas() {
    try {
        console.log('🔍 Checking table schemas...\n');

        // Check bookings table structure by looking at a sample record
        console.log('📋 Checking bookings table structure:');
        const { data: sampleBooking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .limit(1)
            .single();

        if (bookingError) {
            console.error('❌ Error fetching sample booking:', bookingError);
        } else {
            console.log('✅ Sample booking structure:');
            if (sampleBooking) {
                Object.keys(sampleBooking).forEach(key => {
                    console.log(`  - ${key}: ${typeof sampleBooking[key]} (${sampleBooking[key]})`);
                });
            }
        }

        // Test minimal booking creation
        console.log('\n🧪 Testing minimal booking creation...');

        // Get existing IDs for test
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .limit(1)
            .single();

        const { data: vehicle } = await supabase
            .from('vehicles')
            .select('id')
            .limit(1)
            .single();

        const { data: state } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'pending')
            .single();

        if (customer && vehicle && state) {
            console.log('Using test IDs:', {
                customer_id: customer.id,
                vehicle_id: vehicle.id,
                booking_state_id: state.id
            });

            // Test with minimal required fields
            const testBooking = {
                customer_id: customer.id,
                vehicle_id: vehicle.id,
                booking_state_id: state.id,
                date: new Date().toISOString().split('T')[0],
                total_price: 50.00,
                notes: 'Test booking from schema check',
                created_by: customer.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('📝 Test booking data:', testBooking);

            const { data: newBooking, error: createError } = await supabase
                .from('bookings')
                .insert(testBooking)
                .select('id')
                .single();

            if (createError) {
                console.error('❌ Error creating test booking:', createError);

                // Detailed error analysis
                console.log('\n🔍 Error analysis:');
                console.log('Code:', createError.code);
                console.log('Message:', createError.message);
                console.log('Details:', createError.details);
                console.log('Hint:', createError.hint);
            } else {
                console.log('✅ Test booking created successfully:', newBooking.id);

                // Clean up
                await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', newBooking.id);
                console.log('🧹 Test booking cleaned up');
            }
        } else {
            console.log('❌ Missing required test data');
        }

        // Check customers table
        console.log('\n👥 Checking customers table:');
        const { data: sampleCustomer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .limit(1)
            .single();

        if (customerError) {
            console.error('❌ Error fetching sample customer:', customerError);
        } else if (sampleCustomer) {
            console.log('✅ Customer fields:');
            Object.keys(sampleCustomer).forEach(key => {
                console.log(`  - ${key}: ${typeof sampleCustomer[key]}`);
            });
        }

        // Check vehicles table
        console.log('\n🚗 Checking vehicles table:');
        const { data: sampleVehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .limit(1)
            .single();

        if (vehicleError) {
            console.error('❌ Error fetching sample vehicle:', vehicleError);
        } else if (sampleVehicle) {
            console.log('✅ Vehicle fields:');
            Object.keys(sampleVehicle).forEach(key => {
                console.log(`  - ${key}: ${typeof sampleVehicle[key]}`);
            });
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Run the check
checkTableSchemas().then(() => {
    console.log('\n✨ Schema check complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Schema check failed:', error);
    process.exit(1);
});
