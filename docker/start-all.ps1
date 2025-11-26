# PowerShell script to start all 3 services independently

Write-Host "🚀 Starting TaskFlow services independently..." -ForegroundColor Cyan

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Start SQL Server first
Write-Host ""
Write-Host "1️⃣ Starting SQL Server..." -ForegroundColor Yellow
docker-compose -f sql.yml up -d

# Wait for SQL Server to be healthy
Write-Host "⏳ Waiting for SQL Server to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

$maxRetries = 20
$retryCount = 0
while ($retryCount -lt $maxRetries) {
    $result = docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -Q "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Write-Host "   Still waiting..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    $retryCount++
}

if ($retryCount -eq $maxRetries) {
    Write-Host "⚠️  SQL Server health check timeout, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "✅ SQL Server is ready!" -ForegroundColor Green
}

# Start Backend
Write-Host ""
Write-Host "2️⃣ Starting Backend API..." -ForegroundColor Yellow
docker-compose -f backend.yml up -d

Write-Host "⏳ Waiting for Backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 5
Write-Host "✅ Backend started!" -ForegroundColor Green

# Start Frontend
Write-Host ""
Write-Host "3️⃣ Starting Frontend..." -ForegroundColor Yellow
docker-compose -f frontend.yml up -d

Write-Host "⏳ Waiting for Frontend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 3
Write-Host "✅ Frontend started!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service URLs:" -ForegroundColor Cyan
Write-Host "   - SQL Server:  localhost:1433"
Write-Host "   - Backend API: http://localhost:5001"
Write-Host "   - Frontend:    http://localhost:3000"
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Cyan
Write-Host "   docker logs -f taskflow-sqlserver"
Write-Host "   docker logs -f taskflow-backend"
Write-Host "   docker logs -f taskflow-frontend"
Write-Host ""
Write-Host "🛑 Stop services:" -ForegroundColor Cyan
Write-Host "   cd docker; .\stop-all.ps1"
