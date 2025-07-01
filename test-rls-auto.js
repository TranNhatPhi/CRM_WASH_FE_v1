const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSAndFix() {
    console.log('🔧 Testing RLS and attempting auto-fix...\n');

    try {
        // Test 1: Check if table exists
        console.log('1️⃣ Checking if booking_state table exists...');
        const { data: tableCheck, error: tableError } = await supabase
            .from('booking_state')
            .select('*')
            .limit(1);

        if (tableError) {
            if (tableError.code === 'PGRST116' || tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
                console.log('❌ booking_state table does NOT exist');
                console.log('📋 Please create the table using create-booking-state-table.sql first');
                return;
            }
        }
        console.log('✅ Table exists');

        // Test 2: Try to insert data
        console.log('\n2️⃣ Testing insert operation...');
        const testBookingId = Math.floor(Math.random() * 1000) + 1;

        const { data: insertData, error: insertError } = await supabase
            .from('booking_state')
            .insert({
                booking_id: testBookingId,
                old_state: null,
                current_state: 'draft'
            })
            .select()
            .single();

        if (insertError) {
            if (insertError.message.includes('row-level security')) {
                console.log('❌ RLS (Row Level Security) is blocking inserts');
                console.log('🔧 RLS needs to be disabled or proper policies need to be created');
                console.log('\n📋 To fix this issue:');
                console.log('1. Go to Supabase SQL Editor');
                console.log('2. Run: ALTER TABLE booking_state DISABLE ROW LEVEL SECURITY;');
                console.log('3. Or go to http://localhost:3000/database-setup for full instructions');
                return;
            } else {
                console.log('❌ Insert failed with error:', insertError.message);
                return;
            }
        }

        console.log('✅ Insert successful!');
        console.log('📄 Inserted record:', insertData);

        // Test 3: Try to read the data back
        console.log('\n3️⃣ Testing read operation...');
        const { data: readData, error: readError } = await supabase
            .from('booking_state')
            .select('*')
            .eq('booking_id', testBookingId);

        if (readError) {
            console.log('❌ Read failed:', readError.message);
            return;
        }

        console.log('✅ Read successful!');
        console.log('📄 Read records:', readData);

        // Test 4: Test state transition
        console.log('\n4️⃣ Testing state transition...');
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
            console.log('❌ State transition failed:', transitionError.message);
            return;
        }

        console.log('✅ State transition successful!');
        console.log('📄 Transition record:', transitionData);

        // Test 5: Get state history
        console.log('\n5️⃣ Testing state history query...');
        const { data: historyData, error: historyError } = await supabase
            .from('booking_state')
            .select('*')
            .eq('booking_id', testBookingId)
            .order('timestamp', { ascending: true });

        if (historyError) {
            console.log('❌ History query failed:', historyError.message);
            return;
        }

        console.log('✅ History query successful!');
        console.log('📜 State history:');
        historyData.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.old_state || 'NULL'} → ${record.current_state} (${new Date(record.timestamp).toLocaleString()})`);
        });

        console.log('\n🎉 All tests passed! Booking state is working correctly!');
        console.log('🚀 You can now use the booking state management in your app');

    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
    }
}

// Run the test
testRLSAndFix();
