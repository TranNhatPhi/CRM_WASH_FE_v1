import { supabase } from './supabase-client';

export interface BookingCreateData {
    customer_id: number;
    vehicle_id: number;
    service_ids: number[];
    date: string;
    notes?: string;
    created_by: number;
}

export interface BookingResponse {
    success: boolean;
    booking?: any;
    error?: string;
}

export class BookingService {
    /**
     * Create a new booking with services
     */
    static async createBooking(data: BookingCreateData): Promise<BookingResponse> {
        try {
            // Start a transaction by creating the booking first
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: data.customer_id,
                    vehicle_id: data.vehicle_id,
                    date: data.date,
                    status: 'draft', // Initial status
                    notes: data.notes || '',
                    created_by: data.created_by,
                    total_price: 0, // Will be calculated after services are added
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (bookingError) {
                console.error('Error creating booking:', bookingError);
                return { success: false, error: 'Failed to create booking' };
            }

            // Add services to the booking
            if (data.service_ids.length > 0) {
                const bookingServices = data.service_ids.map(serviceId => ({
                    booking_id: booking.id,
                    service_id: serviceId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));

                const { error: servicesError } = await supabase
                    .from('booking_services')
                    .insert(bookingServices);

                if (servicesError) {
                    console.error('Error adding services to booking:', servicesError);
                    // Try to rollback by deleting the booking
                    await supabase.from('bookings').delete().eq('id', booking.id);
                    return { success: false, error: 'Failed to add services to booking' };
                }

                // Calculate total price
                const { data: services, error: priceError } = await supabase
                    .from('services')
                    .select('price')
                    .in('id', data.service_ids);

                if (!priceError && services) {
                    const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

                    // Update booking with total price
                    await supabase
                        .from('bookings')
                        .update({
                            total_price: totalPrice,
                            updatedAt: new Date().toISOString()
                        })
                        .eq('id', booking.id);
                }
            }

            return { success: true, booking };
        } catch (error) {
            console.error('Error in createBooking:', error);
            return { success: false, error: 'Unexpected error occurred' };
        }
    }

    /**
     * Get booking details with services and customer info
     */
    static async getBookingDetails(bookingId: number) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    customers (
                        id,
                        name,
                        email,
                        phone
                    ),
                    vehicles (
                        id,
                        make,
                        model,
                        year,
                        color,
                        license_plate
                    ),
                    booking_services (
                        services (
                            id,
                            name,
                            price,
                            duration
                        )
                    )
                `)
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('Error fetching booking details:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getBookingDetails:', error);
            return null;
        }
    }

    /**
     * Update vehicle wash status
     */
    static async updateVehicleWashStatus(vehicleId: number, status: string) {
        try {
            // First get current wash count if completing
            let updateData: any = {
                wash_status: status,
                updatedAt: new Date().toISOString()
            };

            if (status === 'completed') {
                updateData.last_wash_at = new Date().toISOString();

                // Get current wash count and increment
                const { data: vehicle } = await supabase
                    .from('vehicles')
                    .select('wash_count')
                    .eq('id', vehicleId)
                    .single();

                if (vehicle) {
                    updateData.wash_count = (vehicle.wash_count || 0) + 1;
                }
            }

            const { error } = await supabase
                .from('vehicles')
                .update(updateData)
                .eq('id', vehicleId);

            if (error) {
                console.error('Error updating vehicle wash status:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateVehicleWashStatus:', error);
            return false;
        }
    }

    /**
     * Create a transaction record for payment
     */
    static async createTransaction(bookingId: number, amount: number, paymentMethod: string) {
        try {
            const { data: booking } = await supabase
                .from('bookings')
                .select('customer_id')
                .eq('id', bookingId)
                .single();

            if (!booking) {
                return { success: false, error: 'Booking not found' };
            }

            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    customer_id: booking.customer_id,
                    booking_id: bookingId,
                    amount: amount,
                    payment_method: paymentMethod,
                    status: 'completed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating transaction:', error);
                return { success: false, error: 'Failed to create transaction' };
            }

            return { success: true, transaction: data };
        } catch (error) {
            console.error('Error in createTransaction:', error);
            return { success: false, error: 'Unexpected error occurred' };
        }
    }
}
