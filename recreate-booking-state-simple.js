/**
 * Script đơn giản để xóa và tạo lại bảng booking_state
 * Sử dụng raw SQL thay vì Supabase functions
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateBookingStateTable() {
    console.log('🚀 Starting to recreate booking_state table...');

    try {
        // Test connection first
        console.log('🔍 Testing database connection...');
        const { data: testData, error: testError } = await supabase
            .from('customers')
            .select('id')
            .limit(1);

        if (testError) {
            console.error('❌ Database connection failed:', testError.message);
            return;
        }
        console.log('✅ Database connection successful');

        // Step 1: Drop foreign key constraint (if exists)
        console.log('🗑️  Removing foreign key constraint...');
        const dropConstraintSQL = `
            ALTER TABLE IF EXISTS bookings 
            DROP CONSTRAINT IF EXISTS bookings_booking_state_id_fkey;
        `;

        const { error: dropConstraintError } = await supabase.rpc('exec_sql', {
            sql: dropConstraintSQL
        });

        if (dropConstraintError) {
            console.log('⚠️  Could not remove foreign key constraint (might not exist):', dropConstraintError.message);
        } else {
            console.log('✅ Foreign key constraint removed');
        }

        // Step 2: Drop table
        console.log('🗑️  Dropping booking_state table...');
        const dropTableSQL = `DROP TABLE IF EXISTS booking_state CASCADE;`;

        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: dropTableSQL
        });

        if (dropError) {
            console.error('❌ Error dropping table:', dropError.message);
            // Continue anyway, table might not exist
        } else {
            console.log('✅ booking_state table dropped');
        }

        // Step 3: Create new table
        console.log('📋 Creating new booking_state table...');
        const createTableSQL = `
            CREATE TABLE booking_state (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: createTableSQL
        });

        if (createError) {
            console.error('❌ Error creating table:', createError.message);
            return;
        }
        console.log('✅ booking_state table created');

        // Step 4: Insert default data
        console.log('📝 Inserting default state data...');
        const insertDataSQL = `
            INSERT INTO booking_state (name, description) VALUES
            ('pending', 'Booking đang chờ xử lý'),
            ('confirmed', 'Booking đã được xác nhận'),
            ('in_progress', 'Đang thực hiện dịch vụ'),
            ('washing', 'Đang rửa xe'),
            ('drying', 'Đang sấy khô'),
            ('completed', 'Hoàn thành dịch vụ'),
            ('cancelled', 'Booking đã bị hủy'),
            ('no_show', 'Khách hàng không đến');
        `;

        const { error: insertError } = await supabase.rpc('exec_sql', {
            sql: insertDataSQL
        });

        if (insertError) {
            console.error('❌ Error inserting data:', insertError.message);
            return;
        }
        console.log('✅ Default state data inserted');

        // Step 5: Add foreign key constraint if bookings table has booking_state_id column
        console.log('🔗 Adding foreign key constraint...');
        const addConstraintSQL = `
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'bookings' 
                    AND column_name = 'booking_state_id'
                ) THEN
                    ALTER TABLE bookings 
                    ADD CONSTRAINT bookings_booking_state_id_fkey 
                    FOREIGN KEY (booking_state_id) REFERENCES booking_state(id);
                    
                    UPDATE bookings 
                    SET booking_state_id = 1 
                    WHERE booking_state_id IS NULL;
                END IF;
            END $$;
        `;

        const { error: constraintError } = await supabase.rpc('exec_sql', {
            sql: addConstraintSQL
        });

        if (constraintError) {
            console.log('⚠️  Could not add foreign key constraint:', constraintError.message);
        } else {
            console.log('✅ Foreign key constraint added');
        }

        // Verify the result
        console.log('🔍 Verifying created table...');
        const { data: stateData, error: verifyError } = await supabase
            .from('booking_state')
            .select('*')
            .order('id');

        if (verifyError) {
            console.error('❌ Error verifying table:', verifyError.message);
        } else {
            console.log('✅ Verification successful!');
            console.log('📊 Created states:');
            stateData.forEach(state => {
                console.log(`   ${state.id}. ${state.name} - ${state.description}`);
            });
        }

        console.log('🎉 booking_state table recreated successfully!');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run the function
recreateBookingStateTable();
