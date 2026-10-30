@echo off
echo ========================================================
echo        MEDSENTINEL CPS - STARTING LOCAL SYSTEM
echo ========================================================
echo.

echo [1/3] Checking Python backend dependencies...
cd backend
python -m pip install -r requirements.txt
echo [2/3] Seeding initial CPS device and clinical database...
python seed.py
echo Starting FastAPI Backend server on http://127.0.0.1:8000 ...
start "MedSentinel Backend (Port 8000)" cmd /k "python -m uvicorn app.main:app --port 8000 --reload"

echo.
echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
cd ..\frontend
start "MedSentinel Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo ========================================================
echo System is launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Portal:  http://localhost:5173
echo ========================================================

