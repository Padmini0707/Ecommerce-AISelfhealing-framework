
const { getLocator } = require('./locator-helper');

function convertCandidateToLocator(page, candidate) {
  if (!page) {
    throw new Error('Playwright page object is required');
  }

  if (!candidate) {
    throw new Error('DOM candidate is required');
  }

  // Convert the selected DOM candidate into locator configuration
  let locatorConfig;

  if (candidate.testId) {
    locatorConfig = {
      type: 'css',
      value: `[data-test="${candidate.testId}"], [data-testid="${candidate.testId}"]`
    };
  } else if (candidate.id) {
    locatorConfig = {
      type: 'id',
      value: candidate.id
    };
  } else if (candidate.role && candidate.accessibleName) {
    locatorConfig = {
      type: 'role',
      value: {
        role: candidate.role,
        name: candidate.accessibleName
      }
    };
  } else if (candidate.placeholder) {
    locatorConfig = {
      type: 'placeholder',
      value: candidate.placeholder
    };
  } else if (candidate.text) {
    locatorConfig = {
      type: 'text',
      value: candidate.text
    };
  } else {
    throw new Error('No supported locator attributes found');
  }

  return getLocator(page, locatorConfig);
}

module.exports = { convertCandidateToLocator };
