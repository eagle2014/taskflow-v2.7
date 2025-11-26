# Get SiteID for testing
$password = "TaskFlow@2025!Strong"

Write-Host "Getting SiteID for ACME Corporation..." -ForegroundColor Yellow
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $password -C -d TaskFlowDB_Dev -Q "SELECT CAST(SiteID AS VARCHAR(36)) AS SiteID, SiteCode, SiteName FROM Sites WHERE SiteCode = 'ACME'"