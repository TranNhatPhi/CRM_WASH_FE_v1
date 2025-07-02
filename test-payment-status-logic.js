// Test script để kiểm tra logic determinePaymentStatus đã fix

function determinePaymentStatus(notes, stateName) {
    console.log('🧪 Testing determinePaymentStatus...');
    console.log('Input notes:', notes);
    console.log('Input stateName:', stateName);

    // Priority: Check if payment was completed (paid status overrides unpaid)
    if (notes?.includes('Payment Status: paid')) {
        console.log('✅ Found "Payment Status: paid" - returning "paid"');
        return 'paid';
    }

    // Check for explicit unpaid status
    if (notes?.includes('Payment Status: unpaid')) {
        console.log('❌ Found "Payment Status: unpaid" - returning "unpaid"');
        return 'unpaid';
    }

    // If booking is in progress or finished, check for payment method
    if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
        // Check if there's payment method info in notes (indicating payment was made)
        if (notes?.includes('Method:')) {
            console.log('✅ Found "Method:" in notes for active booking - returning "paid"');
            return 'paid';
        }
    }

    // Default to unpaid for pending bookings
    console.log('⚠️  No payment indicators found - returning "unpaid"');
    return 'unpaid';
}

// Test cases
console.log('═══════════════════════════════════════');
console.log('TEST 1: Notes with both paid and unpaid status');
const notes1 = 'Payment Status: unpaid\\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM\\nPayment Status: paid | Payment Method: Cash | Amount Paid: $91.30 | Payment Date: 7/2/2025, 9:35:15 AM\\nStatus updated to finished at 7/2/2025, 9:35:22 AM';
const result1 = determinePaymentStatus(notes1, 'finished');
console.log('RESULT:', result1);
console.log('EXPECTED: paid');
console.log('');

console.log('═══════════════════════════════════════');
console.log('TEST 2: Notes with only unpaid status');
const notes2 = 'Payment Status: unpaid\\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const result2 = determinePaymentStatus(notes2, 'in_progress');
console.log('RESULT:', result2);
console.log('EXPECTED: unpaid');
console.log('');

console.log('═══════════════════════════════════════');
console.log('TEST 3: Notes with payment method but no explicit status');
const notes3 = 'Payment Method: Cash | Amount: $50.00\\nStatus updated to finished at 7/2/2025, 9:35:22 AM';
const result3 = determinePaymentStatus(notes3, 'finished');
console.log('RESULT:', result3);
console.log('EXPECTED: paid');
console.log('');

console.log('═══════════════════════════════════════');
console.log('TEST 4: Sample từ booking #53 (theo debug trước đó)');
const notes4 = 'Payment Status: unpaid\\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const result4 = determinePaymentStatus(notes4, 'in_progress');
console.log('RESULT:', result4);
console.log('EXPECTED: unpaid (vì chưa có payment info)');
console.log('');
