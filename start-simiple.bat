@echo off
echo Starting Ministry Messenger (Web Mode)
echo ======================================
echo.

REM Check if API dependencies are installed
if not exist "apps\api\node_modules" (
    echo Installing API dependencies...
    cd apps\api
    call pnpm install
    cd ..\..
)

REM Check if UI dependencies are installed
if not exist "apps\ui\node_modules" (
    echo Installing UI dependencies...
    cd apps\ui
    call pnpm install
    cd ..\..
)

echo.
echo Starting API on http://localhost:3001
echo Starting UI on http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

REM Start API in new window
start "Ministry API" cmd /k "cd apps\api && pnpm dev"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start UI in new window
start "Ministry UI" cmd /k "cd apps\ui && pnpm dev"

echo.
echo Both services started! Check the new windows.
pause