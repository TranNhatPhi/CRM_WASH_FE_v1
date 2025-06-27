const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLicensePlate() {
    console.log('Testing license plate lookup...')

    // Test getting all vehicles first
    console.log('\n1. Getting all vehicles:')
    const { data: allVehicles, error: allError } = await supabase
        .from('vehicles')
        .select(`
      *,
      customers!vehicles_customer_id_fkey(
        id,
        name,
        email,
        phone
      )
    `)
        .limit(5)

    if (allError) {
        console.error('Error getting all vehicles:', allError)
    } else {
        console.log('Found vehicles:', allVehicles?.length)
        allVehicles?.forEach(v => {
            console.log(`  - ${v.license_plate} (${v.make} ${v.model}) - Customer: ${v.customers?.name}`)
        })
    }

    // Test looking up specific license plates
    const testPlates = ['30A-12345', '51B-67890', '30A-99999']

    for (const plate of testPlates) {
        console.log(`\n2. Testing license plate: ${plate}`)
        const { data: vehicleData, error } = await supabase
            .from('vehicles')
            .select(`
        *,
        customers!vehicles_customer_id_fkey(
          id,
          name,
          email,
          phone,
          tags
        )
      `)
            .eq('license_plate', plate)
            .single()

        if (error) {
            console.log(`  Error: ${error.message} (Code: ${error.code})`)
        } else {
            console.log(`  Found: ${vehicleData.make} ${vehicleData.model}`)
            console.log(`  Customer: ${vehicleData.customers?.name} (${vehicleData.customers?.phone})`)
            console.log(`  Tags: ${vehicleData.customers?.tags}`)
        }
    }
}

testLicensePlate().catch(console.error)
