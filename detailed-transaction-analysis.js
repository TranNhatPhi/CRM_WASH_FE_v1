/**
 * Detailed analysis of all transactions and paid bookings
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function detailedTransactionAnalysis() {
    console.log('🔍 Chi tiết phân tích transactions và paid bookings...\n');

    try {
        // 1. Lấy tất cả transactions
        console.log('1. Tất cả transactions trong database:');
        const { data: allTransactions, error: transError } = await supabase
            .from('transactions')
            .select(`
                *,
                customers!transactions_customer_id_fkey(name, phone),
                bookings!transactions_booking_id_fkey(id, total_price)
            `)
            .order('id', { ascending: true });

        if (transError) {
            console.error('❌ Lỗi:', transError);
            return;
        }

        console.log(`📊 Tổng số transactions: ${allTransactions.length}`);
        const transactionBookingIds = [];
        allTransactions.forEach((trans, index) => {
            transactionBookingIds.push(trans.booking_id);
            console.log(`   ${index + 1}. Transaction #${trans.id} → Booking #${trans.booking_id} ($${trans.amount})`);
        });

        // 2. Lấy tất cả paid bookings
        console.log('\n2. Tất cả paid bookings (theo notes):');
        const { data: paidBookings, error: paidError } = await supabase
            .from('bookings')
            .select(`
                id,
                customer_id,
                total_price,
                notes,
                customers(name, phone),
                vehicles(license_plate)
            `)
            .ilike('notes', '%Payment Status: paid%')
            .order('id', { ascending: true });

        if (paidError) {
            console.error('❌ Lỗi:', paidError);
            return;
        }

        console.log(`📊 Tổng số paid bookings: ${paidBookings.length}`);
        const paidBookingIds = [];
        paidBookings.forEach((booking, index) => {
            paidBookingIds.push(booking.id);
            console.log(`   ${index + 1}. Booking #${booking.id}: ${booking.customers?.name} ($${booking.total_price})`);
        });

        // 3. So sánh chi tiết
        console.log('\n3. Phân tích chi tiết:');
        console.log(`📋 Paid Booking IDs: [${paidBookingIds.sort().join(', ')}]`);
        console.log(`💰 Transaction Booking IDs: [${transactionBookingIds.sort().join(', ')}]`);

        // Tìm paid bookings chưa có transaction
        const missingTransactions = paidBookingIds.filter(id => !transactionBookingIds.includes(id));
        console.log(`❗ Paid bookings chưa có transaction: [${missingTransactions.join(', ')}]`);

        // Tìm transactions không có paid booking tương ứng
        const extraTransactions = transactionBookingIds.filter(id => !paidBookingIds.includes(id));
        console.log(`🔄 Transactions cho bookings không có "paid" note: [${extraTransactions.join(', ')}]`);

        // 4. Kết luận
        console.log('\n🎯 KẾT LUẬN CUỐI CÙNG:');
        if (missingTransactions.length === 0 && extraTransactions.length === 0) {
            console.log('✅ HOÀN HẢO! Tất cả paid bookings đều có transaction records');
        } else if (missingTransactions.length === 0) {
            console.log('✅ Tất cả paid bookings đều có transaction records');
            console.log(`ℹ️  Có ${extraTransactions.length} transaction(s) cho bookings có thể đã thanh toán nhưng chưa update notes`);
        } else {
            console.log(`❗ Còn thiếu ${missingTransactions.length} transaction(s) cho paid bookings`);
        }

        console.log(`📊 Tổng kết: ${allTransactions.length} transactions / ${paidBookings.length} paid bookings`);

    } catch (error) {
        console.error('💥 Lỗi:', error);
    }
}

// Chạy phân tích
detailedTransactionAnalysis().then(() => {
    console.log('\n✨ Phân tích hoàn tất');
    process.exit(0);
}).catch(error => {
    console.error('💥 Phân tích thất bại:', error);
    process.exit(1);
});
