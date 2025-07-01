// Script để lấy thông tin services thật từ booking trong database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getBookingServicesDetails() {
    try {
        console.log('🔍 Lấy chi tiết services từ bookings...');

        // Lấy booking với services details
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                total_amount,
                notes,
                customers(name, phone),
                vehicles(license_plate),
                booking_services(
                    quantity,
                    price,
                    services(id, name, price, description)
                ),
                booking_state(state_name)
            `)
            .order('id', { ascending: false })
            .limit(5);

        if (error) {
            console.error('❌ Lỗi:', error);
            return;
        }

        console.log(`📊 Tìm thấy ${bookings.length} bookings:`);

        bookings.forEach((booking, index) => {
            console.log(`\n📋 Booking ${index + 1}:`);
            console.log(`   ID: ${booking.id}`);
            console.log(`   Customer: ${booking.customers?.name} (${booking.customers?.phone})`);
            console.log(`   Vehicle: ${booking.vehicles?.license_plate}`);
            console.log(`   State: ${booking.booking_state?.state_name}`);
            console.log(`   Total: $${booking.total_amount}`);
            console.log(`   Payment Status: ${booking.notes?.includes('Payment Status: paid') ? 'PAID' : 'UNPAID'}`);

            if (booking.booking_services && booking.booking_services.length > 0) {
                console.log(`   Services:`);
                booking.booking_services.forEach(bs => {
                    console.log(`     - ${bs.services?.name} (qty: ${bs.quantity}, price: $${bs.price})`);
                });

                // Tạo cart data với services thật
                const cartItems = booking.booking_services.map(bs => ({
                    service: {
                        id: bs.services?.id || 'unknown',
                        name: bs.services?.name || 'Unknown Service',
                        price: bs.services?.price || bs.price
                    },
                    quantity: bs.quantity,
                    subtotal: bs.price * bs.quantity
                }));

                const isPaid = booking.notes?.includes('Payment Status: paid');

                const cartData = {
                    cart: cartItems,
                    carInfo: {
                        licensePlate: booking.vehicles?.license_plate,
                        status: booking.booking_state?.state_name,
                        total: booking.total_amount,
                        bookingId: booking.id,
                        paymentStatus: isPaid ? 'paid' : 'unpaid'
                    },
                    customerInfo: {
                        name: booking.customers?.name,
                        phone: booking.customers?.phone,
                        isVip: false
                    },
                    viewOnly: isPaid
                };

                console.log(`\n🔧 Cart data cho booking ${booking.id} (${isPaid ? 'PAID' : 'UNPAID'}):`);
                console.log(`localStorage.setItem('pos-cart', '${JSON.stringify(cartData)}');`);
            } else {
                console.log(`   ⚠️  Không có services data`);
            }
        });

    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

getBookingServicesDetails();
