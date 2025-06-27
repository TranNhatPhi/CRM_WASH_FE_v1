import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';
import {
    APIError,
    ValidationError,
    formatErrorResponse,
    validateRequiredFields,
    sanitizeInput,
    sanitizeNumericInput
} from '@/lib/error-handler';
import { withErrorHandler, withValidation, withLogging } from '@/lib/middleware-new';

async function handleGET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const customer_id = searchParams.get('customer_id');
        const search = searchParams.get('search') || '';

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            throw new ValidationError('Invalid pagination parameters');
        }

        let result;

        if (customer_id) {
            const customerId = parseInt(customer_id);
            if (isNaN(customerId)) {
                throw new ValidationError('Invalid customer ID format');
            }
            result = await DB.vehicles.getByCustomerId(customerId);
            // Convert to match pagination format
            result = {
                data: result.data,
                error: result.error,
                count: result.data?.length || 0
            };
        } else if (search) {
            result = await DB.vehicles.search(search, page, limit);
        } else {
            result = await DB.vehicles.getAll(page, limit);
        }

        const { data: vehicles, error, count } = result;

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Vehicles fetched successfully',
            data: {
                vehicles: vehicles || [],
                total: count || 0,
                page: customer_id ? 1 : page,
                limit: customer_id ? (vehicles?.length || 0) : limit,
                search,
                customer_id
            }
        });

    } catch (error) {
        throw error;
    }
}

async function handlePOST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        validateRequiredFields(body, ['customer_id', 'license_plate']);

        // Sanitize and validate data
        const sanitizedData = {
            customer_id: sanitizeNumericInput(body.customer_id),
            make: sanitizeInput(body.make || ''),
            model: sanitizeInput(body.model || ''),
            year: sanitizeNumericInput(body.year) || null,
            color: sanitizeInput(body.color || ''),
            license_plate: sanitizeInput(body.license_plate),
            notes: sanitizeInput(body.notes || ''),
            status: sanitizeInput(body.status || 'active'),
            wash_status: sanitizeInput(body.wash_status || 'No active wash'),
            wash_count: sanitizeNumericInput(body.wash_count) || 0
        };

        // Additional validation
        if (!sanitizedData.customer_id) {
            throw new ValidationError('Invalid customer_id');
        }

        if (!sanitizedData.license_plate) {
            throw new ValidationError('License plate is required');
        }

        if (sanitizedData.wash_count < 0) {
            throw new ValidationError('Wash count cannot be negative');
        }

        // Prepare data for creation (handle null values)
        const vehicleData = {
            ...sanitizedData,
            customer_id: sanitizedData.customer_id as number // We've validated it's not null above
        };

        const { data: vehicle, error } = await DB.vehicles.create(vehicleData);

        if (error) {
            // Check for duplicate license plate
            if (error.message.includes('vehicles_license_plate_key')) {
                throw new APIError('License plate already exists', 409, 'DUPLICATE_ERROR');
            }
            // Check for foreign key constraint
            if (error.message.includes('vehicles_customer_id_fkey')) {
                throw new APIError('Customer not found', 404, 'NOT_FOUND');
            }
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Vehicle created successfully',
            data: vehicle
        });

    } catch (error) {
        throw error;
    }
}

async function handlePUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        validateRequiredFields(body, ['id']);

        const { id, ...updateData } = body;

        // Sanitize update data
        const sanitizedData: any = {};

        if (updateData.customer_id !== undefined) {
            sanitizedData.customer_id = sanitizeNumericInput(updateData.customer_id);
            if (!sanitizedData.customer_id) {
                throw new ValidationError('Invalid customer_id');
            }
        }

        if (updateData.make !== undefined) {
            sanitizedData.make = sanitizeInput(updateData.make);
        }

        if (updateData.model !== undefined) {
            sanitizedData.model = sanitizeInput(updateData.model);
        }

        if (updateData.year !== undefined) {
            sanitizedData.year = sanitizeNumericInput(updateData.year);
        }

        if (updateData.color !== undefined) {
            sanitizedData.color = sanitizeInput(updateData.color);
        }

        if (updateData.license_plate !== undefined) {
            sanitizedData.license_plate = sanitizeInput(updateData.license_plate);
            if (!sanitizedData.license_plate) {
                throw new ValidationError('License plate cannot be empty');
            }
        }

        if (updateData.notes !== undefined) {
            sanitizedData.notes = sanitizeInput(updateData.notes);
        }

        if (updateData.status !== undefined) {
            sanitizedData.status = sanitizeInput(updateData.status);
        }

        if (updateData.wash_status !== undefined) {
            sanitizedData.wash_status = sanitizeInput(updateData.wash_status);
        }

        if (updateData.wash_count !== undefined) {
            sanitizedData.wash_count = sanitizeNumericInput(updateData.wash_count);
            if (sanitizedData.wash_count !== null && sanitizedData.wash_count < 0) {
                throw new ValidationError('Wash count cannot be negative');
            }
        }

        const { data: vehicle, error } = await DB.vehicles.update(parseInt(id), sanitizedData);

        if (error) {
            // Check for duplicate license plate
            if (error.message.includes('vehicles_license_plate_key')) {
                throw new APIError('License plate already exists', 409, 'DUPLICATE_ERROR');
            }
            // Check for foreign key constraint
            if (error.message.includes('vehicles_customer_id_fkey')) {
                throw new APIError('Customer not found', 404, 'NOT_FOUND');
            }
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        if (!vehicle) {
            throw new APIError('Vehicle not found', 404, 'NOT_FOUND');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Vehicle updated successfully',
            data: vehicle
        });

    } catch (error) {
        throw error;
    }
}

async function handleDELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new ValidationError('Vehicle ID is required');
        }

        const vehicleId = parseInt(id);
        if (isNaN(vehicleId)) {
            throw new ValidationError('Invalid vehicle ID format');
        }

        const { error } = await DB.vehicles.delete(vehicleId);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Vehicle deleted successfully',
            data: null
        });

    } catch (error) {
        throw error;
    }
}

// Apply middleware to handlers
export const GET = withLogging(withErrorHandler(handleGET));
export const POST = withLogging(withErrorHandler(withValidation(handlePOST)));
export const PUT = withLogging(withErrorHandler(withValidation(handlePUT)));
export const DELETE = withLogging(withErrorHandler(handleDELETE));
