// SMS Service for sending real SMS notifications
import { createClient } from '@supabase/supabase-js';

// SMS Supabase client (for sending actual SMS)
const smsSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_SMS;
const smsSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SMS;

// Main Supabase client (for logging notifications to main database)
const mainSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mainSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('🔧 SMS Service Environment Check:', {
    smsUrl: smsSupabaseUrl ? '✅ Set' : '❌ Missing',
    smsKey: smsSupabaseKey ? '✅ Set' : '❌ Missing',
    mainUrl: mainSupabaseUrl ? '✅ Set' : '❌ Missing',
    mainKey: mainSupabaseKey ? '✅ Set' : '❌ Missing'
});

if (!smsSupabaseUrl || !smsSupabaseKey) {
    console.error('❌ SMS Supabase credentials missing!');
}

if (!mainSupabaseUrl || !mainSupabaseKey) {
    console.error('❌ Main Supabase credentials missing!');
}

const smsSupabaseClient = createClient(smsSupabaseUrl!, smsSupabaseKey!);
const mainSupabase = createClient(mainSupabaseUrl!, mainSupabaseKey!);

export interface SMSNotification {
    phone_number: string;
    message_text: string;
    booking_id?: string;
    customer_name?: string;
    status?: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface Message {
    id: string;
    contactId: string;
    text: string;
    timestamp: number;
    status: 'delivered' | 'sent' | 'failed';
    isIncoming: boolean;
}

/**
 * Generate SMS message based on booking status
 */
export function generateStatusSMS(customerName: string, licensePlate: string, status: 'in-progress' | 'finished'): string {
    if (status === 'in-progress') {
        return `Hi ${customerName}, Your car ${licensePlate} is being wash. We will notify you when it's done!`;
    } else if (status === 'finished') {
        return `Hi ${customerName}, Your car ${licensePlate} is washed. Please collect the car. Thanks and see you again`;
    }
    return '';
}

/**
 * Send SMS using fetch API (based on your sample code)
 */
export const sendMessage = async (
    phoneNumber: string,
    text: string
): Promise<Message> => {
    try {
        console.log('📱 Sending message:', { phoneNumber, text: text.substring(0, 50) + '...' });

        // Validate environment variables
        if (!smsSupabaseUrl || !smsSupabaseKey) {
            throw new Error('SMS Supabase credentials not configured');
        }

        const response = await fetch(
            `${smsSupabaseUrl}/functions/v1/sms`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${smsSupabaseKey}`,
                },
                body: JSON.stringify({ phoneNumber, text }),
            }
        );

        console.log('📡 SMS API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ SMS API Error:', errorData);
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('✅ SMS API Response:', responseData);

        // Create message object from response
        const message: Message = {
            id: responseData.id,
            contactId: phoneNumber,
            text,
            timestamp: new Date(responseData.timestamp).getTime(),
            status: responseData.status,
            isIncoming: false,
        };

        return message;
    } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
};

/**
 * Send SMS notification to customer and log to database
 */
export async function sendSMSNotification(
    phoneNumber: string,
    message: string,
    bookingId?: string,
    customerName?: string
): Promise<{ success: boolean; error?: string }> {
    console.log('📱 SMS Service: Starting to send SMS...');
    console.log('📋 SMS Details:', {
        phone: phoneNumber,
        message: message.substring(0, 50) + '...',
        bookingId,
        customerName
    });

    try {
        // Step 1: Send actual SMS via API
        console.log('📤 Sending SMS via SMS Supabase API...');

        const smsMessage = await sendMessage(phoneNumber, message);
        let smsStatus = 'sent';

        console.log('✅ SMS sent successfully:', smsMessage);

        // Step 2: Log notification to main database
        console.log('💾 Logging SMS notification to main database...');

        try {
            const { error: logError } = await mainSupabase
                .from('sms_notifications')
                .insert({
                    phone_number: phoneNumber,
                    message_text: message,
                    booking_id: bookingId?.toString(),
                    customer_name: customerName,
                    status: smsStatus,
                    sent_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (logError) {
                console.error('⚠️ Failed to log SMS notification:', logError);
                // Don't fail the whole process if logging fails
            } else {
                console.log('✅ SMS notification logged successfully');
            }
        } catch (logException) {
            console.error('⚠️ Exception while logging SMS:', logException);
            // Don't fail the whole process if logging fails
        }

        return { success: true };

    } catch (error) {
        console.error('❌ SMS Service Error:', error);

        // Still try to log the failed attempt
        try {
            await mainSupabase
                .from('sms_notifications')
                .insert({
                    phone_number: phoneNumber,
                    message_text: message,
                    booking_id: bookingId?.toString(),
                    customer_name: customerName,
                    status: 'failed',
                    sent_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
        } catch (logError) {
            console.error('⚠️ Failed to log failed SMS attempt:', logError);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Send booking status SMS notification
 */
export async function sendBookingStatusSMS(
    customerName: string,
    licensePlate: string,
    phoneNumber: string,
    status: 'in-progress' | 'finished',
    bookingId?: string
): Promise<{ success: boolean; error?: string }> {

    console.log('🎯 Sending booking status SMS:', {
        customer: customerName,
        licensePlate,
        phone: phoneNumber,
        status,
        bookingId
    });

    // Generate appropriate message
    const message = generateStatusSMS(customerName, licensePlate, status);

    if (!message) {
        console.error('❌ Invalid status for SMS generation:', status);
        return { success: false, error: 'Invalid status' };
    }

    // Send SMS notification
    return await sendSMSNotification(phoneNumber, message, bookingId, customerName);
}

/**
 * Test SMS function for development
 */
export async function testSMS(phoneNumber: string = '0450781528'): Promise<void> {
    console.log('🧪 Testing SMS service...');

    try {
        const result = await sendBookingStatusSMS(
            'Test Customer',
            'TEST123',
            phoneNumber,
            'in-progress',
            'test-booking-' + Date.now()
        );

        console.log('Test result:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Additional functions from your sample code

export const fetchMessages = async (
    phoneNumber?: string
): Promise<Message[]> => {
    try {
        console.log('Fetching messages for:', phoneNumber);
        let query = smsSupabaseClient
            .from('messages')
            .select('*')
            .order('timestamp', { ascending: true });

        if (phoneNumber) {
            query = query.eq('contact_id', phoneNumber);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }

        console.log('Raw messages from database:', data);
        const messages = data.map(msg => ({
            id: msg.id,
            contactId: msg.contact_id,
            text: msg.text,
            timestamp: new Date(msg.timestamp).getTime(),
            status: (msg.status as Message['status']) || 'delivered',
            isIncoming: msg.is_incoming,
        }));

        console.log('Processed messages:', messages);
        return messages;
    } catch (error) {
        console.error('Error in fetchMessages:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return [];
    }
};

export const setupMessageListener = (
    callback: (message: Message) => void
): (() => void) => {
    console.log('Setting up real-time message listener...');

    // Subscribe to all changes in the messages table
    const channel = smsSupabaseClient
        .channel('messages-channel')
        .on(
            'postgres_changes',
            {
                event: 'INSERT', // Only listen to new messages
                schema: 'public',
                table: 'messages'
            },
            (payload) => {
                console.log('Realtime message received:', payload);

                const msg = payload.new;
                const newMessage: Message = {
                    id: msg.id,
                    contactId: msg.contact_id,
                    text: msg.text,
                    timestamp: new Date(msg.timestamp).getTime(),
                    status: (msg.status as Message['status']) || 'delivered',
                    isIncoming: msg.is_incoming,
                };

                console.log('Processed real-time message:', newMessage);
                callback(newMessage);
            }
        )
        .subscribe((status) => {
            console.log('Subscription status:', status);
        });

    // Return unsubscribe function
    return () => {
        console.log('Unsubscribing from real-time messages...');
        smsSupabaseClient.removeChannel(channel);
    };
};

// Test real-time connection
export const testRealtimeConnection = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const channel = smsSupabaseClient
            .channel('test-channel')
            .subscribe((status) => {
                console.log('Test subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    resolve(true);
                    smsSupabaseClient.removeChannel(channel);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    resolve(false);
                    smsSupabaseClient.removeChannel(channel);
                }
            });

        // Timeout after 10 seconds
        setTimeout(() => {
            resolve(false);
            smsSupabaseClient.removeChannel(channel);
        }, 10000);
    });
};
