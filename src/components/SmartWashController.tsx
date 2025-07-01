'use client';

import { useState, useEffect } from 'react';
import { BookingStateManager, BookingState, VALID_TRANSITIONS } from '@/lib/booking-state-manager';
import { BookingService } from '@/lib/booking-service';
import Swal from 'sweetalert2';

interface SmartWashControllerProps {
    bookingId: number;
    customerId?: number;
    vehicleId?: number;
    serviceIds?: number[];
    userId?: number;
    onStateChange?: (newState: BookingState) => void;
    className?: string;
}

export default function SmartWashController({
    bookingId,
    customerId,
    vehicleId,
    serviceIds = [],
    userId = 1, // Default user ID, should be from auth context
    onStateChange,
    className = ''
}: SmartWashControllerProps) {
    const [currentState, setCurrentState] = useState<BookingState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [stateHistory, setStateHistory] = useState<any[]>([]);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // Load current state and history
    useEffect(() => {
        loadBookingState();
        if (bookingId) {
            loadBookingDetails();
        }
    }, [bookingId]);

    const loadBookingState = async () => {
        setIsLoading(true);
        try {
            const [state, history] = await Promise.all([
                BookingStateManager.getCurrentState(bookingId),
                BookingStateManager.getStateHistory(bookingId)
            ]);

            if (!state) {
                // Initialize booking if no state exists
                const result = await BookingStateManager.initializeBooking(bookingId);
                if (result.success) {
                    setCurrentState('draft');
                }
            } else {
                setCurrentState(state);
            }

            setStateHistory(history);
        } catch (error) {
            console.error('Error loading booking state:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load booking state'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadBookingDetails = async () => {
        try {
            const details = await BookingService.getBookingDetails(bookingId);
            setBookingDetails(details);
        } catch (error) {
            console.error('Error loading booking details:', error);
        }
    };

    const handleStateTransition = async (action: string) => {
        if (!currentState || isTransitioning) return;

        // Confirm critical actions
        if (action === 'Cancel') {
            const result = await Swal.fire({
                title: 'Cancel Booking?',
                text: 'Are you sure you want to cancel this booking?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel it!'
            });

            if (!result.isConfirmed) return;
        }

        setIsTransitioning(true);

        try {
            // Special handling for "Start" action from draft state
            if (action === 'Start' && currentState === 'draft') {
                // Create booking record if we have the required data
                if (customerId && vehicleId) {
                    const bookingData = {
                        customer_id: customerId,
                        vehicle_id: vehicleId,
                        service_ids: serviceIds,
                        date: new Date().toISOString(),
                        notes: 'Started wash session',
                        created_by: userId
                    };

                    const bookingResult = await BookingService.createBooking(bookingData);

                    if (!bookingResult.success) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed to Create Booking',
                            text: bookingResult.error || 'Could not create booking record'
                        });
                        setIsTransitioning(false);
                        return;
                    }

                    // Update vehicle wash status
                    if (vehicleId) {
                        await BookingService.updateVehicleWashStatus(vehicleId, 'in_progress');
                    }
                }
            }

            // Perform state transition
            const result = await BookingStateManager.transitionState(bookingId, action, userId);

            if (result.success && result.newState) {
                setCurrentState(result.newState);
                onStateChange?.(result.newState);

                // Update vehicle status based on new state
                if (vehicleId) {
                    let vehicleStatus = 'No active wash';
                    switch (result.newState) {
                        case 'in_progress':
                            vehicleStatus = 'Wash in progress';
                            break;
                        case 'departed':
                            vehicleStatus = 'Departed from wash';
                            break;
                        case 'completed':
                            vehicleStatus = 'Wash completed';
                            break;
                        case 'cancelled':
                            vehicleStatus = 'Wash cancelled';
                            break;
                    }
                    await BookingService.updateVehicleWashStatus(vehicleId, vehicleStatus);
                }

                // Reload history and details
                const [history] = await Promise.all([
                    BookingStateManager.getStateHistory(bookingId),
                    loadBookingDetails()
                ]);
                setStateHistory(history);

                // Show success message
                const stateInfo = BookingStateManager.getStateDisplayInfo(result.newState);
                Swal.fire({
                    icon: 'success',
                    title: 'State Updated',
                    text: `Booking is now ${stateInfo.label}`,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Auto-progress for certain states
                if (result.newState === 'in_progress') {
                    console.log('🚗 Starting wash sequence...');
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Transition Failed',
                    text: result.error || 'Could not update booking state'
                });
            }
        } catch (error) {
            console.error('Error transitioning state:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        } finally {
            setIsTransitioning(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentState) {
        return (
            <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <p className="text-red-800">Failed to load booking state</p>
                <button
                    onClick={loadBookingState}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const stateInfo = BookingStateManager.getStateDisplayInfo(currentState);
    const validActions = BookingStateManager.getValidActions(currentState);

    return (
        <div className={`p-4 bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Booking Details */}
            {bookingDetails && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold mb-2">Booking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">Customer:</span> {bookingDetails.customers?.name}
                        </div>
                        <div>
                            <span className="font-medium">Vehicle:</span> {bookingDetails.vehicles?.license_plate}
                        </div>
                        <div>
                            <span className="font-medium">Car:</span> {bookingDetails.vehicles?.make} {bookingDetails.vehicles?.model}
                        </div>
                        <div>
                            <span className="font-medium">Total:</span> ${bookingDetails.total_price?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    {bookingDetails.booking_services?.length > 0 && (
                        <div className="mt-2">
                            <span className="font-medium">Services:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {bookingDetails.booking_services.map((bs: any, index: number) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {bs.services?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Current State Display */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${stateInfo.color}`}>
                    <span className="mr-2">{stateInfo.icon}</span>
                    {stateInfo.label}
                </div>
                <p className="text-gray-600 text-sm mt-1">{stateInfo.description}</p>
            </div>

            {/* Action Buttons */}
            {validActions.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">Available Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {validActions.map((action) => {
                            const buttonStyle = getActionButtonStyle(action);
                            return (
                                <button
                                    key={action}
                                    onClick={() => handleStateTransition(action)}
                                    disabled={isTransitioning}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyle} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                        }`}
                                >
                                    {isTransitioning ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            {getActionIcon(action)} {action}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* State History */}
            {stateHistory.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-2">State History</h4>
                    <div className="max-h-32 overflow-y-auto">
                        {stateHistory.map((record, index) => (
                            <div key={record.id} className="flex items-center justify-between py-1 text-sm">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                    {record.old_state ? (
                                        <span>
                                            {record.old_state} → <strong>{record.current_state}</strong>
                                        </span>
                                    ) : (
                                        <span>
                                            Created as <strong>{record.current_state}</strong>
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-500">
                                    {new Date(record.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper functions for button styling
function getActionButtonStyle(action: string): string {
    const styles = {
        'Start': 'bg-green-600 text-white',
        'Manual Confirm': 'bg-blue-600 text-white',
        'Finish': 'bg-purple-600 text-white',
        'Cancel': 'bg-red-600 text-white'
    };
    return styles[action as keyof typeof styles] || 'bg-gray-600 text-white';
}

function getActionIcon(action: string): string {
    const icons = {
        'Start': '▶️',
        'Manual Confirm': '✅',
        'Finish': '🏁',
        'Cancel': '❌'
    };
    return icons[action as keyof typeof icons] || '🔄';
}
