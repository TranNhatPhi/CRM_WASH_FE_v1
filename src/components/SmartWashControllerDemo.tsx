'use client';

import { useState, useEffect } from 'react';
import { BookingStateManager, BookingState, VALID_TRANSITIONS } from '@/lib/booking-state-manager';
import { supabase } from '@/lib/supabase-client';
import Swal from 'sweetalert2';

interface SmartWashControllerDemoProps {
    bookingId: number;
    customerId?: number;
    vehicleId?: number;
    cartItems?: { id: number; name: string; price: number; quantity: number }[];
    totalAmount?: number;
    onStateChange?: (newState: BookingState) => void;
    className?: string;
}

export default function SmartWashControllerDemo({
    bookingId,
    customerId,
    vehicleId,
    cartItems = [],
    totalAmount = 0,
    onStateChange,
    className = ''
}: SmartWashControllerDemoProps) {
    const [currentState, setCurrentState] = useState<BookingState>('draft');
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [stateHistory, setStateHistory] = useState<{ action: string; oldState: BookingState | null; newState: BookingState; timestamp: Date }[]>([
        { action: 'Created', oldState: null, newState: 'draft', timestamp: new Date() }
    ]);

    // Function to create booking and services
    const createBookingWithServices = async () => {
        try {
            if (!customerId || !vehicleId) {
                throw new Error('Customer ID and Vehicle ID are required');
            }

            console.log('🔄 Creating booking with services...');

            // 1. Create or update the booking
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .upsert({
                    id: bookingId > 0 ? bookingId : undefined,
                    customer_id: customerId,
                    vehicle_id: vehicleId,
                    date: new Date().toISOString(),
                    status: 'in_progress',
                    total_price: totalAmount,
                    notes: 'Started from POS system',
                    created_by: 1, // Default user ID
                    updated_by: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single();

            if (bookingError) {
                throw new Error(`Failed to create booking: ${bookingError.message}`);
            }

            console.log('✅ Booking created:', booking);

            // 2. Create booking services from cart items
            if (cartItems.length > 0) {
                const bookingServices = cartItems.map(item => ({
                    booking_id: booking.id,
                    service_id: item.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));

                const { error: servicesError } = await supabase
                    .from('booking_services')
                    .insert(bookingServices);

                if (servicesError) {
                    console.warn('Warning: Failed to create booking services:', servicesError.message);
                    // Continue anyway, as this is not critical
                } else {
                    console.log('✅ Booking services created for', cartItems.length, 'items');
                }
            }

            // 3. Update booking state
            const stateResult = await BookingStateManager.transitionState(booking.id, 'Start');
            if (!stateResult.success) {
                console.warn('Warning: Failed to update booking state:', stateResult.error);
            } else {
                console.log('✅ Booking state updated to:', stateResult.newState);
            }

            return booking;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    };

    const handleStateTransition = async (action: string) => {
        if (isTransitioning) return;

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
            // Check if transition is valid
            if (!BookingStateManager.isValidTransition(currentState, action)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Transition',
                    text: `Cannot perform '${action}' from '${currentState}' state`
                });
                return;
            }

            // Special handling for "Start" action - save to database
            if (action === 'Start') {
                try {
                    const booking = await createBookingWithServices();

                    Swal.fire({
                        icon: 'success',
                        title: 'Wash Started!',
                        text: `Booking #${booking.id} has been created and wash service started`,
                        timer: 3000,
                        showConfirmButton: false
                    });

                    // Update local state
                    setCurrentState('in_progress');
                    onStateChange?.('in_progress');

                    // Add to history
                    setStateHistory(prev => [...prev, {
                        action: `${action} (DB)`,
                        oldState: currentState,
                        newState: 'in_progress',
                        timestamp: new Date()
                    }]);

                    return;
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to Start Wash',
                        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        confirmButtonText: 'OK'
                    });
                    return;
                }
            }

            // Regular state transitions (local simulation)
            const transitions = VALID_TRANSITIONS[currentState];
            const transition = transitions.find(t => t.action === action && t.allowed);

            if (transition) {
                const oldState = currentState;
                setCurrentState(transition.nextState);
                onStateChange?.(transition.nextState);

                // Add to history
                setStateHistory(prev => [...prev, {
                    action,
                    oldState,
                    newState: transition.nextState,
                    timestamp: new Date()
                }]);

                // Show success message
                const stateInfo = BookingStateManager.getStateDisplayInfo(transition.nextState);
                Swal.fire({
                    icon: 'success',
                    title: 'State Updated',
                    text: `Booking is now ${stateInfo.label}`,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Auto-progress for certain states
                if (transition.nextState === 'in_progress') {
                    console.log('🚗 Starting wash sequence...');
                }
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

    const stateInfo = BookingStateManager.getStateDisplayInfo(currentState);
    const validActions = BookingStateManager.getValidActions(currentState);

    return (
        <div className={`p-4 bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Current State Display */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Booking Status
                    {customerId && vehicleId ? (
                        <span className="text-sm text-green-600 ml-2">(Database Mode)</span>
                    ) : (
                        <span className="text-sm text-blue-600 ml-2">(Demo Mode)</span>
                    )}
                </h3>
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${stateInfo.color}`}>
                    <span className="mr-2">{stateInfo.icon}</span>
                    {stateInfo.label}
                </div>
                <p className="text-gray-600 text-sm mt-1">{stateInfo.description}</p>
                {customerId && vehicleId ? (
                    <div className="text-xs text-green-600 mt-1">
                        🗄️ Database mode - Customer: {customerId}, Vehicle: {vehicleId}
                        {cartItems.length > 0 && `, Services: ${cartItems.length} items ($${totalAmount})`}
                    </div>
                ) : (
                    <p className="text-xs text-blue-600 mt-1">
                        ℹ️ Demo mode - States are simulated locally
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            {validActions.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">Available Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {validActions.map((action) => {
                            const hasDatabase = !!(customerId && vehicleId);
                            const buttonStyle = getActionButtonStyle(action, hasDatabase);
                            const isStartAction = action === 'Start';

                            return (
                                <button
                                    key={action}
                                    onClick={() => handleStateTransition(action)}
                                    disabled={isTransitioning}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyle} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                        } ${isStartAction && hasDatabase ? 'ring-2 ring-green-300' : ''}`}
                                >
                                    {isTransitioning ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent mr-2"></div>
                                            {isStartAction && hasDatabase ? 'Creating Booking...' : 'Processing...'}
                                        </div>
                                    ) : (
                                        <>
                                            {getActionIcon(action)} {action}
                                            {isStartAction && hasDatabase && (
                                                <span className="ml-1 text-xs opacity-90">(Save to DB)</span>
                                            )}
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
                            <div key={index} className="py-1 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs font-medium">
                                        {record.timestamp.toLocaleTimeString()}
                                    </span>
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                </div>
                                <div className="mt-1">
                                    {record.oldState ? (
                                        <span>
                                            {record.action}: {record.oldState} → <strong>{record.newState}</strong>
                                        </span>
                                    ) : (
                                        <span>
                                            {record.action} as <strong>{record.newState}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

// Helper functions for button styling
function getActionButtonStyle(action: string, hasDatabase: boolean = false): string {
    const styles = {
        'Start': hasDatabase ? 'bg-green-700 text-white shadow-lg' : 'bg-green-600 text-white',
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
