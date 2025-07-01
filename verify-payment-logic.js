/**
 * Script để verify payment status logic trong POS Dashboard
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyPaymentStatusLogic() {
    console.log('🧪 Verifying payment status logic in POS Dashboard...\n');

    // Function to determine payment status (same as in component)
    const determinePaymentStatus = (notes, stateName) => {
        // Check if payment info is in notes
        if (notes?.includes('Payment Status: paid')) {
            return 'paid';
        }
        if (notes?.includes('Payment Status: unpaid')) {
            return 'unpaid';
        }

        // If booking is in progress or finished, likely paid
        if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
            // Check if there's payment method info in notes
            if (notes?.includes('Method:')) {
                return 'paid';
            }
        }

        // Default to unpaid for pending bookings
        return 'unpaid';
    };

    try {
        // Get recent bookings to test
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                notes,
                total_price,
                booking_state(state_name),
                customers(name),
                vehicles(license_plate)
            `)
            .order('createdAt', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching bookings:', error);
            return;
        }

        console.log('📋 Payment Status Test Results:\n');

        bookings.forEach((booking, index) => {
            const paymentStatus = determinePaymentStatus(
                booking.notes || '',
                booking.booking_state?.state_name || ''
            );

            const displayStatus = paymentStatus === 'unpaid' ? 'UNPAID 🔴' : 'PAID ✅';

            console.log(`${index + 1}. Booking #${booking.id}`);
            console.log(`   License: ${booking.vehicles?.license_plate || 'N/A'}`);
            console.log(`   Customer: ${booking.customers?.name || 'Unknown'}`);
            console.log(`   State: ${booking.booking_state?.state_name || 'unknown'}`);
            console.log(`   Notes: ${booking.notes || 'No notes'}`);
            console.log(`   Payment Status: ${displayStatus}`);
            console.log(`   Total: $${booking.total_price || 0}`);
            console.log('');
        });

        console.log('🎯 Expected Dashboard Behavior:');
        console.log('- Bookings with "UNPAID 🔴" should show red UNPAID badge');
        console.log('- Bookings with "PAID ✅" should NOT show UNPAID badge');
        console.log('\n🌐 Check POS Dashboard: http://localhost:3000/pos-dashboard');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyPaymentStatusLogic();
