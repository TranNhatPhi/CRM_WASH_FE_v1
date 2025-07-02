/**
 * Test script to verify payment transaction creation
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPaymentTransactionFlow() {
    console.log('🧪 Testing payment transaction creation flow...\n');

    try {
        // 1. Check existing transactions
        console.log('1. Checking existing transactions...');
        const { data: existingTransactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(5);

        if (transError) {
            console.error('❌ Error fetching transactions:', transError);
        } else {
            console.log(`📊 Found ${existingTransactions.length} existing transactions`);
            if (existingTransactions.length > 0) {
                console.log('Recent transactions:');
                existingTransactions.forEach((trans, index) => {
                    console.log(`  ${index + 1}. ID: ${trans.id}, Booking: ${trans.booking_id}, Amount: $${trans.amount}, Method: ${trans.payment_method}, Status: ${trans.status}`);
                });
            }
        }

        // 2. Find a test booking to use
        console.log('\n2. Finding a test booking...');
        const { data: testBookings, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                id,
                customer_id,
                total_price,
                notes,
                customers(name, phone),
                vehicles(license_plate)
            `)
            .order('createdAt', { ascending: false })
            .limit(3);

        if (bookingError) {
            console.error('❌ Error fetching bookings:', bookingError);
            return;
        }

        if (!testBookings || testBookings.length === 0) {
            console.log('❌ No bookings found for testing');
            return;
        }

        const testBooking = testBookings[0];
        console.log(`✅ Using booking #${testBooking.id} for testing`);
        console.log(`   Customer: ${testBooking.customers?.name} (${testBooking.customers?.phone})`);
        console.log(`   Vehicle: ${testBookings[0].vehicles?.license_plate}`);
        console.log(`   Total: $${testBooking.total_price}`);

        // 3. Test transaction creation (simulate payment completion)
        console.log('\n3. Testing transaction creation...');

        const testAmount = testBooking.total_price || 50.00;
        const testPaymentMethod = 'cash'; // Use lowercase as required by API

        // Create transaction using the API
        const response = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: testBooking.customer_id,
                booking_id: testBooking.id,
                amount: testAmount,
                payment_method: testPaymentMethod,
                status: 'completed'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Transaction created successfully via API:');
            console.log(`   Transaction ID: ${result.data.id}`);
            console.log(`   Booking ID: ${result.data.booking_id}`);
            console.log(`   Amount: $${result.data.amount}`);
            console.log(`   Method: ${result.data.payment_method}`);
            console.log(`   Status: ${result.data.status}`);
        } else {
            const error = await response.json();
            console.error('❌ Failed to create transaction via API:', error);
        }

        // 4. Verify transaction was created
        console.log('\n4. Verifying transaction creation...');
        const { data: newTransactions, error: verifyError } = await supabase
            .from('transactions')
            .select(`
                *,
                customers!transactions_customer_id_fkey(name, phone),
                bookings!transactions_booking_id_fkey(id, total_price)
            `)
            .eq('booking_id', testBooking.id)
            .order('createdAt', { ascending: false });

        if (verifyError) {
            console.error('❌ Error verifying transactions:', verifyError);
        } else {
            console.log(`✅ Found ${newTransactions.length} transaction(s) for booking #${testBooking.id}`);
            newTransactions.forEach((trans, index) => {
                console.log(`   ${index + 1}. Transaction #${trans.id}:`);
                console.log(`      Amount: $${trans.amount}`);
                console.log(`      Method: ${trans.payment_method}`);
                console.log(`      Status: ${trans.status}`);
                console.log(`      Date: ${new Date(trans.createdAt).toLocaleString()}`);
            });
        }

        // 5. Check database schema matches requirements
        console.log('\n5. Checking database schema compliance...');

        // Check transactions table structure
        const { data: tableInfo } = await supabase
            .from('transactions')
            .select('*')
            .limit(1);

        if (tableInfo && tableInfo.length > 0) {
            const sampleTransaction = tableInfo[0];
            const requiredFields = ['id', 'customer_id', 'booking_id', 'amount', 'payment_method', 'status', 'createdAt', 'updatedAt'];

            console.log('✅ Transaction table structure verification:');
            requiredFields.forEach(field => {
                const hasField = sampleTransaction.hasOwnProperty(field);
                console.log(`   ${hasField ? '✅' : '❌'} ${field}: ${hasField ? 'Present' : 'Missing'}`);
            });
        }

        console.log('\n🎉 Payment transaction flow test completed!');

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testPaymentTransactionFlow().then(() => {
    console.log('\n✨ Test execution finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});
