const locators = require('../locators/locators.json');
const { getSelfHealingLocator } = require('../utils/locator-helper');

class LoginPage {
    constructor(page) {
        this.page = page;
   
        this.username =getSelfHealingLocator(
        page,
        locators.loginPage.username);

        this.password = getSelfHealingLocator(
        page,
        locators.loginPage.password
        );

        this.loginButton = getSelfHealingLocator(
        page,
        locators.loginPage.loginButton
        );

        this.errorMessage = getSelfHealingLocator(
        page,
        locators.loginPage.errorMessage
        );
      }

    //}

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
