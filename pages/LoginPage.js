const locators = require('../locators/locators.json');
const { getLocator } = require('../utils/locator-helper');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.username = getLocator(
        page,
        locators.loginPage.username);

        this.password = getLocator(
        page,
        locators.loginPage.password
        );

        this.loginButton = getLocator(
        page,
        locators.loginPage.loginButton
        );

        this.errorMessage = getLocator(
        page,
        locators.loginPage.errorMessage
        );

    }

    async open() {
    await this.page.goto('/');
   }

   async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

module.exports = { LoginPage };
