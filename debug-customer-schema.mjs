import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://dknrcqpmnhubkhkxptqp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbnJjcXBtbmh1Ymtoa3hwdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MDAzOTgsImV4cCI6MjA1MTI3NjM5OH0.-ioRLFPNRc8HGE-LkrPOFdLCcq9pHLBG-Wm_GJPwMrQ'
);

async function checkCustomerSchema() {
    console.log('Checking customers table schema...');

    // Try to get existing customers to see structure
    const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .limit(1);

    if (customerError) {
        console.error('Error querying customers:', customerError);
    } else {
        console.log('Sample customer data:', customers);
    }

    // Check if we can insert a test customer
    console.log('Testing customer insert...');

    const testCustomer = {
        name: 'Test Customer',
        phone: '9999999999',
        email: 'test@test.com'
    };

    const { data: insertResult, error: insertError } = await supabase
        .from('customers')
        .insert(testCustomer)
        .select('id')
        .single();

    if (insertError) {
        console.error('Error inserting test customer:', insertError);
        console.log('Error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
        });
    } else {
        console.log('Test customer created successfully:', insertResult);

        // Clean up test customer
        await supabase
            .from('customers')
            .delete()
            .eq('id', insertResult.id);
        console.log('Test customer deleted');
    }
}

checkCustomerSchema().catch(console.error);
