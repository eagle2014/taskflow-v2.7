# Check password hash
$password = "TaskFlow@2025!Strong"

Write-Host "Checking password hash for admin@acme.com..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -d TaskFlowDB_Dev -Q "SELECT Email, PasswordHash FROM Users WHERE Email = 'admin@acme.com'"