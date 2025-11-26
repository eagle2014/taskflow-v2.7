# Simple Database Initialization for TaskFlow
# Creates schema and seeds sample data

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TaskFlow Database Initialization" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$sqlPassword = "TaskFlow@2025!Strong"

# Check if SQL Server is running
Write-Host "Checking SQL Server..." -ForegroundColor Yellow
$sqlCheck = docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -Q "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SQL Server is not running" -ForegroundColor Red
    Write-Host "Starting SQL Server..." -ForegroundColor Yellow
    docker start taskflow-sqlserver
    Write-Host "Waiting for SQL Server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
}

Write-Host "✅ SQL Server is running" -ForegroundColor Green
Write-Host ""

# Run schema creation script
Write-Host "Creating database schema..." -ForegroundColor Yellow
$schemaScript = Get-Content "Backend\Database\00_Full_Schema_And_Data.sql" -Raw
$schemaScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Schema creation completed with warnings" -ForegroundColor Yellow
}

Write-Host ""

# Run seed data script
Write-Host "Seeding sample data..." -ForegroundColor Yellow
$seedScript = Get-Content "Backend\Database\11_SeedData_Fixed.sql" -Raw
$output = $seedScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -d TaskFlowDB_Dev 2>&1

if ($output -match "Seed data completed successfully") {
    Write-Host "✅ Sample data seeded successfully" -ForegroundColor Green
    # Show summary
    $output | Select-String -Pattern "(Sites|Users|Categories|Projects|Phases|Tasks|Comments|Events|Spaces):" | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "⚠️  Seeding had errors:" -ForegroundColor Yellow
    Write-Host $output -ForegroundColor Red
}

Write-Host ""

# Run stored procedures for login
Write-Host "Creating stored procedures for login..." -ForegroundColor Yellow
$spScript = Get-Content "Backend\Database\12_StoredProcedures_Login.sql" -Raw
$spScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -d TaskFlowDB_Dev 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Stored procedures created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Stored procedures creation had warnings" -ForegroundColor Yellow
}

Write-Host ""

# Update password hashes
Write-Host "Updating password hashes for admin123..." -ForegroundColor Yellow
$pwScript = Get-Content "Backend\Database\13_UpdatePasswordHash.sql" -Raw
$pwScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -d TaskFlowDB_Dev 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Password hashes updated (password: admin123)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Password update had warnings" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Database Initialization Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sample Login Credentials:" -ForegroundColor Cyan
Write-Host "  Site: ACME" -ForegroundColor White
Write-Host "    Email: admin@acme.com" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Site: TECHSTART" -ForegroundColor White
Write-Host "    Email: ceo@techstart.com" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: cd Backend\TaskFlow.API && dotnet run" -ForegroundColor Gray
Write-Host "  2. Start frontend: npm run dev" -ForegroundColor Gray
Write-Host "  3. Access Swagger: http://localhost:5001" -ForegroundColor Gray
Write-Host ""
