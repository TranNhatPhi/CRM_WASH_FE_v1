'use client';

import { useState, useEffect } from 'react';
import SmartWashController from '@/components/SmartWashController';
import { supabase } from '@/lib/supabase-client';

interface DemoWashControllerProps {
    className?: string;
}

export default function DemoWashController({ className = '' }: DemoWashControllerProps) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setIsLoading(true);
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
                        license_plate,
                        wash_status
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
                .order('createdAt', { ascending: false })
                .limit(20);

            if (error) {
                console.error('Error loading bookings:', error);
            } else {
                setBookings(data || []);
                // Auto-select first booking
                if (data && data.length > 0) {
                    setSelectedBooking(data[0]);
                }
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookingSelect = (booking: any) => {
        setSelectedBooking(booking);
    };

    if (isLoading) {
        return (
            <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'booked':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Booking List */}
            <div className="p-4 bg-white rounded-lg shadow border">
                <h2 className="text-xl font-bold mb-4">Active Bookings</h2>

                {bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No bookings found</p>
                        <p className="text-sm">Create some test bookings to see them here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookings.map(booking => (
                            <div
                                key={booking.id}
                                onClick={() => handleBookingSelect(booking)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedBooking?.id === booking.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {/* Booking Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">#{booking.id}</h3>
                                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status || 'draft'}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-3">
                                    <div className="text-sm">
                                        <span className="font-medium">Customer:</span> {booking.customers?.name || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {booking.customers?.phone}
                                    </div>
                                </div>

                                {/* Vehicle Info */}
                                <div className="mb-3">
                                    <div className="text-sm">
                                        <span className="font-medium">Vehicle:</span> {booking.vehicles?.license_plate}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {booking.vehicles?.make} {booking.vehicles?.model} ({booking.vehicles?.color})
                                    </div>
                                    {booking.vehicles?.wash_status && (
                                        <div className="text-xs text-blue-600 mt-1">
                                            Status: {booking.vehicles.wash_status}
                                        </div>
                                    )}
                                </div>

                                {/* Services */}
                                {booking.booking_services && booking.booking_services.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-sm font-medium mb-1">Services:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {booking.booking_services.map((bs: any, index: number) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                    {bs.services?.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Total Price */}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm font-medium">Total:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ${booking.total_price?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Booking Summary */}
            {selectedBooking && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Selected Booking:</h3>
                    <div className="text-sm text-blue-800">
                        <div><strong>ID:</strong> #{selectedBooking.id}</div>
                        <div><strong>Customer:</strong> {selectedBooking.customers?.name}</div>
                        <div><strong>Vehicle:</strong> {selectedBooking.vehicles?.license_plate} - {selectedBooking.vehicles?.make} {selectedBooking.vehicles?.model}</div>
                        <div><strong>Services:</strong> {selectedBooking.booking_services?.length || 0} selected</div>
                        <div><strong>Total:</strong> ${selectedBooking.total_price?.toFixed(2) || '0.00'}</div>
                        <div><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Wash Controller */}
            {selectedBooking && (
                <SmartWashController
                    bookingId={selectedBooking.id}
                    customerId={selectedBooking.customer_id}
                    vehicleId={selectedBooking.vehicle_id}
                    serviceIds={selectedBooking.booking_services?.map((bs: any) => bs.services?.id).filter(Boolean) || []}
                    userId={1} // Demo user ID
                    onStateChange={(newState) => {
                        console.log('State changed to:', newState);
                        // Reload bookings to refresh the status
                        loadBookings();
                    }}
                />
            )}
        </div>
    );
}
