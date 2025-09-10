@echo off
echo ========================================================
echo   Starting Music Recommendation System (Dev)
echo ========================================================

echo Starting Backend on http://localhost:8000...
start "Music Recommendation Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend on http://localhost:3000...
start "Music Recommendation Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application ready!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/docs
echo ========================================================
