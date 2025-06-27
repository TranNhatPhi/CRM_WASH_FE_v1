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

        const { data: transactions, error, count } = await DB.transactions.getAll(page, limit);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Transactions fetched successfully',
            data: {
                transactions: transactions || [],
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
        validateRequiredFields(body, ['customer_id', 'amount', 'payment_method']);

        // Sanitize and validate data
        const sanitizedData = {
            customer_id: sanitizeNumericInput(body.customer_id),
            booking_id: sanitizeNumericInput(body.booking_id) || null,
            amount: sanitizeNumericInput(body.amount),
            payment_method: sanitizeInput(body.payment_method),
            status: sanitizeInput(body.status || 'completed'),
            description: sanitizeInput(body.description || ''),
            notes: sanitizeInput(body.notes || '')
        };

        // Additional validation
        if (!sanitizedData.customer_id) {
            throw new ValidationError('Invalid customer_id');
        }

        if (!sanitizedData.amount || sanitizedData.amount <= 0) {
            throw new ValidationError('Amount must be greater than 0');
        }

        const validPaymentMethods = ['cash', 'card', 'bank_transfer', 'digital_wallet'];
        if (!validPaymentMethods.includes(sanitizedData.payment_method)) {
            throw new ValidationError('Invalid payment method');
        }

        const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(sanitizedData.status)) {
            throw new ValidationError('Invalid status');
        }

        const { data: transaction, error } = await DB.transactions.create(sanitizedData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Transaction created successfully',
            data: transaction
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

        if (updateData.booking_id !== undefined) {
            sanitizedData.booking_id = sanitizeNumericInput(updateData.booking_id);
        }

        if (updateData.amount !== undefined) {
            sanitizedData.amount = sanitizeNumericInput(updateData.amount);
            if (sanitizedData.amount !== null && sanitizedData.amount <= 0) {
                throw new ValidationError('Amount must be greater than 0');
            }
        }

        if (updateData.payment_method !== undefined) {
            sanitizedData.payment_method = sanitizeInput(updateData.payment_method);
            const validPaymentMethods = ['cash', 'card', 'bank_transfer', 'digital_wallet'];
            if (!validPaymentMethods.includes(sanitizedData.payment_method)) {
                throw new ValidationError('Invalid payment method');
            }
        }

        if (updateData.status !== undefined) {
            sanitizedData.status = sanitizeInput(updateData.status);
            const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
            if (!validStatuses.includes(sanitizedData.status)) {
                throw new ValidationError('Invalid status');
            }
        }

        if (updateData.description !== undefined) {
            sanitizedData.description = sanitizeInput(updateData.description);
        }

        if (updateData.notes !== undefined) {
            sanitizedData.notes = sanitizeInput(updateData.notes);
        }

        const { data: transaction, error } = await DB.transactions.update(parseInt(id), sanitizedData);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        if (!transaction) {
            throw new APIError('Transaction not found', 404, 'NOT_FOUND');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Transaction updated successfully',
            data: transaction
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
            throw new ValidationError('Transaction ID is required');
        }

        const transactionId = parseInt(id);
        if (isNaN(transactionId)) {
            throw new ValidationError('Invalid transaction ID format');
        }

        const { error } = await DB.transactions.delete(transactionId);

        if (error) {
            throw new APIError(error.message, 500, 'DATABASE_ERROR');
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Transaction deleted successfully',
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
