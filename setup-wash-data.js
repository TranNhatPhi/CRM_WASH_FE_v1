/**
 * Wrapper script to load environment variables and run setup
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please make sure you have .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
            if (error.code === '23505') { // Unique constraint violation
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
            if (error.code === '23505') { // Unique constraint violation
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
                // Service might already exist, try to get it
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
                password: 'hashedpassword', // In real app, this would be properly hashed
                address: '123 Wash Street',
                phone: '+1234567890',
                date_of_birth: '1990-01-01T00:00:00Z',
                role_id: 1
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
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
    console.log('🚀 Starting database setup for wash controller testing...\n');

    // Test connection
    const connected = await testDatabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection');
        process.exit(1);
    }

    console.log('');

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

    console.log('\n✅ Database setup complete! You can now test the wash controller at /wash-test');
}

main().catch(console.error);
