Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       MEDSENTINEL CPS - STARTING LOCAL SYSTEM          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Preparing Python backend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
python -m pip install -r requirements.txt
python seed.py

Write-Host "Starting FastAPI Backend server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn app.main:app --port 8000 --reload"

Write-Host "[2/3] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "System is active!" -ForegroundColor Green
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

