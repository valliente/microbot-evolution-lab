@echo off
title Microbot Evolution Lab - Desktop Launcher
color 0B
echo =========================================================================
echo                   MICROBOT EVOLUTION LAB
echo       2D Autonomous Artificial Life & Genetic Simulation
echo =========================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if exist "dist-standalone\index.html" (
    echo [INFO] Launching offline standalone playable simulation...
    start "" "dist-standalone\index.html"
    goto END
)

if exist "dist\index.html" (
    echo [INFO] Opening built simulation distribution...
    start "" "dist\index.html"
    goto END
)

echo [INFO] Installing dependencies and launching live development server...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not detected in PATH.
    echo Please open dist-standalone\index.html directly in any web browser!
    pause
    exit /b 1
)

call npm install
call npm run dev -- --open

:END
echo.
echo [SUCCESS] Microbot Evolution Lab is now running!
timeout /t 3 >nul
