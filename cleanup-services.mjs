// Test script to check database connection and clean up services
import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to your known values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctzcqonfjxtbvjzgakbo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0emNxb25manh0YnZqemdhazNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTQ0ODEsImV4cCI6MjA1MTM5MDQ4MX0.fJnWq-Iq1OKEpQD33vy_FKHNr2eCLtmTvJHTL5cNLYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupServices() {
    try {
        console.log('🧹 Starting services cleanup...\n');
        console.log('🔗 Connecting to:', supabaseUrl);

        // Test connection first
        const { data: testData, error: testError } = await supabase
            .from('services')
            .select('count', { count: 'exact', head: true });

        if (testError) {
            console.error('❌ Connection test failed:', testError);
            return;
        }

        console.log('✅ Database connection successful');

        // Get all services
        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .order('id');

        if (error) {
            console.error('❌ Error fetching services:', error);
            return;
        }

        console.log('📊 Total services found:', services?.length || 0);

        if (!services || services.length === 0) {
            console.log('ℹ️  No services found in database. Perhaps they were already cleaned up?');
            return;
        }

        // Group by category
        const categories = services.reduce((acc, service) => {
            if (!acc[service.category]) acc[service.category] = [];
            acc[service.category].push(service);
            return acc;
        }, {});

        console.log('\n📂 Services by category:');
        Object.entries(categories).forEach(([category, serviceList]) => {
            console.log(`  ${category}: ${serviceList.length} services`);
        });

        // Show all services
        console.log('\n📋 All services:');
        services.forEach(service => {
            console.log(`  ID: ${service.id} | ${service.category} | ${service.name} | $${service.price}`);
        });

        // Identify likely duplicates (Vietnamese services or duplicated English ones)
        const vietnameseCategories = ['Rửa xe', 'Chăm sóc', 'Nội thất', 'Bảo vệ xe mới'];
        const duplicateServices = services.filter(service =>
            vietnameseCategories.includes(service.category) ||
            service.id >= 49 // Based on your database export
        );

        if (duplicateServices.length > 0) {
            console.log('\n🗑️  Found potential duplicate services:');
            duplicateServices.forEach(service => {
                console.log(`  ID: ${service.id} | ${service.category} | ${service.name}`);
            });

            console.log('\n⚠️  Would you like to delete these duplicates? (Run with --delete flag)');

            // Check if delete flag is passed
            if (process.argv.includes('--delete')) {
                console.log('\n🗑️  Deleting duplicate services...');

                for (const service of duplicateServices) {
                    const { error: deleteError } = await supabase
                        .from('services')
                        .delete()
                        .eq('id', service.id);

                    if (deleteError) {
                        console.log(`❌ Error deleting service ID ${service.id}:`, deleteError.message);
                    } else {
                        console.log(`✅ Deleted: ${service.name} (ID: ${service.id})`);
                    }
                }

                // Show final result
                const { data: finalServices } = await supabase
                    .from('services')
                    .select('*')
                    .order('category, id');

                console.log('\n🎯 Cleanup completed!');
                console.log('📊 Final service count:', finalServices?.length || 0);

                const finalCategories = finalServices?.reduce((acc, service) => {
                    acc[service.category] = (acc[service.category] || 0) + 1;
                    return acc;
                }, {});
                console.log('📂 Final categories:', finalCategories);
            }
        } else {
            console.log('\n✨ No duplicate services found! Database is already clean.');
        }

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

cleanupServices();
