/**
 * Create sample bookings for testing the wash controller
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please make sure you have .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleBookings() {
    console.log('📋 Creating sample bookings...');

    try {
        // First, get some existing customers, vehicles, and services
        const [customersResult, vehiclesResult, servicesResult] = await Promise.all([
            supabase.from('customers').select('*').limit(5),
            supabase.from('vehicles').select('*').limit(5),
            supabase.from('services').select('*').limit(4)
        ]);

        const customers = customersResult.data || [];
        const vehicles = vehiclesResult.data || [];
        const services = servicesResult.data || [];

        if (customers.length === 0 || vehicles.length === 0 || services.length === 0) {
            console.log('⚠️  Please run setup-wash-data.js first to create customers, vehicles, and services');
            return;
        }

        // Create sample bookings with different statuses
        const sampleBookings = [
            {
                customer_id: customers[0]?.id,
                vehicle_id: vehicles[0]?.id,
                date: new Date().toISOString(),
                status: 'draft',
                notes: 'Quick wash needed',
                created_by: 1,
                total_price: 25.99,
                service_ids: [services[0]?.id, services[1]?.id].filter(Boolean)
            },
            {
                customer_id: customers[1]?.id || customers[0]?.id,
                vehicle_id: vehicles[1]?.id || vehicles[0]?.id,
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                status: 'booked',
                notes: 'Premium service requested',
                created_by: 1,
                total_price: 79.99,
                service_ids: [services[2]?.id].filter(Boolean)
            },
            {
                customer_id: customers[2]?.id || customers[0]?.id,
                vehicle_id: vehicles[2]?.id || vehicles[0]?.id,
                date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                status: 'in_progress',
                notes: 'Express wash in progress',
                created_by: 1,
                total_price: 15.99,
                service_ids: [services[0]?.id].filter(Boolean)
            },
            {
                customer_id: customers[3]?.id || customers[0]?.id,
                vehicle_id: vehicles[3]?.id || vehicles[0]?.id,
                date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                status: 'departed',
                notes: 'Customer has left, needs completion',
                created_by: 1,
                total_price: 45.98,
                service_ids: [services[0]?.id, services[3]?.id].filter(Boolean)
            },
            {
                customer_id: customers[4]?.id || customers[0]?.id,
                vehicle_id: vehicles[4]?.id || vehicles[0]?.id,
                date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                status: 'completed',
                notes: 'Completed successfully',
                created_by: 1,
                total_price: 105.97,
                service_ids: [services[0]?.id, services[1]?.id, services[2]?.id].filter(Boolean)
            }
        ];

        const createdBookings = [];

        for (const bookingData of sampleBookings) {
            try {
                // Create the booking
                const { data: booking, error: bookingError } = await supabase
                    .from('bookings')
                    .insert({
                        customer_id: bookingData.customer_id,
                        vehicle_id: bookingData.vehicle_id,
                        date: bookingData.date,
                        status: bookingData.status,
                        notes: bookingData.notes,
                        created_by: bookingData.created_by,
                        total_price: bookingData.total_price,
                        createdAt: bookingData.date,
                        updatedAt: bookingData.date
                    })
                    .select()
                    .single();

                if (bookingError) {
                    console.error('Error creating booking:', bookingError);
                    continue;
                }

                // Add services to the booking
                if (bookingData.service_ids.length > 0) {
                    const bookingServices = bookingData.service_ids.map(serviceId => ({
                        booking_id: booking.id,
                        service_id: serviceId,
                        createdAt: bookingData.date,
                        updatedAt: bookingData.date
                    }));

                    const { error: servicesError } = await supabase
                        .from('booking_services')
                        .insert(bookingServices);

                    if (servicesError) {
                        console.error('Error adding services to booking:', servicesError);
                    }
                }

                // Create initial booking state
                const { error: stateError } = await supabase
                    .from('booking_state')
                    .insert({
                        booking_id: booking.id,
                        old_state: null,
                        current_state: bookingData.status,
                        timestamp: bookingData.date
                    });

                if (stateError) {
                    console.error('Error creating booking state:', stateError);
                }

                // Update vehicle wash status
                let washStatus = 'No active wash';
                switch (bookingData.status) {
                    case 'booked':
                        washStatus = 'Scheduled for wash';
                        break;
                    case 'in_progress':
                        washStatus = 'Wash in progress';
                        break;
                    case 'departed':
                        washStatus = 'Departed from wash';
                        break;
                    case 'completed':
                        washStatus = 'Wash completed';
                        break;
                }

                await supabase
                    .from('vehicles')
                    .update({
                        wash_status: washStatus,
                        last_wash_at: bookingData.status === 'completed' ? bookingData.date : null,
                        updatedAt: bookingData.date
                    })
                    .eq('id', bookingData.vehicle_id);

                createdBookings.push(booking);
                console.log(`✅ Created booking #${booking.id} with status: ${bookingData.status}`);

            } catch (error) {
                console.error('Error creating sample booking:', error);
            }
        }

        console.log(`\n📊 Created ${createdBookings.length} sample bookings`);
        console.log('🎯 You can now test the wash controller at /wash-test');

        return createdBookings;

    } catch (error) {
        console.error('❌ Error creating sample bookings:', error);
        return [];
    }
}

async function main() {
    console.log('🚀 Creating sample bookings for wash controller testing...\n');

    await createSampleBookings();

    console.log('\n✅ Sample bookings created successfully!');
    console.log('🌐 Visit /wash-test to manage booking states');
}

main().catch(console.error);
