@echo off
setlocal
cd /d "%~dp0"
title CrossPilot

where node >nul 2>nul
if errorlevel 1 (
  echo [CrossPilot] Node.js was not found.
  echo Install Node.js 22.5 or newer from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\better-sqlite3\package.json" goto install
if not exist "node_modules\exceljs\package.json" goto install
goto launch

:install
echo [CrossPilot] Installing dependencies for the first run...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [CrossPilot] Dependency installation failed.
  pause
  exit /b 1
)

:launch
node "scripts\launch.mjs" %*
if errorlevel 1 (
  echo [CrossPilot] Startup failed.
  pause
  exit /b 1
)

endlocal
