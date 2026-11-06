@echo off
title TaskFlow Launcher
echo ============================================================
echo           TaskFlow Manager - Starting Services
echo ============================================================
echo.

echo [1/3] Launching FastAPI Backend on http://localhost:8000 ...
start "TaskFlow Backend" cmd /k "cd /d ""%~dp0backend"" && ""%~dp0backend\venv\Scripts\python.exe"" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

ping 127.0.0.1 -n 4 >nul

echo [2/3] Launching React Vite Frontend on http://localhost:5173 ...
start "TaskFlow Frontend" cmd /k "set ""PATH=C:\Program Files\nodejs;%%PATH%%"" && cd /d ""%~dp0frontend"" && node ""node_modules\vite\bin\vite.js"" --host 127.0.0.1 --port 5173"

ping 127.0.0.1 -n 4 >nul

echo [3/3] Opening Google Chrome...
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:5173"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:5173"
) else (
    start "" "http://localhost:5173"
)

echo.
echo ============================================================
echo  TaskFlow Manager is running!
echo  Frontend URL : http://localhost:5173
echo  Backend URL  : http://localhost:8000
echo  Swagger Docs : http://localhost:8000/docs
echo ============================================================
