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

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            throw new ValidationError('Invalid pagination parameters');
        }

        const { data: bookings, error, count } = await DB.bookings.getAll(page, limit);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Bookings fetched successfully',
            data: {
                bookings: bookings || [],
                total: count || 0,
                page,
                limit
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
        validateRequiredFields(body, ['customer_id', 'vehicle_id', 'date', 'services']);

        // Sanitize and validate data
        const sanitizedData = {
            customer_id: sanitizeNumericInput(body.customer_id),
            vehicle_id: sanitizeNumericInput(body.vehicle_id),
            date: new Date(body.date),
            notes: sanitizeInput(body.notes || ''),
            services: Array.isArray(body.services) ? body.services : [],
            total_price: sanitizeNumericInput(body.total_price) || 0
        };

        // Additional validation
        if (!sanitizedData.customer_id || !sanitizedData.vehicle_id) {
            throw new ValidationError('Invalid customer_id or vehicle_id');
        }

        if (isNaN(sanitizedData.date.getTime())) {
            throw new ValidationError('Invalid date format');
        }

        if (sanitizedData.services.length === 0) {
            throw new ValidationError('At least one service is required');
        }

        if (sanitizedData.total_price < 0) {
            throw new ValidationError('Total price cannot be negative');
        }

        // Create booking
        const bookingData = {
            customer_id: sanitizedData.customer_id,
            vehicle_id: sanitizedData.vehicle_id,
            date: sanitizedData.date.toISOString(),
            status: 'pending',
            total_price: sanitizedData.total_price,
            notes: sanitizedData.notes,
            created_by: 1 // Default user ID, should be from auth context
        };

        const { data: booking, error } = await DB.bookings.create(bookingData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Booking created successfully',
            data: booking
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

        if (updateData.vehicle_id !== undefined) {
            sanitizedData.vehicle_id = sanitizeNumericInput(updateData.vehicle_id);
            if (!sanitizedData.vehicle_id) {
                throw new ValidationError('Invalid vehicle_id');
            }
        }

        if (updateData.date !== undefined) {
            sanitizedData.date = new Date(updateData.date);
            if (isNaN(sanitizedData.date.getTime())) {
                throw new ValidationError('Invalid date format');
            }
            sanitizedData.date = sanitizedData.date.toISOString();
        }

        if (updateData.status !== undefined) {
            sanitizedData.status = sanitizeInput(updateData.status);
        }

        if (updateData.total_price !== undefined) {
            sanitizedData.total_price = sanitizeNumericInput(updateData.total_price);
            if (sanitizedData.total_price !== null && sanitizedData.total_price < 0) {
                throw new ValidationError('Total price cannot be negative');
            }
        }

        if (updateData.notes !== undefined) {
            sanitizedData.notes = sanitizeInput(updateData.notes);
        }

        const { data: booking, error } = await DB.bookings.update(parseInt(id), sanitizedData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        if (!booking) {
            throw new APIError('Booking not found', 404, 'NOT_FOUND');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Booking updated successfully',
            data: booking
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
            throw new ValidationError('Booking ID is required');
        }

        const bookingId = parseInt(id);
        if (isNaN(bookingId)) {
            throw new ValidationError('Invalid booking ID format');
        }

        const { error } = await DB.bookings.delete(bookingId);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Booking deleted successfully',
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
