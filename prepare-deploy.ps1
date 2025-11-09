# Quick Deployment Setup Script for Axis Vedam Finance
# Run this before deploying to Vercel

Write-Host "🚀 Axis Vedam Finance - Deployment Preparation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is initialized
if (-Not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check if files are added
Write-Host ""
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
git add .

# Check for changes
$changes = git status --porcelain
if ($changes) {
    Write-Host "✅ Files added to Git" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Files ready to commit:" -ForegroundColor Cyan
    git status --short
} else {
    Write-Host "ℹ️ No changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📖 Next Steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Commit your changes:" -ForegroundColor White
Write-Host '   git commit -m "Ready for deployment"' -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create GitHub repository at:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host "   - Name: axis-vedam-finance" -ForegroundColor Gray
Write-Host "   - Private repository (recommended)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host '   git remote add origin https://github.com/YOUR_USERNAME/axis-vedam-finance.git' -ForegroundColor Gray
Write-Host '   git branch -M main' -ForegroundColor Gray
Write-Host '   git push -u origin main' -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy on Vercel:" -ForegroundColor White
Write-Host "   - Go to: https://vercel.com/new" -ForegroundColor Gray
Write-Host "   - Import your GitHub repository" -ForegroundColor Gray
Write-Host "   - Add DATABASE_URL environment variable" -ForegroundColor Gray
Write-Host "   - Click Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
