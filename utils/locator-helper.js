function getLocator(page, locatorConfig) {
  if (!page) {
    throw new Error('Playwright page object is required');
  }

  if (!locatorConfig || !locatorConfig.type || locatorConfig.value === undefined) {
    throw new Error('Locator must contain both type and value');
  }

  const { type, value } = locatorConfig;

  switch (type.toLowerCase()) {
     // Playwright built-in locators
    case 'role':
      return page.getByRole(value);
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

    // CSS-based locators
    case 'id':
      return page.locator(`#${value}`);

    case 'class':
      return page.locator(`.${value}`);

    case 'name':
      return page.locator(`[name="${value}"]`);

    case 'css':
    case 'selector':
      return page.locator(value);

    // XPath locator
    case 'xpath':
      return page.locator(`xpath=${value}`);
    
    default:
      throw new Error(`Unsupported locator type: ${type}`);
  
  }
}

module.exports = { getLocator };