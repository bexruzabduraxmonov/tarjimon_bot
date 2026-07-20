require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const translate = require('translate-google');
const { SpeechClient } = require('@google-cloud/speech');

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credPath = path.join(os.tmpdir(), 'google-credentials.json');
  fs.writeFileSync(credPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
}

async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || !text.trim()) {
    throw new Error('Bo\'sh matn tarjima qilinmaydi.');
  }

  const result = await translate(text, { to: targetLang, from: sourceLang });
  return typeof result === 'string' ? result : result.text || String(result);
}

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is missing. Set it in the .env file.');
  process.exit(1);
}

const pidFile = path.join(os.tmpdir(), 'tarjimon-bot.pid');

function isCloudEnvironment() {
  return Boolean(
    process.env.RENDER ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.FLY_APP_NAME ||
    process.env.HEROKU_APP_NAME
  );
}

function ensureSingleInstance() {
  if (isCloudEnvironment()) {
    return;
  }
  if (fs.existsSync(pidFile)) {
    const existingPid = fs.readFileSync(pidFile, 'utf8').trim();
    if (existingPid) {
      try {
        process.kill(Number(existingPid), 0);
        console.log(`Another bot instance is already running with PID ${existingPid}.`);
        process.exit(0);
      } catch (error) {
        fs.unlinkSync(pidFile);
      }
    }
  }

  fs.writeFileSync(pidFile, String(process.pid));
}

function cleanupPidFile() {
  try {
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile);
    }
  } catch (error) {
    console.error('Could not remove PID file:', error.message);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

ensureSingleInstance();

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 20,
      allowed_updates: ['message', 'callback_query'],
    },
  },
  request: { timeout: 30000 },
});

async function registerBotProfile() {
  try {
    await bot.setMyCommands([
      { command: 'start', description: 'Boshlash va til tanlash' },
      { command: 'lang', description: 'Maqsad tilini o\'zgartirish' },
      { command: 'ping', description: 'Bot ishlayotganini tekshirish' },
      { command: 'help', description: 'Yordam' },
    ]);
    await bot.setMyDescription('Tarjimon bot — matn va ovozli xabarlarni tez tarjima qiladi.');
    await bot.setMyShortDescription('Matn va ovozli tarjimon');
  } catch (error) {
    console.error('Could not register bot commands:', error.message);
  }
}

registerBotProfile();

bot.on('message', (msg) => {
  const user = msg.from ? `@${msg.from.username || msg.from.first_name || msg.from.id}` : 'Unknown';
  const text = msg.text || (msg.voice ? '[Voice message]' : '[Other format]');
  console.log(`[Incoming Message] User: ${user} | Chat ID: ${msg.chat.id} | Text: "${text}"`);
});

bot.on('callback_query', (callbackQuery) => {
  const user = callbackQuery.from ? `@${callbackQuery.from.username || callbackQuery.from.first_name || callbackQuery.from.id}` : 'Unknown';
  console.log(`[Incoming Callback] User: ${user} | Data: "${callbackQuery.data}"`);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error.message);
});

const languageOptions = {
  auto: 'Avtomatik',
  // Markaziy Osiyo
  uz: 'O\'zbek',
  kk: 'Qozoq',
  ky: 'Qirg\'iz',
  tg: 'Tojik',
  // Mashhur tillar
  ru: 'Rus',
  en: 'Ingliz',
  tr: 'Turk',
  ar: 'Arab',
  'zh-cn': 'Xitoy',
  ja: 'Yapon',
  ko: 'Koreys',
  hi: 'Hind',
  // Yevropa tillari
  de: 'Nemis',
  es: 'Ispan',
  fr: 'Fransuz',
  it: 'Italyan',
  pt: 'Portugal',
  nl: 'Golland',
  pl: 'Polyak',
  uk: 'Ukrain',
  cs: 'Chex',
  sv: 'Shved',
  ro: 'Rumin',
  el: 'Grek',
  hu: 'Venger',
  // Boshqa tillar
  fa: 'Fors',
  id: 'Indonez',
  ms: 'Malay',
  th: 'Tay',
  vi: 'Vyetnam',
  bn: 'Bengal',
  az: 'Ozarbayjon',
};

