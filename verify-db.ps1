# Verify Database and Users
$password = "TaskFlow@2025!Strong"

Write-Host "Checking databases..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -Q "SELECT name FROM sys.databases WHERE name = 'TaskFlowDB_Dev'"

Write-Host ""
Write-Host "Checking users..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -d TaskFlowDB_Dev -Q "SELECT Email, Name, Role FROM Users WHERE IsDeleted = 0"

Write-Host ""
Write-Host "Checking sites..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -d TaskFlowDB_Dev -Q "SELECT SiteName, SiteCode FROM Sites"
