// Kiểm tra booking đã thanh toán từ POS Dashboard
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaidBookings() {
    try {
        console.log('🔍 Tìm kiếm bookings đã thanh toán...');

        // Tìm booking có notes chứa "Payment Status: paid"
        const { data: paidBookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                booking_state!inner(state_name),
                customers(name, phone),
                vehicles(license_plate),
                booking_services(
                    quantity,
                    price,
                    services(id, name, price)
                )
            `)
            .ilike('notes', '%Payment Status: paid%')
            .limit(5);

        if (error) {
            console.error('❌ Lỗi:', error);
            return;
        }

        console.log(`📊 Tìm thấy ${paidBookings.length} booking đã thanh toán:`);

        paidBookings.forEach((booking, index) => {
            console.log(`\n📋 Booking ${index + 1}:`);
            console.log(`   ID: ${booking.id}`);
            console.log(`   Customer: ${booking.customers?.name}`);
            console.log(`   Phone: ${booking.customers?.phone}`);
            console.log(`   License Plate: ${booking.vehicles?.license_plate}`);
            console.log(`   Status: ${booking.booking_state?.state_name}`);
            console.log(`   Total: $${booking.total_amount}`);
            console.log(`   Services:`, booking.booking_services?.map(bs =>
                `${bs.services?.name} (${bs.quantity}x - $${bs.price})`
            ));

            // Tạo cart data cho booking này
            const cartData = {
                cart: booking.booking_services?.map(bs => ({
                    service: {
                        id: bs.services?.id || 'unknown',
                        name: bs.services?.name || 'Unknown Service',
                        price: bs.services?.price || bs.price
                    },
                    quantity: bs.quantity,
                    subtotal: bs.price * bs.quantity
                })) || [],
                carInfo: {
                    licensePlate: booking.vehicles?.license_plate,
                    status: booking.booking_state?.state_name,
                    total: booking.total_amount,
                    bookingId: booking.id,
                    notes: booking.notes
                },
                customerInfo: {
                    name: booking.customers?.name,
                    phone: booking.customers?.phone,
                    isVip: false
                },
                viewOnly: true
            };

            console.log(`\n🔧 Cart data cho booking ${booking.id}:`);
            console.log('localStorage.setItem("pos-cart", ' + JSON.stringify(JSON.stringify(cartData)) + ');');
        });

    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

checkPaidBookings();
