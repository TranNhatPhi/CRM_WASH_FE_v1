/**
 * Test script to simulate the exact query from POS Dashboard
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPOSDashboardQuery() {
    console.log('🧪 Testing POS Dashboard query simulation...\n');

    try {
        // Exact query from component
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                date,
                total_price,
                notes,
                createdAt,
                updatedAt,
                booking_state_id,
                customers!bookings_customer_id_fkey (
                    id,
                    name,
                    phone,
                    email
                ),
                vehicles!bookings_vehicle_id_fkey (
                    id,
                    license_plate,
                    make,
                    model,
                    color
                ),
                booking_state!bookings_booking_state_id_fkey (
                    id,
                    state_name,
                    description
                ),
                booking_services!booking_services_booking_id_fkey (
                    services!booking_services_service_id_fkey (
                        id,
                        name,
                        price
                    )
                )
            `)
            .order('createdAt', { ascending: false })
            .limit(10);

        if (bookingsError) {
            console.error('❌ Query Error:', bookingsError);
            return;
        }

        console.log(`✅ Query successful! Found ${bookingsData?.length || 0} bookings`);

        if (bookingsData && bookingsData.length > 0) {
            console.log('\n📋 Sample Dashboard Data:');

            bookingsData.forEach((booking, index) => {
                // Transform data exactly like in component
                const services = booking.booking_services?.map((bs) => bs.services?.name).filter(Boolean) || [];
                const total = booking.total_price || 0;

                // Map states
                const mapStateToUI = (stateName) => {
                    switch (stateName) {
                        case 'pending':
                        case 'draft':
                        case 'confirmed':
                            return 'pending';
                        case 'in_progress':
                        case 'washing':
                        case 'drying':
                            return 'in-progress';
                        case 'finished':
                        case 'completed':
                            return 'finished';
                        case 'cancelled':
                        case 'no_show':
                            return 'finished';
                        default:
                            return 'pending';
                    }
                };

                const dashboardItem = {
                    id: booking.id.toString(),
                    licensePlate: booking.vehicles?.license_plate || 'N/A',
                    customer: booking.customers?.name || 'Unknown Customer',
                    customerPhone: booking.customers?.phone || '',
                    time: new Date(booking.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    services: services,
                    total: total,
                    status: mapStateToUI(booking.booking_state?.state_name || 'pending'),
                    paymentStatus: Math.random() > 0.3 ? 'paid' : 'unpaid',
                    vehicleInfo: {
                        make: booking.vehicles?.make || undefined,
                        model: booking.vehicles?.model || undefined,
                        color: booking.vehicles?.color || undefined,
                    }
                };

                console.log(`${index + 1}. ${dashboardItem.licensePlate} - ${dashboardItem.customer}`);
                console.log(`   Services: ${services.join(', ') || 'None'}`);
                console.log(`   Status: ${dashboardItem.status} | Total: $${total}`);
                console.log(`   Time: ${dashboardItem.time}`);
                console.log('');
            });
        }

        console.log('🎉 POS Dashboard query working perfectly!');
        console.log('📱 The dashboard should now display booking data correctly.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testPOSDashboardQuery();
