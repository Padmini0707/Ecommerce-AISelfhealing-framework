const { test, expect } = require('@playwright/test');

test('Demonstrate shared-page interference', async ({ browser }) => {
    const context = await browser.newContext({
        storageState: 'playwright/.auth/user.json'
    });

    // Both tasks deliberately share this SAME page.
    const page = await context.newPage();

    const testA = async () => {
        await page.goto('https://www.saucedemo.com/inventory.html');

        // Simulate Test A doing some work on inventory.
        await page.waitForTimeout(1000);

        // This can fail if Test B has navigated the same page.
        await expect(page).toHaveURL(/inventory\.html/);
    };

    const testB = async () => {
        await page.waitForTimeout(200);

        // Changes the page that Test A is using.
        await page.goto('https://www.saucedemo.com/cart.html');
    };

    try {
        await Promise.all([testA(), testB()]);
    } finally {
        await context.close();
    }
});