// Test API endpoints directly
const testApiEndpoints = async () => {
    const baseUrl = 'http://localhost:3001';

    try {
        console.log('🧪 Testing API endpoints...\n');

        // Test services endpoint
        console.log('📊 Testing GET /api/services...');
        const servicesResponse = await fetch(`${baseUrl}/api/services`);

        if (!servicesResponse.ok) {
            console.error('❌ Services API failed:', servicesResponse.status, servicesResponse.statusText);
            const errorText = await servicesResponse.text();
            console.error('Error details:', errorText);
            return;
        }

        const servicesData = await servicesResponse.json();
        console.log('✅ Services API response:', {
            success: servicesData.success,
            count: servicesData.data?.length || 0,
            hasData: !!servicesData.data
        });

        if (servicesData.data && servicesData.data.length > 0) {
            // Group by category
            const categories = servicesData.data.reduce((acc, service) => {
                if (!acc[service.category]) acc[service.category] = [];
                acc[service.category].push(service);
                return acc;
            }, {});

            console.log('\n📂 Services by category:');
            Object.entries(categories).forEach(([category, services]) => {
                console.log(`  ${category}: ${services.length} services`);
            });

            // Show all services
            console.log('\n📋 All services:');
            servicesData.data.forEach(service => {
                console.log(`  ID: ${service.id} | ${service.category} | ${service.name} | $${service.price}`);
            });

            // Check for duplicates
            const vietnameseCategories = ['Rửa xe', 'Chăm sóc', 'Nội thất', 'Bảo vệ xe mới'];
            const duplicates = servicesData.data.filter(service =>
                vietnameseCategories.includes(service.category)
            );

            if (duplicates.length > 0) {
                console.log('\n🗑️  Found Vietnamese/duplicate services:');
                duplicates.forEach(service => {
                    console.log(`  ID: ${service.id} | ${service.category} | ${service.name}`);
                });

                // Try to delete them via API
                console.log('\n🗑️  Attempting to delete duplicates via API...');
                for (const service of duplicates) {
                    try {
                        const deleteResponse = await fetch(`${baseUrl}/api/services?id=${service.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });

                        if (deleteResponse.ok) {
                            const result = await deleteResponse.json();
                            console.log(`✅ Deleted: ${service.name} (ID: ${service.id})`);
                        } else {
                            const errorData = await deleteResponse.json();
                            console.log(`❌ Failed to delete ID ${service.id}:`, errorData.error || errorData.message);
                        }
                    } catch (deleteError) {
                        console.log(`❌ Error deleting ID ${service.id}:`, deleteError.message);
                    }
                }

                // Check final state
                console.log('\n🔄 Checking final state...');
                const finalResponse = await fetch(`${baseUrl}/api/services`);
                const finalData = await finalResponse.json();
                console.log('📊 Final service count:', finalData.data?.length || 0);

                const finalCategories = finalData.data?.reduce((acc, service) => {
                    acc[service.category] = (acc[service.category] || 0) + 1;
                    return acc;
                }, {});
                console.log('📂 Final categories:', finalCategories);
            } else {
                console.log('\n✨ No Vietnamese/duplicate services found!');
            }
        } else {
            console.log('ℹ️  No services found in the response.');
        }

    } catch (error) {
        console.error('💥 Error testing API:', error.message);
    }
};

testApiEndpoints();
