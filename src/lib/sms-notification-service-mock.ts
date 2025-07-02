// SMS Service for sending real SMS notifications
import { createClient } from '@supabase/supabase-js';

// SMS Supabase client (for sending actual SMS)
const smsSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_SMS;
const smsSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SMS;

// Main Supabase client (for logging notifications)
const mainSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mainSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mainSupabase = createClient(mainSupabaseUrl!, mainSupabaseKey!);

export interface SMSNotification {
    phone_number: string;
    message_text: string;
    booking_id?: string;
    customer_name?: string;
    status?: 'pending' | 'sent' | 'delivered' | 'failed';
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
async function sendSMSViaAPI(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
        console.log('📱 Sending SMS via API:', { phoneNumber, message: message.substring(0, 50) + '...' });

        const response = await fetch(
            `${smsSupabaseUrl}/functions/v1/sms`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${smsSupabaseKey}`,
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    text: message
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ SMS API Error:', errorData);
            return {
                success: false,
                error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
            };
        }

        const responseData = await response.json();
        console.log('✅ SMS API Response:', responseData);

        return {
            success: true,
            data: responseData
        };

    } catch (error) {
        console.error('❌ SMS API Exception:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown SMS API error'
        };
    }
}

/**
 * Send SMS notification to customer
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
        console.log('📤 Sending SMS via API...');

        const smsResult = await sendSMSViaAPI(phoneNumber, message);

        let smsStatus = smsResult.success ? 'sent' : 'failed';

        // Step 2: Log notification to main database (regardless of SMS success/failure)
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

        // Return result based on mock SMS sending
        return smsResult;

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

    const testMessage = `[TEST] Hello from Smart Wash! This is a test message sent at ${new Date().toLocaleString()}. SMS service is working! 🚗✨`;

    const result = await sendSMSNotification(
        phoneNumber,
        testMessage,
        'test-booking-' + Date.now(),
        'Test Customer'
    );

    console.log('🎯 Test SMS Result:', result);
}
