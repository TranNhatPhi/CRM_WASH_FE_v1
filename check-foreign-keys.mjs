import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForeignKeys() {
    try {
        console.log('🔍 Checking foreign key constraints...\n');

        // Check if there's a users table
        console.log('👤 Checking users table:');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .limit(5);

        if (usersError) {
            console.error('❌ Users table error:', usersError);
        } else {
            console.log('✅ Users table found:', users);
        }

        // Check staff table
        console.log('\n👥 Checking staff table:');
        const { data: staff, error: staffError } = await supabase
            .from('staff')
            .select('id, name, email')
            .limit(5);

        if (staffError) {
            console.error('❌ Staff table error:', staffError);
        } else {
            console.log('✅ Staff table found:', staff);
        }

        // Check existing bookings to see what created_by values are used
        console.log('\n📋 Checking existing bookings created_by values:');
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, created_by, updated_by')
            .limit(10);

        if (bookingsError) {
            console.error('❌ Bookings error:', bookingsError);
        } else {
            console.log('✅ Existing bookings:');
            bookings.forEach(booking => {
                console.log(`  Booking ${booking.id}: created_by=${booking.created_by}, updated_by=${booking.updated_by}`);
            });

            // Get unique created_by values
            const uniqueCreatedBy = [...new Set(bookings.map(b => b.created_by))];
            console.log('Unique created_by values:', uniqueCreatedBy);
        }

        // Test with existing created_by value
        if (bookings && bookings.length > 0) {
            const existingCreatedBy = bookings[0].created_by;
            console.log(`\n🧪 Testing booking creation with existing created_by: ${existingCreatedBy}`);

            const testBooking = {
                customer_id: 1,
                vehicle_id: 1,
                booking_state_id: 3,
                date: new Date().toISOString().split('T')[0],
                total_price: 77.00,
                notes: 'Test booking with correct created_by',
                created_by: existingCreatedBy,
                updated_by: existingCreatedBy,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('📝 Test booking data:', testBooking);

            const { data: newBooking, error: createError } = await supabase
                .from('bookings')
                .insert(testBooking)
                .select('id')
                .single();

            if (createError) {
                console.error('❌ Error creating test booking:', createError);
            } else {
                console.log('✅ Test booking created successfully:', newBooking.id);

                // Clean up
                await supabase
                    .from('bookings')
                    .delete()
                    .eq('id', newBooking.id);
                console.log('🧹 Test booking cleaned up');
            }
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Run the check
checkForeignKeys().then(() => {
    console.log('\n✨ Foreign key check complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Foreign key check failed:', error);
    process.exit(1);
});
