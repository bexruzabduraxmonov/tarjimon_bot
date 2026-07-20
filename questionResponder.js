function isLikelyQuestion(text) {
  if (!text || typeof text !== 'string') return false;

  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  const questionWords = [
    'qa', 'qanday', 'nima', 'kim', 'nechta', 'qachon', 'nimani',
    'yordam', 'bilan', 'bo\'ladimi', 'qilsa', 'qilaman', 'qilgan',
    'ishlaydi', 'ishlamoqchi', 'savol', 'qila', 'qila olasiz', 'menga'
  ];

  return questionWords.some((word) => normalized.includes(word)) || /\?$/u.test(normalized);
}

function getQuestionReply(text) {
  if (!text || typeof text !== 'string') {
    return 'Iltimos, savolingizni yozing. Men sizga tez yordam berishga tayyorman.';
  }

  const normalized = text.trim().toLowerCase();

  if (normalized.includes('qanday') || normalized.includes('yordam')) {
    return 'Men sizga matn va ovozli xabarlarni bir tilidan ikkinchi tiliga tarjima qilishda yordam beraman. Agar xohlasangiz, /lang yoki /from orqali tilni o\'zgartirishingiz mumkin.';
  }

  if (normalized.includes('kim') || normalized.includes('sen')) {
    return 'Men Tarjimon botman. Men matn va ovozli xabarlarga tarjima qilaman va kerak bo\'lsa ovozli javob ham beraman.';
  }

  if (normalized.includes('nima') || normalized.includes('qila') || normalized.includes('qila ol')) {
    return 'Men sizning xabarlaringizni tarjima qilaman. Yozma va ovozli xabarlarni qabul qilib, kerak bo\'lsa javobni ham qaytaraman.';
  }

  return 'Savolingizni tushundim. Men matn va ovozli xabarlarni tarjima qilishda yordam beraman. Xabar yuboring, men uni tarjima qilaman.';
}

module.exports = { isLikelyQuestion, getQuestionReply };
