const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Mock BookingStateManager functions for Node.js testing
const BookingStateManager = {
    async getCurrentState(bookingId) {
        try {
            const { data, error } = await supabase
                .from('booking_state')
                .select('current_state')
                .eq('booking_id', bookingId)
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                console.log('Error fetching current state:', error.message);
                return 'draft';
            }

            return data?.current_state || 'draft';
        } catch (error) {
            console.log('Error in getCurrentState:', error.message);
            return 'draft';
        }
    },

    async transitionState(bookingId, action) {
        const VALID_TRANSITIONS = {
            draft: [
                { action: 'Start', nextState: 'in_progress', allowed: true },
                { action: 'Manual Confirm', nextState: 'booked', allowed: true },
            ],
            booked: [
                { action: 'Start', nextState: 'in_progress', allowed: true },
                { action: 'Cancel', nextState: 'cancelled', allowed: true },
            ],
            in_progress: [
                { action: 'Finish', nextState: 'departed', allowed: true },
                { action: 'Cancel', nextState: 'cancelled', allowed: true },
            ],
            departed: [
                { action: 'Finish', nextState: 'completed', allowed: true },
            ],
            completed: [],
            cancelled: [],
        };

        try {
            const currentState = await this.getCurrentState(bookingId);

            const transitions = VALID_TRANSITIONS[currentState];
            const transition = transitions.find(t => t.action === action && t.allowed);

            if (!transition) {
                return { success: false, error: `Transition '${action}' is not allowed from state '${currentState}'` };
            }

            const { data, error } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: bookingId,
                    old_state: currentState,
                    current_state: transition.nextState,
                })
                .select()
                .single();

            if (error) {
                return { success: false, error: 'Failed to update booking state' };
            }

            return { success: true, newState: transition.nextState };
        } catch (error) {
            return { success: false, error: 'Unexpected error occurred' };
        }
    }
};

async function testBookingStateManager() {
    console.log('🧪 Testing BookingStateManager with real data...');

    try {
        // Get the booking we just created (ID: 3)
        const testBookingId = 3;

        console.log('\n1️⃣ Getting current state...');
        const currentState = await BookingStateManager.getCurrentState(testBookingId);
        console.log(`✅ Current state: ${currentState}`);

        console.log('\n2️⃣ Testing transition to in_progress...');
        const transition1 = await BookingStateManager.transitionState(testBookingId, 'Start');
        if (transition1.success) {
            console.log(`✅ Transition successful: ${transition1.newState}`);
        } else {
            console.log(`❌ Transition failed: ${transition1.error}`);
        }

        console.log('\n3️⃣ Testing transition to departed...');
        const transition2 = await BookingStateManager.transitionState(testBookingId, 'Finish');
        if (transition2.success) {
            console.log(`✅ Transition successful: ${transition2.newState}`);
        } else {
            console.log(`❌ Transition failed: ${transition2.error}`);
        }

        console.log('\n4️⃣ Testing final transition to completed...');
        const transition3 = await BookingStateManager.transitionState(testBookingId, 'Finish');
        if (transition3.success) {
            console.log(`✅ Transition successful: ${transition3.newState}`);
        } else {
            console.log(`❌ Transition failed: ${transition3.error}`);
        }

        console.log('\n5️⃣ Getting final state...');
        const finalState = await BookingStateManager.getCurrentState(testBookingId);
        console.log(`✅ Final state: ${finalState}`);

        console.log('\n6️⃣ Checking complete history...');
        const { data: history, error } = await supabase
            .from('booking_state')
            .select('*')
            .eq('booking_id', testBookingId)
            .order('timestamp');

        if (error) {
            console.log('❌ Error getting history:', error.message);
        } else {
            console.log(`✅ Complete state history (${history.length} records):`);
            history.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.old_state || 'null'} → ${record.current_state} (${new Date(record.timestamp).toLocaleString()})`);
            });
        }

    } catch (error) {
        console.log('💥 Error in test:', error.message);
    }
}

testBookingStateManager();
