import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dknrcqpmnhubkhkxptqp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbnJjcXBtbmh1Ymtoa3hwdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MDAzOTgsImV4cCI6MjA1MTI3NjM5OH0.-ioRLFPNRc8HGE-LkrPOFdLCcq9pHLBG-Wm_GJPwMrQ'
);

async function checkBooking() {
    console.log('Checking booking 11111...');

    const { data, error } = await supabase
        .from('bookings')
        .select(`
      id, 
      notes, 
      total_price,
      booking_state (
        id,
        state_name,
        description
      )
    `)
        .eq('id', 11111)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Booking 11111 data:');
    console.log('ID:', data.id);
    console.log('Notes:', data.notes);
    console.log('Total Price:', data.total_price);
    console.log('State:', data.booking_state?.state_name);
    console.log('State Description:', data.booking_state?.description);

    // Test payment status logic
    const determinePaymentStatus = (notes, stateName) => {
        console.log('\n--- Payment Status Logic ---');
        console.log('Input - Notes:', notes);
        console.log('Input - State:', stateName);

        if (notes?.includes('Payment Status: paid')) {
            console.log('✓ Found "Payment Status: paid" in notes');
            return 'paid';
        }
        if (notes?.includes('Payment Status: unpaid')) {
            console.log('✓ Found "Payment Status: unpaid" in notes');
            return 'unpaid';
        }

        if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
            console.log('✓ Booking is active (in_progress/finished/completed)');
            if (notes?.includes('Method:')) {
                console.log('✓ Found payment method in notes');
                return 'paid';
            } else {
                console.log('✗ No payment method found in notes');
            }
        } else {
            console.log('✗ Booking is not active, state:', stateName);
        }

        console.log('→ Defaulting to unpaid');
        return 'unpaid';
    };

    const paymentStatus = determinePaymentStatus(data.notes, data.booking_state?.state_name);
    console.log('\nFinal payment status:', paymentStatus);

    // Check if viewOnly should be true or false
    console.log('\n--- ViewOnly Logic ---');
    const shouldBeViewOnly = paymentStatus === 'paid';
    console.log('viewOnly should be:', shouldBeViewOnly);

    return { data, paymentStatus, shouldBeViewOnly };
}

checkBooking().catch(console.error);
