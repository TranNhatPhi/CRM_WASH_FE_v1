const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findPaidBookings() {
    try {
        console.log('🔍 Tìm kiếm bookings đã thanh toán...');

        // Tìm booking có notes chứa "Payment Status: paid"
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .ilike('notes', '%Payment Status: paid%')
            .limit(3);

        if (error) {
            console.error('❌ Lỗi:', error);
            return;
        }

        console.log(`📊 Tìm thấy ${bookings.length} booking đã thanh toán:`);

        for (const booking of bookings) {
            console.log(`\n📋 Booking ID: ${booking.id}`);
            console.log(`   Total: $${booking.total_amount}`);
            console.log(`   Notes: ${booking.notes?.substring(0, 100)}...`);

            // Lấy thông tin customer và vehicle
            const { data: customer } = await supabase
                .from('customers')
                .select('name, phone')
                .eq('id', booking.customer_id)
                .single();

            const { data: vehicle } = await supabase
                .from('vehicles')
                .select('license_plate')
                .eq('id', booking.vehicle_id)
                .single();

            console.log(`   Customer: ${customer?.name} (${customer?.phone})`);
            console.log(`   Vehicle: ${vehicle?.license_plate}`);

            // Tạo cart data mẫu cho booking này
            const cartData = {
                cart: [
                    {
                        service: { id: 'basic-wash', name: 'Basic Wash', price: 20.00 },
                        quantity: 1,
                        subtotal: 20.00
                    },
                    {
                        service: { id: 'premium-detail', name: 'Premium Detail', price: 50.00 },
                        quantity: 1,
                        subtotal: 50.00
                    }
                ],
                carInfo: {
                    licensePlate: vehicle?.license_plate || 'ABC123',
                    status: 'finished',
                    total: booking.total_amount,
                    bookingId: booking.id,
                    notes: booking.notes
                },
                customerInfo: {
                    name: customer?.name || 'Test Customer',
                    phone: customer?.phone || '555-1234',
                    isVip: false
                },
                viewOnly: true
            };

            console.log(`\n🔧 Để test booking này, copy và paste vào browser console:`);
            console.log(`localStorage.setItem('pos-cart', '${JSON.stringify(cartData)}');`);
            console.log(`Sau đó reload trang payment`);
        }

    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

findPaidBookings();
