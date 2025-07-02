const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://fvoyzowlnwqsmlqofxvd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3l6b3dsbndrb3NtbHFvZnh2ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMyNzQ4MzA2LCJleHAiOjIwNDgzMjQzMDZ9.hJe6Xs0DkSLOMWLtAUlP-fKq2hGvgpBXcwNFP1fBIlU'
);

async function cleanupPaymentNotes() {
    console.log('🧹 Cleanup duplicate payment status in booking notes...\n');

    try {
        // Get all bookings with notes
        const { data: bookings, error: fetchError } = await supabase
            .from('bookings')
            .select('id, notes, booking_state(state_name)')
            .not('notes', 'is', null);

        if (fetchError) {
            console.error('❌ Error fetching bookings:', fetchError.message);
            return;
        }

        console.log(`📋 Found ${bookings.length} bookings with notes`);

        let cleanedCount = 0;

        for (const booking of bookings) {
            const notes = booking.notes || '';

            // Check if notes contains both paid and unpaid status
            const hasPaid = notes.includes('Payment Status: paid');
            const hasUnpaid = notes.includes('Payment Status: unpaid');

            if (hasPaid && hasUnpaid) {
                console.log(`\n🔧 Cleaning booking #${booking.id}:`);
                console.log(`   State: ${booking.booking_state?.state_name}`);
                console.log(`   Original notes (first 100 chars): "${notes.substring(0, 100)}..."`);

                // Remove all "Payment Status: unpaid" lines since we have "Payment Status: paid"
                let cleanedNotes = notes;

                // Remove standalone "Payment Status: unpaid" lines
                cleanedNotes = cleanedNotes.replace(/\nPayment Status: unpaid/g, '');
                cleanedNotes = cleanedNotes.replace(/^Payment Status: unpaid\n?/g, '');
                cleanedNotes = cleanedNotes.replace(/Payment Status: unpaid\n/g, '');

                // Clean up any extra newlines
                cleanedNotes = cleanedNotes.replace(/\n\n+/g, '\n\n');
                cleanedNotes = cleanedNotes.trim();

                if (cleanedNotes !== notes) {
                    console.log(`   ✅ Cleaned notes (first 100 chars): "${cleanedNotes.substring(0, 100)}..."`);

                    // Update the booking
                    const { error: updateError } = await supabase
                        .from('bookings')
                        .update({ notes: cleanedNotes })
                        .eq('id', booking.id);

                    if (updateError) {
                        console.log(`   ❌ Error updating booking #${booking.id}:`, updateError.message);
                    } else {
                        console.log(`   ✅ Updated booking #${booking.id} successfully`);
                        cleanedCount++;
                    }
                } else {
                    console.log(`   ℹ️  No changes needed for booking #${booking.id}`);
                }
            }
        }

        console.log(`\n🎉 Cleanup completed! Cleaned ${cleanedCount} bookings.`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanupPaymentNotes();
