/**
 * Debug script để kiểm tra payment status của booking #333
 */

// Test logic determinePaymentStatus với cases thực tế
function determinePaymentStatus(notes, stateName) {
    console.log('🔍 Analyzing payment status...');
    console.log('Notes:', notes);
    console.log('State:', stateName);

    // Priority: Check if payment was completed (paid status overrides unpaid)
    if (notes?.includes('Payment Status: paid')) {
        console.log('✅ Found "Payment Status: paid"');
        return 'paid';
    }

    // Check for explicit unpaid status
    if (notes?.includes('Payment Status: unpaid')) {
        console.log('❌ Found "Payment Status: unpaid"');
        return 'unpaid';
    }

    // If booking is in progress or finished, check for payment method
    if (stateName === 'in_progress' || stateName === 'finished' || stateName === 'completed') {
        // Check if there's payment method info in notes (indicating payment was made)
        if (notes?.includes('Method:')) {
            console.log('💰 Found payment method in notes');
            return 'paid';
        }
    }

    // Default to unpaid for pending bookings
    console.log('⚠️ No payment indicators - defaulting to unpaid');
    return 'unpaid';
}

// Test với các cases có thể gặp
console.log('═══════════════════════════════════════');
console.log('CASE 1: Booking started wash but not paid yet');
const notes1 = 'Payment Status: unpaid\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const status1 = determinePaymentStatus(notes1, 'in_progress');
console.log('Result:', status1);
console.log('Expected: unpaid ✅\n');

console.log('═══════════════════════════════════════');
console.log('CASE 2: Booking paid during in_progress');
const notes2 = 'Payment Status: paid | Payment Method: Cash | Amount Paid: $91.30 | Payment Date: 7/2/2025, 9:35:15 AM\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const status2 = determinePaymentStatus(notes2, 'in_progress');
console.log('Result:', status2);
console.log('Expected: paid ✅\n');

console.log('═══════════════════════════════════════');
console.log('CASE 3: Booking finished after payment');
const notes3 = 'Payment Status: paid | Payment Method: Cash | Amount Paid: $91.30 | Payment Date: 7/2/2025, 9:35:15 AM\nStatus updated to finished at 7/2/2025, 9:35:22 AM';
const status3 = determinePaymentStatus(notes3, 'finished');
console.log('Result:', status3);
console.log('Expected: paid ✅\n');

console.log('═══════════════════════════════════════');
console.log('CASE 4: Problematic case - finished without payment');
const notes4 = 'Payment Status: unpaid\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM\nStatus updated to finished at 7/2/2025, 9:35:22 AM';
const status4 = determinePaymentStatus(notes4, 'finished');
console.log('Result:', status4);
console.log('Expected: unpaid (this is the problem case) ❌\n');

console.log('🎯 SUMMARY:');
console.log('Case 1 (in_progress + unpaid):', status1, '→ Will show UNPAID ✅');
console.log('Case 2 (in_progress + paid):', status2, '→ Will show PAID ✅');
console.log('Case 3 (finished + paid):', status3, '→ Will hide payment status ✅');
console.log('Case 4 (finished + unpaid):', status4, '→ Will hide payment status but booking is problematic ⚠️');
