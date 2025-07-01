import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dknrcqpmnhubkhkxptqp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbnJjcXBtbmh1Ymtoa3hwdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MDAzOTgsImV4cCI6MjA1MTI3NjM5OH0.-ioRLFPNRc8HGE-LkrPOFdLCcq9pHLBG-Wm_GJPwMrQ'
);

async function fixBookingData() {
    console.log('Checking booking 11111 data...');

    // Check booking with full relationships
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
      id,
      total_price,
      notes,
      booking_state (
        id,
        state_name
      ),
      customers (
        id,
        name,
        phone
      ),
      vehicles (
        id,
        license_plate
      ),
      booking_services (
        id,
        services (
          id,
          name,
          price
        )
      )
    `)
        .eq('id', 11111)
        .single();

    if (error) {
        console.error('Error fetching booking:', error);
        return;
    }

    console.log('Booking data:', JSON.stringify(booking, null, 2));

    // Check if booking has services
    if (!booking.booking_services || booking.booking_services.length === 0) {
        console.log('No services found for booking 11111. Adding default service...');

        // Get a service to add
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('id, name, price')
            .limit(1);

        if (servicesError) {
            console.error('Error fetching services:', servicesError);
            return;
        }

        if (services && services.length > 0) {
            const service = services[0];

            // Add service to booking
            const { error: insertError } = await supabase
                .from('booking_services')
                .insert({
                    booking_id: 11111,
                    service_id: service.id
                });

            if (insertError) {
                console.error('Error adding service to booking:', insertError);
            } else {
                console.log(`Added service "${service.name}" to booking 11111`);

                // Update booking total if needed
                if (!booking.total_price || booking.total_price === 0) {
                    const { error: updateError } = await supabase
                        .from('bookings')
                        .update({ total_price: service.price })
                        .eq('id', 11111);

                    if (updateError) {
                        console.error('Error updating booking total:', updateError);
                    } else {
                        console.log(`Updated booking total to $${service.price}`);
                    }
                }
            }
        }
    }

    console.log('Data check complete!');
}

fixBookingData().catch(console.error);
