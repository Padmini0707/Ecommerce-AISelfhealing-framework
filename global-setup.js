const { SESSION } = require('./playwright.config');
const { createSession } = require('./utils/session-config');
const { clearHealingLog } = require('./utils/healing-logger');

module.exports = async function globalSetup() {

  // Step 1: Clear previous execution's healing events
    clearHealingLog();

    // Step 2: Create session if SESSION is enabled
  if(SESSION){
    await createSession();
  }
};