const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://ctzcqonfjxtbvjzgakbo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emNxb25manh0YnZqemdhazNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTQ0ODEsImV4cCI6MjA1MTM5MDQ4MX0.fJnWq-Iq1OKEpQD33vy_FKHNr2eCLtmTvJHTL5cNLYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupServices() {
    try {
        console.log('🧹 Starting services cleanup...\n');

        // Get current services
        const { data: beforeServices, error: beforeError } = await supabase
            .from('services')
            .select('*')
            .order('id');

        if (beforeError) {
            console.error('Error fetching services:', beforeError);
            return;
        }

        console.log('📊 Total services before cleanup:', beforeServices?.length || 0);

        // Count by category
        const beforeCategories = beforeServices?.reduce((acc, service) => {
            acc[service.category] = (acc[service.category] || 0) + 1;
            return acc;
        }, {});
        console.log('📂 Categories before cleanup:', beforeCategories);

        // Show all services
        console.log('\n📋 All services before cleanup:');
        beforeServices?.forEach(service => {
            console.log(`ID: ${service.id} | ${service.category} | ${service.name} | $${service.price}`);
        });

        // Identify duplicates
        const duplicateIds = [49, 50, 51, 52, 53, 59, 60, 61, 62, 63];
        console.log('\n🗑️  Removing duplicate services with IDs:', duplicateIds);

        // Remove duplicates one by one
        let deletedCount = 0;
        for (const id of duplicateIds) {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) {
                console.log(`❌ Error deleting service ID ${id}:`, error.message);
            } else {
                console.log(`✅ Deleted service ID: ${id}`);
                deletedCount++;
            }
        }

        // Get updated services
        const { data: afterServices, error: afterError } = await supabase
            .from('services')
            .select('*')
            .order('category, id');

        if (afterError) {
            console.error('Error fetching updated services:', afterError);
            return;
        }

        console.log(`\n🎯 Successfully deleted ${deletedCount} duplicate services`);
        console.log('📊 Total services after cleanup:', afterServices?.length || 0);

        // Count by category after cleanup
        const afterCategories = afterServices?.reduce((acc, service) => {
            acc[service.category] = (acc[service.category] || 0) + 1;
            return acc;
        }, {});
        console.log('📂 Categories after cleanup:', afterCategories);

        // Show final structure
        console.log('\n📋 Final service structure:');
        afterServices?.forEach(service => {
            console.log(`ID: ${service.id} | ${service.category} | ${service.name} | $${service.price}`);
        });

        console.log('\n✨ Database cleanup completed successfully!');

    } catch (error) {
        console.error('💥 Unexpected error during cleanup:', error);
    }
}

// Run the cleanup
cleanupServices();
