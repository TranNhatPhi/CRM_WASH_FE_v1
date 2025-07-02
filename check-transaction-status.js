/**
 * Kiểm tra trạng thái hiện tại của transactions trong database
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTransactionStatus() {
    console.log('🔍 Kiểm tra trạng thái transactions trong database...\n');

    try {
        // 1. Kiểm tra bảng transactions có tồn tại không
        console.log('1. Kiểm tra bảng transactions...');
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .limit(1);

        if (transError) {
            console.error('❌ Lỗi khi truy cập bảng transactions:', transError);
            return;
        }

        console.log('✅ Bảng transactions có thể truy cập được');

        // 2. Đếm tổng số transactions
        console.log('\n2. Đếm tổng số transactions...');
        const { count, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Lỗi khi đếm transactions:', countError);
        } else {
            console.log(`📊 Tổng số transactions: ${count || 0}`);
        }

        // 3. Lấy transactions gần đây nhất
        console.log('\n3. Transactions gần đây...');
        const { data: recentTransactions, error: recentError } = await supabase
            .from('transactions')
            .select(`
                *,
                customers!transactions_customer_id_fkey(name, phone),
                bookings!transactions_booking_id_fkey(id, total_price)
            `)
            .order('createdAt', { ascending: false })
            .limit(10);

        if (recentError) {
            console.error('❌ Lỗi khi lấy transactions gần đây:', recentError);
        } else {
            if (recentTransactions.length === 0) {
                console.log('⚠️  Không có transactions nào trong database');
                console.log('❗ Điều này có nghĩa là thanh toán CHƯA được lưu vào transactions table');
            } else {
                console.log(`✅ Tìm thấy ${recentTransactions.length} transactions:`);
                recentTransactions.forEach((trans, index) => {
                    console.log(`\n📋 Transaction ${index + 1}:`);
                    console.log(`   ID: ${trans.id}`);
                    console.log(`   Customer: ${trans.customers?.name} (${trans.customers?.phone})`);
                    console.log(`   Booking: #${trans.booking_id} ($${trans.bookings?.total_price})`);
                    console.log(`   Amount: $${trans.amount}`);
                    console.log(`   Method: ${trans.payment_method}`);
                    console.log(`   Status: ${trans.status}`);
                    console.log(`   Date: ${new Date(trans.createdAt).toLocaleString()}`);
                });
            }
        }

        // 4. Kiểm tra bookings có thông tin payment
        console.log('\n4. Kiểm tra payment info trong bookings...');
        const { data: paidBookings, error: paidError } = await supabase
            .from('bookings')
            .select(`
                id,
                notes,
                total_price,
                customers(name, phone),
                vehicles(license_plate)
            `)
            .ilike('notes', '%Payment Status: paid%')
            .order('createdAt', { ascending: false })
            .limit(5);

        if (paidError) {
            console.error('❌ Lỗi khi tìm paid bookings:', paidError);
        } else {
            console.log(`📋 Tìm thấy ${paidBookings.length} booking đã thanh toán (theo notes):`);
            paidBookings.forEach((booking, index) => {
                console.log(`\n   Booking ${index + 1}: #${booking.id}`);
                console.log(`   Customer: ${booking.customers?.name}`);
                console.log(`   Vehicle: ${booking.vehicles?.license_plate}`);
                console.log(`   Total: $${booking.total_price}`);
                console.log(`   Payment Info: ${booking.notes?.includes('Payment Method:') ? 'Có' : 'Không'}`);
            });
        }

        // 5. So sánh paid bookings vs transactions
        console.log('\n5. Phân tích gap giữa paid bookings và transactions...');
        const paidBookingIds = paidBookings.map(b => b.id);
        const transactionBookingIds = recentTransactions.map(t => t.booking_id);

        console.log(`📊 Paid bookings (từ notes): ${paidBookingIds.length}`);
        console.log(`📊 Transactions records: ${recentTransactions.length}`);

        const missingTransactions = paidBookingIds.filter(id => !transactionBookingIds.includes(id));
        if (missingTransactions.length > 0) {
            console.log(`❗ ${missingTransactions.length} booking(s) đã thanh toán nhưng CHƯA có transaction record:`);
            missingTransactions.forEach(bookingId => {
                const booking = paidBookings.find(b => b.id === bookingId);
                console.log(`   - Booking #${bookingId}: ${booking?.customers?.name} - $${booking?.total_price}`);
            });
        } else {
            console.log('✅ Tất cả paid bookings đều có transaction records');
        }

        // 6. Kết luận
        console.log('\n🎯 KẾT LUẬN:');
        if (count === 0) {
            console.log('❌ CHƯA có transactions nào được lưu trong database');
            console.log('💡 Cần implement transaction creation trong payment flow');
        } else if (missingTransactions.length > 0) {
            console.log('⚠️  Có transactions nhưng không đầy đủ');
            console.log('💡 Một số payments chưa được lưu vào transactions table');
        } else {
            console.log('✅ Transactions được lưu đầy đủ');
        }

    } catch (error) {
        console.error('💥 Lỗi khi kiểm tra:', error);
    }
}

// Chạy kiểm tra
checkTransactionStatus().then(() => {
    console.log('\n✨ Kiểm tra hoàn tất');
    process.exit(0);
}).catch(error => {
    console.error('💥 Kiểm tra thất bại:', error);
    process.exit(1);
});
