
async function scanDOMCandidates(page) {
  if (!page) {
    throw new Error('Playwright page object is required');
  }

  const candidates = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      'button, input, textarea, select, a, [role], [data-test], [data-testid]'
    );

    const results = [];

    for (const element of elements) {
      const style = window.getComputedStyle(element);

      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getClientRects().length > 0;

      if (!isVisible) {
        continue;
      }

      const tagName = element.tagName.toLowerCase();

      const id = element.id || null;

      const testId =
        element.getAttribute('data-test') ||
        element.getAttribute('data-testid') ||
        null;

      const nameAttribute = element.getAttribute('name');

      const placeholder = element.getAttribute('placeholder');

      const role =
        element.getAttribute('role') ||
        getImplicitRole(element);

      const text = (element.innerText || element.value || '')
        .trim()
        .replace(/\s+/g, ' ');

      const accessibleName =
        element.getAttribute('aria-label') ||
        text ||
        null;

      results.push({
        tagName,
        id,
        testId,
        nameAttribute,
        placeholder,
        role,
        text,
        accessibleName,
      });
    }

    function getImplicitRole(element) {
      const tag = element.tagName.toLowerCase();

      if (tag === 'button') {
        return 'button';
      }

      if (tag === 'a' && element.hasAttribute('href')) {
        return 'link';
      }

      if (tag === 'textarea') {
        return 'textbox';
      }

      if (tag === 'select') {
        return element.multiple ? 'listbox' : 'combobox';
      }

      if (tag === 'input') {
        const type = (element.getAttribute('type') || 'text').toLowerCase();

        if (['button', 'submit', 'reset'].includes(type)) {
          return 'button';
        }

        if (type === 'checkbox') {
          return 'checkbox';
        }

        if (type === 'radio') {
          return 'radio';
        }

        if (['text', 'email', 'search', 'tel', 'url', 'password'].includes(type)) {
          return 'textbox';
        }
      }

      return null;
    }

    return results;
  });

  console.log('[DOM SCANNER] Candidates found:', candidates.length);

  return candidates;
}

module.exports = {
  scanDOMCandidates,
};
