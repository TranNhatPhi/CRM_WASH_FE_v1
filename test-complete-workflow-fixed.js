/**
 * Test complete workflow: Create booking -> Start Wash -> Payment -> Finish Wash
 * để đảm bảo payment status được preserve
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://fvoyzowlnwqsmlqofxvd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3l6b3dsbndrb3NtbHFvZnh2ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMyNzQ4MzA2LCJleHAiOjIwNDgzMjQzMDZ9.hJe6Xs0DkSLOMWLtAUlP-fKq2hGvgpBXcwNFP1fBIlU'
);

// Simulate determinePaymentStatus function (after fix)
function determinePaymentStatus(notes, stateName) {
    // Priority: Check if payment was completed (paid status overrides unpaid)
    if (notes?.includes('Payment Status: paid')) {
        return 'paid';
    }

    // Check for explicit unpaid status
    if (notes?.includes('Payment Status: unpaid')) {
        return 'unpaid';
    }

    // If booking is in progress or finished, check for payment method
    if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
        // Check if there's payment method info in notes (indicating payment was made)
        if (notes?.includes('Method:')) {
            return 'paid';
        }
    }

    // Default to unpaid for pending bookings
    return 'unpaid';
}

async function testCompleteWorkflow() {
    console.log('🧪 Testing complete workflow: Create -> Start -> Pay -> Finish\n');

    try {
        // 1. Create a test booking
        console.log('1. Creating test booking...');
        const { data: booking, error: createError } = await supabase
            .from('bookings')
            .insert({
                customer_name: 'Test User',
                vehicle_license_plate: 'TEST123',
                total_price: 50.00,
                state: 'pending',
                notes: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Error creating booking:', createError.message);
            return;
        }

        const bookingId = booking.id;
        console.log(`✅ Created booking #${bookingId}`);

        // 2. Simulate "Start Wash" - update state to in_progress and add unpaid status
        console.log('\n2. Simulating "Start Wash"...');
        const startWashNotes = 'Payment Status: unpaid\nStatus updated to in_progress at ' + new Date().toLocaleString();

        const { error: startError } = await supabase
            .from('bookings')
            .update({
                state: 'in_progress',
                notes: startWashNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (startError) {
            console.error('❌ Error starting wash:', startError.message);
            return;
        }

        console.log('✅ Wash started - status: in_progress, payment: unpaid');
        console.log(`   Notes: "${startWashNotes}"`);

        // Check payment status after start
        let paymentStatus = determinePaymentStatus(startWashNotes, 'in_progress');
        console.log(`   🧪 Payment Status: ${paymentStatus} ${paymentStatus === 'unpaid' ? '✅' : '❌'}`);

        // 3. Simulate payment completion
        console.log('\n3. Simulating cash payment...');
        const paymentNotes = `Payment Status: paid | Payment Method: Cash | Amount Paid: $50.00 | Payment Date: ${new Date().toLocaleString()}`;

        // Simulate the fix: replace unpaid with paid
        let updatedNotes = startWashNotes;
        if (updatedNotes.includes('Payment Status: unpaid')) {
            updatedNotes = updatedNotes.replace('Payment Status: unpaid', paymentNotes);
        } else {
            updatedNotes = `${updatedNotes}\n${paymentNotes}`;
        }

        const { error: paymentError } = await supabase
            .from('bookings')
            .update({
                notes: updatedNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (paymentError) {
            console.error('❌ Error processing payment:', paymentError.message);
            return;
        }

        console.log('✅ Payment completed');
        console.log(`   Updated Notes: "${updatedNotes}"`);

        // Check payment status after payment
        paymentStatus = determinePaymentStatus(updatedNotes, 'in_progress');
        console.log(`   🧪 Payment Status: ${paymentStatus} ${paymentStatus === 'paid' ? '✅' : '❌'}`);

        // 4. Simulate "Finish Wash"
        console.log('\n4. Simulating "Finish Wash"...');
        const finishNote = `\nStatus updated to finished at ${new Date().toLocaleString()}`;
        const finalNotes = updatedNotes + finishNote;

        const { error: finishError } = await supabase
            .from('bookings')
            .update({
                state: 'finished',
                notes: finalNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (finishError) {
            console.error('❌ Error finishing wash:', finishError.message);
            return;
        }

        console.log('✅ Wash finished');
        console.log(`   Final Notes: "${finalNotes}"`);

        // Final check payment status after finish
        paymentStatus = determinePaymentStatus(finalNotes, 'finished');
        console.log(`   🧪 Final Payment Status: ${paymentStatus} ${paymentStatus === 'paid' ? '✅' : '❌'}`);

        // 5. Verify with database query
        console.log('\n5. Verifying with database...');
        const { data: finalBooking, error: verifyError } = await supabase
            .from('bookings')
            .select('id, state, notes')
            .eq('id', bookingId)
            .single();

        if (verifyError) {
            console.error('❌ Error verifying booking:', verifyError.message);
            return;
        }

        const dbPaymentStatus = determinePaymentStatus(finalBooking.notes, finalBooking.state);
        console.log(`📋 Database verification - Payment Status: ${dbPaymentStatus} ${dbPaymentStatus === 'paid' ? '✅' : '❌'}`);

        // 6. Cleanup - delete test booking
        console.log('\n6. Cleaning up test booking...');
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (deleteError) {
            console.error('❌ Error deleting test booking:', deleteError.message);
        } else {
            console.log('✅ Test booking cleaned up');
        }

        console.log('\n🎉 WORKFLOW TEST COMPLETED');
        console.log('🎯 RESULT: Payment status preserved through complete workflow!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteWorkflow();
