
const { expect } = require('@playwright/test');

class LocatorNarrowing {

    // Methods that the Proxy should intercept
  static locatorMethods = new Set([
    'filter',
    'getByRole',
    'getByText',
    'getByLabel',
    'getByPlaceholder',
    'getByTestId',
    'getByAltText',
    'getByTitle',
    'locator',
    'nth',
    'first',
    'last'
  ]);

  // Operations that must act on exactly one element.
  static singleElementActions = new Set([
    'click',
    'dblclick',
    'fill',
    'clear',
    'check',
    'uncheck',
    'selectOption',
    'press',
    'hover',
    'focus',
    'tap',
    'setInputFiles'
  ]);

  // Operations that can work with multiple matching elements.
  static collectionOperations = new Set([
    'count',
    'all',
    'allTextContents',
    'allInnerTexts',
    'evaluateAll'
  ]);


  // Narrow a collection using a child locator
  static byChild(collection, childLocator) {
    return collection.filter({
      has: childLocator
    });
  }

  // Narrow a collection using a condition
  static byCondition(collection, condition) {
    if (!condition) {
      return collection;
    }

    return condition(collection);
  }
  //check for single methods

  static requiresUniqueElement(method) {
    return this.singleElementActions.has(method);
  }
  //check for methods return the multiple counts/matches
  static supportsCollection(method) {
    return this.collectionOperations.has(method);
  }

  // Validate exactly one matching element
  static async expectUnique(locator,method='action') {
    const count = await locator.count();

    if (count === 0) {
      throw new Error(
        `LocatorNarrowing: No element found for "${method}".`
      );
    }

     if (count > 1) {
      throw new Error(
        `LocatorNarrowing: "${method}" requires one element, ` +
        `but ${count} elements matched. Apply a narrowing condition.`
      );
     }

  return locator;
    // await expect(locator).toHaveCount(1);
    // return locator;
  }
}

module.exports = { LocatorNarrowing };
