import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';

// Define the API response types based on your backend structure
interface ApiVehicleResponse {
    statusCode: number;
    message: string;
    data: {
        vehicles: {
            id: number;
            customer_id: number;
            make: string;
            model: string;
            year: number;
            color: string;
            license_plate: string;
            notes: string;
            status: string;
            last_wash_at: string | null;
            wash_count: number;
            photo_url: string | null;
            internal_notes: string | null;
            createdAt: string;
            updatedAt: string;
            Customer: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const { data: vehicles, error, count } = await DB.vehicles.getAll(page, limit);

        if (error) {
            throw new Error(error.message);
        }

        // Transform data to match expected format
        const transformedVehicles = vehicles?.map(vehicle => ({
            ...vehicle,
            Customer: vehicle.customers // Rename for compatibility
        })) || [];

        const response: ApiVehicleResponse = {
            statusCode: 200,
            message: 'Vehicles fetched successfully',
            data: {
                vehicles: transformedVehicles,
                total: count || 0,
                page,
                limit
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Failed to fetch vehicles',
                data: {
                    vehicles: [],
                    total: 0,
                    page: 1,
                    limit: 10
                },
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customer_id, make, model, year, color, license_plate, notes } = body;

        // Validate required fields
        if (!license_plate) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: 'License plate is required',
                    data: null
                },
                { status: 400 }
            );
        }

        const vehicleData = {
            customer_id,
            make,
            model,
            year,
            color,
            license_plate,
            notes,
            status: 'active',
            wash_status: 'No active wash',
            wash_count: 0
        };

        const { data: vehicle, error } = await DB.vehicles.create(vehicleData);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Vehicle created successfully',
            data: vehicle
        });

    } catch (error) {
        console.error('Error creating vehicle:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: error instanceof Error ? error.message : 'Failed to create vehicle',
                data: null
            },
            { status: 500 }
        );
    }
}
