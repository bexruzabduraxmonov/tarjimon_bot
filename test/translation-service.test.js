const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLanguageCode, shouldSkipTranslation } = require('../translationService');

test('normalizes common language names to codes', () => {
  assert.equal(normalizeLanguageCode('O\'zbek'), 'uz');
  assert.equal(normalizeLanguageCode('rus'), 'ru');
  assert.equal(normalizeLanguageCode('ingliz'), 'en');
  assert.equal(normalizeLanguageCode('zh-cn'), 'zh-cn');
});

test('skips translation when source and target are the same', () => {
  assert.equal(shouldSkipTranslation('Salom', 'uz', 'uz'), true);
  assert.equal(shouldSkipTranslation('Hello', 'en', 'auto'), false);
});
