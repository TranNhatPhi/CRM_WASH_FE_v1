import { supabase } from './supabase-client';

// Booking states based on your transition table
export type BookingState =
    | 'draft'
    | 'booked'
    | 'in_progress'
    | 'departed'
    | 'completed'
    | 'cancelled';

// State transitions from your table
export const VALID_TRANSITIONS: Record<BookingState, { action: string; nextState: BookingState; allowed: boolean }[]> = {
    draft: [
        { action: 'Start', nextState: 'in_progress', allowed: true },
        { action: 'Manual Confirm', nextState: 'booked', allowed: true },
        { action: 'Cancel', nextState: 'cancelled', allowed: false }, // Not allowed per your table
    ],
    booked: [
        { action: 'Start', nextState: 'in_progress', allowed: true },
        { action: 'Cancel', nextState: 'cancelled', allowed: true },
    ],
    in_progress: [
        { action: 'Finish', nextState: 'departed', allowed: true },
        { action: 'Cancel', nextState: 'cancelled', allowed: true },
    ],
    departed: [
        { action: 'Finish', nextState: 'completed', allowed: true },
        { action: 'Cancel', nextState: 'cancelled', allowed: false }, // Not allowed per your table
    ],
    completed: [
        // No transitions allowed from completed state
    ],
    cancelled: [
        // No transitions allowed from cancelled state
    ],
};

export interface BookingStateRecord {
    id: number;
    state_name: string;
    description: string;
    sort_order: number;
}

export interface BookingWithState {
    id: number;
    customer_id: number;
    vehicle_id: number;
    booking_state_id: number;
    total_price: number;
    current_state: BookingState;
    state_description: string;
}

export class BookingStateManagerV2 {
    /**
     * Get current state of a booking
     */
    static async getCurrentState(bookingId: number): Promise<BookingState | null> {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    booking_state_id,
                    booking_state!inner (
                        state_name
                    )
                `)
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('Error fetching current state:', error);
                return 'draft'; // Return default state
            }

            return (data?.booking_state as any)?.state_name as BookingState || 'draft';
        } catch (error) {
            console.error('Error in getCurrentState:', error);
            return 'draft';
        }
    }

    /**
     * Get state history for a booking (simulated from old system or create audit table)
     */
    static async getStateHistory(bookingId: number): Promise<any[]> {
        try {
            // Since we don't have history table anymore, return current state only
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id,
                    createdAt,
                    updatedAt,
                    booking_state!inner (
                        state_name,
                        description
                    )
                `)
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('Error fetching state history:', error);
                return [];
            }

            // Return current state as history entry
            return [{
                id: data.id,
                old_state: null,
                current_state: (data.booking_state as any)?.state_name,
                timestamp: data.updatedAt || data.createdAt
            }];
        } catch (error) {
            console.error('Error in getStateHistory:', error);
            return [];
        }
    }

    /**
     * Check if a state transition is valid
     */
    static isValidTransition(currentState: BookingState, action: string): boolean {
        const transitions = VALID_TRANSITIONS[currentState];
        const transition = transitions.find(t => t.action === action);
        return transition?.allowed || false;
    }

    /**
     * Get valid actions for current state
     */
    static getValidActions(currentState: BookingState): string[] {
        return VALID_TRANSITIONS[currentState]
            .filter(t => t.allowed)
            .map(t => t.action);
    }

    /**
     * Get booking state ID by state name
     */
    static async getStateId(stateName: BookingState): Promise<number | null> {
        try {
            const { data, error } = await supabase
                .from('booking_state')
                .select('id')
                .eq('state_name', stateName)
                .single();

            if (error) {
                console.error('Error getting state ID:', error);
                return null;
            }

            return data.id;
        } catch (error) {
            console.error('Error in getStateId:', error);
            return null;
        }
    }

    /**
     * Transition booking to new state
     */
    static async transitionState(
        bookingId: number,
        action: string,
        userId?: number
    ): Promise<{ success: boolean; newState?: BookingState; error?: string }> {
        try {
            // Get current state
            const currentState = await this.getCurrentState(bookingId);

            if (!currentState) {
                return { success: false, error: 'Could not determine current booking state' };
            }

            // Check if transition is valid
            if (!this.isValidTransition(currentState, action)) {
                return {
                    success: false,
                    error: `Transition '${action}' is not allowed from state '${currentState}'`
                };
            }

            // Get the new state
            const transitions = VALID_TRANSITIONS[currentState];
            const transition = transitions.find(t => t.action === action && t.allowed);

            if (!transition) {
                return { success: false, error: 'Invalid transition' };
            }

            // Get new state ID
            const newStateId = await this.getStateId(transition.nextState);
            if (!newStateId) {
                return { success: false, error: 'Could not find new state ID' };
            }

            // Update booking with new state
            const { error } = await supabase
                .from('bookings')
                .update({
                    booking_state_id: newStateId,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) {
                console.error('Error updating booking state:', error);
                return { success: false, error: 'Failed to update booking state' };
            }

            return { success: true, newState: transition.nextState };
        } catch (error) {
            console.error('Error in transitionState:', error);
            return { success: false, error: 'Unexpected error occurred' };
        }
    }

    /**
     * Initialize booking with draft state
     */
    static async initializeBooking(bookingId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const draftStateId = await this.getStateId('draft');
            if (!draftStateId) {
                return { success: false, error: 'Could not find draft state ID' };
            }

            const { error } = await supabase
                .from('bookings')
                .update({
                    booking_state_id: draftStateId,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (error) {
                console.error('Error initializing booking state:', error);
                return { success: false, error: 'Failed to initialize booking state' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error in initializeBooking:', error);
            return { success: false, error: 'Unexpected error occurred' };
        }
    }

    /**
     * Get state display info for UI
     */
    static getStateDisplayInfo(state: BookingState) {
        const stateInfo = {
            draft: {
                label: 'Draft',
                color: 'bg-gray-100 text-gray-800',
                icon: '📝',
                description: 'Booking is being prepared'
            },
            booked: {
                label: 'Booked',
                color: 'bg-blue-100 text-blue-800',
                icon: '📅',
                description: 'Booking is confirmed and scheduled'
            },
            in_progress: {
                label: 'In Progress',
                color: 'bg-orange-100 text-orange-800',
                icon: '🚗',
                description: 'Vehicle wash is in progress'
            },
            departed: {
                label: 'Departed',
                color: 'bg-purple-100 text-purple-800',
                icon: '🚙',
                description: 'Vehicle has left the wash bay'
            },
            completed: {
                label: 'Completed',
                color: 'bg-green-100 text-green-800',
                icon: '✅',
                description: 'Service completed successfully'
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800',
                icon: '❌',
                description: 'Booking was cancelled'
            }
        };

        return stateInfo[state];
    }

    /**
     * Get all available states
     */
    static async getAllStates(): Promise<BookingStateRecord[]> {
        try {
            const { data, error } = await supabase
                .from('booking_state')
                .select('*')
                .order('sort_order');

            if (error) {
                console.error('Error fetching all states:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllStates:', error);
            return [];
        }
    }
}
