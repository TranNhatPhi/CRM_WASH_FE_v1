import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';
import {
    APIError,
    ValidationError,
    formatErrorResponse,
    validateRequiredFields,
    sanitizeInput,
    sanitizeNumericInput,
    validateEmail,
    validatePhoneNumber
} from '@/lib/error-handler';
import { withErrorHandler, withValidation, withLogging } from '@/lib/middleware-new';

async function handleGET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            throw new ValidationError('Invalid pagination parameters');
        }

        let result;
        if (search) {
            result = await DB.customers.search(search, page, limit);
        } else {
            result = await DB.customers.getAll(page, limit);
        }

        const { data: customers, error, count } = result;

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Customers fetched successfully',
            data: {
                customers: customers || [],
                total: count || 0,
                page,
                limit,
                search
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
        validateRequiredFields(body, ['name', 'phone']);

        // Sanitize and validate data
        const sanitizedData = {
            name: sanitizeInput(body.name),
            email: body.email ? sanitizeInput(body.email) : null,
            phone: sanitizeInput(body.phone),
            joined_at: body.joined_at ? new Date(body.joined_at).toISOString() : new Date().toISOString(),
            tags: sanitizeInput(body.tags || 'Regular'),
            membership_id: sanitizeNumericInput(body.membership_id) || null
        };

        // Additional validation
        if (!validatePhoneNumber(sanitizedData.phone)) {
            throw new ValidationError('Invalid phone number format');
        }

        if (sanitizedData.email && !validateEmail(sanitizedData.email)) {
            throw new ValidationError('Invalid email format');
        }

        const { data: customer, error } = await DB.customers.create(sanitizedData);

        if (error) {
            // Check for duplicate phone number
            if (error.message.includes('customers_phone_key')) {
                throw new APIError('Phone number already exists', 409, 'DUPLICATE_ERROR');
            }
            // Check for duplicate email
            if (error.message.includes('customers_email_key')) {
                throw new APIError('Email already exists', 409, 'DUPLICATE_ERROR');
            }
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Customer created successfully',
            data: customer
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

        if (updateData.name !== undefined) {
            sanitizedData.name = sanitizeInput(updateData.name);
            if (!sanitizedData.name) {
                throw new ValidationError('Name cannot be empty');
            }
        }

        if (updateData.email !== undefined) {
            sanitizedData.email = updateData.email ? sanitizeInput(updateData.email) : null;
            if (sanitizedData.email && !validateEmail(sanitizedData.email)) {
                throw new ValidationError('Invalid email format');
            }
        }

        if (updateData.phone !== undefined) {
            sanitizedData.phone = sanitizeInput(updateData.phone);
            if (sanitizedData.phone && !validatePhoneNumber(sanitizedData.phone)) {
                throw new ValidationError('Invalid phone number format');
            }
        }

        if (updateData.tags !== undefined) {
            sanitizedData.tags = sanitizeInput(updateData.tags);
        }

        if (updateData.membership_id !== undefined) {
            sanitizedData.membership_id = sanitizeNumericInput(updateData.membership_id);
        }

        const { data: customer, error } = await DB.customers.update(parseInt(id), sanitizedData);

        if (error) {
            // Check for duplicate phone number
            if (error.message.includes('customers_phone_key')) {
                throw new APIError('Phone number already exists', 409, 'DUPLICATE_ERROR');
            }
            // Check for duplicate email
            if (error.message.includes('customers_email_key')) {
                throw new APIError('Email already exists', 409, 'DUPLICATE_ERROR');
            }
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        if (!customer) {
            throw new APIError('Customer not found', 404, 'NOT_FOUND');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Customer updated successfully',
            data: customer
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
            throw new ValidationError('Customer ID is required');
        }

        const customerId = parseInt(id);
        if (isNaN(customerId)) {
            throw new ValidationError('Invalid customer ID format');
        }

        // Check if customer has vehicles
        const { data: vehicles } = await DB.vehicles.getByCustomerId(customerId);
        if (vehicles && vehicles.length > 0) {
            throw new APIError(
                'Cannot delete customer with existing vehicles. Delete vehicles first or use cascade=true',
                409,
                'CONSTRAINT_ERROR'
            );
        }

        const { error } = await DB.customers.delete(customerId);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Customer deleted successfully',
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
