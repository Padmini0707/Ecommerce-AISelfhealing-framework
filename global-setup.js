const { SESSION } = require('./playwright.config');
const { createSession } = require('./utils/session-config');

module.exports = async function globalSetup() {
  if(SESSION){
    await createSession();
  }
};