/**
 * Script đơn giản để setup booking_state và sample data
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBookingStates() {
    console.log('📋 Setting up booking states...');

    try {
        // Check if booking_state table exists and has data
        const { data: existingStates, error: checkError } = await supabase
            .from('booking_state')
            .select('*')
            .limit(1);

        if (checkError) {
            console.log('⚠️  booking_state table might not exist or is empty');
        }

        // Insert states (will be ignored if already exist due to UNIQUE constraint)
        const states = [
            { state_name: 'pending', description: 'Pending - Chờ xử lý', sort_order: 1 },
            { state_name: 'in_progress', description: 'In Progress - Đang thực hiện', sort_order: 2 },
            { state_name: 'finished', description: 'Finished - Hoàn thành', sort_order: 3 },
            { state_name: 'cancelled', description: 'Cancelled - Đã hủy', sort_order: 4 },
            { state_name: 'no_show', description: 'No Show - Không đến', sort_order: 5 }
        ];

        for (const state of states) {
            const { error } = await supabase
                .from('booking_state')
                .upsert(state, { onConflict: 'state_name' });

            if (error) {
                console.error(`Error inserting state ${state.state_name}:`, error);
            } else {
                console.log(`✅ State ready: ${state.state_name}`);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Error setting up booking states:', error);
        return false;
    }
}

async function createSampleCustomersAndVehicles() {
    console.log('👥 Creating sample customers and vehicles...');

    const sampleData = [
        {
            customer: { name: 'John Doe', email: 'john@example.com', phone: '555-0123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            vehicle: { license_plate: 'ABC-123', make: 'Toyota', model: 'Camry', color: 'Silver', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        },
        {
            customer: { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0124', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            vehicle: { license_plate: 'XYZ-789', make: 'Honda', model: 'Civic', color: 'Blue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        },
        {
            customer: { name: 'Mike Johnson', email: 'mike@example.com', phone: '555-0125', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            vehicle: { license_plate: 'DEF-456', make: 'Ford', model: 'Focus', color: 'Red', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        },
        {
            customer: { name: 'Sarah Wilson', email: 'sarah@example.com', phone: '555-0126', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            vehicle: { license_plate: 'MNO-678', make: 'BMW', model: '320i', color: 'Black', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        }
    ];

    const createdData = [];

    for (const item of sampleData) {
        try {
            // Create customer
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .insert(item.customer)
                .select()
                .single();

            if (customerError) {
                // Try to find existing customer
                if (customerError.code === '23505') {
                    const { data: existingCustomer } = await supabase
                        .from('customers')
                        .select('*')
                        .eq('email', item.customer.email)
                        .single();
                    if (existingCustomer) {
                        console.log(`⚠️  Customer exists: ${item.customer.name}`);
                        // Create vehicle for existing customer
                        const { data: vehicle, error: vehicleError } = await supabase
                            .from('vehicles')
                            .insert({
                                ...item.vehicle,
                                customer_id: existingCustomer.id,
                                status: 'active'
                            })
                            .select()
                            .single();

                        if (!vehicleError) {
                            createdData.push({ customer: existingCustomer, vehicle });
                            console.log(`✅ Vehicle added: ${vehicle.license_plate}`);
                        }
                    }
                }
                continue;
            }

            // Create vehicle
            const { data: vehicle, error: vehicleError } = await supabase
                .from('vehicles')
                .insert({
                    ...item.vehicle,
                    customer_id: customer.id,
                    status: 'active'
                })
                .select()
                .single();

            if (vehicleError) {
                if (vehicleError.code === '23505') {
                    console.log(`⚠️  Vehicle exists: ${item.vehicle.license_plate}`);
                } else {
                    console.error('Error creating vehicle:', vehicleError);
                }
                continue;
            }

            createdData.push({ customer, vehicle });
            console.log(`✅ Created: ${customer.name} - ${vehicle.license_plate}`);

        } catch (error) {
            console.error('Error creating customer/vehicle:', error);
        }
    }

    return createdData;
}

async function createSampleServices() {
    console.log('🧽 Creating sample services...');

    const services = [
        { name: 'Basic Wash', description: 'Exterior wash with soap and rinse', price: 25.00, category: 'Basic', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Premium Wash', description: 'Basic wash plus wax and tire shine', price: 35.00, category: 'Premium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Deluxe Wash', description: 'Full exterior wash with premium products', price: 50.00, category: 'Deluxe', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Interior Clean', description: 'Vacuum and interior detailing', price: 20.00, category: 'Interior', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Wax', description: 'Premium wax application', price: 15.00, category: 'Protection', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: 'Vacuum', description: 'Interior vacuum service', price: 10.00, category: 'Interior', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];

    const createdServices = [];

    for (const service of services) {
        try {
            const { data, error } = await supabase
                .from('services')
                .insert(service)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    console.log(`⚠️  Service exists: ${service.name}`);
                    // Get existing service
                    const { data: existing } = await supabase
                        .from('services')
                        .select('*')
                        .eq('name', service.name)
                        .single();
                    if (existing) createdServices.push(existing);
                } else {
                    console.error(`Error creating service ${service.name}:`, error);
                }
            } else {
                createdServices.push(data);
                console.log(`✅ Service ready: ${service.name} - $${service.price}`);
            }
        } catch (error) {
            console.error(`Error creating service ${service.name}:`, error);
        }
    }

    return createdServices;
}

async function createDefaultUser() {
    console.log('👨‍💼 Creating default user...');

    try {
        const { data, error } = await supabase
            .from('users')
            .insert({
                fullname: 'POS Manager',
                email: 'pos@washcrm.com',
                password: 'hashedpassword',
                phone: '+1234567890',
                role_id: 1
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                console.log('⚠️  User already exists');
                const { data: existing } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', 'pos@washcrm.com')
                    .single();
                return existing;
            }
            console.error('Error creating user:', error);
            return null;
        }

        console.log('✅ User ready:', data.fullname);
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
}

async function main() {
    console.log('🚀 Setting up POS Dashboard data...\n');

    // Setup booking states
    const statesReady = await setupBookingStates();
    if (!statesReady) {
        console.log('❌ Failed to setup booking states');
        return;
    }

    // Create sample data
    const user = await createDefaultUser();
    const customerVehicleData = await createSampleCustomersAndVehicles();
    const services = await createSampleServices();

    console.log('\n📊 Setup Summary:');
    console.log(`✅ Booking states configured`);
    console.log(`✅ ${customerVehicleData.length} customer-vehicle pairs created`);
    console.log(`✅ ${services.length} services available`);
    if (user) console.log(`✅ Default user created`);

    console.log('\n🎉 POS Dashboard data setup complete!');
    console.log('📱 You can now create bookings and view them in the POS Dashboard');
    console.log('🌐 Visit /pos-dashboard to see the results');
}

main().catch(console.error);
