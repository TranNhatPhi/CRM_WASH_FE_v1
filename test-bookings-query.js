const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBookingsQuery() {
    console.log('=== Testing bookings query ===');

    // Test simple query first
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(5);

    console.log('Simple bookings query:');
    if (bookingsError) {
        console.log('Error:', bookingsError);
    } else {
        console.log('Found bookings:', bookings?.length || 0);
        if (bookings?.length > 0) {
            console.log('Sample booking:', bookings[0]);
        }
    }

    // Test with simple joins
    const { data: bookingsWithJoins, error: joinError } = await supabase
        .from('bookings')
        .select(`
      id,
      total_price,
      createdAt,
      customers(name),
      vehicles(license_plate),
      booking_state(state_name)
    `)
        .limit(3);

    console.log('\n=== Bookings with joins ===');
    if (joinError) {
        console.log('Join Error:', joinError);
    } else {
        console.log('Found bookings with joins:', bookingsWithJoins?.length || 0);
        if (bookingsWithJoins?.length > 0) {
            console.log('Sample:', JSON.stringify(bookingsWithJoins[0], null, 2));
        }
    }

    // Test the exact query from the component
    console.log('\n=== Testing exact component query ===');
    const { data: exactQuery, error: exactError } = await supabase
        .from('bookings')
        .select(`
        id,
        date,
        total_price,
        notes,
        createdAt,
        updatedAt,
        booking_state_id,
        customers!bookings_customer_id_fkey (
            id,
            name,
            phone,
            email
        ),
        vehicles!bookings_vehicle_id_fkey (
            id,
            license_plate,
            make,
            model,
            color
        ),
        booking_state!bookings_booking_state_id_fkey (
            id,
            state_name,
            description
        )
    `)
        .order('createdAt', { ascending: false })
        .limit(3);

    if (exactError) {
        console.log('Exact query error:', exactError);
    } else {
        console.log('Exact query success! Found:', exactQuery?.length || 0);
        if (exactQuery?.length > 0) {
            console.log('Sample result:', JSON.stringify(exactQuery[0], null, 2));
        }
    }
}

testBookingsQuery().catch(console.error);
