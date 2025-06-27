import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';
import {
    APIError,
    ValidationError,
    formatErrorResponse,
    validateRequiredFields,
    sanitizeInput
} from '@/lib/error-handler';
import { withErrorHandler, withValidation, withLogging } from '@/lib/middleware-new';

async function handleGET(request: NextRequest) {
    try {
        const { data: services, error } = await DB.services.getAll();

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Services fetched successfully',
            data: services || []
        });

    } catch (error) {
        throw error;
    }
}

async function handlePOST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        validateRequiredFields(body, ['name', 'price']);

        // Sanitize input
        const sanitizedData = {
            name: sanitizeInput(body.name),
            description: sanitizeInput(body.description || ''),
            price: parseFloat(body.price),
            duration: body.duration ? parseInt(body.duration) : null,
            category: sanitizeInput(body.category || '')
        };

        // Additional validation
        if (sanitizedData.price <= 0) {
            throw new ValidationError('Price must be greater than 0');
        }

        const { data: service, error } = await DB.services.create(sanitizedData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Service created successfully',
            data: service
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
        if (updateData.name) sanitizedData.name = sanitizeInput(updateData.name);
        if (updateData.description !== undefined) sanitizedData.description = sanitizeInput(updateData.description);
        if (updateData.price !== undefined) {
            sanitizedData.price = parseFloat(updateData.price);
            if (sanitizedData.price <= 0) {
                throw new ValidationError('Price must be greater than 0');
            }
        }
        if (updateData.duration !== undefined) sanitizedData.duration = parseInt(updateData.duration);
        if (updateData.category !== undefined) sanitizedData.category = sanitizeInput(updateData.category);

        const { data: service, error } = await DB.services.update(parseInt(id), sanitizedData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        if (!service) {
            throw new APIError('Service not found', 404, 'NOT_FOUND');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Service updated successfully',
            data: service
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
            throw new ValidationError('Service ID is required');
        }

        const serviceId = parseInt(id);
        if (isNaN(serviceId)) {
            throw new ValidationError('Invalid service ID format');
        }

        const { error } = await DB.services.delete(serviceId);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Service deleted successfully',
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
