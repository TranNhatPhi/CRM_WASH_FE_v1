// Debug script to check Payment Options dialog content
console.log('🐛 Debug Payment Options Dialog Content...');

// Test SweetAlert2 HTML rendering
const testHTML = `
    <div style="text-align: center; font-size: 16px; color: #1f2937;">
        <div style="margin: 15px 0; padding: 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; font-weight: 600;">
            ⚠️ Payment has not been completed yet.
        </div>
        <p style="margin: 15px 0; color: #1f2937; font-weight: 500;">Choose an option:</p>
        <div style="margin: 20px 0; padding: 15px; background: #fef3cd; border-radius: 8px; border-left: 4px solid #fbbf24; color: #92400e;">
            <strong>Option 1:</strong> Complete payment now before finishing
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e40af;">
            <strong>Option 2:</strong> Finish wash and allow customer to pay later
        </div>
    </div>
`;

console.log('📋 Testing HTML content...');

// Create a temporary div to test HTML rendering
const tempDiv = document.createElement('div');
tempDiv.innerHTML = testHTML;
document.body.appendChild(tempDiv);

console.log('✅ HTML content added to page');

// Check if emojis are visible
setTimeout(() => {
    const warningDiv = tempDiv.querySelector('div[style*="#fef2f2"]');
    if (warningDiv) {
        console.log('📍 Warning div found:', warningDiv.textContent);
        console.log('📍 Warning div HTML:', warningDiv.innerHTML);

        // Check computed styles
        const styles = window.getComputedStyle(warningDiv);
        console.log('📍 Warning div styles:');
        console.log('  - Font family:', styles.fontFamily);
        console.log('  - Font size:', styles.fontSize);
        console.log('  - Color:', styles.color);
        console.log('  - Background:', styles.backgroundColor);
    }

    // Test emoji separately
    const emojiTest = document.createElement('div');
    emojiTest.innerHTML = '⚠️';
    emojiTest.style.fontSize = '24px';
    document.body.appendChild(emojiTest);

    console.log('📍 Standalone emoji test added');

    // Test if emoji is rendered
    setTimeout(() => {
        const emojiRect = emojiTest.getBoundingClientRect();
        console.log('📍 Emoji dimensions:', emojiRect.width, 'x', emojiRect.height);

        if (emojiRect.width > 0 && emojiRect.height > 0) {
            console.log('✅ Emoji is being rendered');
        } else {
            console.log('❌ Emoji may not be rendering properly');
        }
    }, 1000);

}, 500);
