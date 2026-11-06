@echo off
title Push TaskFlow to GitHub
cd /d "%~dp0"
echo ============================================================
echo   Pushing TaskFlow Manager to GitHub:
echo   https://github.com/salonivarshney385/taskflow-manager.git
echo ============================================================
echo.
git push -u origin main
echo.
echo ============================================================
echo Finished! Press any key to close this window.
echo ============================================================
pause
