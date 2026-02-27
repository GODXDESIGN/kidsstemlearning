@echo off
echo ===================================================
echo Kids Educational App - Backend Server Startup
echo ===================================================

:: 1. Force a path reload in the local session in case they didn't restart
set PATH=%PATH%;"C:\Program Files\nodejs\"

:: 2. Check explicitly if node exists now
node -v >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is STILL not recognized! 
    echo Did you finish running the installer from nodejs.org?
    echo Please make sure you closed ALL open windows and restarted your computer if necessary.
    echo.
    echo Press any key to close this window...
    pause >nul
    exit /b
)

:: 3. Check for dependencies
if not exist "node_modules\" (
    echo [INFO] First time setup. Installing dependencies...
    call npm install express cors sqlite3
)

:: 4. Start Server
echo [INFO] Starting the Node.js API server...
node server.js

:: 5. Keep window open if server crashes
echo.
echo [SERVER CLOSED OR CRASHED] 
pause
