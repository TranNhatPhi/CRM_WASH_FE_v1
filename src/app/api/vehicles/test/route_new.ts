import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Test Supabase connection and fetch vehicles
        const { data: vehicles, error, count } = await DB.vehicles.getAll(page, limit);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        // Transform data to match expected format
        const transformedVehicles = vehicles?.map(vehicle => ({
            ...vehicle,
            Customer: vehicle.customers // Rename for compatibility
        })) || [];

        return NextResponse.json({
            statusCode: 200,
            message: 'Test successful - Supabase connection working',
            data: {
                vehicles: transformedVehicles,
                total: count || 0,
                page,
                limit,
                source: 'Supabase Direct'
            }
        });

    } catch (error) {
        console.error('Test API error:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Test failed - Supabase connection error',
                data: {
                    vehicles: [],
                    total: 0,
                    page: 1,
                    limit: 10,
                    source: 'Mock Data (Fallback)'
                },
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Test POST endpoint
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Test creating a vehicle
        const vehicleData = {
            customer_id: body.customer_id || 1,
            make: body.make || 'Test',
            model: body.model || 'Vehicle',
            year: body.year || 2024,
            color: body.color || 'Test Color',
            license_plate: body.license_plate || `TEST-${Date.now()}`,
            notes: body.notes || 'Test vehicle created via API',
            status: 'active',
            wash_status: 'No active wash',
            wash_count: 0
        };

        const { data: vehicle, error } = await DB.vehicles.create(vehicleData);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Test vehicle created successfully via Supabase',
            data: vehicle
        });

    } catch (error) {
        console.error('Test POST error:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Test POST failed',
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
