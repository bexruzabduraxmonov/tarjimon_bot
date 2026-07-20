function normalizeLanguageCode(lang) {
  if (!lang || typeof lang !== 'string') return 'auto';

  const normalized = lang.trim().toLowerCase();
  const map = {
    'o\'zbek': 'uz',
    "o'zbek": 'uz',
    'uzbek': 'uz',
    'rus': 'ru',
    'ruscha': 'ru',
    'ingliz': 'en',
    'english': 'en',
    'inglizcha': 'en',
    'turk': 'tr',
    'turkcha': 'tr',
    'arab': 'ar',
    'arabcha': 'ar',
    'xitoy': 'zh-cn',
    'xitoycha': 'zh-cn',
    'yapon': 'ja',
    'koreys': 'ko',
    'hind': 'hi',
    'nemis': 'de',
    'ispan': 'es',
    'fransuz': 'fr',
    'italyan': 'it',
    'portugal': 'pt',
    'polyak': 'pl',
    'ukrain': 'uk',
    'chex': 'cs',
    'shved': 'sv',
    'rumin': 'ro',
    'grek': 'el',
    'venger': 'hu',
    'fors': 'fa',
    'indonez': 'id',
    'malay': 'ms',
    'tay': 'th',
    'vyetnam': 'vi',
    'bengal': 'bn',
    'ozarbayjon': 'az',
    'qozoq': 'kk',
    'qirg\'iz': 'ky',
    "qirg'iz": 'ky',
    'tojik': 'tg',
    'kyrgyz': 'ky',
    'kazakh': 'kk',
    'tajik': 'tg',
    'turkish': 'tr',
    'russian': 'ru',
    'uzbekistan': 'uz',
    'english': 'en',
    'french': 'fr',
    'german': 'de',
    'spanish': 'es',
    'italian': 'it',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh-cn',
    'arabic': 'ar'
  };

  const code = map[normalized] || normalized;
  return ['auto', 'en', 'ru', 'uz', 'tr', 'ar', 'zh-cn', 'ja', 'ko', 'hi', 'de', 'es', 'fr', 'it', 'pt', 'pl', 'uk', 'cs', 'sv', 'ro', 'el', 'hu', 'fa', 'id', 'ms', 'th', 'vi', 'bn', 'az', 'kk', 'ky', 'tg'].includes(code) ? code : 'auto';
}

function shouldSkipTranslation(text, sourceLang, targetLang) {
  if (!text || !text.trim()) return true;
  if (sourceLang === targetLang) return true;
  if (sourceLang === 'auto' && targetLang === 'auto') return true;
  return false;
}

function detectLanguageHint(text) {
  if (!text || typeof text !== 'string') return null;

  const normalized = text.toLowerCase();
  if (normalized.includes('ingliz') || normalized.includes('english') || normalized.includes('inglizcha')) return 'en';
  if (normalized.includes('rus') || normalized.includes('russian') || normalized.includes('ruscha')) return 'ru';
  if (normalized.includes('o\'zbek') || normalized.includes('uzbek') || normalized.includes('o\'zbekcha')) return 'uz';
  if (normalized.includes('turk') || normalized.includes('turkcha')) return 'tr';
  if (normalized.includes('arab') || normalized.includes('arabcha')) return 'ar';
  if (normalized.includes('xitoy') || normalized.includes('xitoycha')) return 'zh-cn';
  return null;
}

module.exports = { normalizeLanguageCode, shouldSkipTranslation, detectLanguageHint };
