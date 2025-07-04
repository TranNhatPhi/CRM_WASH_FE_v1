const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pzvtpphhmcnxbkdfjith.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dnRwcGhobWNueGJrZGZqaXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjgyNzksImV4cCI6MjA2NTc0NDI3OX0.QD_c0bcnI3x49GO_-kH20a67DyPvDn1l-ZQmX5-wyVo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('Testing Supabase connection...');

        // Test full query
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .limit(1);

        if (servicesError) {
            console.error('Query error:', servicesError);
            return;
        }

        console.log('First service structure:', JSON.stringify(services[0], null, 2));
        console.log('All available columns:', Object.keys(services[0] || {}));

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testConnection();
