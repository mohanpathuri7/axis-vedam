# AxisFinance - Quick Setup and Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AxisFinance Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL
Write-Host ""
Write-Host "[2/6] Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 3
Write-Host "✓ Database started" -ForegroundColor Green

# Install server dependencies
Write-Host ""
Write-Host "[3/6] Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Generate Prisma client and run migrations
Write-Host ""
Write-Host "[4/6] Setting up database schema..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate deploy
Write-Host "✓ Database schema updated" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "[5/6] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[6/6] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a NEW terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd D:\code\AxisFinance" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "4. Go to Import page to upload your Excel file" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
