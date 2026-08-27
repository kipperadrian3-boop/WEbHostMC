@echo off
title WebHostMC - Zu GitHub hochladen
cd /d "%~dp0"

echo ========================================================
echo   Lade deine Minecraft-Hosting-Website auf GitHub hoch
echo   Ziel: https://github.com/kipperadrian3-boop/WEbHostMC.git
echo ========================================================
echo.

git init
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/kipperadrian3-boop/WEbHostMC.git

git add .
git commit -m "WebHostMC Cloud Panel Release"
git push -u origin main

echo.
echo ========================================================
echo   FERTIG HOCHGELADEN!
echo   Deine Website ist jetzt in deinem GitHub-Repository!
echo ========================================================
pause
