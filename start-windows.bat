@echo off
echo.
echo  Starting EduPulse...
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  ERROR: Node.js not found.
  echo  Download from https://nodejs.org ^(use v18 or higher^)
  pause
  exit /b 1
)

:: Install backend deps if needed
if not exist "backend\node_modules" (
  echo  Installing backend dependencies...
  cd backend && npm install && cd ..
)

:: Install client deps if needed
if not exist "client\node_modules" (
  echo  Installing client dependencies...
  cd client && npm install && cd ..
)

:: Seed database once
if not exist ".seeded" (
  echo  Seeding database with sample data...
  cd backend && node seed.js && cd ..
  type nul > .seeded
)

echo.
echo  Starting backend on http://localhost:5000
start "EduPulse Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo  Starting frontend on http://localhost:3000
start "EduPulse Frontend" cmd /k "cd client && npm start"

echo.
echo  EduPulse is running!
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo    Demo login: student@elearn.dev / password123
echo.
pause
