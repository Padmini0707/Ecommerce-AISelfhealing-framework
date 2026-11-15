
const { test, expect } = require('@playwright/test');

test('validate ambiguous locator handling', async ({ page }) => {
    await page.goto('/inventory.html');

    const products = page.locator('[data-test="inventory-item"]');

    console.log('Matching products:', await products.count());

    await products.click();
});
