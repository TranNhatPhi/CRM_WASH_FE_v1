import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';
import { 
  formatErrorResponse, 
  formatSuccessResponse, 
  validateRequest, 
  sanitizers,
  logError
} from '@/lib/error-handler';

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
            createdAt: string;
            updatedAt: string;
            customers: {
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

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Sanitize input data
        const sanitizedData = {
            customer_id: body.customer_id,
            make: sanitizers.string(body.make),
            model: sanitizers.string(body.model),
            year: body.year,
            color: sanitizers.string(body.color),
            license_plate: sanitizers.licensePlate(body.license_plate),
            notes: sanitizers.string(body.notes)
        };

        // Validate required fields and formats
        validateRequest(sanitizedData, {
            customer_id: { required: true },
            license_plate: { required: true, licensePlate: true },
            make: { maxLength: 255 },
            model: { maxLength: 255 },
            year: { year: true },
            color: { maxLength: 255 },
            notes: { maxLength: 1000 }
        });

        const vehicleData = {
            customer_id: sanitizedData.customer_id,
            make: sanitizedData.make,
            model: sanitizedData.model,
            year: sanitizedData.year,
            color: sanitizedData.color,
            license_plate: sanitizedData.license_plate,
            notes: sanitizedData.notes,
            status: 'active',
            wash_status: 'No active wash',
            wash_count: 0
        };

        const { data: vehicle, error } = await DB.vehicles.create(vehicleData);

        if (error) {
            logError(new Error(error.message), { operation: 'POST vehicle', data: vehicleData });
            const errorResponse = formatErrorResponse(new Error(error.message), request.url);
            return NextResponse.json(errorResponse, { status: 500 });
        }

        const successResponse = formatSuccessResponse(
            vehicle,
            'Vehicle created successfully',
            201
        );

        return NextResponse.json(successResponse, { status: 201 });

    } catch (error) {
        logError(error as Error, { operation: 'POST vehicle' });
        const errorResponse = formatErrorResponse(error as Error, request.url);
        const status = error instanceof Error && error.message.includes('Validation') ? 400 : 500;
        return NextResponse.json(errorResponse, { status });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: 'Vehicle ID is required',
                    data: null
                },
                { status: 400 }
            );
        }

        const { data: vehicle, error } = await DB.vehicles.update(id, updateData);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Vehicle updated successfully',
            data: vehicle
        });

    } catch (error) {
        console.error('Error updating vehicle:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Unable to update vehicle',
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: 'Vehicle ID is required',
                    data: null
                },
                { status: 400 }
            );
        }

        const { error } = await DB.vehicles.delete(parseInt(id));

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Vehicle deleted successfully',
            data: null
        });

    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Unable to delete vehicle',
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