const languageFlags = {
  auto: '🔎',
  uz: '🇺🇿',
  kk: '🇰🇿',
  ky: '🇰🇬',
  tg: '🇹🇯',
  ru: '🇷🇺',
  en: '🇺🇸',
  tr: '🇹🇷',
  ar: '🇸🇦',
  'zh-cn': '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  hi: '🇮🇳',
  de: '🇩🇪',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  pt: '🇧🇷',
  nl: '🇳🇱',
  pl: '🇵🇱',
  uk: '🇺🇦',
  cs: '🇨🇿',
  sv: '🇸🇪',
  ro: '🇷🇴',
  el: '🇬🇷',
  hu: '🇭🇺',
  fa: '🇮🇷',
  id: '🇮🇩',
  ms: '🇲🇾',
  th: '🇹🇭',
  vi: '🇻🇳',
  bn: '🇧🇩',
  az: '🇦🇿',
};

const userTargetLanguages = new Map();
const userSourceLanguages = new Map();
const pendingLanguage = new Map();

function getLanguageName(code) {
  if (!code) return 'Avtomatik';
  return languageOptions[code] || code.toUpperCase();
}

function getDisplayText(text) {
  return text && text.trim() ? text.trim() : '…';
}

function buildKeyboard(mode = 'target', currentLang = null) {
  const options = Object.entries(languageOptions)
    .filter(([code]) => code !== 'auto' || mode === 'source');

  let autoButton = null;
  if (mode === 'source') {
    const isSelected = currentLang === 'auto' || !currentLang;
    autoButton = {
      text: `🔎 Avtomatik aniqlash${isSelected ? ' ✅' : ''}`,
      callback_data: 'source:auto',
    };
  }

  const list = options.filter(([code]) => code !== 'auto');
  const rows = [];
  const chunkSize = 3;

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const row = chunk.map(([code, name]) => {
      const isSelected = currentLang === code;
      return {
        text: `${languageFlags[code]} ${name}${isSelected ? ' ✅' : ''}`,
        callback_data: `${mode === 'source' ? 'source' : 'target'}:${code}`,
      };
    });
    rows.push(row);
  }

  if (autoButton) {
    rows.unshift([autoButton]);
  }

  return {
    inline_keyboard: rows,
  };
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const targetLang = userTargetLanguages.get(chatId) || 'en';
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';
  
  const text = [
    '👋 <b>Assalomu alaykum! Tarjimon botga xush kelibsiz!</b>',
    '',
    'Men matn va ovozli xabarlarni tezda tarjima qilishga yordam beraman.',
    '',
    '⚙️ <b>Joriy sozlamalar:</b>',
    `🌐 Tarjima yo'nalishi: <b>${languageFlags[sourceLang] || '🔎'} ${getLanguageName(sourceLang)}</b> ➡️ <b>${languageFlags[targetLang] || '🌐'} ${getLanguageName(targetLang)}</b>`,
    '',
    '🚀 <b>Buyruqlar:</b>',
    '👉 /lang — Maqsad tilini tanlash 🎯',
    '👉 /from — Manba tilini tanlash 🔎',
    '👉 /swap — Tillarni almashtirish 🔄',
    '👉 /status — Sozlamalarni ko\'rish 📊',
    '👉 /reset — Sozlamalarni tiklash 🧹',
    '👉 /ping — Bot holatini tekshirish ⚡',
    '',
    '✍️ <i>Boshlash uchun istalgan matnni yuboring yoki ovozli xabar jo\'nating!</i>'
  ].join('\n');

  pendingLanguage.delete(chatId);
  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: buildKeyboard('target', targetLang)
  });
});

bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '⚡ <b>Bot ishlayapti va faol!</b> ✅', { parse_mode: 'HTML' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = [
    'ℹ️ <b>Tarjimon bot bo\'yicha yordam:</b>',
    '',
    '📍 <b>Buyruqlar ro\'yxati:</b>',
    '• /start — Boshlash va asosiy ma\'lumotlar',
    '• /lang — Maqsad tilini o\'zgartirish 🎯',
    '• /from — Manba tilini o\'zgartirish 🔎',
    '• /swap — Tarjima yo\'nalishini teskari qilish 🔄',
    '• /status — Joriy tillarni tekshirish 📊',
    '• /reset — Sozlamalarni o\'chirish 🧹',
    '• /ping — Botning faolligini tekshirish ⚡',
    '',
    '📥 <b>Qanday ishlatiladi?</b>',
    '1. Tarjima qilmoqchi bo\'lgan tilingizni tanlang (/lang).',
    '2. Matn ko\'rinishidagi xabar yuboring.',
    '3. Yoki ovozli xabar yuboring, bot uni matnga o\'girib, tarjima qiladi va ovozli javob qaytaradi! 🎤'
  ].join('\n');

  bot.sendMessage(chatId, helpText, { parse_mode: 'HTML' });
});

bot.onText(/\/lang/, (msg) => {
  const chatId = msg.chat.id;
  const targetLang = userTargetLanguages.get(chatId) || 'en';
  pendingLanguage.set(chatId, 'target');
  bot.sendMessage(chatId, '🎯 <b>Maqsad tilini tanlang.</b>\nUshbu tilga tarjima qilinadi:', {
    parse_mode: 'HTML',
    reply_markup: buildKeyboard('target', targetLang)
  });
});

bot.onText(/\/from/, (msg) => {
  const chatId = msg.chat.id;
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';
  pendingLanguage.set(chatId, 'source');
  bot.sendMessage(chatId, '🔎 <b>Manba tilini tanlang.</b>\nAgar bilmasangiz, avtomatik aniqlashni tanlang:', {
    parse_mode: 'HTML',
    reply_markup: buildKeyboard('source', sourceLang)
  });
});

bot.onText(/\/swap/, (msg) => {
  const chatId = msg.chat.id;
  const currentTarget = userTargetLanguages.get(chatId) || 'en';
  const currentSource = userSourceLanguages.get(chatId) || 'auto';

  if (currentSource !== 'auto') {
    userTargetLanguages.set(chatId, currentSource);
  }
  if (currentTarget !== 'en') {
    userSourceLanguages.set(chatId, currentTarget);
  } else {
    userSourceLanguages.delete(chatId);
  }

  const targetLang = userTargetLanguages.get(chatId) || 'en';
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';

  const text = [
    '🔄 <b>Tarjima yo\'nalishi almashtirildi!</b>',
    '',
    `Joriy: <b>${languageFlags[sourceLang] || '🔎'} ${getLanguageName(sourceLang)}</b> ➡️ <b>${languageFlags[targetLang] || '🌐'} ${getLanguageName(targetLang)}</b>`
  ].join('\n');

  bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const targetLang = userTargetLanguages.get(chatId) || 'en';
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';

  const text = [
    '📊 <b>Joriy sozlamalar:</b>',
    '',
    `• Manba tili: <b>${languageFlags[sourceLang] || '🔎'} ${getLanguageName(sourceLang)}</b>`,
    `• Maqsad tili: <b>${languageFlags[targetLang] || '🌐'} ${getLanguageName(targetLang)}</b>`,
  ].join('\n');

  bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
});

bot.onText(/\/reset/, (msg) => {
  const chatId = msg.chat.id;
  userTargetLanguages.delete(chatId);
  userSourceLanguages.delete(chatId);
  pendingLanguage.delete(chatId);
  bot.sendMessage(chatId, '🧹 <b>Sozlamalar tozalab tiklandi.</b>\n/start buyrug\'ini yuborib qayta sozlang.', { parse_mode: 'HTML' });
});

