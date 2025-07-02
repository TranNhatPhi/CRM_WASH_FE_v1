/**
 * Debug script để kiểm tra notes của booking sau khi finish wash
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugBookingNotes() {
    console.log('🔍 Debug notes của bookings sau payment và finish wash...\n');

    try {
        // Lấy bookings gần đây nhất
        const { data: recentBookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                notes,
                total_price,
                booking_state(state_name),
                customers(name, phone),
                vehicles(license_plate)
            `)
            .order('updatedAt', { ascending: false })
            .limit(5);

        if (error) {
            console.error('❌ Lỗi:', error);
            return;
        }

        console.log(`📋 Tìm thấy ${recentBookings.length} bookings gần đây:`);

        recentBookings.forEach((booking, index) => {
            console.log(`\n📋 Booking ${index + 1}: #${booking.id}`);
            console.log(`   Customer: ${booking.customers?.name}`);
            console.log(`   Vehicle: ${booking.vehicles?.license_plate}`);
            console.log(`   State: ${booking.booking_state?.state_name}`);
            console.log(`   Total: $${booking.total_price}`);
            console.log(`   Notes:`);
            console.log(`   --------------------------------`);
            console.log(`   ${booking.notes || 'No notes'}`);
            console.log(`   --------------------------------`);

            // Test payment status logic
            const determinePaymentStatus = (notes, stateName) => {
                console.log(`\n   🧪 Testing payment status logic:`);
                console.log(`   - Has "Payment Status: paid": ${notes?.includes('Payment Status: paid') ? 'YES' : 'NO'}`);
                console.log(`   - Has "Payment Status: unpaid": ${notes?.includes('Payment Status: unpaid') ? 'YES' : 'NO'}`);
                console.log(`   - State (${stateName}) in progress/finished/completed: ${['in_progress', 'finished', 'completed'].includes(stateName) ? 'YES' : 'NO'}`);
                console.log(`   - Has "Method:": ${notes?.includes('Method:') ? 'YES' : 'NO'}`);

                if (notes?.includes('Payment Status: paid')) {
                    return 'paid';
                }
                if (notes?.includes('Payment Status: unpaid')) {
                    return 'unpaid';
                }
                if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
                    if (notes?.includes('Method:')) {
                        return 'paid';
                    }
                }
                return 'unpaid';
            };

            const paymentStatus = determinePaymentStatus(booking.notes, booking.booking_state?.state_name);
            console.log(`   ➡️  RESULT: ${paymentStatus} ${paymentStatus === 'unpaid' ? '🔴' : '✅'}`);
        });

    } catch (error) {
        console.error('💥 Lỗi:', error);
    }
}

// Chạy debug
debugBookingNotes().then(() => {
    console.log('\n✨ Debug hoàn tất');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug thất bại:', error);
    process.exit(1);
});
