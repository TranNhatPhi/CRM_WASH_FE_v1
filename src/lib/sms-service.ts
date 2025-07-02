import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for SMS
const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_SMS!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SMS!
);

export interface SMSMessage {
    id?: string;
    phoneNumber: string;
    text: string;
    timestamp?: number;
    status?: 'sent' | 'failed';
    bookingId?: string;
    customerName?: string;
}

export const sendSMS = async (
    phoneNumber: string,
    text: string,
    bookingId?: string,
    customerName?: string
): Promise<SMSMessage> => {
    try {
        console.log('🚀 Sending SMS:', { phoneNumber, text, bookingId, customerName });

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // Ensure phone number starts with + for international format
        const formattedPhone = cleanPhoneNumber.startsWith('+')
            ? cleanPhoneNumber
            : `+61${cleanPhoneNumber.startsWith('0') ? cleanPhoneNumber.slice(1) : cleanPhoneNumber}`;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL_SMS}/functions/v1/sms`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SMS}`,
                },
                body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    text
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ SMS API Error:', errorData);
            throw new Error(errorData.error || 'Failed to send SMS');
        }

        const responseData = await response.json();
        console.log('✅ SMS API Response:', responseData);

        // Create message object from response
        const message: SMSMessage = {
            id: responseData.id,
            phoneNumber: formattedPhone,
            text,
            timestamp: new Date(responseData.timestamp).getTime(),
            status: responseData.status || 'delivered',
            bookingId,
            customerName,
        };

        // Log successful SMS to our database for tracking
        try {
            await logSMSToDatabase(message);
        } catch (logError) {
            console.warn('⚠️ Failed to log SMS to database:', logError);
            // Don't throw error here - SMS was sent successfully
        }

        return message;
    } catch (error) {
        console.error('❌ Error in sendSMS:', error);

        // Log failed SMS attempt to database
        try {
            await logSMSToDatabase({
                phoneNumber,
                text,
                bookingId,
                customerName,
                status: 'failed',
                timestamp: Date.now()
            });
        } catch (logError) {
            console.warn('⚠️ Failed to log failed SMS to database:', logError);
        }

        throw error;
    }
};

// Log SMS to our main database for tracking
const logSMSToDatabase = async (message: SMSMessage) => {
    try {
        // Use the main Supabase client (not SMS one) to log to our database
        const { createClient } = await import('@supabase/supabase-js');
        const mainSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await mainSupabase
            .from('sms_notifications')
            .insert({
                booking_id: message.bookingId,
                customer_name: message.customerName,
                phone_number: message.phoneNumber,
                message_text: message.text,
                status: message.status || 'delivered',
                sent_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error logging SMS to database:', error);
        } else {
            console.log('✅ SMS logged to database successfully');
        }
    } catch (error) {
        console.error('Error in logSMSToDatabase:', error);
    }
};

// Generate SMS messages based on booking status
export const generateStatusSMS = (
    customerName: string,
    licensePlate: string,
    status: 'in-progress' | 'finished'
): string => {
    switch (status) {
        case 'in-progress':
            return `Hi ${customerName}, Your car ${licensePlate} is being wash. We will notify you when it's done!`;

        case 'finished':
            return `Hi ${customerName}, Your car ${licensePlate} is washed. Please collect the car. Thanks and see you again`;

        default:
            return `Hi ${customerName}, Your car ${licensePlate} status has been updated.`;
    }
};

// Test SMS function
export const testSMS = async (phoneNumber: string = '0450781528') => {
    try {
        console.log('🧪 Testing SMS to:', phoneNumber);

        const testMessage = 'Test message from Car Wash System. If you receive this, SMS is working correctly!';

        const result = await sendSMS(
            phoneNumber,
            testMessage,
            'test-booking-123',
            'Test Customer'
        );

        console.log('✅ Test SMS sent successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Test SMS failed:', error);
        throw error;
    }
};
