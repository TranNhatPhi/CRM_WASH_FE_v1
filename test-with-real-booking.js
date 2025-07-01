const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testWithRealBooking() {
    console.log('🔍 Checking existing bookings...');

    try {
        // First check if we have any bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .limit(5);

        if (bookingsError) {
            console.log('❌ Error checking bookings:', bookingsError.message);
            return;
        }

        console.log(`📊 Found ${bookings?.length || 0} bookings`);

        if (bookings && bookings.length > 0) {
            const testBookingId = bookings[0].id;
            console.log(`🧪 Testing with existing booking ID: ${testBookingId}`);

            // Try to insert booking state
            const { data, error } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: testBookingId,
                    old_state: null,
                    current_state: 'draft'
                })
                .select();

            if (error) {
                console.log('❌ Insert failed:', error.message);
            } else {
                console.log('✅ Insert successful!');
                console.log('📄 Inserted data:', data);
            }

            // Check what we have in booking_state now
            const { data: states } = await supabase
                .from('booking_state')
                .select('*');
            console.log(`📋 Total booking states in table: ${states?.length || 0}`);

            if (states && states.length > 0) {
                console.log('📜 All booking states:');
                states.forEach((state, index) => {
                    console.log(`  ${index + 1}. ID: ${state.id}, Booking: ${state.booking_id}, State: ${state.old_state} → ${state.current_state}, Time: ${state.timestamp}`);
                });
            }

        } else {
            console.log('⚠️ No bookings found. Creating a test booking first...');

            // Create a test booking
            const { data: newBooking, error: createError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: 1, // Assuming customer ID 1 exists
                    vehicle_id: 1,  // Assuming vehicle ID 1 exists
                    service_date: new Date().toISOString(),
                    total_amount: 50000,
                    status: 'confirmed'
                })
                .select()
                .single();

            if (createError) {
                console.log('❌ Failed to create test booking:', createError.message);
                return;
            }

            console.log('✅ Created test booking:', newBooking);

            // Now test with this booking
            const { data, error } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: newBooking.id,
                    old_state: null,
                    current_state: 'draft'
                })
                .select();

            if (error) {
                console.log('❌ Insert booking state failed:', error.message);
            } else {
                console.log('✅ Booking state insert successful!');
                console.log('📄 Inserted data:', data);
            }
        }

    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
    }
}

testWithRealBooking();
