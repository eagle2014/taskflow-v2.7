-- =============================================
-- Migration: Add SectionName column to Tasks table
-- Purpose: Support subtask grouping by sections
-- Date: 2025-01-28
-- =============================================

USE TaskFlowDB_Dev;
GO

-- Add SectionName column to Tasks table
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('Tasks')
    AND name = 'SectionName'
)
BEGIN
    ALTER TABLE Tasks
    ADD SectionName NVARCHAR(100) NULL;

    PRINT 'SectionName column added to Tasks table successfully.';
END
ELSE
BEGIN
    PRINT 'SectionName column already exists in Tasks table.';
END
GO

-- Create index for better query performance when filtering by SectionName
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Tasks_SectionName'
    AND object_id = OBJECT_ID('Tasks')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Tasks_SectionName
    ON Tasks(SectionName)
    WHERE SectionName IS NOT NULL;

    PRINT 'Index IX_Tasks_SectionName created successfully.';
END
ELSE
BEGIN
    PRINT 'Index IX_Tasks_SectionName already exists.';
END
GO

-- Update stored procedures to include SectionName

-- =============================================
-- Update sp_GetTasksByProject to include SectionName
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_GetTasksByProject') AND type in (N'P', N'PC'))
DROP PROCEDURE sp_GetTasksByProject;
GO

CREATE PROCEDURE sp_GetTasksByProject
    @ProjectID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        [Order],
        Title,
        Description,
        Status,
        Priority,
        AssigneeID,
        DueDate,
        StartDate,
        EstimatedHours,
        ActualHours,
        Progress,
        Budget,
        Spent,
        Tags,
        SectionName,
        CreatedBy,
        CreatedAt,
        UpdatedAt
    FROM Tasks
    WHERE ProjectID = @ProjectID
    AND SiteID = @SiteID
    AND IsDeleted = 0
    ORDER BY [Order], CreatedAt;
END
GO

-- =============================================
-- Update sp_GetTaskByID to include SectionName
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_GetTaskByID') AND type in (N'P', N'PC'))
DROP PROCEDURE sp_GetTaskByID;
GO

CREATE PROCEDURE sp_GetTaskByID
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        [Order],
        Title,
        Description,
        Status,
        Priority,
        AssigneeID,
        DueDate,
        StartDate,
        EstimatedHours,
        ActualHours,
        Progress,
        Budget,
        Spent,
        Tags,
        SectionName,
        CreatedBy,
        CreatedAt,
        UpdatedAt
    FROM Tasks
    WHERE TaskID = @TaskID
    AND SiteID = @SiteID
    AND IsDeleted = 0;
END
GO

-- =============================================
-- Update sp_CreateTask to include SectionName
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_CreateTask') AND type in (N'P', N'PC'))
DROP PROCEDURE sp_CreateTask;
GO

CREATE PROCEDURE sp_CreateTask
    @TaskID UNIQUEIDENTIFIER OUTPUT,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Order INT = NULL,
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50) = 'todo',
    @Priority NVARCHAR(50) = 'medium',
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @DueDate DATETIME = NULL,
    @StartDate DATETIME = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL,
    @Progress INT = 0,
    @Budget DECIMAL(18,2) = NULL,
    @Spent DECIMAL(18,2) = NULL,
    @Tags NVARCHAR(500) = NULL,
    @SectionName NVARCHAR(100) = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SET @TaskID = NEWID();

    INSERT INTO Tasks (
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        DueDate, StartDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @TaskID, @SiteID, @ProjectID, @PhaseID, @ParentTaskID, @Order,
        @Title, @Description, @Status, @Priority, @AssigneeID,
        @DueDate, @StartDate, @EstimatedHours, @ActualHours, @Progress,
        @Budget, @Spent, @Tags, @SectionName, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        DueDate, StartDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    FROM Tasks
    WHERE TaskID = @TaskID;
END
GO

-- =============================================
-- Update sp_UpdateTask to include SectionName
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_UpdateTask') AND type in (N'P', N'PC'))
DROP PROCEDURE sp_UpdateTask;
GO

CREATE PROCEDURE sp_UpdateTask
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Order INT = NULL,
    @Title NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50) = NULL,
    @Priority NVARCHAR(50) = NULL,
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @DueDate DATETIME = NULL,
    @StartDate DATETIME = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL,
    @Progress INT = NULL,
    @Budget DECIMAL(18,2) = NULL,
    @Spent DECIMAL(18,2) = NULL,
    @Tags NVARCHAR(500) = NULL,
    @SectionName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET
        PhaseID = ISNULL(@PhaseID, PhaseID),
        ParentTaskID = CASE WHEN @ParentTaskID IS NOT NULL THEN @ParentTaskID ELSE ParentTaskID END,
        [Order] = ISNULL(@Order, [Order]),
        Title = ISNULL(@Title, Title),
        Description = ISNULL(@Description, Description),
        Status = ISNULL(@Status, Status),
        Priority = ISNULL(@Priority, Priority),
        AssigneeID = CASE WHEN @AssigneeID IS NOT NULL THEN @AssigneeID ELSE AssigneeID END,
        DueDate = CASE WHEN @DueDate IS NOT NULL THEN @DueDate ELSE DueDate END,
        StartDate = CASE WHEN @StartDate IS NOT NULL THEN @StartDate ELSE StartDate END,
        EstimatedHours = ISNULL(@EstimatedHours, EstimatedHours),
        ActualHours = ISNULL(@ActualHours, ActualHours),
        Progress = ISNULL(@Progress, Progress),
        Budget = ISNULL(@Budget, Budget),
        Spent = ISNULL(@Spent, Spent),
        Tags = ISNULL(@Tags, Tags),
        SectionName = ISNULL(@SectionName, SectionName),
        UpdatedAt = GETUTCDATE()
    WHERE TaskID = @TaskID
    AND SiteID = @SiteID
    AND IsDeleted = 0;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        DueDate, StartDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    FROM Tasks
    WHERE TaskID = @TaskID
    AND SiteID = @SiteID
    AND IsDeleted = 0;
END
GO

PRINT 'Migration 28_Add_SectionName_To_Tasks completed successfully.';
GO
