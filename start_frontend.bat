@echo off
title TaskFlow Frontend (Port 5173)
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0frontend"
echo Starting React Vite Frontend on http://127.0.0.1:5173 ...
node "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173
pause

