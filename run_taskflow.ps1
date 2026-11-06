# TaskFlow Manager - Full-Stack Launcher (PowerShell)
$root = $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          TaskFlow Manager - Starting Services" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start FastAPI Backend
Write-Host "[1/3] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendCmd = "cd /d `"$root\backend`" && `"$root\backend\venv\Scripts\python.exe`" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process "cmd.exe" -ArgumentList "/k", $backendCmd

Start-Sleep -Seconds 3

# 2. Start React Frontend
Write-Host "[2/3] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
$frontendCmd = "set `"PATH=C:\Program Files\nodejs;%PATH%`" && cd /d `"$root\frontend`" && node `"node_modules\vite\bin\vite.js`" --host 127.0.0.1 --port 5173"
Start-Process "cmd.exe" -ArgumentList "/k", $frontendCmd

Start-Sleep -Seconds 3

# 3. Open in Google Chrome
Write-Host "[3/3] Opening TaskFlow in Google Chrome ..." -ForegroundColor Green
$chromePaths = @(
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
)
$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Start-Process $path "http://localhost:5173"
        $chromeFound = $true
        break
    }
}
if (-not $chromeFound) {
    Start-Process "http://localhost:5173"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TaskFlow Manager is now running!" -ForegroundColor Cyan
Write-Host " Frontend : http://localhost:5173" -ForegroundColor White
Write-Host " Backend  : http://localhost:8000" -ForegroundColor White
Write-Host " Swagger  : http://localhost:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
