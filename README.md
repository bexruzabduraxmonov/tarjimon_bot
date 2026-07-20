# Tarjimon Telegram Bot

Telegram tarjimon bot — matn va ovozli xabarlarni 30+ tilga tarjima qiladi.

**Bot:** [@Tarjimon00_bot](https://t.me/Tarjimon00_bot)

## Imkoniyatlar

- Matn tarjimasi (30+ til)
- Ovozli xabar qabul qilish va tarjima qilish
- Til tanlash (`/lang`, `/start`)
- `/ping` — bot ishlayotganini tekshirish

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env
# .env fayliga BOT_TOKEN qo'shing
npm run bot
```

## GitHub + avtomatik ishga tushirish (Render)

Bot doimiy ishlashi uchun [Render.com](https://render.com) (bepul worker) ishlatiladi. GitHub'ga push qilganingizda avtomatik deploy bo'ladi.

### 1. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Tarjimon bot — GitHub va Render deploy"
git branch -M main
git remote add origin https://github.com/bexruzabduraxmonov/tarjimon.bot.git
git push -u origin main
```

> `.env` fayli GitHub'ga yuklanmaydi — token xavfsiz qoladi.

### 2. Render'da ulash

1. [render.com](https://render.com) ga kiring va GitHub bilan ro'yxatdan o'ting
2. **New +** → **Blueprint**
3. `tarjimon.bot` repozitoriyingizni tanlang
4. `render.yaml` avtomatik topiladi — **Apply** bosing
5. **Environment** bo'limida `BOT_TOKEN` ni kiriting (Telegram @BotFather token)
6. Deploy tugagach bot 24/7 ishlaydi

### 3. Yangilanishlar

GitHub'ga yangi commit push qilsangiz, Render avtomatik qayta deploy qiladi:

```bash
git add .
git commit -m "Yangilanish"
git push
```

## Environment o'zgaruvchilari

| O'zgaruvchi | Majburiy | Tavsif |
|---|---|---|
| `BOT_TOKEN` | Ha | Telegram bot tokeni |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Yo'q | Ovozni matnga aylantirish uchun Google Cloud kaliti |

## Buyruqlar

| Buyruq | Vazifa |
|---|---|
| `/start` | Boshlash va til tanlash |
| `/lang` | Maqsad tilini o'zgartirish |
| `/ping` | Bot ishlayotganini tekshirish |
| `/help` | Yordam |

## Muammolar

- **409 Conflict** — bot bir vaqtning o'zida ikkita joyda ishlayapti. Lokal `npm run bot` ni to'xtating yoki Render'da faqat bitta instance qoldiring.
- **Ovozli xabar ishlamayapti** — Google Cloud Speech kaliti kerak; aks holda faqat matn tarjimasi ishlaydi.
