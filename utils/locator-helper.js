
const DEFERRED = Symbol('deferredLocator');

const { logHealing } = require('./healing-logger');
const { test } = require('@playwright/test');
const { LocatorNarrowing } = require('./locator-narrowing');


const { scanDOMCandidates } = require('./dom-candidate-scanner');
const { findBestCandidate } = require('./dom-candidate-matcher');
const { deriveDOMHints } = require('./derive-dom-hints');

// Converts locator configuration into a Playwright locator.
function getLocator(page, locatorConfig) {
  if (!page) {
    throw new Error('Playwright page object is required');
  }

  if (
    !locatorConfig ||
    !locatorConfig.type ||
    locatorConfig.value === undefined
  ) {
    throw new Error('Locator must contain both type and value');
  }

  const { type, value } = locatorConfig;

  switch (type.toLowerCase()) {
    case 'role':
      return typeof value === 'string'
        ? page.getByRole(value)
        : page.getByRole(value.role, { name: value.name });

    case 'label':
      return page.getByLabel(value);

    case 'placeholder':
      return page.getByPlaceholder(value);

    case 'text':
      return page.getByText(value);

    case 'testid':
    case 'test-id':
      return page.getByTestId(value);

    case 'alttext':
    case 'alt-text':
      return page.getByAltText(value);

    case 'title':
      return page.getByTitle(value);

    case 'id':
      return page.locator(`#${value}`);

    case 'class':
      return page.locator(`.${value}`);

    case 'name':
      return page.locator(`[name="${value}"]`);

    case 'css':
    case 'selector':
      return page.locator(value);

    case 'xpath':
      return page.locator(`xpath=${value}`);

    default:
      throw new Error(`Unsupported locator type: ${type}`);
  }
}

