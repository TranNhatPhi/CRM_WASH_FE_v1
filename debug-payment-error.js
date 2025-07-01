/**
 * Debug script for payment page issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugBookingCreation() {
    console.log('🔍 Debugging booking creation issues...\n');

    try {
        console.log('1. Testing database connections...');

        // Test basic connection
        const { data: testData, error: testError } = await supabase
            .from('customers')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Database connection failed:', testError);
            return;
        }
        console.log('✅ Database connection OK');

        // Check required tables
        console.log('\n2. Checking required tables...');

        const tables = ['customers', 'vehicles', 'services', 'users', 'booking_state'];
        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.error(`❌ Table ${table}:`, error.message);
            } else {
                console.log(`✅ Table ${table}: OK (${data?.length || 0} records found)`);
            }
        }

        // Check booking states specifically
        console.log('\n3. Checking booking states...');
        const { data: states, error: statesError } = await supabase
            .from('booking_state')
            .select('*')
            .order('id');

        if (statesError) {
            console.error('❌ Booking states error:', statesError);
        } else {
            console.log('✅ Available booking states:');
            states?.forEach(state => {
                console.log(`   ${state.id}: ${state.state_name} - ${state.description}`);
            });
        }

        // Check users table for created_by
        console.log('\n4. Checking users for created_by...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, fullname, email')
            .limit(3);

        if (usersError) {
            console.error('❌ Users error:', usersError);
        } else {
            console.log('✅ Available users:');
            users?.forEach(user => {
                console.log(`   ID: ${user.id} - ${user.fullname} (${user.email})`);
            });
        }

        // Test creating a simple booking manually
        console.log('\n5. Testing manual booking creation...');

        const testBooking = {
            customer_id: 1, // Use existing customer
            vehicle_id: 1,  // Use existing vehicle
            date: new Date().toISOString(),
            booking_state_id: 1, // Use first state
            total_price: 99.99,
            notes: 'Test booking from debug script',
            created_by: 1,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { data: manualBooking, error: manualError } = await supabase
            .from('bookings')
            .insert(testBooking)
            .select()
            .single();

        if (manualError) {
            console.error('❌ Manual booking creation failed:', manualError);
            console.log('   This might be the same error in the payment page');
        } else {
            console.log('✅ Manual booking created successfully:', manualBooking.id);
            console.log('   Payment page should work if data is provided correctly');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

debugBookingCreation();
