import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentStatusUpdate() {
    try {
        console.log('🧪 Testing payment status update...\n');

        // Find a booking with unpaid status
        const { data: unpaidBooking, error: findError } = await supabase
            .from('bookings')
            .select('id, notes, total_price')
            .ilike('notes', '%Payment Status: unpaid%')
            .limit(1)
            .single();

        if (findError || !unpaidBooking) {
            console.log('No unpaid bookings found, creating a test booking...');

            // Create a test booking with unpaid status
            const testBooking = {
                customer_id: 1,
                vehicle_id: 1,
                booking_state_id: 3,
                date: new Date().toISOString().split('T')[0],
                total_price: 77.00,
                notes: 'Test booking\nPayment Status: unpaid | Cart items: 2',
                created_by: 1,
                updated_by: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const { data: newBooking, error: createError } = await supabase
                .from('bookings')
                .insert(testBooking)
                .select('id, notes, total_price')
                .single();

            if (createError) {
                console.error('❌ Error creating test booking:', createError);
                return;
            }

            console.log('✅ Created test booking:', newBooking);
            var bookingToUpdate = newBooking;
        } else {
            console.log('✅ Found unpaid booking:', unpaidBooking);
            var bookingToUpdate = unpaidBooking;
        }

        console.log('\n💰 Simulating payment completion...');

        // Simulate payment completion (like in Payment page)
        const paymentMethod = 'Cash';
        const totalAmount = bookingToUpdate.total_price;

        // Prepare payment notes
        const paymentNotes = `Payment Status: paid | Payment Method: ${paymentMethod} | Amount Paid: $${totalAmount} | Payment Date: ${new Date().toLocaleString()}`;
        let updatedNotes = bookingToUpdate.notes || '';

        // Replace "Payment Status: unpaid" with new payment status
        if (updatedNotes.includes('Payment Status: unpaid')) {
            updatedNotes = updatedNotes.replace('Payment Status: unpaid', 'Payment Status: paid');
            updatedNotes += `\n${paymentNotes}`;
        } else {
            updatedNotes = `${updatedNotes}\n${paymentNotes}`;
        }

        console.log('📝 Original notes:', bookingToUpdate.notes);
        console.log('📝 Updated notes:', updatedNotes);

        // Update booking with payment status
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                notes: updatedNotes,
                updatedAt: new Date().toISOString()
            })
            .eq('id', bookingToUpdate.id);

        if (updateError) {
            console.error('❌ Error updating booking:', updateError);
            return;
        }

        console.log('✅ Booking payment status updated successfully!');

        // Verify the update
        const { data: verifyBooking, error: verifyError } = await supabase
            .from('bookings')
            .select('id, notes, total_price')
            .eq('id', bookingToUpdate.id)
            .single();

        if (verifyError) {
            console.error('❌ Error verifying update:', verifyError);
            return;
        }

        console.log('\n🔍 Verification:');
        console.log('Updated booking:', verifyBooking);

        // Check payment status determination (like POS Dashboard does)
        const determinePaymentStatus = (notes) => {
            if (notes?.includes('Payment Status: paid')) {
                return 'PAID';
            }
            if (notes?.includes('Payment Status: unpaid')) {
                return 'UNPAID';
            }
            return 'UNKNOWN';
        };

        const paymentStatus = determinePaymentStatus(verifyBooking.notes);
        console.log('\n🏷️ Payment Status Badge:', paymentStatus);

        if (paymentStatus === 'PAID') {
            console.log('🎉 SUCCESS! Payment status correctly updated to PAID');
            console.log('   - UNPAID badge will no longer show in POS Dashboard');
            console.log('   - Booking will appear as paid');
        } else {
            console.log('❌ FAILED! Payment status not updated correctly');
        }

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testPaymentStatusUpdate().then(() => {
    console.log('\n✨ Payment status update test complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
