# GitHub va Render uchun yordamchi skript
# Ishlatish: PowerShell da .\deploy-github.ps1

Write-Host "=== Tarjimon bot — GitHub ga yuklash ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1-qadam: GitHub da repozitoriy yarating (agar yo'q bo'lsa):" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor White
Write-Host "   - Repository name: tarjimon_bot" -ForegroundColor Gray
Write-Host "   - Public tanlang" -ForegroundColor Gray
Write-Host "   - README, .gitignore qo'shmang (bo'sh repo)" -ForegroundColor Gray
Write-Host ""
Write-Host "2-qadam: GitHub ga kiring va push qiling..." -ForegroundColor Yellow

git remote set-url origin https://github.com/bexruzabduraxmonov/tarjimon_bot.git
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Muvaffaqiyat! Kod GitHub ga yuklandi." -ForegroundColor Green
    Write-Host "Repozitoriy: https://github.com/bexruzabduraxmonov/tarjimon_bot" -ForegroundColor Green
    Write-Host ""
    Write-Host "3-qadam: Bot 24/7 ishlashi uchun Render.com ga ulang:" -ForegroundColor Yellow
    Write-Host "   1. https://render.com ga kiring (GitHub bilan login)" -ForegroundColor White
    Write-Host "   2. New + -> Blueprint" -ForegroundColor White
    Write-Host "   3. tarjimon.bot repozitoriyini tanlang" -ForegroundColor White
    Write-Host "   4. Apply -> BOT_TOKEN ni kiriting (@BotFather token)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push muvaffaqiyatsiz. GitHub ga login qilganingizni tekshiring." -ForegroundColor Red
    Write-Host "Brauzerda: GitHub -> Settings -> Developer settings -> Personal access tokens" -ForegroundColor Gray
}
