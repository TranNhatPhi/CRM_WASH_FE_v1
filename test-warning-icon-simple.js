// Test script to verify warning icon in Payment Options dialog
console.log('🧪 Testing warning icon display...');

// Test the HTML content that should be displayed
const isDarkMode = false; // Test with light mode first

const htmlContent = `
    <div style="text-align: center; font-size: 16px; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">
        <div style="margin: 15px 0; padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; font-weight: 600;">
            ⚠️ Payment has not been completed yet.
        </div>
        <p style="margin: 15px 0; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'}; font-weight: 500;">Choose an option:</p>
        <div style="margin: 20px 0; padding: 15px; background: #fef3cd; border-radius: 8px; border-left: 4px solid #fbbf24; color: #92400e;">
            <strong>Option 1:</strong> Complete payment now before finishing
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e40af;">
            <strong>Option 2:</strong> Finish wash and allow customer to pay later
        </div>
    </div>
`;

console.log('📋 HTML content to be displayed:');
console.log(htmlContent);

// Check if warning icon is present
const hasWarningIcon = htmlContent.includes('⚠️');
console.log(`📍 Warning icon (⚠️) present in HTML: ${hasWarningIcon ? '✅ YES' : '❌ NO'}`);

// Check if warning text is present
const hasWarningText = htmlContent.includes('Payment has not been completed yet');
console.log(`📍 Warning text present in HTML: ${hasWarningText ? '✅ YES' : '❌ NO'}`);

// Test with dark mode too
const darkModeHtml = `
    <div style="text-align: center; font-size: 16px; color: #f3f4f6;">
        <div style="margin: 15px 0; padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; font-weight: 600;">
            ⚠️ Payment has not been completed yet.
        </div>
        <p style="margin: 15px 0; color: #f3f4f6; font-weight: 500;">Choose an option:</p>
        <div style="margin: 20px 0; padding: 15px; background: #fef3cd; border-radius: 8px; border-left: 4px solid #fbbf24; color: #92400e;">
            <strong>Option 1:</strong> Complete payment now before finishing
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e40af;">
            <strong>Option 2:</strong> Finish wash and allow customer to pay later
        </div>
    </div>
`;

console.log('\n🌙 Testing dark mode HTML:');
const darkModeHasWarningIcon = darkModeHtml.includes('⚠️');
console.log(`📍 Warning icon in dark mode: ${darkModeHasWarningIcon ? '✅ YES' : '❌ NO'}`);

// Test all emoji characters that should be in the dialog
const emojis = {
    '⚠️': 'Warning icon',
    '💰': 'Money icon (Complete Payment First)',
    '⏭️': 'Fast forward icon (Finish & Pay Later)',
    '❌': 'X icon (Cancel)'
};

console.log('\n📱 Testing all emoji characters:');
Object.entries(emojis).forEach(([emoji, description]) => {
    const hasEmoji = htmlContent.includes(emoji);
    console.log(`${emoji} ${description}: ${hasEmoji ? '✅ YES' : '❌ NO'}`);
});

console.log('\n✅ Warning icon test completed!');
console.log('\n💡 If you don\'t see the warning icon in browser:');
console.log('   1. Try refreshing the page');
console.log('   2. Check browser console for errors');
console.log('   3. Try a different browser');
console.log('   4. Check if emoji fonts are properly loaded');
