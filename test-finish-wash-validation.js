// Test script để kiểm tra logic validation payment trước khi finish wash

function checkPaymentBeforeFinish(notes) {
    console.log('🔍 Checking payment status before finish wash...');
    console.log('Notes:', notes);

    const hasPaymentCompleted = notes.includes('Payment Status: paid') || notes.includes('Method:');

    console.log('Has "Payment Status: paid":', notes.includes('Payment Status: paid'));
    console.log('Has "Method:":', notes.includes('Method:'));
    console.log('Payment completed:', hasPaymentCompleted);

    if (hasPaymentCompleted) {
        console.log('✅ Payment confirmed - can finish wash');
        return true;
    } else {
        console.log('❌ Payment required - cannot finish wash');
        return false;
    }
}

console.log('═══════════════════════════════════════');
console.log('TEST 1: Booking with unpaid status only');
const notes1 = 'Payment Status: unpaid\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const canFinish1 = checkPaymentBeforeFinish(notes1);
console.log('Expected: false ✅\n');

console.log('═══════════════════════════════════════');
console.log('TEST 2: Booking with paid status');
const notes2 = 'Payment Status: paid | Payment Method: Cash | Amount Paid: $91.30 | Payment Date: 7/2/2025, 9:35:15 AM\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const canFinish2 = checkPaymentBeforeFinish(notes2);
console.log('Expected: true ✅\n');

console.log('═══════════════════════════════════════');
console.log('TEST 3: Booking with payment method but no explicit status');
const notes3 = 'Payment Method: Cash | Amount: $50.00\nStatus updated to in_progress at 7/2/2025, 9:34:58 AM';
const canFinish3 = checkPaymentBeforeFinish(notes3);
console.log('Expected: true ✅\n');

console.log('═══════════════════════════════════════');
console.log('TEST 4: Empty notes');
const notes4 = '';
const canFinish4 = checkPaymentBeforeFinish(notes4);
console.log('Expected: false ✅\n');

console.log('🎯 SUMMARY:');
console.log('Test 1 (unpaid only):', canFinish1 ? 'ALLOW' : 'BLOCK', '- Expected: BLOCK');
console.log('Test 2 (paid status):', canFinish2 ? 'ALLOW' : 'BLOCK', '- Expected: ALLOW');
console.log('Test 3 (payment method):', canFinish3 ? 'ALLOW' : 'BLOCK', '- Expected: ALLOW');
console.log('Test 4 (empty notes):', canFinish4 ? 'ALLOW' : 'BLOCK', '- Expected: BLOCK');
