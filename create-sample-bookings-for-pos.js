/**
 * Script để tạo sample bookings data cho testing POS Dashboard
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleBookings() {
    console.log('📝 Creating sample bookings for POS Dashboard...');

    try {
        // First, let's get some existing customers and vehicles
        const { data: customers, error: customerError } = await supabase
            .from('customers')
            .select('id, name')
            .limit(5);

        if (customerError) {
            console.error('Error fetching customers:', customerError);
            return;
        }

        const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, license_plate, customer_id')
            .limit(8);

        if (vehicleError) {
            console.error('Error fetching vehicles:', vehicleError);
            return;
        }

        const { data: services, error: serviceError } = await supabase
            .from('services')
            .select('id, name, price')
            .limit(6);

        if (serviceError) {
            console.error('Error fetching services:', serviceError);
            return;
        }

        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (userError || !users?.length) {
            console.error('Error fetching users:', userError);
            return;
        }

        // Get booking states
        const { data: bookingStates, error: stateError } = await supabase
            .from('booking_state')
            .select('id, state_name');

        if (stateError) {
            console.error('Error fetching booking states:', stateError);
            return;
        }

        console.log(`Found ${customers?.length} customers, ${vehicles?.length} vehicles, ${services?.length} services`);
        console.log(`Booking states:`, bookingStates?.map(s => s.state_name));

        // Create sample bookings
        const sampleBookings = [
            {
                customer_id: customers[0]?.id || 1,
                vehicle_id: vehicles[0]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'pending')?.id || 1,
                total_price: 45.00,
                notes: 'Premium wash with wax',
                created_by: users[0].id,
                services: ['Premium Wash', 'Wax']
            },
            {
                customer_id: customers[1]?.id || 1,
                vehicle_id: vehicles[1]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'in_progress')?.id || 2,
                total_price: 25.00,
                notes: 'Basic wash service',
                created_by: users[0].id,
                services: ['Basic Wash']
            },
            {
                customer_id: customers[2]?.id || 1,
                vehicle_id: vehicles[2]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'finished')?.id || 3,
                total_price: 65.00,
                notes: 'Deluxe wash with interior clean',
                created_by: users[0].id,
                services: ['Deluxe Wash', 'Interior Clean']
            },
            {
                customer_id: customers[3]?.id || 1,
                vehicle_id: vehicles[3]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'in_progress')?.id || 2,
                total_price: 35.00,
                notes: 'Premium wash only',
                created_by: users[0].id,
                services: ['Premium Wash']
            },
            {
                customer_id: customers[0]?.id || 1,
                vehicle_id: vehicles[4]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'pending')?.id || 1,
                total_price: 30.00,
                notes: 'Basic wash with vacuum',
                created_by: users[0].id,
                services: ['Basic Wash', 'Vacuum']
            },
            {
                customer_id: customers[1]?.id || 1,
                vehicle_id: vehicles[5]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'finished')?.id || 3,
                total_price: 50.00,
                notes: 'Deluxe wash service',
                created_by: users[0].id,
                services: ['Deluxe Wash']
            },
            {
                customer_id: customers[2]?.id || 1,
                vehicle_id: vehicles[6]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'pending')?.id || 1,
                total_price: 40.00,
                notes: 'Basic wash with interior clean',
                created_by: users[0].id,
                services: ['Basic Wash', 'Interior Clean']
            },
            {
                customer_id: customers[3]?.id || 1,
                vehicle_id: vehicles[7]?.id || 1,
                date: new Date().toISOString(),
                booking_state_id: bookingStates?.find(s => s.state_name === 'in_progress')?.id || 2,
                total_price: 55.00,
                notes: 'Premium wash with wax and vacuum',
                created_by: users[0].id,
                services: ['Premium Wash', 'Wax', 'Vacuum']
            }
        ];

        for (let i = 0; i < sampleBookings.length; i++) {
            const booking = sampleBookings[i];

            // Create booking
            const { data: newBooking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: booking.customer_id,
                    vehicle_id: booking.vehicle_id,
                    date: booking.date,
                    booking_state_id: booking.booking_state_id,
                    total_price: booking.total_price,
                    notes: booking.notes,
                    created_by: booking.created_by,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (bookingError) {
                console.error(`Error creating booking ${i + 1}:`, bookingError);
                continue;
            }

            console.log(`✅ Created booking ${i + 1}: ${newBooking.id} - $${booking.total_price}`);

            // Add services to booking
            for (const serviceName of booking.services) {
                const service = services?.find(s => s.name === serviceName);
                if (service) {
                    const { error: serviceError } = await supabase
                        .from('booking_services')
                        .insert({
                            booking_id: newBooking.id,
                            service_id: service.id
                        });

                    if (serviceError) {
                        console.error(`Error adding service ${serviceName} to booking:`, serviceError);
                    }
                }
            }
        }

        console.log('🎉 Sample bookings created successfully!');
        console.log('📊 You can now view them in the POS Dashboard');

    } catch (error) {
        console.error('❌ Error creating sample bookings:', error);
    }
}

createSampleBookings();
