const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBookingStateTable() {
    console.log('🔍 Checking booking_state table...');

    try {
        // Try to query the table
        const { data, error } = await supabase
            .from('booking_state')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log('❌ booking_state table does NOT exist');
                console.log('📋 You need to create the table using create-booking-state-table.sql');
                return false;
            } else {
                console.log('⚠️ Error checking table:', error.message);
                return false;
            }
        } else {
            console.log('✅ booking_state table EXISTS');
            console.log(`📊 Found ${data?.length || 0} records in table`);

            if (data && data.length > 0) {
                console.log('📄 Sample records:');
                data.forEach((record, index) => {
                    console.log(`  ${index + 1}. ID: ${record.id}, Booking: ${record.booking_id}, State: ${record.old_state} → ${record.current_state}`);
                });
            }
            return true;
        }
    } catch (error) {
        console.log('💥 Connection error:', error.message);
        return false;
    }
}

async function testStateTransition() {
    console.log('\n🧪 Testing state transition...');

    const testBookingId = Math.floor(Math.random() * 1000) + 1;
    console.log(`📋 Using test booking ID: ${testBookingId}`);

    try {
        // Test inserting a new state
        const { data, error } = await supabase
            .from('booking_state')
            .insert({
                booking_id: testBookingId,
                old_state: null,
                current_state: 'draft'
            })
            .select()
            .single();

        if (error) {
            console.log('❌ Failed to insert state:', error.message);
            return false;
        } else {
            console.log('✅ Successfully inserted state record');
            console.log('📄 Record details:', data);

            // Test transition
            const { data: transitionData, error: transitionError } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: testBookingId,
                    old_state: 'draft',
                    current_state: 'booked'
                })
                .select()
                .single();

            if (transitionError) {
                console.log('❌ Failed to insert transition:', transitionError.message);
            } else {
                console.log('✅ Successfully inserted transition record');
                console.log('📄 Transition details:', transitionData);
            }

            return true;
        }
    } catch (error) {
        console.log('💥 Test error:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚗 Booking State Database Check\n');

    const tableExists = await checkBookingStateTable();

    if (tableExists) {
        await testStateTransition();
        console.log('\n✅ All tests completed');
    } else {
        console.log('\n📝 To create the table:');
        console.log('1. Open Supabase SQL Editor');
        console.log('2. Run the SQL from create-booking-state-table.sql');
        console.log('3. Run this script again');
    }
}

main().catch(console.error);