bot.onText(/\/detect/, (msg) => {
  const chatId = msg.chat.id;
  userSourceLanguages.delete(chatId);
  bot.sendMessage(chatId, 'Manba til avtomatik aniqlashga o\'rnatildi.');
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data || '';
  const [mode, code] = data.split(':');

  if (!mode || !code) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Til tanlanmadi', show_alert: true });
    return;
  }

  if (mode === 'source') {
    if (code === 'auto') {
      userSourceLanguages.delete(chatId);
    } else if (!languageOptions[code]) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Bu til qo\'llab-quvvatlanmaydi', show_alert: true });
      return;
    } else {
      userSourceLanguages.set(chatId, code);
    }

    const currentSource = userSourceLanguages.get(chatId) || 'auto';
    const confirmationText = `✅ Manba tili o'zgartirildi: <b>${languageFlags[currentSource]} ${getLanguageName(currentSource)}</b>`;
    await bot.answerCallbackQuery(callbackQuery.id, { text: `${getLanguageName(currentSource)} tanlandi` });

    try {
      await bot.editMessageText(confirmationText, {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id,
        parse_mode: 'HTML',
        reply_markup: buildKeyboard('source', currentSource),
      });
    } catch (error) {
      if (!/message is not modified/i.test(error?.message || '')) {
        console.error('Could not update source language selection:', error.message);
      }
    }
    return;
  }

  if (mode === 'target' || mode === 'lang') {
    if (!languageOptions[code]) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Bu til qo\'llab-quvvatlanmaydi', show_alert: true });
      return;
    }

    userTargetLanguages.set(chatId, code);
    pendingLanguage.delete(chatId);
    
    const currentTarget = userTargetLanguages.get(chatId) || 'en';
    const confirmationText = `✅ Maqsad tili o'zgartirildi: <b>${languageFlags[currentTarget]} ${getLanguageName(currentTarget)}</b>`;
    await bot.answerCallbackQuery(callbackQuery.id, { text: `${getLanguageName(currentTarget)} tanlandi` });

    try {
      await bot.editMessageText(confirmationText, {
        chat_id: chatId,
        message_id: callbackQuery.message.message_id,
        parse_mode: 'HTML',
        reply_markup: buildKeyboard('target', currentTarget),
      });
    } catch (error) {
      if (!/message is not modified/i.test(error?.message || '')) {
        console.error('Could not update target language selection:', error.message);
      }
    }
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.voice) {
    await handleVoiceMessage(msg);
    return;
  }

  if (!msg.text || msg.text.startsWith('/')) {
    return;
  }

  const targetLang = userTargetLanguages.get(chatId) || 'en';
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';
  if (!userTargetLanguages.has(chatId)) {
    pendingLanguage.set(chatId, 'target');
    await bot.sendMessage(chatId, '🎯 <b>Avval maqsad tilini tanlang:</b>\nQuyidagi tugmalar orqali maqsad tilni sozlang, keyin xabar yuboring.', {
      parse_mode: 'HTML',
      reply_markup: buildKeyboard('target', targetLang)
    });
    return;
  }

  try {
    // Show typing state
    bot.sendChatAction(chatId, 'typing').catch(() => {});

    const translatedText = await translateText(msg.text, targetLang, sourceLang);
    const sourceLabel = getLanguageName(sourceLang);
    const targetLabel = getLanguageName(targetLang);
    
    const response = [
      `<b>📝 Tarjima:</b>`,
      `<blockquote>${escapeHtml(translatedText)}</blockquote>`,
      ``,
      `<i>🌐 ${languageFlags[sourceLang] || '🔎'} ${sourceLabel} ➡️ ${languageFlags[targetLang] || '🌐'} ${targetLabel}</i>`
    ].join('\n');

    await bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Translation error:', error.message);
    await bot.sendMessage(chatId, '❌ <b>Tarjima qilishda muammo yuz berdi.</b>\nIltimos, qaytadan urinib ko\'ring.', { parse_mode: 'HTML' });
  }
});

