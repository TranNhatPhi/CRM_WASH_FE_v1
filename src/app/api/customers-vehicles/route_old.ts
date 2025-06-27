import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.vehicle?.license_plate || !body.customer?.phone || !body.customer?.name) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: "Required fields missing: vehicle license_plate, customer phone, and customer name are required"
                },
                { status: 400 }
            );
        }

        console.log('Creating customer and vehicle:', JSON.stringify(body, null, 2));

        // Create customer first
        const customerData = {
            name: body.customer.name,
            email: body.customer.email || `${body.customer.phone}@example.com`,
            phone: body.customer.phone,
            joined_at: new Date().toISOString(),
            tags: body.customer.tags || 'Regular',
            membership_id: body.customer.membership_id || null
        };

        const { data: customer, error: customerError } = await DB.customers.create(customerData);

        if (customerError) {
            console.error('Customer creation error:', customerError);
            return NextResponse.json(
                {
                    statusCode: 500,
                    message: customerError.message || 'Failed to create customer'
                },
                { status: 500 }
            );
        }

        // Create vehicle with the new customer ID
        const vehicleData = {
            customer_id: customer.id,
            make: body.vehicle.make,
            model: body.vehicle.model,
            year: body.vehicle.year,
            color: body.vehicle.color,
            license_plate: body.vehicle.license_plate,
            notes: body.vehicle.notes,
            status: 'active',
            wash_status: 'No active wash',
            wash_count: 0
        };

        const { data: vehicle, error: vehicleError } = await DB.vehicles.create(vehicleData);

        if (vehicleError) {
            console.error('Vehicle creation error:', vehicleError);
            // If vehicle creation fails, you might want to delete the customer
            // await DB.customers.delete(customer.id);
            return NextResponse.json(
                {
                    statusCode: 500,
                    message: vehicleError.message || 'Failed to create vehicle'
                },
                { status: 500 }
            );
        }

        console.log('Customer and vehicle created successfully:', { customer, vehicle });

        return NextResponse.json({
            statusCode: 201,
            message: "Tạo khách hàng và phương tiện thành công!",
            data: {
                customer,
                vehicle
            }
        });

    } catch (error) {
        console.error('Error creating customer and vehicle:', error);

        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Internal server error. Unable to create customer and vehicle.',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customer_id');

        if (!customerId) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: 'Customer ID is required',
                    data: null
                },
                { status: 400 }
            );
        }

        // Get customer details
        const { data: customer, error: customerError } = await DB.customers.getById(parseInt(customerId));

        if (customerError) {
            throw new Error(customerError.message);
        }

        // Get vehicles for this customer
        const { data: vehicles, error: vehiclesError } = await DB.vehicles.getByCustomerId(parseInt(customerId));

        if (vehiclesError) {
            throw new Error(vehiclesError.message);
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Customer and vehicles fetched successfully',
            data: {
                customer,
                vehicles: vehicles || []
            }
        });

    } catch (error) {
        console.error('Error fetching customer and vehicles:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Unable to fetch customer and vehicles',
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
