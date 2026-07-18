"""Telegram translation bot.

Install dependencies with:
    pip install -r requirements.txt

Run the bot with:
    python bot.py

Before running, put your Telegram bot token in config.py.
"""

import os
import shutil
import tempfile
from typing import Dict

from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, InputFile
from aiogram.storage.memory import MemoryStorage
from deep_translator import GoogleTranslator
from gtts import gTTS
from pydub import AudioSegment
import speech_recognition as sr

from config import BOT_TOKEN


LANGUAGE_OPTIONS: Dict[str, str] = {
    "uz": "Uzbek",
    "ru": "Russian",
    "en": "English",
    "tr": "Turkish",
    "ar": "Arabic",
    "de": "German",
}

LANGUAGE_FLAGS: Dict[str, str] = {
    "uz": "🇺🇿",
    "ru": "🇷🇺",
    "en": "🇺🇸",
    "tr": "🇹🇷",
    "ar": "🇸🇦",
    "de": "🇩🇪",
}

user_languages: Dict[int, str] = {}

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())


# Build the inline keyboard used for language selection.
def build_language_keyboard() -> InlineKeyboardMarkup:
    buttons = []
    for code, name in LANGUAGE_OPTIONS.items():
        buttons.append(
            InlineKeyboardButton(
                text=f"{LANGUAGE_FLAGS[code]} {name}",
                callback_data=f"lang:{code}",
            )
        )

    keyboard = InlineKeyboardMarkup(inline_keyboard=[buttons[i : i + 2] for i in range(0, len(buttons), 2)])
    return keyboard


# Show a greeting message and the language selection keyboard.
@dp.message(Command("start"))
async def start_command(message: types.Message) -> None:
    text = (
        "Hello! I can translate text and voice messages. "
        "Choose your target language to get started."
    )
    await message.answer(text, reply_markup=build_language_keyboard())


# Let the user change the target language at any time.
@dp.message(Command("lang"))
async def lang_command(message: types.Message) -> None:
    await message.answer(
        "Choose a target language:",
        reply_markup=build_language_keyboard(),
    )


# Save the selected language for the current user.
@dp.callback_query(F.data.startswith("lang:"))
async def handle_language_selection(callback: types.CallbackQuery) -> None:
    code = callback.data.split(":", 1)[1]
    if code not in LANGUAGE_OPTIONS:
        await callback.answer("Unsupported language", show_alert=True)
        return

    user_languages[callback.from_user.id] = code
    await callback.message.edit_text(
        f"Target language set to {LANGUAGE_OPTIONS[code]}.",
        reply_markup=build_language_keyboard(),
    )
    await callback.answer(f"Language set to {LANGUAGE_OPTIONS[code]}")


# Translate a text message into the user's chosen language.
@dp.message(F.text)
async def handle_text_message(message: types.Message) -> None:
    if message.text and message.text.startswith("/"):
        return

    target_lang = user_languages.get(message.from_user.id, "en")
    try:
        translator = GoogleTranslator(source="auto", target=target_lang)
        translated_text = translator.translate(message.text)
        await message.answer(
            f"Translated to {LANGUAGE_OPTIONS[target_lang]}:\n\n{translated_text}"
        )
    except Exception as exc:
        await message.answer(f"Could not translate the text: {exc}")


# Translate a spoken message by converting it to text and then to speech.
@dp.message(F.voice)
async def handle_voice_message(message: types.Message) -> None:
    target_lang = user_languages.get(message.from_user.id, "en")
    temp_dir = tempfile.mkdtemp(prefix="voice_translation_", dir=os.getcwd())
    ogg_path = os.path.join(temp_dir, "voice.ogg")
    wav_path = os.path.join(temp_dir, "voice.wav")
    mp3_path = os.path.join(temp_dir, "voice.mp3")

    try:
        file = await bot.get_file(message.voice.file_id)
        await bot.download_file(file.file_path, destination=ogg_path)

        audio = AudioSegment.from_ogg(ogg_path)
        audio.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            transcribed_text = recognizer.recognize_google(audio_data)

        translator = GoogleTranslator(source="auto", target=target_lang)
        translated_text = translator.translate(transcribed_text)

        await message.answer(
            f"Translated to {LANGUAGE_OPTIONS[target_lang]}:\n\n{translated_text}"
        )

        tts = gTTS(text=translated_text, lang=target_lang, slow=False)
        tts.save(mp3_path)
        await message.answer_audio(types.InputFile(mp3_path))
    except sr.UnknownValueError:
        await message.answer("Couldn't recognize the audio. Please try again with clearer speech.")
    except Exception as exc:
        await message.answer(f"Could not process the voice message: {exc}")
    finally:
        for path in (ogg_path, wav_path, mp3_path):
            if os.path.exists(path):
                os.remove(path)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)


# Start the bot event loop.
async def main() -> None:
    print("Bot started. Press Ctrl+C to stop.")
    await dp.start_polling(bot)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
