@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"

if not exist "%BACKEND_DIR%\main.py" (
  echo [ERROR] Backend not found at "%BACKEND_DIR%".
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\.env" if exist "%BACKEND_DIR%\.env.example" (
  copy /y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
)

if not exist "%ROOT%\.env" if exist "%ROOT%\.env.example" (
  copy /y "%ROOT%\.env.example" "%ROOT%\.env" >nul
)

start "Gavell Backend API" cmd /k "cd /d ""%BACKEND_DIR%"" && python main.py"
start "Gavell Frontend" cmd /k "cd /d ""%ROOT%"" && npm run dev -- --host 127.0.0.1 --port 5173"

echo Started backend and frontend.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo Admin:    http://127.0.0.1:5173/admin/login

endlocal
