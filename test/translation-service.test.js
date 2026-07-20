const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLanguageCode, shouldSkipTranslation, detectLanguageHint } = require('../translationService');

test('normalizes common language names to codes', () => {
  assert.equal(normalizeLanguageCode('O\'zbek'), 'uz');
  assert.equal(normalizeLanguageCode('rus'), 'ru');
  assert.equal(normalizeLanguageCode('ingliz'), 'en');
  assert.equal(normalizeLanguageCode('zh-cn'), 'zh-cn');
});

test('falls back safely for unsupported or invalid language codes', () => {
  assert.equal(normalizeLanguageCode('not-a-real-language'), 'auto');
  assert.equal(normalizeLanguageCode(''), 'auto');
  assert.equal(normalizeLanguageCode(null), 'auto');
});

test('detects hints from user text', () => {
  assert.equal(detectLanguageHint('Bu matn inglizcha'), 'en');
  assert.equal(detectLanguageHint('Bu ruscha xabar'), 'ru');
  assert.equal(detectLanguageHint('Bu o\'zbekcha so\'z'), 'uz');
});

test('skips translation when source and target are the same', () => {
  assert.equal(shouldSkipTranslation('Salom', 'uz', 'uz'), true);
  assert.equal(shouldSkipTranslation('Hello', 'en', 'auto'), false);
});
