// Simple test to check Supabase connection
console.log('Testing Supabase connection...');

// Check if we're in browser environment
if (typeof window !== 'undefined') {
    console.log('Running in browser');

    // Check if environment variables are accessible
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

    if (supabaseUrl && supabaseAnonKey) {
        try {
            // Try to create a Supabase client
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            console.log('Supabase client created successfully');

            // Test a simple query
            supabase
                .from('booking_state')
                .select('id, state_name')
                .limit(1)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Database connection test failed:', error);
                    } else {
                        console.log('Database connection test successful:', data);
                    }
                });

        } catch (error) {
            console.error('Error creating Supabase client:', error);
        }
    }
} else {
    console.log('Running in server environment');
}
