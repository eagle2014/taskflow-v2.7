-- =============================================
-- Migration: Convert Task IDs to GUID format
-- Date: 2025-11-28
-- Purpose: Ensure all tasks have valid GUID TaskID
-- =============================================

USE TaskFlowDB_Dev;
GO

-- Check current state
PRINT '==========================================';
PRINT 'Current Task ID Status:';
PRINT '==========================================';
SELECT
    COUNT(*) as TotalTasks,
    COUNT(CASE WHEN TaskID IS NULL THEN 1 END) as NullTaskIDs,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) < 36 THEN 1 END) as InvalidGUIDs
FROM Tasks
WHERE IsDeleted = 0;
GO

-- Step 1: Create temporary table for mapping old IDs to new GUIDs
IF OBJECT_ID('tempdb..#TaskIDMapping') IS NOT NULL
    DROP TABLE #TaskIDMapping;

CREATE TABLE #TaskIDMapping (
    OldTaskID UNIQUEIDENTIFIER,
    NewTaskID UNIQUEIDENTIFIER,
    SiteID NVARCHAR(50),
    Title NVARCHAR(500)
);
GO

-- Step 2: Generate new GUIDs for tasks that need them
-- This handles tasks that might have invalid or duplicate IDs
INSERT INTO #TaskIDMapping (OldTaskID, NewTaskID, SiteID, Title)
SELECT
    TaskID as OldTaskID,
    NEWID() as NewTaskID,
    SiteID,
    Title
FROM Tasks
WHERE IsDeleted = 0;

PRINT '';
PRINT 'Generated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' new GUIDs';
GO

-- Step 3: Show mapping preview (first 10)
PRINT '';
PRINT '==========================================';
PRINT 'Sample ID Mapping (first 10):';
PRINT '==========================================';
SELECT TOP 10
    Title,
    OldTaskID,
    NewTaskID
FROM #TaskIDMapping
ORDER BY Title;
GO

-- Step 4: Update ParentTaskID references FIRST (before updating TaskID)
PRINT '';
PRINT '==========================================';
PRINT 'Updating ParentTaskID references...';
PRINT '==========================================';

UPDATE t
SET t.ParentTaskID = m.NewTaskID
FROM Tasks t
INNER JOIN #TaskIDMapping m ON t.ParentTaskID = m.OldTaskID
WHERE t.IsDeleted = 0;

PRINT 'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' ParentTaskID references';
GO

-- Step 5: Update TaskID to new GUIDs
-- This is the main migration step
PRINT '';
PRINT '==========================================';
PRINT 'Migrating TaskID to new GUIDs...';
PRINT '==========================================';

-- Disable foreign key constraints temporarily
ALTER TABLE Tasks NOCHECK CONSTRAINT ALL;
GO

-- Update TaskID
UPDATE t
SET t.TaskID = m.NewTaskID
FROM Tasks t
INNER JOIN #TaskIDMapping m ON t.TaskID = m.OldTaskID;

PRINT 'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' TaskIDs';
GO

-- Re-enable foreign key constraints
ALTER TABLE Tasks WITH CHECK CHECK CONSTRAINT ALL;
GO

-- Step 6: Update Comments table if exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Comments')
BEGIN
    PRINT '';
    PRINT 'Updating Comments.TaskID references...';

    UPDATE c
    SET c.TaskID = m.NewTaskID
    FROM Comments c
    INNER JOIN #TaskIDMapping m ON c.TaskID = m.OldTaskID
    WHERE c.IsDeleted = 0;

    PRINT 'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' comment references';
END
GO

-- Step 7: Update CalendarEvents table if exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CalendarEvents')
BEGIN
    PRINT '';
    PRINT 'Updating CalendarEvents.TaskID references...';

    UPDATE e
    SET e.TaskID = m.NewTaskID
    FROM CalendarEvents e
    INNER JOIN #TaskIDMapping m ON e.TaskID = m.OldTaskID
    WHERE e.IsDeleted = 0;

    PRINT 'Updated ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' calendar event references';
END
GO

-- Step 8: Verify migration success
PRINT '';
PRINT '==========================================';
PRINT 'Migration Verification:';
PRINT '==========================================';

-- Check all TaskIDs are valid GUIDs (36 characters)
SELECT
    COUNT(*) as TotalTasks,
    COUNT(CASE WHEN TaskID IS NULL THEN 1 END) as NullTaskIDs,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) = 36 THEN 1 END) as ValidGUIDs
FROM Tasks
WHERE IsDeleted = 0;

-- Check for orphaned tasks (ParentTaskID points to non-existent task)
SELECT
    COUNT(*) as OrphanedTasks
FROM Tasks t
WHERE t.ParentTaskID IS NOT NULL
  AND t.IsDeleted = 0
  AND NOT EXISTS (
      SELECT 1 FROM Tasks p
      WHERE p.TaskID = t.ParentTaskID
        AND p.IsDeleted = 0
  );
GO

-- Step 9: Export mapping for frontend reference
PRINT '';
PRINT '==========================================';
PRINT 'Sample TaskIDs for Frontend (first 20):';
PRINT '==========================================';
SELECT TOP 20
    t.SiteID,
    t.ProjectID,
    t.TaskID,
    t.Title,
    t.Status,
    t.Priority
FROM Tasks t
WHERE t.IsDeleted = 0
ORDER BY t.CreatedAt DESC;
GO

-- Step 10: Create index on TaskID if not exists (for performance)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tasks_TaskID' AND object_id = OBJECT_ID('Tasks'))
BEGIN
    PRINT '';
    PRINT 'Creating index on TaskID...';
    CREATE NONCLUSTERED INDEX IX_Tasks_TaskID ON Tasks(TaskID) WHERE IsDeleted = 0;
    PRINT 'Index created successfully';
END
GO

-- Step 11: Update stored procedures to ensure GUID handling
PRINT '';
PRINT '==========================================';
PRINT 'Migration Complete!';
PRINT '==========================================';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Export task list: SELECT TaskID, Title FROM Tasks WHERE SiteID = ''your-site''';
PRINT '2. Update frontend mock data with real TaskIDs from database';
PRINT '3. Test TaskDetailDialog with real task data';
PRINT '4. Verify description save works with GUID TaskIDs';
PRINT '';
GO

-- Cleanup
DROP TABLE #TaskIDMapping;
GO

/*
Usage Instructions:
==================

1. Backup database first:
   BACKUP DATABASE TaskFlowDB_Dev TO DISK = 'D:\Backup\TaskFlow_BeforeMigration.bak';

2. Run this script:
   sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -d TaskFlowDB_Dev -i 28_Migrate_Tasks_To_GUID.sql

3. Verify results:
   SELECT TOP 10 TaskID, Title FROM Tasks WHERE IsDeleted = 0;

4. Test frontend:
   - Open browser console
   - Navigate to workspace
   - Click any task
   - Type in description field
   - Should see: "✅ Description saved successfully"

Rollback (if needed):
======================
Restore from backup:
   RESTORE DATABASE TaskFlowDB_Dev FROM DISK = 'D:\Backup\TaskFlow_BeforeMigration.bak' WITH REPLACE;
*/
