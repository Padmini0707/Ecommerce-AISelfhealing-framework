//this helps to create the locator frm the DOM - no manual dependencies
const { getLocator } = require('./locator-helper');
/**
 * Discover alternative locators using the original element's details.
 *
 * hints example:
 * {
 *   role: 'button',
 *   name: 'Login',
 *   text: 'Login',
 *   testId: 'login-button',
 *   placeholder: 'Username',
 *   id: 'login-button',
 *   nameAttribute: 'login-button'
 * }
 */

async function discoverLocators(page, hints = {}) {
  if (!page) {
    throw new Error('Playwright page object is required');
  }

  const candidates = [];
   // Strong, stable locator attributes first.
   //id
   if (hints.id) {
    candidates.push({
      type: 'id',
      value: hints.id,
    });
    }

    if (hints.testId) {
    candidates.push({
      type: 'css',
      value: `[data-test="${hints.testId}"]`,
    });

    candidates.push({
      type: 'testid',
      value: hints.testId,
    });
  }
  if (hints.nameAttribute) {
    candidates.push({
      type: 'name',
      value: hints.nameAttribute,
    });
  }
   // Semantic locators.
  if (hints.role && hints.name) {
    candidates.push({
      type: 'role',
      value: {
        role: hints.role,
        name: hints.name,
      },
    });
  }

  if (hints.placeholder) {
    candidates.push({
      type: 'placeholder',
      value: hints.placeholder,
    });
  }

  if (hints.text) {
    candidates.push({
      type: 'text',
      value: hints.text,
    });
  }
  // Validate every candidate against the current DOM.
  const validCandidates = [];
   for (const candidate of candidates) {
    try {
      const locator = getLocator(page, candidate);
      const count = await locator.count();
      if (count === 1) {
        validCandidates.push(candidate);
      }
    }
    catch (error) {
      // An invalid candidate should not stop discovery.
      console.warn(
        '[DOM DISCOVERY] Candidate rejected:',
        candidate,
        error.message
      );
    }

   }
    if (validCandidates.length === 0) {
    console.warn(
      '[DOM DISCOVERY] No unique locator found using original element details'
    );

    return null;
  }
  console.log(
    '[DOM DISCOVERY] Unique candidates found:',
    validCandidates
  );

  return validCandidates;


}