// Creates a self-healing locator.
function getSelfHealingLocator(page, locatorConfig) {
  if (!locatorConfig || !locatorConfig.primary) {
    throw new Error(
      'Locator config must contain a primary locator'
    );
  }

  // Primary locator followed by fallback locators.
  const candidates = [
    locatorConfig.primary,
    ...(locatorConfig.fallbacks || [])
  ];

  function getCurrentTestName() {
    try {
      return test.info().title;
    } catch (error) {
      return 'Unknown test';
    }
  }

  // Logs configured fallback healing.
  function recordHealing(candidateIndex, count, terminalMethod) {
    if (candidateIndex === 0) {
      return;
    }

    logHealing({
      test: getCurrentTestName() + ': Self-healing locator resolution',
      primaryLocator: candidates[0],
      fallbackLocator: candidates[candidateIndex],
      primaryCount: 0,
      fallbackCount: count,
      operation: terminalMethod,
      status: 'HEALED'
    });
  }

  // Logs DOM-based healing.
  function recordDOMHealing(candidate, score, count, terminalMethod) {
    logHealing({
      test: getCurrentTestName() + ': DOM-based locator recovery',
      primaryLocator: candidates[0],
      fallbackLocator: candidate,
      primaryCount: 0,
      fallbackCount: count,
      operation: terminalMethod,
      status: 'HEALED',
      healingSource: 'DOM_DISCOVERY',
      matchScore: score
    });

    console.log('[DOM HEALING] Recovered locator:', candidate);
    console.log('[DOM HEALING] Match score:', score);
  }

  // Resolves deferred locators inside method arguments.
  async function resolveArguments(args) {
    const resolved = [];

    for (const arg of args) {
      if (arg && arg[DEFERRED]) {
        const deferred = arg[DEFERRED];

        resolved.push(
          await deferred.resolve(deferred.operations)
        );

      } else if (Array.isArray(arg)) {
        resolved.push(
          await resolveArguments(arg)
        );

      } else if (arg && typeof arg === 'object') {
        const object = {};

        for (const [key, value] of Object.entries(arg)) {
          if (value && value[DEFERRED]) {
            const deferred = value[DEFERRED];

            object[key] = await deferred.resolve(
              deferred.operations
            );

          } else if (value && typeof value === 'object') {
            object[key] = (
              await resolveArguments([value])
            )[0];

          } else {
            object[key] = value;
          }
        }

        resolved.push(object);

      } else {
        resolved.push(arg);
      }
    }

    return resolved;
  }

  // Applies stored locator operations to a candidate.
  async function applyOperations(locator, operations) {
    for (const operation of operations) {
      const args = await resolveArguments(operation.args);

      const method = locator[operation.method];

      if (typeof method !== 'function') {
        throw new Error(
          `Unsupported locator operation: ${operation.method}`
        );
      }

      locator = method.apply(locator, args);
    }

    return locator;
  }

  // New: attempts DOM recovery after configured locators fail.
  async function recoverUsingDOM(operations, terminalMethod) {
    console.log('[DOM HEALING] Starting DOM recovery');

    // Step 1: Derive expected element details from locators.json.
    const hints = deriveDOMHints(locatorConfig);

    

    console.log('[DOM HEALING] Expected hints:', hints);

    console.log(
  '[DEBUG] Complete locator configuration:',
  JSON.stringify(locatorConfig, null, 2)
);

    // Step 2: Scan visible elements on the current page.
    const domCandidates = await scanDOMCandidates(page);

    console.log(
      '[DOM HEALING] Scanned candidates:',
      domCandidates.length
    );

    console.log(
  '[DEBUG] Scanned DOM candidate details:',
  JSON.stringify(domCandidates, null, 2)
);

    // Step 3: Match expected hints against scanned elements.
    const bestMatch = findBestCandidate(hints, domCandidates);

    if (!bestMatch) {
      console.log('[DOM HEALING] No suitable candidate found');
      return null;
    }

    console.log('[DOM HEALING] Best candidate:', bestMatch);

    // Step 4: Convert the selected DOM candidate into a Playwright locator.
    // Lazy require avoids a circular dependency:
    // dom-candidate-to-locator.js imports getLocator from this file.
    const {
      convertCandidateToLocator
    } = require('./dom-candidate-to-locator');

    const recoveredLocator = convertCandidateToLocator(
      page,
      bestMatch.locator
    );

    // Step 5: Apply existing narrowing operations.
    const narrowedLocator = await applyOperations(
      recoveredLocator,
      operations
    );

    // Step 6: Validate the recovered locator.
    const count = await narrowedLocator.count();

    if (count === 0) {
      console.log('[DOM HEALING] Recovered locator matched 0 elements');
      return null;
    }

    if (
      LocatorNarrowing.requiresUniqueElement(terminalMethod) &&
      count !== 1
    ) {
      console.log(
        `[DOM HEALING] Rejected ambiguous candidate. Count: ${count}`
      );
      return null;
    }

    // Step 7: Record successful DOM recovery.
    recordDOMHealing(
      bestMatch.locator,
      bestMatch.score,
      count,
      terminalMethod
    );

    return narrowedLocator;
  }

  // Resolves the primary, fallback, or DOM-recovered locator.
  async function resolveDeferred(
    operations = [],
    terminalMethod = null
  ) {
    let lastLocator;
    let ambiguityError = null;

    // Stage 1: Try primary and configured fallback locators.
    for (let i = 0; i < candidates.length; i++) {
      const candidate = getLocator(page, candidates[i]);

      const locator = await applyOperations(
        candidate,
        operations
      );

      const count = await locator.count();

      lastLocator = locator;

      if (count === 0) {
        console.log(
          `Locator candidate ${i} matched 0 elements`
        );
        continue;
      }

      // Collection operations can return multiple elements.
      if (
        LocatorNarrowing.collectionOperations.has(terminalMethod)
      ) {
        console.log(
          `Collection locator resolved using candidate ${i}`
        );

        recordHealing(i, count, terminalMethod);
        return locator;
      }

      // Single-element operations require exactly one match.
      if (
        LocatorNarrowing.requiresUniqueElement(terminalMethod)
      ) {
        if (count > 1) {
          ambiguityError = new Error(
            `Ambiguous locator: ${terminalMethod} requires exactly one element, ` +
            `but candidate ${i} matched ${count} elements. ` +
            'Add more filtering criteria.'
          );

          console.log(
            `Locator candidate ${i} is ambiguous. Trying next candidate.`
          );

          continue;
        }

        console.log(
          `Locator resolved using candidate ${i}`
        );

        recordHealing(i, count, terminalMethod);
        return locator;
      }

      console.log(
        `Locator resolved using candidate ${i}`
      );

      recordHealing(i, count, terminalMethod);
      return locator;
    }

    // Stage 2: All configured locators failed.
    // Attempt recovery using the live DOM.
    const domRecoveredLocator = await recoverUsingDOM(
      operations,
      terminalMethod
    );

    if (domRecoveredLocator) {
      return domRecoveredLocator;
    }

    // Stage 3: Preserve collection behavior.
    if (
      LocatorNarrowing.collectionOperations.has(terminalMethod)
    ) {
      return lastLocator;
    }

    // Report ambiguity if configured locators and DOM recovery failed.
    if (ambiguityError) {
      throw ambiguityError;
    }

    throw new Error(
      'Self-healing failed: No matching locator found'
    );
  }

  // Creates a deferred locator Proxy.
  function createDeferred(operations = []) {
    return new Proxy(function () {}, {
      get(target, property) {
        if (property === DEFERRED) {
          return {
            operations,
            resolve: resolveDeferred
          };
        }

        if (property === 'then') {
          return undefined;
        }

        // Store locator-building operations for later resolution.
        if (
          LocatorNarrowing.locatorMethods.has(property)
        ) {
          return (...args) =>
            createDeferred([
              ...operations,
              {
                method: property,
                args
              }
            ]);
        }

        // Resolve the locator and execute the terminal operation.
        return async (...args) => {
          const locator = await resolveDeferred(
            operations,
            property
          );

          const resolvedArgs = await resolveArguments(args);

          if (
            LocatorNarrowing.requiresUniqueElement(property)
          ) {
            await LocatorNarrowing.expectUnique(
              locator,
              property
            );
          }

          const method = locator[property];

          if (typeof method !== 'function') {
            throw new Error(
              `Unsupported locator method: ${String(property)}`
            );
          }

          return method.apply(locator, resolvedArgs);
        };
      }
    });
  }

  return createDeferred();
}

module.exports = {
  getLocator,
  getSelfHealingLocator
};
