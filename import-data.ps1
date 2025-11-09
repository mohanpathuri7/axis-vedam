# Import data to AxisFinance database

Write-Host "🚀 Starting data import..." -ForegroundColor Cyan

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/flats" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Server is not running on http://localhost:4000" -ForegroundColor Red
    Write-Host "Please start the server first: cd server; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Import the Excel file
$excelFile = "D:\code\AxisFinance\Axis Vedam_ Residents Info.xlsx"

if (-Not (Test-Path $excelFile)) {
    Write-Host "❌ Excel file not found: $excelFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Found Excel file: $excelFile" -ForegroundColor Green
Write-Host "📤 Uploading to server..." -ForegroundColor Cyan

try {
    $uri = "http://localhost:4000/api/import/excel"
    
    # Use Form parameter for file upload
    $form = @{
        file = Get-Item -Path $excelFile
    }
    
    $response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
    
    Write-Host "✅ Import successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Import Summary:" -ForegroundColor Cyan
    Write-Host "  - Flats created: $($response.flatsCreated)" -ForegroundColor White
    Write-Host "  - Flats updated: $($response.flatsUpdated)" -ForegroundColor White
    Write-Host "  - Flatmates created: $($response.flatmatesCreated)" -ForegroundColor White
    Write-Host "  - Flatmates updated: $($response.flatmatesUpdated)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Data import complete! You can now use the application." -ForegroundColor Green
}
catch {
    Write-Host "❌ Import failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Server response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
    }
    exit 1
}

