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

async function handlePOST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        validateRequiredFields(body, ['vehicle', 'customer']);
        validateRequiredFields(body.vehicle, ['license_plate']);
        validateRequiredFields(body.customer, ['phone', 'name']);

        console.log('Creating customer and vehicle:', JSON.stringify(body, null, 2));

        // Sanitize customer data
        const customerData = {
            name: sanitizeInput(body.customer.name),
            email: body.customer.email ? sanitizeInput(body.customer.email) : `${body.customer.phone}@example.com`,
            phone: sanitizeInput(body.customer.phone),
            joined_at: new Date().toISOString(),
            tags: sanitizeInput(body.customer.tags || 'Regular'),
            membership_id: sanitizeNumericInput(body.customer.membership_id) || null
        };

        // Validate customer data
        if (!validatePhoneNumber(customerData.phone)) {
            throw new ValidationError('Invalid phone number format');
        }

        if (customerData.email && !validateEmail(customerData.email)) {
            throw new ValidationError('Invalid email format');
        }

        // Create customer first
        const { data: customer, error: customerError } = await DB.customers.create(customerData);

        if (customerError) {
            console.error('Customer creation error:', customerError);
            throw new APIError(customerError.message || 'Failed to create customer', 500, 'DATABASE_ERROR');
        }

        // Sanitize vehicle data
        const vehicleData = {
            customer_id: customer.id,
            make: sanitizeInput(body.vehicle.make || ''),
            model: sanitizeInput(body.vehicle.model || ''),
            year: sanitizeNumericInput(body.vehicle.year) || null,
            color: sanitizeInput(body.vehicle.color || ''),
            license_plate: sanitizeInput(body.vehicle.license_plate),
            notes: sanitizeInput(body.vehicle.notes || ''),
            status: 'active',
            wash_status: 'No active wash',
            wash_count: 0
        };

        // Validate vehicle data
        if (!vehicleData.license_plate) {
            throw new ValidationError('License plate is required');
        }

        // Create vehicle with the new customer ID
        const { data: vehicle, error: vehicleError } = await DB.vehicles.create(vehicleData);

        if (vehicleError) {
            console.error('Vehicle creation error:', vehicleError);
            // Try to cleanup customer if vehicle creation fails
            try {
                await DB.customers.delete(customer.id);
            } catch (cleanupError) {
                console.error('Failed to cleanup customer after vehicle creation failure:', cleanupError);
            }
            throw new APIError(vehicleError.message || 'Failed to create vehicle', 500, 'DATABASE_ERROR');
        }

        console.log('Successfully created customer and vehicle');

        return NextResponse.json({
            statusCode: 201,
            message: 'Customer and vehicle created successfully',
            data: {
                customer,
                vehicle
            }
        });

    } catch (error) {
        throw error;
    }
}

async function handleGET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customer_id = searchParams.get('customer_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            throw new ValidationError('Invalid pagination parameters');
        }

        if (customer_id) {
            // Get vehicles for specific customer
            const customerId = parseInt(customer_id);
            if (isNaN(customerId)) {
                throw new ValidationError('Invalid customer ID format');
            }

            const { data: vehicles, error } = await DB.vehicles.getByCustomerId(customerId);

            if (error) {
                throw new APIError(error.message, 500, 'DATABASE_ERROR');
            }

            return NextResponse.json({
                statusCode: 200,
                message: 'Customer vehicles fetched successfully',
                data: vehicles || []
            });
        } else {
            // Get all customer-vehicle relationships with pagination
            const { data: customers, error, count } = await DB.customers.getAll(page, limit);

            if (error) {
                throw new APIError(error.message, 500, 'DATABASE_ERROR');
            }

            return NextResponse.json({
                statusCode: 200,
                message: 'Customer-vehicle relationships fetched successfully',
                data: {
                    customers: customers || [],
                    total: count || 0,
                    page,
                    limit
                }
            });
        }

    } catch (error) {
        throw error;
    }
}

