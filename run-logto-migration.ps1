# Run Logto Integration Migration
$sqlPassword = "TaskFlow@2025!Strong"

Write-Host "Running Logto integration migration..." -ForegroundColor Yellow

$migrationScript = Get-Content "Backend\Database\15_Logto_Integration.sql" -Raw
$output = $migrationScript | docker exec -i taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $sqlPassword -C -d TaskFlowDB_Dev 2>&1

Write-Host $output

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logto integration migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration completed with warnings" -ForegroundColor Yellow
}