async function handleVoiceMessage(msg) {
  const chatId = msg.chat.id;
  const targetLang = userTargetLanguages.get(chatId) || 'en';
  const sourceLang = userSourceLanguages.get(chatId) || 'auto';
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tg-bot-'));
  const oggPath = path.join(tempDir, 'voice.ogg');
  const wavPath = path.join(tempDir, 'voice.wav');
  const mp3Path = path.join(tempDir, 'voice.mp3');

  let statusMsg;
  try {
    statusMsg = await bot.sendMessage(chatId, '⏳ <b>Ovozli xabar yuklab olinmoqda...</b>', { parse_mode: 'HTML' });

    const fileLink = await bot.getFileLink(msg.voice.file_id);
    const audioResponse = await axios({ url: fileLink, responseType: 'stream' });
    const writer = fs.createWriteStream(oggPath);
    audioResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.editMessageText('⚙️ <b>Ovoz matnga o\'girilmoqda...</b>', {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: 'HTML'
    }).catch(() => {});

    const result = await transcribeAudio(oggPath);
    if (!result || !result.trim()) {
      await bot.editMessageText('❌ <b>Ovozni aniqlab bo\'lmadi.</b> Iltimos, aniqroq gapiring.', {
        chat_id: chatId,
        message_id: statusMsg.message_id,
        parse_mode: 'HTML'
      });
      return;
    }

    await bot.editMessageText('✍️ <b>Matn tarjima qilinmoqda...</b>', {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: 'HTML'
    }).catch(() => {});

    const translatedText = await translateText(result, targetLang, sourceLang);

    await bot.editMessageText('🔊 <b>Tarjima ovozli xabarga o\'tkazilmoqda...</b>', {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: 'HTML'
    }).catch(() => {});

    let hasAudio = false;
    try {
      await saveAudio(mp3Path, translatedText, targetLang);
      hasAudio = true;
    } catch (e) {
      console.log(`[TTS] Audio yaratib bo'lmadi tili uchun: ${targetLang}`);
    }

    // Delete the status message since we are sending the actual result now
    await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    statusMsg = null;

    const sourceLabel = getLanguageName(sourceLang);
    const targetLabel = getLanguageName(targetLang);

    const voiceResponse = [
      `<b>🗣️ Ovozli xabar tarjimasi:</b>`,
      `<blockquote>${escapeHtml(translatedText)}</blockquote>`,
      ``,
      `<i>🌐 ${languageFlags[sourceLang] || '🔎'} ${sourceLabel} ➡️ ${languageFlags[targetLang] || '🌐'} ${targetLabel}</i>`
    ].join('\n');

    await bot.sendMessage(chatId, voiceResponse, { parse_mode: 'HTML' });
    if (hasAudio) {
      await bot.sendAudio(chatId, mp3Path);
    } else {
      await bot.sendMessage(chatId, '⚠️ <i>Ushbu til uchun ovozli o\'qish qo\'llab-quvvatlanmaydi.</i>', { parse_mode: 'HTML' });
    }
  } catch (error) {
    console.error('Voice message handling error:', error.message);
    if (statusMsg) {
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    }
    await bot.sendMessage(chatId, '❌ <b>Ovozli xabarni hozircha qayta ishlay olmayapman.</b> Iltimos, matn yuboring.', { parse_mode: 'HTML' });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function transcribeAudio(filePath) {
  try {
    const client = new SpeechClient();
    const audioBytes = fs.readFileSync(filePath);
    const audio = {
      content: audioBytes.toString('base64'),
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio,
      config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript || '')
      .filter(Boolean)
      .join(' ');

    return transcription || '';
  } catch (error) {
    throw new Error('Voice transcription is not available in this environment.');
  }
}

async function saveAudio(filePath, text, lang) {
  const gTTS = require('gtts');
  const audioBuffer = await new Promise((resolve, reject) => {
    const gtts = new gTTS(text, lang);
    gtts.save(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  return audioBuffer;
}

console.log('Bot started and listening for updates.');

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('SIGINT', () => {
  cleanupPidFile();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupPidFile();
  process.exit(0);
});

process.on('exit', cleanupPidFile);