async function handlePUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        validateRequiredFields(body, ['customer_id', 'vehicle_id']);

        const { customer_id, vehicle_id, customer_updates, vehicle_updates } = body;

        // Validate IDs
        const customerId = sanitizeNumericInput(customer_id);
        const vehicleId = sanitizeNumericInput(vehicle_id);

        if (!customerId || !vehicleId) {
            throw new ValidationError('Invalid customer_id or vehicle_id');
        }

        const results: any = {};

        // Update customer if updates provided
        if (customer_updates && Object.keys(customer_updates).length > 0) {
            const sanitizedCustomerData: any = {};

            if (customer_updates.name !== undefined) {
                sanitizedCustomerData.name = sanitizeInput(customer_updates.name);
            }
            if (customer_updates.email !== undefined) {
                sanitizedCustomerData.email = sanitizeInput(customer_updates.email);
                if (sanitizedCustomerData.email && !validateEmail(sanitizedCustomerData.email)) {
                    throw new ValidationError('Invalid email format');
                }
            }
            if (customer_updates.phone !== undefined) {
                sanitizedCustomerData.phone = sanitizeInput(customer_updates.phone);
                if (!validatePhoneNumber(sanitizedCustomerData.phone)) {
                    throw new ValidationError('Invalid phone number format');
                }
            }
            if (customer_updates.tags !== undefined) {
                sanitizedCustomerData.tags = sanitizeInput(customer_updates.tags);
            }
            if (customer_updates.membership_id !== undefined) {
                sanitizedCustomerData.membership_id = sanitizeNumericInput(customer_updates.membership_id);
            }

            const { data: customer, error: customerError } = await DB.customers.update(customerId, sanitizedCustomerData);

            if (customerError) {
                throw new APIError(customerError.message, 500, 'DATABASE_ERROR');
            }

            results.customer = customer;
        }

        // Update vehicle if updates provided
        if (vehicle_updates && Object.keys(vehicle_updates).length > 0) {
            const sanitizedVehicleData: any = {};

            if (vehicle_updates.make !== undefined) {
                sanitizedVehicleData.make = sanitizeInput(vehicle_updates.make);
            }
            if (vehicle_updates.model !== undefined) {
                sanitizedVehicleData.model = sanitizeInput(vehicle_updates.model);
            }
            if (vehicle_updates.year !== undefined) {
                sanitizedVehicleData.year = sanitizeNumericInput(vehicle_updates.year);
            }
            if (vehicle_updates.color !== undefined) {
                sanitizedVehicleData.color = sanitizeInput(vehicle_updates.color);
            }
            if (vehicle_updates.license_plate !== undefined) {
                sanitizedVehicleData.license_plate = sanitizeInput(vehicle_updates.license_plate);
                if (!sanitizedVehicleData.license_plate) {
                    throw new ValidationError('License plate cannot be empty');
                }
            }
            if (vehicle_updates.notes !== undefined) {
                sanitizedVehicleData.notes = sanitizeInput(vehicle_updates.notes);
            }
            if (vehicle_updates.status !== undefined) {
                sanitizedVehicleData.status = sanitizeInput(vehicle_updates.status);
            }
            if (vehicle_updates.wash_status !== undefined) {
                sanitizedVehicleData.wash_status = sanitizeInput(vehicle_updates.wash_status);
            }
            if (vehicle_updates.wash_count !== undefined) {
                sanitizedVehicleData.wash_count = sanitizeNumericInput(vehicle_updates.wash_count);
            }

            const { data: vehicle, error: vehicleError } = await DB.vehicles.update(vehicleId, sanitizedVehicleData);

            if (vehicleError) {
                throw new APIError(vehicleError.message, 500, 'DATABASE_ERROR');
            }

            results.vehicle = vehicle;
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Customer and vehicle updated successfully',
            data: results
        });

    } catch (error) {
        throw error;
    }
}

async function handleDELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customer_id = searchParams.get('customer_id');
        const vehicle_id = searchParams.get('vehicle_id');
        const cascade = searchParams.get('cascade') === 'true';

        if (!customer_id && !vehicle_id) {
            throw new ValidationError('Either customer_id or vehicle_id is required');
        }

        const results: any = {};

        if (vehicle_id) {
            const vehicleIdNum = parseInt(vehicle_id);
            if (isNaN(vehicleIdNum)) {
                throw new ValidationError('Invalid vehicle ID format');
            }

            const { error: vehicleError } = await DB.vehicles.delete(vehicleIdNum);

            if (vehicleError) {
                throw new APIError(vehicleError.message, 500, 'DATABASE_ERROR');
            }

            results.vehicle_deleted = true;
        }

        if (customer_id && cascade) {
            const customerIdNum = parseInt(customer_id);
            if (isNaN(customerIdNum)) {
                throw new ValidationError('Invalid customer ID format');
            }

            // First delete all vehicles for this customer
            const { data: customerVehicles } = await DB.vehicles.getByCustomerId(customerIdNum);
            if (customerVehicles) {
                for (const vehicle of customerVehicles) {
                    await DB.vehicles.delete(vehicle.id);
                }
            }

            // Then delete the customer
            const { error: customerError } = await DB.customers.delete(customerIdNum);

            if (customerError) {
                throw new APIError(customerError.message, 500, 'DATABASE_ERROR');
            }

            results.customer_deleted = true;
            results.vehicles_deleted = customerVehicles?.length || 0;
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Successfully deleted requested items',
            data: results
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
