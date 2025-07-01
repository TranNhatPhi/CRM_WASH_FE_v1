import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Present' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBookingCreation() {
    try {
        console.log('🔍 Checking booking creation with license plate 11111111...\n');

        // First, check recent bookings
        console.log('📋 Recent bookings:');
        const { data: recentBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id, 
                customer_id, 
                vehicle_id, 
                booking_state_id,
                date,
                total_price,
                notes,
                createdAt,
                customers(name, phone),
                vehicles(license_plate),
                booking_state(state_name)
            `)
            .order('createdAt', { ascending: false })
            .limit(5);

        if (bookingsError) {
            console.error('❌ Error fetching bookings:', bookingsError);
        } else {
            console.log('✅ Recent bookings:', JSON.stringify(recentBookings, null, 2));
        }

        // Check for specific license plate
        console.log('\n🚗 Checking bookings for license plate 11111111:');
        const { data: specificBookings, error: specificError } = await supabase
            .from('bookings')
            .select(`
                id, 
                total_price,
                notes,
                createdAt,
                customers(name, phone),
                vehicles(license_plate),
                booking_state(state_name)
            `)
            .eq('vehicles.license_plate', '11111111')
            .order('createdAt', { ascending: false });

        if (specificError) {
            console.error('❌ Error fetching specific bookings:', specificError);
        } else {
            console.log('✅ Bookings for 11111111:', JSON.stringify(specificBookings, null, 2));
        }

        // Check customers table
        console.log('\n👥 Checking customers with phone or name containing "trần nhật phi":');
        const { data: customers, error: customersError } = await supabase
            .from('customers')
            .select('*')
            .or('name.ilike.%trần nhật phi%,phone.like.%11111111%');

        if (customersError) {
            console.error('❌ Error fetching customers:', customersError);
        } else {
            console.log('✅ Matching customers:', JSON.stringify(customers, null, 2));
        }

        // Check vehicles table
        console.log('\n🚗 Checking vehicles with license plate 11111111:');
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('license_plate', '11111111');

        if (vehiclesError) {
            console.error('❌ Error fetching vehicles:', vehiclesError);
        } else {
            console.log('✅ Matching vehicles:', JSON.stringify(vehicles, null, 2));
        }

        // Check booking states
        console.log('\n📊 Available booking states:');
        const { data: states, error: statesError } = await supabase
            .from('booking_state')
            .select('*');

        if (statesError) {
            console.error('❌ Error fetching booking states:', statesError);
        } else {
            console.log('✅ Booking states:', JSON.stringify(states, null, 2));
        }

        console.log('\n✨ Check complete!');

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Run the check
checkBookingCreation().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
