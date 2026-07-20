const test = require('node:test');
const assert = require('node:assert/strict');
const { isLikelyQuestion, getQuestionReply } = require('../questionResponder');

test('detects common questions', () => {
  assert.equal(isLikelyQuestion('Qanday yordam berasiz?'), true);
  assert.equal(isLikelyQuestion('Kim sen?'), true);
  assert.equal(isLikelyQuestion('Bu qanday ishlaydi?'), true);
  assert.equal(isLikelyQuestion('Assalomu alaykum'), false);
});

test('returns a helpful reply for questions', () => {
  const reply = getQuestionReply('Qanday yordam berasiz?');
  assert.match(reply, /tarjima|til|help|xabar/i);
});

test('returns a friendly identity reply', () => {
  const reply = getQuestionReply('Sen kim?');
  assert.match(reply, /Tarjimon bot|tarjima/i);
});

test('returns a more helpful capability reply', () => {
  const reply = getQuestionReply('Bot nima qila oladi?');
  assert.match(reply, /tarjima|ovozli|matn/i);
});
