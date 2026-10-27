const path = require('path');
const fs = require('fs');
const { SESSION, authFile } = require('../playwright.config');
console.log('SESSION:', SESSION);
console.log('authFile:', authFile);

const { chromium } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { readYaml } = require('./yaml-reader');

async function createSession() {
    if (!SESSION) {
        console.log('Session reuse is disabled.');
        return;
    }
    const loginData = readYaml('test-data/login.yaml');
    const { username, password } = loginData.validLogin;

    const browser = await chromium.launch();

    try {
        const context=await browser.newContext({
            baseURL: 'https://www.saucedemo.com/',
        });
        const page=await context.newPage();
        const loginPage=new LoginPage(page);

        await loginPage.open();
        await loginPage.login(username,password);
        await page.waitForURL('**/inventory.html');

        const authFilePath = path.resolve(__dirname, '..', authFile);
        fs.mkdirSync(path.dirname(authFilePath), {
            recursive: true,
        });//creating the missing folder

        await context.storageState({
            path: authFilePath,
        });//stores the session cookies auth session details

        console.log('Login session saved successfully.');

    await context.close();
   

    }
    finally {
    await browser.close();
  }
}
module.exports = { createSession };
