
function deriveDOMHints(locatorConfig) {
  const hints = {
    role: null,
    name: null,
    text: null,
    accessibleName: null,
    testId: null,
    id: null,
    placeholder: null,
    nameAttribute: null,
  };

  if (!locatorConfig) {
    throw new Error('Locator configuration is required');
  }

  // Extract signals without requiring manually configured hints.
  function setIfEmpty(key, value) {
    if (value && !hints[key]) {
      hints[key] = String(value).trim();
    }
  }

  function extractFromConfig(config) {
    if (!config || !config.type) return;

    const type = config.type.toLowerCase();
    const value = config.value;

    switch (type) {
      case 'id':
        setIfEmpty('id', value);
        break;

      case 'role':
        if (typeof value === 'object') {
          setIfEmpty('role', value.role);
          setIfEmpty('name', value.name);
          setIfEmpty('accessibleName', value.name);
        } else {
          setIfEmpty('role', value);
        }
        break;

      case 'placeholder':
        setIfEmpty('placeholder', value);
        break;

      case 'text':
        setIfEmpty('text', value);
        break;

      case 'label':
        setIfEmpty('accessibleName', value);
        break;

      case 'name':
        setIfEmpty('nameAttribute', value);
        break;

      case 'testid':
      case 'test-id':
        setIfEmpty('testId', value);
        break;

      case 'css': {
        if (typeof value !== 'string') break;

        // Extract ID from #some-id
        const idMatch = value.match(/#([\w-]+)/);
        if (idMatch) setIfEmpty('id', idMatch[1]);

        // Extract test ID attributes
        const testIdMatch = value.match(
          /\[(?:data-test|data-testid)=["']([^"']+)["']\]/
        );
        if (testIdMatch) setIfEmpty('testId', testIdMatch[1]);

        // Extract placeholder attributes
        const placeholderMatch = value.match(
          /\[placeholder=["']([^"']+)["']\]/
        );
        if (placeholderMatch) {
          setIfEmpty('placeholder', placeholderMatch[1]);
        }

        // Extract name attributes
        const nameMatch = value.match(
          /\[name=["']([^"']+)["']\]/
        );
        if (nameMatch) setIfEmpty('nameAttribute', nameMatch[1]);

        break;
      }

      default:
        break;
    }
  }

  // Process primary locator first, followed by fallbacks.
  const configurations = [
    locatorConfig.primary,
    ...(locatorConfig.fallbacks || []),
  ];

  for (const config of configurations) {
    extractFromConfig(config);
  }

  console.log('[DOM HINTS] Automatically derived signals:', hints);

  return hints;
}

module.exports = { deriveDOMHints };
