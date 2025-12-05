# Kill process on port 5600 if exists
$port = 5600
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Killing process on port $port (PID: $process)..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Process killed successfully!" -ForegroundColor Green
}

Write-Host "Starting Vite dev server on port $port..." -ForegroundColor Cyan
npx vite
