# PowerShell script to stop all 3 services

Write-Host "🛑 Stopping TaskFlow services..." -ForegroundColor Yellow

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Stopping Frontend..." -ForegroundColor Gray
docker-compose -f frontend.yml down

Write-Host "Stopping Backend..." -ForegroundColor Gray
docker-compose -f backend.yml down

Write-Host "Stopping SQL Server..." -ForegroundColor Gray
docker-compose -f sql.yml down

Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 To remove all data:" -ForegroundColor Cyan
Write-Host "   docker-compose -f sql.yml down -v"
Write-Host "   Remove-Item -Recurse -Force sqlserver/data,sqlserver/log"
