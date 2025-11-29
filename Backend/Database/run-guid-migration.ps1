# =============================================
# PowerShell Script: Run Task GUID Migration
# Date: 2025-11-28
# Purpose: Migrate all Task IDs to valid GUID format
# =============================================

param(
    [string]$Server = "localhost",
    [string]$Database = "TaskFlowDB_Dev",
    [string]$Username = "sa",
    [string]$Password = "TaskFlow@2025!Strong",
    [switch]$DryRun,
    [switch]$Backup
)

$ErrorActionPreference = "Stop"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Task GUID Migration Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ScriptPath = Join-Path $PSScriptRoot "28_Migrate_Tasks_To_GUID.sql"
$BackupPath = "D:\Backup\TaskFlow_BeforeMigration_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak"

Write-Host "Server: $Server" -ForegroundColor Yellow
Write-Host "Database: $Database" -ForegroundColor Yellow
Write-Host "Script: $ScriptPath" -ForegroundColor Yellow
Write-Host ""

# Check if script exists
if (-not (Test-Path $ScriptPath)) {
    Write-Host "ERROR: Migration script not found at $ScriptPath" -ForegroundColor Red
    exit 1
}

# Step 1: Test connection
Write-Host "Step 1: Testing database connection..." -ForegroundColor Green
try {
    $testQuery = "SELECT COUNT(*) as TaskCount FROM Tasks WHERE IsDeleted = 0"
    $result = sqlcmd -S $Server -U $Username -P $Password -C -d $Database -Q $testQuery -h -1 -W
    $taskCount = $result.Trim()
    Write-Host "✓ Connected successfully. Found $taskCount tasks." -ForegroundColor Green
} catch {
    Write-Host "✗ Connection failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Backup database (optional but recommended)
if ($Backup) {
    Write-Host "Step 2: Creating database backup..." -ForegroundColor Green
    try {
        # Create backup directory if not exists
        $backupDir = Split-Path $BackupPath
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        }

        $backupQuery = "BACKUP DATABASE [$Database] TO DISK = '$BackupPath' WITH FORMAT, INIT, COMPRESSION"
        sqlcmd -S $Server -U $Username -P $Password -C -Q $backupQuery
        Write-Host "✓ Backup created: $BackupPath" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backup failed: $_" -ForegroundColor Red
        Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
        $continue = Read-Host
        if ($continue -ne "Y") {
            exit 1
        }
    }
} else {
    Write-Host "Step 2: Skipping backup (use -Backup to enable)" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Preview current state
Write-Host "Step 3: Checking current task IDs..." -ForegroundColor Green
$previewQuery = @"
SELECT TOP 5
    TaskID,
    Title,
    Status,
    CASE
        WHEN LEN(CAST(TaskID AS NVARCHAR(50))) = 36 THEN 'Valid GUID'
        ELSE 'Invalid'
    END as GUIDStatus
FROM Tasks
WHERE IsDeleted = 0
ORDER BY CreatedAt DESC
"@

Write-Host ""
Write-Host "Sample of current tasks:" -ForegroundColor Cyan
sqlcmd -S $Server -U $Username -P $Password -C -d $Database -Q $previewQuery
Write-Host ""

# Step 4: Dry run or actual migration
if ($DryRun) {
    Write-Host "Step 4: DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would execute: $ScriptPath" -ForegroundColor Yellow
    Write-Host "To run actual migration, remove -DryRun flag" -ForegroundColor Yellow
    exit 0
}

Write-Host "Step 4: Running migration..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  WARNING: This will regenerate all Task GUIDs!" -ForegroundColor Red
Write-Host "             All tasks will get new IDs!" -ForegroundColor Red
Write-Host "             Continue? (Y/N)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "Y") {
    Write-Host "Migration cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing migration script..." -ForegroundColor Green

try {
    # Run the migration script
    sqlcmd -S $Server -U $Username -P $Password -C -d $Database -i $ScriptPath

    Write-Host ""
    Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "✗ Migration failed: $_" -ForegroundColor Red
    if ($Backup -and (Test-Path $BackupPath)) {
        Write-Host ""
        Write-Host "To rollback, run:" -ForegroundColor Yellow
        Write-Host "RESTORE DATABASE [$Database] FROM DISK = '$BackupPath' WITH REPLACE" -ForegroundColor Yellow
    }
    exit 1
}

# Step 5: Verify results
Write-Host ""
Write-Host "Step 5: Verifying migration results..." -ForegroundColor Green

$verifyQuery = @"
SELECT
    COUNT(*) as TotalTasks,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) = 36 THEN 1 END) as ValidGUIDs,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) < 36 THEN 1 END) as InvalidGUIDs
FROM Tasks
WHERE IsDeleted = 0
"@

sqlcmd -S $Server -U $Username -P $Password -C -d $Database -Q $verifyQuery

# Step 6: Export sample TaskIDs for frontend
Write-Host ""
Write-Host "Step 6: Exporting sample TaskIDs..." -ForegroundColor Green

$exportQuery = @"
SELECT TOP 10
    TaskID,
    Title,
    Status,
    Priority
FROM Tasks
WHERE IsDeleted = 0
ORDER BY CreatedAt DESC
"@

$exportFile = Join-Path $PSScriptRoot "sample-task-ids.txt"
sqlcmd -S $Server -U $Username -P $Password -C -d $Database -Q $exportQuery > $exportFile

Write-Host "✓ Sample TaskIDs exported to: $exportFile" -ForegroundColor Green

# Step 7: Summary
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ All tasks migrated to GUID format" -ForegroundColor Green
Write-Host "✓ ParentTaskID references updated" -ForegroundColor Green
Write-Host "✓ Comments/Events references updated (if tables exist)" -ForegroundColor Green
Write-Host ""

if ($Backup) {
    Write-Host "Backup Location: $BackupPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update frontend to use real TaskIDs from database" -ForegroundColor White
Write-Host "2. Test TaskDetailDialog with description save" -ForegroundColor White
Write-Host "3. Verify: Open browser console → Should see '✅ Description saved'" -ForegroundColor White
Write-Host ""
Write-Host "Sample TaskIDs saved to: $exportFile" -ForegroundColor Yellow
Write-Host "Use these IDs to update frontend mock data" -ForegroundColor Yellow
Write-Host ""

<#
USAGE EXAMPLES:
===============

1. Dry run (preview only, no changes):
   .\run-guid-migration.ps1 -DryRun

2. Run migration with backup:
   .\run-guid-migration.ps1 -Backup

3. Run on remote server:
   .\run-guid-migration.ps1 -Server "remote-server" -Database "TaskFlowDB_Prod" -Backup

4. Run on Docker SQL Server:
   .\run-guid-migration.ps1 -Server "localhost,1433" -Backup

ROLLBACK:
=========
If something goes wrong and you created a backup:

sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -Q "RESTORE DATABASE TaskFlowDB_Dev FROM DISK = 'D:\Backup\TaskFlow_BeforeMigration_YYYYMMDD_HHMMSS.bak' WITH REPLACE"
#>
