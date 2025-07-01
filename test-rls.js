const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithServiceKey() {
    console.log('🔑 Testing with service key...');

    const testBookingId = Math.floor(Math.random() * 1000) + 1;

    try {
        // Try to insert using service key (bypasses RLS)
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
            console.log('❌ Still failed with service key:', error.message);

            // Try to check RLS status
            const { data: rlsData, error: rlsError } = await supabase
                .rpc('check_rls_status');

            console.log('RLS Check:', rlsData, rlsError);
        } else {
            console.log('✅ Success with service key!');
            console.log('📄 Inserted record:', data);

            // Test reading
            const { data: readData, error: readError } = await supabase
                .from('booking_state')
                .select('*')
                .eq('booking_id', testBookingId);

            if (readError) {
                console.log('❌ Read error:', readError.message);
            } else {
                console.log('✅ Read success:', readData);
            }
        }
    } catch (error) {
        console.log('💥 Error:', error.message);
    }
}

async function disableRLS() {
    console.log('🔧 Attempting to disable RLS...');

    try {
        const { data, error } = await supabase
            .rpc('disable_rls_booking_state');

        if (error) {
            console.log('❌ Cannot disable RLS via function:', error.message);
        } else {
            console.log('✅ RLS disabled successfully');
        }
    } catch (error) {
        console.log('💥 RLS disable error:', error.message);
    }
}

async function main() {
    console.log('🛠️ Booking State RLS Fix Test\n');

    await testWithServiceKey();
    // await disableRLS();
}

main().catch(console.error);
