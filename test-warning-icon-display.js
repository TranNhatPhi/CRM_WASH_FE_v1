const { chromium } = require('playwright');

async function testWarningIconDisplay() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('🧪 Testing warning icon display in Payment Options dialog...');

        // Navigate to the POS dashboard
        await page.goto('http://localhost:3000/pos-dashboard');
        await page.waitForTimeout(2000);

        // Check if there are any bookings with "in-progress" status
        console.log('📋 Looking for in-progress bookings...');
        const inProgressBookings = await page.locator('[data-testid^="booking-card-"]').filter({
            hasText: 'in-progress'
        }).count();

        if (inProgressBookings === 0) {
            console.log('⚠️ No in-progress bookings found. Creating one...');

            // Click New Booking
            await page.click('button:has-text("New Booking")');
            await page.waitForTimeout(1000);

            // Fill customer info
            await page.fill('input[placeholder="Customer Name"]', 'Test Customer for Warning Icon');
            await page.fill('input[placeholder="Phone Number"]', '1234567890');
            await page.fill('input[placeholder="License Plate"]', 'TEST123');

            // Select a service
            await page.click('button:has-text("Basic Wash")');
            await page.waitForTimeout(500);

            // Create booking
            await page.click('button:has-text("Create Booking")');
            await page.waitForTimeout(2000);

            // Start the wash
            const bookingCards = await page.locator('[data-testid^="booking-card-"]').all();
            if (bookingCards.length > 0) {
                const latestCard = bookingCards[bookingCards.length - 1];
                await latestCard.locator('button:has-text("Start Wash")').click();
                await page.waitForTimeout(2000);
            }
        }

        // Find an in-progress booking and try to finish it
        console.log('🔍 Looking for in-progress booking to test "Finish Wash"...');
        const inProgressCard = page.locator('[data-testid^="booking-card-"]').filter({
            hasText: 'in-progress'
        }).first();

        if (await inProgressCard.count() > 0) {
            console.log('✅ Found in-progress booking. Clicking "Finish Wash"...');

            // Click Finish Wash button
            await inProgressCard.locator('button:has-text("Finish Wash")').click();
            await page.waitForTimeout(2000);

            // Check if Payment Options dialog appears
            const dialogExists = await page.locator('div:has-text("Payment Options")').count() > 0;

            if (dialogExists) {
                console.log('✅ Payment Options dialog appeared!');

                // Check for warning icon ⚠️
                const warningIconExists = await page.locator('text=⚠️').count() > 0;
                console.log(`📍 Warning icon (⚠️) found: ${warningIconExists ? '✅ YES' : '❌ NO'}`);

                // Check for warning text
                const warningTextExists = await page.locator('text=Payment has not been completed yet').count() > 0;
                console.log(`📍 Warning text found: ${warningTextExists ? '✅ YES' : '❌ NO'}`);

                // Check the warning box styling
                const warningBox = page.locator('div').filter({ hasText: '⚠️ Payment has not been completed yet' });
                if (await warningBox.count() > 0) {
                    const styles = await warningBox.evaluate(el => window.getComputedStyle(el));
                    console.log('📍 Warning box styles:');
                    console.log(`  - Background: ${styles.backgroundColor}`);
                    console.log(`  - Color: ${styles.color}`);
                    console.log(`  - Border: ${styles.border}`);
                    console.log(`  - Font weight: ${styles.fontWeight}`);
                }

                // Take a screenshot
                await page.screenshot({ path: 'warning-icon-test.png', fullPage: true });
                console.log('📸 Screenshot saved as warning-icon-test.png');

                // Test both buttons
                console.log('🔘 Testing button visibility...');
                const payFirstBtn = await page.locator('button:has-text("Complete Payment First")').count() > 0;
                const payLaterBtn = await page.locator('button:has-text("Finish & Pay Later")').count() > 0;
                const cancelBtn = await page.locator('button:has-text("Cancel")').count() > 0;

                console.log(`📍 "Complete Payment First" button: ${payFirstBtn ? '✅ YES' : '❌ NO'}`);
                console.log(`📍 "Finish & Pay Later" button: ${payLaterBtn ? '✅ YES' : '❌ NO'}`);
                console.log(`📍 "Cancel" button: ${cancelBtn ? '✅ YES' : '❌ NO'}`);

                // Close dialog
                await page.click('button:has-text("Cancel")');
                await page.waitForTimeout(1000);

            } else {
                console.log('❌ Payment Options dialog did not appear');
            }

        } else {
            console.log('❌ No in-progress booking found to test');
        }

        console.log('✅ Warning icon display test completed');

    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testWarningIconDisplay().catch(console.error);
