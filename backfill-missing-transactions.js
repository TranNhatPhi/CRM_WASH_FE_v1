/**
 * Script để tạo transaction records cho các booking đã thanh toán trước khi implement transaction creation
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function backfillMissingTransactions() {
    console.log('🔧 Backfilling missing transactions cho paid bookings...\n');

    try {
        // 1. Tìm tất cả bookings đã thanh toán mà chưa có transaction
        console.log('1. Tìm bookings đã thanh toán...');
        const { data: paidBookings, error: paidError } = await supabase
            .from('bookings')
            .select(`
                id,
                customer_id,
                total_price,
                notes,
                createdAt,
                customers(name, phone),
                vehicles(license_plate)
            `)
            .ilike('notes', '%Payment Status: paid%')
            .order('createdAt', { ascending: false });

        if (paidError) {
            console.error('❌ Lỗi khi tìm paid bookings:', paidError);
            return;
        }

        console.log(`📋 Tìm thấy ${paidBookings.length} booking đã thanh toán`);

        // 2. Kiểm tra transactions đã tồn tại
        console.log('\n2. Kiểm tra transactions đã tồn tại...');
        const { data: existingTransactions, error: transError } = await supabase
            .from('transactions')
            .select('booking_id');

        if (transError) {
            console.error('❌ Lỗi khi kiểm tra transactions:', transError);
            return;
        }

        const existingBookingIds = existingTransactions.map(t => t.booking_id);
        console.log(`📊 Đã có ${existingTransactions.length} transaction records cho booking IDs: [${existingBookingIds.join(', ')}]`);

        // 3. Tìm bookings cần tạo transaction
        const missingTransactionBookings = paidBookings.filter(booking =>
            !existingBookingIds.includes(booking.id)
        );

        console.log(`\n3. Cần tạo transactions cho ${missingTransactionBookings.length} bookings:`);
        missingTransactionBookings.forEach(booking => {
            console.log(`   - Booking #${booking.id}: ${booking.customers?.name} - $${booking.total_price}`);
        });

        if (missingTransactionBookings.length === 0) {
            console.log('✅ Tất cả paid bookings đã có transaction records!');
            return;
        }

        // 4. Tạo transactions cho các bookings còn thiếu
        console.log('\n4. Tạo transaction records...');
        let successCount = 0;
        let errorCount = 0;

        for (const booking of missingTransactionBookings) {
            try {
                // Extract payment method from notes if available
                let paymentMethod = 'cash'; // default
                if (booking.notes?.includes('Payment Method:')) {
                    const methodMatch = booking.notes.match(/Payment Method:\s*([^|]+)/);
                    if (methodMatch) {
                        const method = methodMatch[1].trim().toLowerCase();
                        // Map common variations
                        if (method === 'cash') paymentMethod = 'cash';
                        else if (method === 'card' || method === 'credit card' || method === 'debit card') paymentMethod = 'card';
                        else if (method === 'bank transfer' || method === 'transfer') paymentMethod = 'bank_transfer';
                        else if (method.includes('digital') || method.includes('wallet')) paymentMethod = 'digital_wallet';
                        else paymentMethod = 'cash'; // fallback
                    }
                }

                // Create transaction via API
                const response = await fetch('http://localhost:3000/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customer_id: booking.customer_id,
                        booking_id: booking.id,
                        amount: booking.total_price || 50.00,
                        payment_method: paymentMethod,
                        status: 'completed'
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`   ✅ Transaction created for booking #${booking.id} - Transaction ID: ${result.data.id}`);
                    successCount++;
                } else {
                    const error = await response.json();
                    console.error(`   ❌ Failed to create transaction for booking #${booking.id}:`, error.message);
                    errorCount++;
                }

                // Add small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`   ❌ Error creating transaction for booking #${booking.id}:`, error.message);
                errorCount++;
            }
        }

        // 5. Tóm tắt kết quả
        console.log('\n🎯 KẾT QUẢ BACKFILL:');
        console.log(`✅ Thành công: ${successCount}/${missingTransactionBookings.length} transactions`);
        console.log(`❌ Thất bại: ${errorCount}/${missingTransactionBookings.length} transactions`);

        if (successCount > 0) {
            console.log('\n6. Kiểm tra kết quả...');
            const { data: finalTransactions, error: finalError } = await supabase
                .from('transactions')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!finalError) {
                console.log(`📊 Tổng transactions sau backfill: ${finalTransactions.length}`);
            }
        }

    } catch (error) {
        console.error('💥 Lỗi trong quá trình backfill:', error);
    }
}

// Chạy backfill
backfillMissingTransactions().then(() => {
    console.log('\n✨ Backfill hoàn tất');
    process.exit(0);
}).catch(error => {
    console.error('💥 Backfill thất bại:', error);
    process.exit(1);
});
