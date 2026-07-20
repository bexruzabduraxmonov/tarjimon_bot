const test = require('node:test');
const assert = require('node:assert/strict');
const { isLikelyQuestion, getQuestionReply } = require('../questionResponder');
const { normalizeLanguageCode, shouldSkipTranslation, detectLanguageHint } = require('../translationService');

test('detects conversational questions more reliably', () => {
  assert.equal(isLikelyQuestion('Bot nima qila oladi?'), true);
  assert.equal(isLikelyQuestion('Menga yordam bering'), true);
  assert.equal(isLikelyQuestion('Salom, qanday yaxshiman?'), true);
});

test('returns more natural conversational replies', () => {
  const reply = getQuestionReply('Menga yordam bering');
  assert.match(reply, /yordam|tarjima|xabar/i);
});

test('detects language hints from user text', () => {
  assert.equal(detectLanguageHint('Bu matn ingliz tilida'), 'en');
  assert.equal(detectLanguageHint('Bu ruscha xabar'), 'ru');
  assert.equal(detectLanguageHint('Hech qanday til yo\'q'), null);
});

test('avoids useless translation for same-language input', () => {
  assert.equal(shouldSkipTranslation('Salom', 'uz', 'uz'), true);
  assert.equal(shouldSkipTranslation('Hello', 'en', 'en'), true);
  assert.equal(shouldSkipTranslation('Hello', 'en', 'uz'), false);
});
