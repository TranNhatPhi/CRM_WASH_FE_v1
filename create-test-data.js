const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function createTestData() {
    console.log('🚗 Creating test data for booking state testing...');

    try {
        // Step 1: Check if we have customers and vehicles
        console.log('\n1️⃣ Checking customers...');
        const { data: customers, error: customerError } = await supabase
            .from('customers')
            .select('id, name')
            .limit(5);

        if (customerError) {
            console.log('❌ Error checking customers:', customerError.message);
            return;
        }

        console.log(`📊 Found ${customers?.length || 0} customers`);
        if (customers && customers.length > 0) {
            customers.forEach((customer, index) => {
                console.log(`   ${index + 1}. ID: ${customer.id}, Name: ${customer.name}`);
            });
        }

        // Step 2: Check vehicles
        console.log('\n2️⃣ Checking vehicles...');
        const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, license_plate, customer_id')
            .limit(5);

        if (vehicleError) {
            console.log('❌ Error checking vehicles:', vehicleError.message);
            return;
        }

        console.log(`📊 Found ${vehicles?.length || 0} vehicles`);
        if (vehicles && vehicles.length > 0) {
            vehicles.forEach((vehicle, index) => {
                console.log(`   ${index + 1}. ID: ${vehicle.id}, Plate: ${vehicle.license_plate}, Customer: ${vehicle.customer_id}`);
            });
        }

        // Step 3: Create a test booking if we have data
        if (customers && customers.length > 0 && vehicles && vehicles.length > 0) {
            console.log('\n3️⃣ Creating test booking...');

            const testCustomer = customers[0];
            const testVehicle = vehicles[0];

            const { data: newBooking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: testCustomer.id,
                    vehicle_id: testVehicle.id,
                    date: new Date().toISOString(),
                    status: 'confirmed',
                    total_price: 50000,
                    notes: 'Test booking for state management',
                    created_by: 1, // Default user ID
                    updated_by: 1, // Default user ID
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (bookingError) {
                console.log('❌ Failed to create booking:', bookingError.message);
                return;
            }

            console.log('✅ Created test booking:');
            console.log(`   ID: ${newBooking.id}`);
            console.log(`   Customer: ${testCustomer.name} (ID: ${newBooking.customer_id})`);
            console.log(`   Vehicle: ${testVehicle.license_plate} (ID: ${newBooking.vehicle_id})`);
            console.log(`   Status: ${newBooking.status}`);

            // Step 4: Now test booking state
            console.log('\n4️⃣ Testing booking state...');

            const { data: stateData, error: stateError } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: newBooking.id,
                    old_state: null,
                    current_state: 'draft'
                })
                .select()
                .single();

            if (stateError) {
                console.log('❌ Failed to create booking state:', stateError.message);
            } else {
                console.log('✅ Created booking state:');
                console.log(`   State Record ID: ${stateData.id}`);
                console.log(`   Booking ID: ${stateData.booking_id}`);
                console.log(`   State: ${stateData.old_state} → ${stateData.current_state}`);
                console.log(`   Timestamp: ${stateData.timestamp}`);
            }

            // Step 5: Test state transition
            console.log('\n5️⃣ Testing state transition...');

            const { data: transitionData, error: transitionError } = await supabase
                .from('booking_state')
                .insert({
                    booking_id: newBooking.id,
                    old_state: 'draft',
                    current_state: 'booked'
                })
                .select()
                .single();

            if (transitionError) {
                console.log('❌ Failed to transition state:', transitionError.message);
            } else {
                console.log('✅ State transition successful:');
                console.log(`   New State Record ID: ${transitionData.id}`);
                console.log(`   Transition: ${transitionData.old_state} → ${transitionData.current_state}`);
            }

            // Step 6: Check all states for this booking
            console.log('\n6️⃣ Checking all states for this booking...');

            const { data: allStates, error: allStatesError } = await supabase
                .from('booking_state')
                .select('*')
                .eq('booking_id', newBooking.id)
                .order('timestamp');

            if (allStatesError) {
                console.log('❌ Failed to get states:', allStatesError.message);
            } else {
                console.log(`✅ Found ${allStates?.length || 0} state records:`);
                allStates?.forEach((state, index) => {
                    console.log(`   ${index + 1}. ${state.old_state || 'null'} → ${state.current_state} (${new Date(state.timestamp).toLocaleString()})`);
                });
            }

        } else {
            console.log('\n⚠️ Cannot create booking - missing customers or vehicles');
            console.log('You need to add some test customers and vehicles first');
        }

    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
    }
}

createTestData();
