import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/error-handler';

// Global error handler middleware
export function withErrorHandler(handler: Function) {
    return async (request: NextRequest, context?: any) => {
        try {
            return await handler(request, context);
        } catch (error) {
            console.error('Unhandled error in API route:', error);
            const errorResponse = formatErrorResponse(error as Error, request.url);
            return NextResponse.json(errorResponse, { status: 500 });
        }
    };
}

// Request validation middleware
export function withValidation(schema: any) {
    return function (handler: Function) {
        return async (request: NextRequest, context?: any) => {
            try {
                const body = await request.json();
                // Add validation logic here if needed
                return await handler(request, context);
            } catch (error) {
                const errorResponse = formatErrorResponse(
                    new Error('Invalid JSON payload'),
                    request.url
                );
                return NextResponse.json(errorResponse, { status: 400 });
            }
        };
    };
}

// Database connection check middleware
export function withDatabaseCheck() {
    return function (handler: Function) {
        return async (request: NextRequest, context?: any) => {
            // Add database connection check here if needed
            return await handler(request, context);
        };
    };
}

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
    return function (handler: Function) {
        return async (request: NextRequest, context?: any) => {
            const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';
            const now = Date.now();

            const record = requestCounts.get(ip);

            if (!record || now - record.timestamp > windowMs) {
                requestCounts.set(ip, { count: 1, timestamp: now });
            } else if (record.count >= maxRequests) {
                const errorResponse = formatErrorResponse(
                    new Error('Too many requests. Please try again later.'),
                    request.url
                );
                return NextResponse.json(errorResponse, { status: 429 });
            } else {
                record.count++;
            }

            return await handler(request, context);
        };
    };
}

// CORS middleware
export function withCORS() {
    return function (handler: Function) {
        return async (request: NextRequest, context?: any) => {
            const response = await handler(request, context);

            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            return response;
        };
    };
}

// Logging middleware
export function withLogging() {
    return function (handler: Function) {
        return async (request: NextRequest, context?: any) => {
            const start = Date.now();
            const method = request.method;
            const url = request.url;

            console.log(`[${new Date().toISOString()}] ${method} ${url} - Started`);

            try {
                const response = await handler(request, context);
                const duration = Date.now() - start;
                console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} (${duration}ms)`);
                return response;
            } catch (error) {
                const duration = Date.now() - start;
                console.error(`[${new Date().toISOString()}] ${method} ${url} - Error (${duration}ms):`, error);
                throw error;
            }
        };
    };
}

// Compose multiple middlewares
export function compose(...middlewares: Function[]) {
    return function (handler: Function) {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
}
