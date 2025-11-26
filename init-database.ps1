# Initialize TaskFlow Database
# Runs all SQL scripts to create schema, stored procedures, and seed data

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TaskFlow Database Initialization" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$sqlPassword = "TaskFlow@2025!Strong"
$dbName = "TaskFlowDB_Dev"

# Function to run SQL script
function Run-SQLScript {
    param(
        [string]$ScriptPath,
        [string]$Description
    )

    Write-Host "Running: $Description..." -ForegroundColor Yellow

    $scriptContent = Get-Content $ScriptPath -Raw

    # Replace GO statements with proper batch separator
    $batches = $scriptContent -split '\nGO\s*\n'

    foreach ($batch in $batches) {
        if ($batch.Trim() -ne "") {
            # Execute batch directly via stdin to avoid path issues
            $result = $batch | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd `
                -S localhost -U sa -P $sqlPassword -C -d $dbName 2>&1

            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error executing batch:" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
            }
        }
    }

    Write-Host "✅ $Description completed" -ForegroundColor Green
}

# Check if SQL Server is running
Write-Host "Checking SQL Server..." -ForegroundColor Yellow
$sqlCheck = docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -Q "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SQL Server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start SQL Server first:" -ForegroundColor Yellow
    Write-Host "   docker start taskflow-sqlserver" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ SQL Server is running" -ForegroundColor Green
Write-Host ""

# Create database if not exists
Write-Host "Creating database $dbName..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $sqlPassword -C `
    -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$dbName') CREATE DATABASE $dbName;" 2>&1 | Out-Null

Write-Host "✅ Database ready" -ForegroundColor Green
Write-Host ""

# Run schema script
Run-SQLScript -ScriptPath "Backend\Database\01_CreateSchema.sql" -Description "Schema Creation"

# Run stored procedures
Run-SQLScript -ScriptPath "Backend\Database\02_StoredProcedures_Users.sql" -Description "User Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\03_StoredProcedures_Projects.sql" -Description "Project Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\04_StoredProcedures_Tasks.sql" -Description "Task Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\05_StoredProcedures_Events.sql" -Description "Event Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\06_StoredProcedures_Comments.sql" -Description "Comment Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\07_StoredProcedures_Categories.sql" -Description "Category Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\08_StoredProcedures_Spaces.sql" -Description "Space Stored Procedures"
Run-SQLScript -ScriptPath "Backend\Database\09_StoredProcedures_Phases.sql" -Description "Phase Stored Procedures"

# Run seed data
Run-SQLScript -ScriptPath "Backend\Database\10_SeedData_Sample.sql" -Description "Sample Data Seeding"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Database Initialization Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Sample Login Credentials:" -ForegroundColor Yellow
Write-Host "  Site: ACME" -ForegroundColor Cyan
Write-Host "    Email: admin@acme.com" -ForegroundColor White
Write-Host "    Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "  Site: TECHSTART" -ForegroundColor Cyan
Write-Host "    Email: ceo@techstart.com" -ForegroundColor White
Write-Host "    Password: admin123" -ForegroundColor White
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend: cd Backend\TaskFlow.API && dotnet run" -ForegroundColor Gray
Write-Host "  2. Start frontend: npm run dev" -ForegroundColor Gray
Write-Host "  3. Access Swagger: http://localhost:5001" -ForegroundColor Gray
Write-Host ""
