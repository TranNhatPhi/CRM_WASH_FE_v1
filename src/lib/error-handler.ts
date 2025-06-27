// Error handling utilities for the CRM system
export class APIError extends Error {
    public statusCode: number;
    public errorCode: string;
    public details?: any;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode: string = 'INTERNAL_ERROR',
        details?: any
    ) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
    }
}

export class ValidationError extends APIError {
    constructor(message: string, field?: string) {
        super(message, 400, 'VALIDATION_ERROR', { field });
    }
}

export class DatabaseError extends APIError {
    constructor(message: string, originalError?: any) {
        super(message, 500, 'DATABASE_ERROR', { originalError: originalError?.message });
    }
}

export class NotFoundError extends APIError {
    constructor(resource: string, id?: string | number) {
        super(`${resource} not found${id ? ` with ID: ${id}` : ''}`, 404, 'NOT_FOUND', { resource, id });
    }
}

export class DuplicateError extends APIError {
    constructor(resource: string, field: string, value: any) {
        super(`${resource} with ${field} '${value}' already exists`, 409, 'DUPLICATE_ERROR', { resource, field, value });
    }
}

// Error response formatter
export interface ErrorResponse {
    statusCode: number;
    message: string;
    errorCode: string;
    data: null;
    details?: any;
    timestamp: string;
    path?: string;
}

export function formatErrorResponse(
    error: Error | APIError,
    path?: string
): ErrorResponse {
    if (error instanceof APIError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
            errorCode: error.errorCode,
            data: null,
            details: error.details,
            timestamp: new Date().toISOString(),
            path
        };
    }

    // Handle Supabase errors
    if (error.message.includes('duplicate key value violates unique constraint')) {
        const match = error.message.match(/violates unique constraint "(.+)"/);
        const constraint = match ? match[1] : 'unknown';
        return {
            statusCode: 409,
            message: 'Duplicate entry detected',
            errorCode: 'DUPLICATE_ERROR',
            data: null,
            details: { constraint, originalMessage: error.message },
            timestamp: new Date().toISOString(),
            path
        };
    }

    if (error.message.includes('row-level security policy')) {
        return {
            statusCode: 403,
            message: 'Access denied - please check database permissions',
            errorCode: 'ACCESS_DENIED',
            data: null,
            details: { originalMessage: error.message },
            timestamp: new Date().toISOString(),
            path
        };
    }

    if (error.message.includes('foreign key constraint')) {
        return {
            statusCode: 400,
            message: 'Invalid reference - related record not found',
            errorCode: 'FOREIGN_KEY_ERROR',
            data: null,
            details: { originalMessage: error.message },
            timestamp: new Date().toISOString(),
            path
        };
    }

    // Default error response
    return {
        statusCode: 500,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message,
        errorCode: 'INTERNAL_ERROR',
        data: null,
        details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
        timestamp: new Date().toISOString(),
        path
    };
}

// Validation utilities
export const validators = {
    email: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    phone: (phone: string): boolean => {
        const phoneRegex = /^[\d\s\-\+\(\)\.]{8,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    licensePlate: (plate: string): boolean => {
        // Vietnamese license plate format: 12A-345.67 or 30F-123.45
        const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}$|^[A-Z0-9\-\.]{5,15}$/;
        return plateRegex.test(plate);
    },

    required: (value: any): boolean => {
        return value !== null && value !== undefined && value !== '';
    },

    year: (year: number): boolean => {
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear + 1;
    },

    price: (price: number): boolean => {
        return price >= 0 && price <= 10000000; // Max 10M VND
    }
};

// Input sanitization
export const sanitizers = {
    string: (str: string): string => {
        return str?.toString().trim() || '';
    },

    phone: (phone: string): string => {
        return phone?.toString().replace(/[^\d\+\-\(\)\.\s]/g, '').trim() || '';
    },

    email: (email: string): string => {
        return email?.toString().toLowerCase().trim() || '';
    },

    licensePlate: (plate: string): string => {
        return plate?.toString().toUpperCase().trim() || '';
    }
};

// Request validation helper
export function validateRequest(data: any, rules: Record<string, any>): void {
    const errors: string[] = [];

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field];

        // Check required fields
        if (fieldRules.required && !validators.required(value)) {
            errors.push(`${field} is required`);
            continue;
        }

        // Skip other validations if field is empty and not required
        if (!validators.required(value) && !fieldRules.required) {
            continue;
        }

        // Validate email
        if (fieldRules.email && !validators.email(value)) {
            errors.push(`${field} must be a valid email address`);
        }

        // Validate phone
        if (fieldRules.phone && !validators.phone(value)) {
            errors.push(`${field} must be a valid phone number`);
        }

        // Validate license plate
        if (fieldRules.licensePlate && !validators.licensePlate(value)) {
            errors.push(`${field} must be a valid license plate format`);
        }

        // Validate year
        if (fieldRules.year && !validators.year(Number(value))) {
            errors.push(`${field} must be a valid year between 1900 and ${new Date().getFullYear() + 1}`);
        }

        // Validate price
        if (fieldRules.price && !validators.price(Number(value))) {
            errors.push(`${field} must be a valid price (0 - 10,000,000 VND)`);
        }

        // Min length
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors.push(`${field} must be at least ${fieldRules.minLength} characters long`);
        }

        // Max length
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors.push(`${field} must be no more than ${fieldRules.maxLength} characters long`);
        }
    }

    if (errors.length > 0) {
        throw new ValidationError(`Validation failed: ${errors.join(', ')}`, errors[0]);
    }
}

// Validation utilities
export function validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field =>
        data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
    // Support Vietnam phone format: 0901234567, +84901234567, etc.
    const phoneRegex = /^[\+]?[0-9][\d\s\-\(\)]{7,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 8 && cleanPhone.length <= 16;
}

// Sanitization utilities
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return String(input || '');

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove basic HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeNumericInput(input: any): number | null {
    if (input === null || input === undefined || input === '') return null;

    const num = parseFloat(String(input));
    return isNaN(num) ? null : num;
}

export function sanitizeIntegerInput(input: any): number | null {
    if (input === null || input === undefined || input === '') return null;

    const num = parseInt(String(input));
    return isNaN(num) ? null : num;
}

// Logging utility
export function logError(error: Error, context?: any) {
    console.error(`[${new Date().toISOString()}] ERROR:`, {
        message: error.message,
        stack: error.stack,
        context
    });
}

// Success response formatter
export interface SuccessResponse<T = any> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
    meta?: any;
}

export function formatSuccessResponse<T>(
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: any
): SuccessResponse<T> {
    return {
        statusCode,
        message,
        data,
        timestamp: new Date().toISOString(),
        meta
    };
}

// Database connection checker
export async function checkDatabaseConnection(supabase: any): Promise<boolean> {
    try {
        const { error } = await supabase.from('services').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
}

// Rate limiting helper (for future implementation)
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    isAllowed(key: string, limit: number, windowMs: number): boolean {
        const now = Date.now();
        const requests = this.requests.get(key) || [];

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs);

        if (validRequests.length >= limit) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }
}
