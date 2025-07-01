/**
 * Setup new booking state structure for testing
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBookingStateTable() {
    console.log('📋 Creating new booking_state table...');

    try {
        // Create booking_state lookup table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS booking_state (
                id SERIAL PRIMARY KEY,
                state_name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                sort_order INTEGER,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createTableQuery
        });

        if (createError) {
            console.error('Error creating table:', createError);
            return false;
        }

        // Insert predefined states
        const states = [
            { state_name: 'draft', description: 'Booking đang được tạo', sort_order: 1 },
            { state_name: 'booked', description: 'Booking đã được xác nhận', sort_order: 2 },
            { state_name: 'in_progress', description: 'Đang thực hiện rửa xe', sort_order: 3 },
            { state_name: 'departed', description: 'Xe đã rời khỏi trạm rửa', sort_order: 4 },
            { state_name: 'completed', description: 'Hoàn thành dịch vụ', sort_order: 5 },
            { state_name: 'cancelled', description: 'Booking đã bị hủy', sort_order: 6 }
        ];

        for (const state of states) {
            const { error } = await supabase
                .from('booking_state')
                .upsert(state, { onConflict: 'state_name' });

            if (error) {
                console.error(`Error inserting state ${state.state_name}:`, error);
            } else {
                console.log(`✅ Created state: ${state.state_name}`);
            }
        }

        return true;
    } catch (error) {
        console.error('Error in createBookingStateTable:', error);
        return false;
    }
}

async function addBookingStateIdColumn() {
    console.log('🔧 Adding booking_state_id column to bookings...');

    try {
        // Add column if not exists
        const addColumnQuery = `
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS booking_state_id INTEGER;
        `;

        const { error: columnError } = await supabase.rpc('exec_sql', {
            sql: addColumnQuery
        });

        if (columnError) {
            console.error('Error adding column:', columnError);
            return false;
        }

        // Update existing bookings with default state (draft)
        const { data: draftState } = await supabase
            .from('booking_state')
            .select('id')
            .eq('state_name', 'draft')
            .single();

        if (draftState) {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ booking_state_id: draftState.id })
                .is('booking_state_id', null);

            if (updateError) {
                console.error('Error updating bookings:', updateError);
                return false;
            }

            console.log('✅ Updated existing bookings with draft state');
        }

        return true;
    } catch (error) {
        console.error('Error in addBookingStateIdColumn:', error);
        return false;
    }
}

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        const { data, error } = await supabase
            .from('customers')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
}

async function createSampleCustomer() {
    console.log('👤 Creating sample customer...');

    try {
        const { data, error } = await supabase
            .from('customers')
            .insert({
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                joined_at: new Date().toISOString(),
                tags: 'VIP,Regular Customer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                console.log('⚠️  Customer already exists');
                const { data: existing } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('email', 'john.doe@example.com')
                    .single();
                return existing;
            }
            throw error;
        }

        console.log('✅ Sample customer created:', data.name);
        return data;
    } catch (error) {
        console.error('❌ Error creating customer:', error.message);
        return null;
    }
}

async function createSampleVehicle(customerId) {
    console.log('🚗 Creating sample vehicle...');

    try {
        const { data, error } = await supabase
            .from('vehicles')
            .insert({
                customer_id: customerId,
                make: 'Toyota',
                model: 'Camry',
                year: 2022,
                color: 'Silver',
                license_plate: 'ABC-123',
                notes: 'Regular wash customer',
                status: 'active',
                wash_count: 0,
                wash_status: 'No active wash',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                console.log('⚠️  Vehicle already exists');
                const { data: existing } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('license_plate', 'ABC-123')
                    .single();
                return existing;
            }
            throw error;
        }

        console.log('✅ Sample vehicle created:', data.license_plate);
        return data;
    } catch (error) {
        console.error('❌ Error creating vehicle:', error.message);
        return null;
    }
}

async function createSampleServices() {
    console.log('🧽 Creating sample services...');

    const services = [
        {
            name: 'Basic Wash',
            description: 'Exterior wash with soap and rinse',
            price: 15.99,
            duration: 30,
            category: 'Basic'
        },
        {
            name: 'Premium Wash',
            description: 'Exterior wash, wax, and tire shine',
            price: 25.99,
            duration: 45,
            category: 'Premium'
        },
        {
            name: 'Full Detail',
            description: 'Complete interior and exterior detailing',
            price: 79.99,
            duration: 120,
            category: 'Detail'
        },
        {
            name: 'Quick Rinse',
            description: 'Quick exterior rinse only',
            price: 5.99,
            duration: 10,
            category: 'Express'
        }
    ];

    const createdServices = [];

    for (const service of services) {
        try {
            const { data, error } = await supabase
                .from('services')
                .insert({
                    ...service,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (error && error.code !== '23505') {
                throw error;
            }

            if (data) {
                createdServices.push(data);
                console.log(`✅ Service created: ${service.name}`);
            } else {
                const { data: existing } = await supabase
                    .from('services')
                    .select('*')
                    .eq('name', service.name)
                    .single();
                if (existing) {
                    createdServices.push(existing);
                    console.log(`⚠️  Service already exists: ${service.name}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error creating service ${service.name}:`, error.message);
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
                fullname: 'Wash Manager',
                email: 'manager@washcrm.com',
                password: 'hashedpassword',
                address: '123 Wash Street',
                phone: '+1234567890',
                date_of_birth: '1990-01-01T00:00:00Z',
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
                    .eq('email', 'manager@washcrm.com')
                    .single();
                return existing;
            }
            throw error;
        }

        console.log('✅ Default user created:', data.fullname);
        return data;
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Setting up new booking state structure...\n');

    // Test connection
    const connected = await testDatabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection');
        process.exit(1);
    }

    console.log('');

    // Setup new booking state structure
    const stateTableCreated = await createBookingStateTable();
    if (!stateTableCreated) {
        console.log('\n❌ Failed to create booking state table');
        process.exit(1);
    }

    const columnAdded = await addBookingStateIdColumn();
    if (!columnAdded) {
        console.log('\n❌ Failed to add booking_state_id column');
        process.exit(1);
    }

    // Create sample data
    const user = await createDefaultUser();
    const customer = await createSampleCustomer();
    const services = await createSampleServices();

    if (customer) {
        const vehicle = await createSampleVehicle(customer.id);

        console.log('\n📊 Sample data summary:');
        console.log(`Customer ID: ${customer.id} (${customer.name})`);
        if (vehicle) {
            console.log(`Vehicle ID: ${vehicle.id} (${vehicle.license_plate})`);
        }
        console.log(`Services: ${services.length} available`);
        if (user) {
            console.log(`User ID: ${user.id} (${user.fullname})`);
        }
    }

    console.log('\n✅ New booking state structure setup complete!');
    console.log('🌐 You can now test the wash controller at /wash-test');
}

main().catch(console.error);
