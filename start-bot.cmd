@echo off
cd /d "C:\Users\User\Desktop\tarjimon.bot"
echo Starting Tarjimon bot at %date% %time% >> bot.log
set NODE_EXE=C:\Program Files\nodejs\node.exe
if exist "%NODE_EXE%" (
  start "Tarjimon Bot" "%NODE_EXE%" bot.js >> bot.log 2>&1
) else (
  echo Node.js not found. >> bot.log
)
