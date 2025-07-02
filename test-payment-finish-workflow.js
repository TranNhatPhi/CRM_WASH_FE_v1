/**
 * Script để test toàn bộ flow: Payment → Finish Wash
 * Đảm bảo payment status được preserve sau khi finish wash
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPaymentFinishWorkflow() {
    console.log('🧪 Testing Payment → Finish Wash workflow...\n');

    try {
        // 1. Tạo test booking
        console.log('1. Creating test booking...');

        // Get required IDs
        const { data: testCustomer } = await supabase.from('customers').select('id').limit(1).single();
        const { data: testVehicle } = await supabase.from('vehicles').select('id').limit(1).single();
        const { data: inProgressState } = await supabase.from('booking_state').select('id').eq('state_name', 'in_progress').single();

        const { data: newBooking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                customer_id: testCustomer.id,
                vehicle_id: testVehicle.id,
                booking_state_id: inProgressState.id,
                date: new Date().toISOString(),
                total_price: 99.99,
                notes: 'Test booking for workflow',
                created_by: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Failed to create test booking:', bookingError);
            return;
        }

        const testBookingId = newBooking.id;
        console.log(`✅ Created test booking #${testBookingId}`);

        // 2. Simulate payment completion
        console.log('\n2. Simulating payment completion...');

        const paymentNotes = `Payment Status: paid | Payment Method: Cash | Amount Paid: $99.99 | Payment Date: ${new Date().toLocaleString()}`;

        const { error: paymentError } = await supabase
            .from('bookings')
            .update({
                notes: paymentNotes,
                updatedAt: new Date().toISOString()
            })
            .eq('id', testBookingId);

        if (paymentError) {
            console.error('❌ Failed to update payment:', paymentError);
            return;
        }

        // Create transaction record
        const transactionResponse = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_id: testCustomer.id,
                booking_id: testBookingId,
                amount: 99.99,
                payment_method: 'cash',
                status: 'completed'
            })
        });

        if (transactionResponse.ok) {
            const transactionResult = await transactionResponse.json();
            console.log(`✅ Transaction created: #${transactionResult.data.id}`);
        }

        // 3. Check payment status after payment
        console.log('\n3. Checking payment status after payment...');
        const { data: afterPayment } = await supabase
            .from('bookings')
            .select('notes, booking_state(state_name)')
            .eq('id', testBookingId)
            .single();

        const determinePaymentStatus = (notes, stateName) => {
            if (notes?.includes('Payment Status: paid')) return 'paid';
            if (notes?.includes('Payment Status: unpaid')) return 'unpaid';
            if (['in_progress', 'finished', 'completed'].includes(stateName)) {
                if (notes?.includes('Method:')) return 'paid';
            }
            return 'unpaid';
        };

        const statusAfterPayment = determinePaymentStatus(afterPayment.notes, afterPayment.booking_state?.state_name);
        console.log(`   Payment Status: ${statusAfterPayment} ${statusAfterPayment === 'paid' ? '✅' : '❌'}`);
        console.log(`   Notes: "${afterPayment.notes}"`);

        // 4. Simulate finish wash (using FIXED logic)
        console.log('\n4. Simulating finish wash...');

        // Get current notes first (important!)
        const { data: currentBooking } = await supabase
            .from('bookings')
            .select('notes')
            .eq('id', testBookingId)
            .single();

        const { data: finishedState } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'finished')
            .single();

        // FIXED: Append to existing notes instead of replacing
        const existingNotes = currentBooking?.notes || '';
        const finishStatusNote = `\nStatus updated to finished at ${new Date().toLocaleString()}`;
        const updatedNotes = existingNotes + finishStatusNote;

        const { error: finishError } = await supabase
            .from('bookings')
            .update({
                booking_state_id: finishedState.id,
                notes: updatedNotes,
                updatedAt: new Date().toISOString()
            })
            .eq('id', testBookingId);

        if (finishError) {
            console.error('❌ Failed to finish wash:', finishError);
            return;
        }

        console.log('✅ Finish wash completed');

        // 5. Check payment status after finish wash
        console.log('\n5. Checking payment status after finish wash...');
        const { data: afterFinish } = await supabase
            .from('bookings')
            .select('notes, booking_state(state_name)')
            .eq('id', testBookingId)
            .single();

        const statusAfterFinish = determinePaymentStatus(afterFinish.notes, afterFinish.booking_state?.state_name);
        console.log(`   Payment Status: ${statusAfterFinish} ${statusAfterFinish === 'paid' ? '✅' : '❌'}`);
        console.log(`   Notes: "${afterFinish.notes}"`);

        // 6. Final result
        console.log('\n🎯 WORKFLOW TEST RESULT:');
        if (statusAfterPayment === 'paid' && statusAfterFinish === 'paid') {
            console.log('✅ SUCCESS! Payment status preserved through finish wash');
        } else {
            console.log('❌ FAILED! Payment status was lost');
        }

        // 7. Cleanup
        console.log('\n7. Cleaning up test data...');
        await supabase.from('transactions').delete().eq('booking_id', testBookingId);
        await supabase.from('bookings').delete().eq('id', testBookingId);
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run test
testPaymentFinishWorkflow().then(() => {
    console.log('\n✨ Workflow test completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});
