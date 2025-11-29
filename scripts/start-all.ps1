#!/usr/bin/env pwsh
# Start All Services Script
# Kills old processes on ports 5600 (frontend) and 5001 (backend), then starts both

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TaskFlow - Start All Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to kill process on port
function Kill-ProcessOnPort {
    param (
        [int]$Port,
        [string]$ServiceName
    )

    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

    if ($process) {
        Write-Host "[$ServiceName] Killing process on port $Port (PID: $process)..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Host "[$ServiceName] Process killed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[$ServiceName] Port $Port is available" -ForegroundColor Green
    }
}

# Kill processes on both ports
Kill-ProcessOnPort -Port 5600 -ServiceName "Frontend"
Kill-ProcessOnPort -Port 5001 -ServiceName "Backend"

Write-Host "`n----------------------------------------" -ForegroundColor Cyan

# Start Backend in new window
Write-Host "[Backend] Starting .NET API on port 5001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\Backend\TaskFlow.API'; dotnet run" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "[Frontend] Starting Vite on port 5600..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; npm run dev:raw" -WindowStyle Normal

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Services Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nFrontend: http://localhost:5600" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5001`n" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
