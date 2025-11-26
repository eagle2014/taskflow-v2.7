# TaskFlow Automated Test Runner (PowerShell)
# Runs full stack with Docker Compose and executes E2E tests

param(
    [string]$ApiBaseUrl = "http://localhost:5001/api",
    [string]$SiteCode = "ACME",
    [int]$MaxWaitTime = 180
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TaskFlow Automated Test Suite" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   API URL: $ApiBaseUrl"
Write-Host "   Site Code: $SiteCode"
Write-Host "   Max Wait Time: ${MaxWaitTime}s"
Write-Host ""

# Step 1: Clean up existing containers
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null
Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 2: Start services
Write-Host "🚀 Starting Docker Compose services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for SQL Server
Write-Host "⏳ Waiting for SQL Server to be ready..." -ForegroundColor Yellow
$counter = 0
$sqlReady = $false

while (-not $sqlReady -and $counter -lt $MaxWaitTime) {
    try {
        $result = docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong" -Q "SELECT 1" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $sqlReady = $true
        }
    } catch {
        # Continue waiting
    }

    if (-not $sqlReady) {
        $counter++
        Write-Host "   Waiting for SQL Server... (${counter}s)"
        Start-Sleep -Seconds 1
    }
}

if (-not $sqlReady) {
    Write-Host "❌ SQL Server failed to start within ${MaxWaitTime} seconds" -ForegroundColor Red
    docker-compose logs sqlserver
    exit 1
}

Write-Host "✅ SQL Server is ready" -ForegroundColor Green
Write-Host ""

# Step 3: Initialize database
Write-Host "🗄️  Initializing database..." -ForegroundColor Yellow
docker-compose up db-init

$dbInitExitCode = docker inspect taskflow-db-init --format='{{.State.ExitCode}}'
if ($dbInitExitCode -ne "0") {
    Write-Host "❌ Database initialization failed" -ForegroundColor Red
    docker-compose logs db-init
    exit 1
}

Write-Host "✅ Database initialized successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for backend
Write-Host "⏳ Waiting for Backend API to be ready..." -ForegroundColor Yellow
$counter = 0
$backendReady = $false

while (-not $backendReady -and $counter -lt $MaxWaitTime) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
        }
    } catch {
        # Continue waiting
    }

    if (-not $backendReady) {
        $counter++
        Write-Host "   Waiting for Backend API... (${counter}s)"
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "❌ Backend failed to start within ${MaxWaitTime} seconds" -ForegroundColor Red
    docker-compose logs backend
    exit 1
}

Write-Host "✅ Backend API is ready" -ForegroundColor Green
Write-Host ""

# Step 5: Run E2E Tests
Write-Host "🧪 Running End-to-End Tests..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Set environment variables
$env:API_BASE_URL = $ApiBaseUrl
$env:SITE_CODE = $SiteCode

# Compile and run TypeScript test file
Write-Host "🔨 Running test script..." -ForegroundColor Yellow
npx tsx tests/e2e-test.ts

$testExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan

if ($testExitCode -eq 0) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "❌ TESTS FAILED" -ForegroundColor Red
}

# Step 6: Show logs if tests failed
if ($testExitCode -ne 0) {
    Write-Host ""
    Write-Host "📝 Backend Logs (last 50 lines):" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Cyan
    docker-compose logs --tail=50 backend
}

# Step 7: Cleanup (optional - comment out to keep running)
# Write-Host ""
# Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
# docker-compose down -v

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Test run completed" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

exit $testExitCode
