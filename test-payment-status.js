/**
 * Test script để tạo sample booking với payment status
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestBookingWithPayment() {
    console.log('🧪 Creating test booking with payment status...\n');

    try {
        // Get existing customer and vehicle
        const { data: customers } = await supabase
            .from('customers')
            .select('*')
            .limit(1);

        const { data: vehicles } = await supabase
            .from('vehicles')
            .select('*')
            .limit(1);

        const { data: services } = await supabase
            .from('services')
            .select('*')
            .limit(2);

        const { data: users } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (!customers?.length || !vehicles?.length || !services?.length || !users?.length) {
            console.error('❌ Missing required data');
            return;
        }

        // Get booking states
        const { data: pendingState } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'pending')
            .single();

        const { data: inProgressState } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'in_progress')
            .single();

        // Create booking with unpaid status (should show UNPAID in dashboard)
        const unpaidBooking = {
            customer_id: customers[0].id,
            vehicle_id: vehicles[0].id,
            date: new Date().toISOString(),
            booking_state_id: pendingState?.id || 1,
            total_price: 75.50,
            notes: 'Payment Status: unpaid | Created from test',
            created_by: users[0].id,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { data: unpaidResult, error: unpaidError } = await supabase
            .from('bookings')
            .insert(unpaidBooking)
            .select()
            .single();

        if (unpaidError) {
            console.error('Error creating unpaid booking:', unpaidError);
        } else {
            console.log('✅ Created UNPAID booking:', unpaidResult.id);
        }

        // Create booking with paid status (should NOT show UNPAID)
        const paidBooking = {
            customer_id: customers[0].id,
            vehicle_id: vehicles[0].id,
            date: new Date().toISOString(),
            booking_state_id: inProgressState?.id || 2,
            total_price: 65.00,
            notes: 'Payment Status: paid | Method: Cash | Created from test',
            created_by: users[0].id,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { data: paidResult, error: paidError } = await supabase
            .from('bookings')
            .insert(paidBooking)
            .select()
            .single();

        if (paidError) {
            console.error('Error creating paid booking:', paidError);
        } else {
            console.log('✅ Created PAID booking:', paidResult.id);
        }

        console.log('\n🎯 Test Results:');
        console.log('- Unpaid booking should show "UNPAID" in dashboard');
        console.log('- Paid booking should NOT show "UNPAID" in dashboard');
        console.log('🌐 Check POS Dashboard: http://localhost:3000/pos-dashboard');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestBookingWithPayment();
