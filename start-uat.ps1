# TaskFlow UAT - Start Script
# Khởi động tất cả services cho UAT testing

param(
    [switch]$SkipSQL = $false
)

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TaskFlow UAT - Starting Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start SQL Server
if (-not $SkipSQL) {
    Write-Host "🗄️  Starting SQL Server..." -ForegroundColor Yellow
    docker-compose -f docker-compose.sql.yml up -d

    Write-Host "⏳ Waiting for SQL Server to initialize (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    Write-Host "✅ SQL Server started" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping SQL Server (already running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Services Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check SQL Server
Write-Host ""
Write-Host "🗄️  SQL Server:" -ForegroundColor Yellow
docker ps | Select-String "taskflow-sqlserver"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Next Steps for UAT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Start Backend API:" -ForegroundColor Green
Write-Host "   Open new PowerShell terminal and run:" -ForegroundColor White
Write-Host "   cd 'Backend\TaskFlow.API'" -ForegroundColor Gray
Write-Host "   dotnet run" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Start Frontend:" -ForegroundColor Green
Write-Host "   Open another PowerShell terminal and run:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Access Applications:" -ForegroundColor Green
Write-Host "   Backend Swagger: http://localhost:5001" -ForegroundColor Cyan
Write-Host "   Frontend:        http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "4️⃣  Sample Login Credentials:" -ForegroundColor Green
Write-Host "   Email:    admin@acme.com" -ForegroundColor Cyan
Write-Host "   Password: admin123" -ForegroundColor Cyan
Write-Host "   SiteCode: ACME" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Full UAT Guide: UAT-GUIDE.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Ready for UAT Testing! 🚀" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
