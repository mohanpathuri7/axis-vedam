# AxisFinance - Start Both Servers
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting AxisFinance" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking PostgreSQL database..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    # Check if postgres container is running
    $postgresRunning = docker ps --filter "name=axisfinance-postgres" --format "{{.Names}}"
    if (-not $postgresRunning) {
        Write-Host "Starting database..." -ForegroundColor Yellow
        docker-compose up -d
        Start-Sleep -Seconds 3
    }
    Write-Host "✓ Database is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\code\AxisFinance\server; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Backend server starting in new window" -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\code\AxisFinance; Write-Host 'Frontend Starting...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Frontend starting in new window" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AxisFinance Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Two PowerShell windows have opened with the servers." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
