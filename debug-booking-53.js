const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://fvoyzowlnwqsmlqofxvd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3l6b3dsbndrb3NtbHFvZnh2ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMyNzQ4MzA2LCJleHAiOjIwNDgzMjQzMDZ9.hJe6Xs0DkSLOMWLtAUlP-fKq2hGvgpBXcwNFP1fBIlU'
);

async function debugBooking53() {
    console.log('🔍 Debug booking #53...\n');

    try {
        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', 53)
            .single();

        if (bookingError) {
            console.log('❌ Error fetching booking:', bookingError.message);
            return;
        }

        if (!booking) {
            console.log('❌ Booking #53 not found');
            return;
        }

        console.log('📋 BOOKING DETAILS:');
        console.log('ID:', booking.id);
        console.log('Customer:', booking.customer_name);
        console.log('Vehicle:', booking.vehicle_license_plate);
        console.log('State:', booking.state);
        console.log('Total Price:', '$' + booking.total_price);
        console.log('Created:', booking.created_at);
        console.log('Updated:', booking.updated_at);
        console.log('\n📝 NOTES:');
        console.log('================================');
        console.log(booking.notes || '(empty)');
        console.log('================================\n');

        // Check transactions
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('booking_id', 53);

        if (transError) {
            console.log('❌ Error fetching transactions:', transError.message);
        } else {
            console.log('💰 TRANSACTIONS:', transactions?.length || 0);
            if (transactions?.length > 0) {
                transactions.forEach((t, i) => {
                    console.log(`Transaction ${i + 1}:`);
                    console.log('  ID:', t.id);
                    console.log('  Amount:', '$' + t.amount);
                    console.log('  Method:', t.payment_method);
                    console.log('  Status:', t.status);
                    console.log('  Created:', t.created_at);
                    console.log('');
                });
            } else {
                console.log('❌ No transactions found');
            }
        }

        // Test payment status logic
        console.log('🧪 TESTING PAYMENT STATUS LOGIC:');
        const notes = booking.notes || '';
        const hasPaidStatus = notes.includes('Payment Status: paid');
        const hasUnpaidStatus = notes.includes('Payment Status: unpaid');
        const hasMethod = notes.includes('Method:');
        const isInProgress = ['in_progress', 'finished', 'completed'].includes(booking.state);

        console.log('- Has "Payment Status: paid":', hasPaidStatus ? 'YES ✅' : 'NO ❌');
        console.log('- Has "Payment Status: unpaid":', hasUnpaidStatus ? 'YES ❌' : 'NO ✅');
        console.log('- Has "Method:":', hasMethod ? 'YES ✅' : 'NO ❌');
        console.log('- State is progress/finished/completed:', isInProgress ? 'YES ✅' : 'NO ❌');

        let paymentStatus;
        if (hasPaidStatus && !hasUnpaidStatus && isInProgress && hasMethod) {
            paymentStatus = 'paid';
        } else if (hasUnpaidStatus || (!hasPaidStatus && isInProgress)) {
            paymentStatus = 'unpaid';
        } else {
            paymentStatus = 'pending';
        }

        console.log('\n➡️  FINAL PAYMENT STATUS:', paymentStatus.toUpperCase(), paymentStatus === 'paid' ? '✅' : '🔴');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugBooking53();
