function getEffectiveTargetLanguage(chatId, preferences) {
  return preferences?.get(chatId) || 'en';
}

module.exports = {
  getEffectiveTargetLanguage,
};
