
const fs = require('fs');
const path = require('path');

const healingLogDir = path.join(process.cwd(), 'reports', 'healing');
const healingLogFile = path.join(healingLogDir, 'healing-events.json');

function formatLocator(locator) {
    if (!locator) return null;

    // DOM-discovered candidate
    if (locator.id) {
        return `#${locator.id}`;
    }

    if (locator.testId) {
        return `[data-testid="${locator.testId}"]`;
    }

    if (locator.placeholder) {
        return `[placeholder="${locator.placeholder}"]`;
    }

    if (locator.nameAttribute) {
        return `[name="${locator.nameAttribute}"]`;
    }

    // Configured locator from locators.json
    if (locator.type === 'id') {
        return `#${locator.value}`;
    }

    if (locator.type === 'class') {
        return `.${locator.value}`;
    }

    if (locator.type === 'css' || locator.type === 'selector') {
        return locator.value;
    }

    if (locator.type === 'placeholder') {
        return `placeholder=${locator.value}`;
    }

    if (locator.type === 'testid' || locator.type === 'test-id') {
        return `data-testid=${locator.value}`;
    }

    return locator.type
        ? `${locator.type}=${JSON.stringify(locator.value)}`
        : locator.tagName || 'Unknown locator';
}

// Clear previous run's healing events
function clearHealingLog() {
    fs.mkdirSync(healingLogDir, { recursive: true });

    fs.writeFileSync(healingLogFile, '', 'utf-8');

    console.log('[SELF-HEALING] Previous healing log cleared.');
}

// Append each new healing event
function logHealing(event) {

    console.log('[LOGGER DEBUG] Called');
    console.log('[LOGGER DEBUG] Event:', event);
    console.log('[LOGGER DEBUG] File:', healingLogFile);

    fs.mkdirSync(healingLogDir, { recursive: true });

    const healingEvent = {
        timestamp: new Date().toISOString(),
        test: event.test || 'Unknown test',
        originalLocator: formatLocator(event.primaryLocator),
        healedLocator: formatLocator(event.fallbackLocator),
        primaryCount: event.primaryCount ?? null,
        fallbackCount: event.fallbackCount ?? null,
        recoveryMethod: event.healingSource || 'CONFIGURED_FALLBACK',
        score: event.matchScore ?? null,
        operation: event.operation || null,
        status: event.status || 'UNKNOWN'
    };

    fs.appendFileSync(
        healingLogFile,
        JSON.stringify(healingEvent) + '\n',
        'utf-8'
    );

    console.log(
        '[SELF-HEALING]',
        JSON.stringify(healingEvent, null, 2)
    );
}

module.exports = {
    logHealing,
    clearHealingLog
};
