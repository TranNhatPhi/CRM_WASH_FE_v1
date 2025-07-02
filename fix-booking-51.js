/**
 * Script để fix booking #51 bị mất thông tin payment
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixBooking51() {
    console.log('🔧 Fixing booking #51 payment status...\n');

    try {
        // 1. Kiểm tra booking #51
        console.log('1. Checking booking #51 current status...');
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id,
                notes,
                total_price,
                booking_state(state_name),
                customers(name, phone),
                vehicles(license_plate)
            `)
            .eq('id', 51)
            .single();

        if (fetchError) {
            console.error('❌ Error fetching booking #51:', fetchError);
            return;
        }

        console.log('📋 Current booking #51 status:');
        console.log(`   Customer: ${booking.customers?.name}`);
        console.log(`   Vehicle: ${booking.vehicles?.license_plate}`);
        console.log(`   State: ${booking.booking_state?.state_name}`);
        console.log(`   Total: $${booking.total_price}`);
        console.log(`   Current Notes: "${booking.notes}"`);

        // 2. Kiểm tra có transaction record không
        console.log('\n2. Checking if transaction record exists...');
        const { data: transaction, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('booking_id', 51)
            .single();

        if (transError && transError.code === 'PGRST116') {
            console.log('❗ No transaction record found for booking #51');

            // 3. Tạo transaction record nếu chưa có
            console.log('\n3. Creating transaction record...');
            const createResponse = await fetch('http://localhost:3000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_id: booking.customers?.id || 1,
                    booking_id: 51,
                    amount: booking.total_price,
                    payment_method: 'cash',
                    status: 'completed'
                })
            });

            if (createResponse.ok) {
                const result = await createResponse.json();
                console.log('✅ Transaction created:', result.data.id);
            } else {
                console.error('❌ Failed to create transaction');
            }
        } else if (transaction) {
            console.log('✅ Transaction record already exists:', transaction.id);
        }

        // 4. Update notes để add payment info
        console.log('\n4. Updating booking notes with payment info...');

        // Construct proper payment notes
        const paymentInfo = `Payment Status: paid | Payment Method: Cash | Amount Paid: $${booking.total_price} | Payment Date: ${new Date().toLocaleString()}`;
        const existingNotes = booking.notes || '';

        // Add payment info at the beginning if not present
        let updatedNotes;
        if (existingNotes.includes('Payment Status:')) {
            console.log('✅ Payment status already in notes, no update needed');
            updatedNotes = existingNotes;
        } else {
            updatedNotes = paymentInfo + '\n' + existingNotes;

            const { error: updateError } = await supabase
                .from('bookings')
                .update({
                    notes: updatedNotes,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', 51);

            if (updateError) {
                console.error('❌ Error updating booking notes:', updateError);
            } else {
                console.log('✅ Booking notes updated successfully');
                console.log(`   New Notes: "${updatedNotes}"`);
            }
        }

        // 5. Verify fix
        console.log('\n5. Verifying fix...');
        const { data: verifyBooking, error: verifyError } = await supabase
            .from('bookings')
            .select('id, notes, booking_state(state_name)')
            .eq('id', 51)
            .single();

        if (!verifyError) {
            // Test payment status logic
            const determinePaymentStatus = (notes, stateName) => {
                if (notes?.includes('Payment Status: paid')) return 'paid';
                if (notes?.includes('Payment Status: unpaid')) return 'unpaid';
                if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
                    if (notes?.includes('Method:')) return 'paid';
                }
                return 'unpaid';
            };

            const paymentStatus = determinePaymentStatus(verifyBooking.notes, verifyBooking.booking_state?.state_name);
            console.log(`🎯 Payment Status Result: ${paymentStatus} ${paymentStatus === 'paid' ? '✅' : '🔴'}`);

            if (paymentStatus === 'paid') {
                console.log('🎉 SUCCESS! Booking #51 now shows as PAID');
            } else {
                console.log('❌ Still showing as UNPAID, needs more investigation');
            }
        }

    } catch (error) {
        console.error('💥 Error:', error);
    }
}

// Run fix
fixBooking51().then(() => {
    console.log('\n✨ Fix completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
});
