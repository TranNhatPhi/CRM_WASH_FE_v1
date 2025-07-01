/**
 * Script để xóa và tạo lại bảng booking_state
 * Đây là script an toàn để reset hoàn toàn bảng booking_state
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

async function checkExistingBookings() {
    console.log('🔍 Checking existing bookings with booking_state_id...');

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, booking_state_id')
            .not('booking_state_id', 'is', null);

        if (error) {
            console.log('⚠️  Could not check bookings (table might not exist)');
            return [];
        }

        console.log(`📊 Found ${data.length} bookings with booking_state_id`);
        return data;
    } catch (error) {
        console.log('⚠️  Could not check bookings:', error.message);
        return [];
    }
}

async function dropBookingStateTable() {
    console.log('🗑️  Dropping existing booking_state table...');

    try {
        // First, remove foreign key constraint if it exists
        const removeFKQuery = `
            ALTER TABLE IF EXISTS bookings 
            DROP CONSTRAINT IF EXISTS bookings_booking_state_id_fkey;
        `;

        const { error: fkError } = await supabase.rpc('exec_sql', {
            sql: removeFKQuery
        });

        if (fkError) {
            console.log('⚠️  Could not remove foreign key constraint:', fkError.message);
        } else {
            console.log('✅ Removed foreign key constraint (if existed)');
        }

        // Drop the table
        const dropTableQuery = `DROP TABLE IF EXISTS booking_state CASCADE;`;

        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: dropTableQuery
        });

        if (dropError) {
            console.error('❌ Error dropping table:', dropError.message);
            return false;
        }

        console.log('✅ Successfully dropped booking_state table');
        return true;
    } catch (error) {
        console.error('❌ Error in dropBookingStateTable:', error.message);
        return false;
    }
}

async function createNewBookingStateTable() {
    console.log('📋 Creating new booking_state table...');

    try {
        // Create new booking_state lookup table
        const createTableQuery = `
            CREATE TABLE booking_state (
                id SERIAL PRIMARY KEY,
                state_name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                sort_order INTEGER NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Create index for better performance
            CREATE INDEX idx_booking_state_name ON booking_state(state_name);
            CREATE INDEX idx_booking_state_sort_order ON booking_state(sort_order);
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createTableQuery
        });

        if (createError) {
            console.error('❌ Error creating table:', createError.message);
            return false;
        }

        console.log('✅ Successfully created new booking_state table');
        return true;
    } catch (error) {
        console.error('❌ Error in createNewBookingStateTable:', error.message);
        return false;
    }
}

async function insertPredefinedStates() {
    console.log('📝 Inserting predefined booking states...');

    const states = [
        {
            state_name: 'draft',
            description: 'Booking đang được tạo',
            sort_order: 1
        },
        {
            state_name: 'booked',
            description: 'Booking đã được xác nhận',
            sort_order: 2
        },
        {
            state_name: 'in_progress',
            description: 'Đang thực hiện rửa xe',
            sort_order: 3
        },
        {
            state_name: 'departed',
            description: 'Xe đã rời khỏi trạm rửa',
            sort_order: 4
        },
        {
            state_name: 'completed',
            description: 'Hoàn thành dịch vụ',
            sort_order: 5
        },
        {
            state_name: 'cancelled',
            description: 'Booking đã bị hủy',
            sort_order: 6
        }
    ];

    try {
        for (const state of states) {
            const { data, error } = await supabase
                .from('booking_state')
                .insert(state)
                .select()
                .single();

            if (error) {
                console.error(`❌ Error inserting state ${state.state_name}:`, error.message);
                return false;
            } else {
                console.log(`✅ Created state: ${state.state_name} (ID: ${data.id})`);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Error in insertPredefinedStates:', error.message);
        return false;
    }
}

async function resetBookingStateColumn() {
    console.log('🔧 Resetting booking_state_id column in bookings table...');

    try {
        // Remove booking_state_id column if exists
        const dropColumnQuery = `
            ALTER TABLE IF EXISTS bookings 
            DROP COLUMN IF EXISTS booking_state_id;
        `;

        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: dropColumnQuery
        });

        if (dropError) {
            console.log('⚠️  Could not drop column:', dropError.message);
        } else {
            console.log('✅ Dropped booking_state_id column');
        }

        // Add booking_state_id column back
        const addColumnQuery = `
            ALTER TABLE bookings 
            ADD COLUMN booking_state_id INTEGER REFERENCES booking_state(id);
        `;

        const { error: addError } = await supabase.rpc('exec_sql', {
            sql: addColumnQuery
        });

        if (addError) {
            console.error('❌ Error adding column:', addError.message);
            return false;
        }

        console.log('✅ Added booking_state_id column with foreign key constraint');

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
                console.error('❌ Error updating bookings:', updateError.message);
                return false;
            }

            console.log('✅ Updated existing bookings with draft state');
        }

        return true;
    } catch (error) {
        console.error('❌ Error in resetBookingStateColumn:', error.message);
        return false;
    }
}

async function verifyNewStructure() {
    console.log('🔍 Verifying new booking_state structure...');

    try {
        // Check booking_state table
        const { data: states, error: statesError } = await supabase
            .from('booking_state')
            .select('*')
            .order('sort_order');

        if (statesError) {
            console.error('❌ Error verifying states:', statesError.message);
            return false;
        }

        console.log('\n📊 Booking States:');
        states.forEach(state => {
            console.log(`  ${state.sort_order}. ${state.state_name} - ${state.description}`);
        });

        // Check if bookings have the new column
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, booking_state_id')
            .limit(5);

        if (bookingsError) {
            console.log('⚠️  Could not check bookings table');
        } else {
            console.log(`\n📋 Sample bookings: ${bookings.length} records found`);
            if (bookings.length > 0) {
                console.log(`  First booking state_id: ${bookings[0].booking_state_id}`);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Error in verifyNewStructure:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Recreating booking_state table...\n');

    // Test connection
    const connected = await testDatabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without database connection');
        process.exit(1);
    }

    console.log('');

    // Check existing bookings
    await checkExistingBookings();
    console.log('');

    // Step 1: Drop existing table
    const dropped = await dropBookingStateTable();
    if (!dropped) {
        console.log('\n❌ Failed to drop booking_state table');
        process.exit(1);
    }
    console.log('');

    // Step 2: Create new table
    const created = await createNewBookingStateTable();
    if (!created) {
        console.log('\n❌ Failed to create new booking_state table');
        process.exit(1);
    }
    console.log('');

    // Step 3: Insert predefined states
    const statesInserted = await insertPredefinedStates();
    if (!statesInserted) {
        console.log('\n❌ Failed to insert predefined states');
        process.exit(1);
    }
    console.log('');

    // Step 4: Reset booking_state_id column
    const columnReset = await resetBookingStateColumn();
    if (!columnReset) {
        console.log('\n❌ Failed to reset booking_state_id column');
        process.exit(1);
    }
    console.log('');

    // Step 5: Verify structure
    await verifyNewStructure();

    console.log('\n✅ Successfully recreated booking_state table!');
    console.log('🌐 The new booking state structure is ready to use');
    console.log('📝 All existing bookings have been set to "draft" state');
}

main().catch(console.error);
