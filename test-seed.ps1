# Test seed script with error output
$password = "TaskFlow@2025!Strong"

Write-Host "Running seed script with verbose output..." -ForegroundColor Yellow
$seedScript = Get-Content "Backend\Database\10_SeedData_Sample.sql" -Raw

$result = $seedScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -d TaskFlowDB_Dev

Write-Host $result
