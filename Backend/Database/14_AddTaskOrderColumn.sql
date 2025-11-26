-- =============================================
-- Add Order Column to Tasks Table
-- Purpose: Enable drag & drop task reordering persistence
-- =============================================

USE TaskFlowDB_Dev;
GO

PRINT 'Adding Order column to Tasks table...';

-- Add Order column if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('Tasks')
    AND name = 'Order'
)
BEGIN
    ALTER TABLE Tasks
    ADD [Order] INT NULL;

    PRINT 'Order column added to Tasks table';
END
ELSE
BEGIN
    PRINT 'Order column already exists in Tasks table';
END
GO

-- Set initial order values based on CreatedAt
IF EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('Tasks')
    AND name = 'Order'
)
BEGIN
    UPDATE Tasks
    SET [Order] = RowNum
    FROM (
        SELECT TaskID, ROW_NUMBER() OVER (PARTITION BY ProjectID ORDER BY CreatedAt) as RowNum
        FROM Tasks
        WHERE [Order] IS NULL
    ) AS OrderedTasks
    WHERE Tasks.TaskID = OrderedTasks.TaskID;

    PRINT 'Initial Order values set based on creation date';
END
GO

PRINT '✓ Task Order column migration completed!';