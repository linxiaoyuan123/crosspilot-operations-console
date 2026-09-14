@echo off
setlocal
cd /d "%~dp0"
title CrossPilot

where node >nul 2>nul
if errorlevel 1 (
  echo [CrossPilot] Node.js was not found.
  echo Install Node.js 24 or newer from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\better-sqlite3\package.json" goto install
if not exist "node_modules\exceljs\package.json" goto install
if not exist "web\dist\index.html" goto install
goto launch

:install
echo [CrossPilot] Installing dependencies and building the web workspace...
where pnpm >nul 2>nul
if errorlevel 1 (
  call corepack enable
  if errorlevel 1 (
    echo [CrossPilot] pnpm was not found and corepack could not enable it.
    pause
    exit /b 1
  )
)
call pnpm install --frozen-lockfile
if errorlevel 1 (
  echo [CrossPilot] Dependency installation failed.
  pause
  exit /b 1
)
call pnpm run build
if errorlevel 1 (
  echo [CrossPilot] Web build failed.
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
