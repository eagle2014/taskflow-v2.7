-- Migration: Add Budget and Spent columns to Tasks table
-- Date: 2024-11-30
-- Description: Tasks need Budget and Spent fields for custom fields in task detail

USE DB_PMS;
GO

-- Add Budget column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Tasks') AND name = 'Budget')
BEGIN
    ALTER TABLE Tasks ADD Budget DECIMAL(18,2) NULL;
    PRINT 'Budget column added to Tasks table';
END
ELSE
BEGIN
    PRINT 'Budget column already exists in Tasks table';
END
GO

-- Add Spent column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Tasks') AND name = 'Spent')
BEGIN
    ALTER TABLE Tasks ADD Spent DECIMAL(18,2) NULL;
    PRINT 'Spent column added to Tasks table';
END
ELSE
BEGIN
    PRINT 'Spent column already exists in Tasks table';
END
GO

-- Update sp_Task_Insert to include Budget and Spent
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_Insert')
BEGIN
    DROP PROCEDURE sp_Task_Insert;
END
GO

CREATE PROCEDURE sp_Task_Insert
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Order INT = NULL,
    @Title NVARCHAR(500),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50) = 'To Do',
    @Priority NVARCHAR(50) = 'Medium',
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @DueDate DATE = NULL,
    @StartDate DATE = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL,
    @Progress INT = 0,
    @Budget DECIMAL(18,2) = NULL,
    @Spent DECIMAL(18,2) = NULL,
    @Tags NVARCHAR(MAX) = NULL,
    @SectionName NVARCHAR(200) = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Tasks (
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        DueDate, StartDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    )
    VALUES (
        @TaskID, @SiteID, @ProjectID, @PhaseID, @ParentTaskID, @Order,
        @Title, @Description, @Status, @Priority, @AssigneeID,
        @DueDate, @StartDate, @EstimatedHours, @ActualHours, @Progress,
        @Budget, @Spent, @Tags, @SectionName, @CreatedBy, GETUTCDATE(), GETUTCDATE()
    );

    SELECT * FROM Tasks WHERE TaskID = @TaskID;
END
GO
PRINT 'sp_Task_Insert updated with Budget and Spent';
GO

-- Update sp_Task_Update to include Budget and Spent
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_Update')
BEGIN
    DROP PROCEDURE sp_Task_Update;
END
GO

CREATE PROCEDURE sp_Task_Update
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Order INT = NULL,
    @Title NVARCHAR(500) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50) = NULL,
    @Priority NVARCHAR(50) = NULL,
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @DueDate DATE = NULL,
    @StartDate DATE = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL,
    @Progress INT = NULL,
    @Budget DECIMAL(18,2) = NULL,
    @Spent DECIMAL(18,2) = NULL,
    @Tags NVARCHAR(MAX) = NULL,
    @SectionName NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET
        PhaseID = COALESCE(@PhaseID, PhaseID),
        ParentTaskID = COALESCE(@ParentTaskID, ParentTaskID),
        [Order] = COALESCE(@Order, [Order]),
        Title = COALESCE(@Title, Title),
        Description = COALESCE(@Description, Description),
        Status = COALESCE(@Status, Status),
        Priority = COALESCE(@Priority, Priority),
        AssigneeID = COALESCE(@AssigneeID, AssigneeID),
        DueDate = COALESCE(@DueDate, DueDate),
        StartDate = COALESCE(@StartDate, StartDate),
        EstimatedHours = COALESCE(@EstimatedHours, EstimatedHours),
        ActualHours = COALESCE(@ActualHours, ActualHours),
        Progress = COALESCE(@Progress, Progress),
        Budget = COALESCE(@Budget, Budget),
        Spent = COALESCE(@Spent, Spent),
        Tags = COALESCE(@Tags, Tags),
        SectionName = COALESCE(@SectionName, SectionName),
        UpdatedAt = GETUTCDATE()
    WHERE TaskID = @TaskID AND SiteID = @SiteID AND IsDeleted = 0;

    SELECT * FROM Tasks WHERE TaskID = @TaskID AND SiteID = @SiteID;
END
GO
PRINT 'sp_Task_Update updated with Budget and Spent';
GO

-- Update sp_Task_GetById to include Budget and Spent (if needed)
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_GetById')
BEGIN
    DROP PROCEDURE sp_Task_GetById;
END
GO

CREATE PROCEDURE sp_Task_GetById
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    FROM Tasks
    WHERE TaskID = @TaskID AND SiteID = @SiteID AND IsDeleted = 0;
END
GO
PRINT 'sp_Task_GetById updated with Budget and Spent';
GO

-- Update sp_Task_GetAll to include Budget and Spent
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_GetAll')
BEGIN
    DROP PROCEDURE sp_Task_GetAll;
END
GO

CREATE PROCEDURE sp_Task_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    FROM Tasks
    WHERE SiteID = @SiteID AND IsDeleted = 0
    ORDER BY [Order], CreatedAt DESC;
END
GO
PRINT 'sp_Task_GetAll updated with Budget and Spent';
GO

-- Update sp_Task_GetByProject
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_GetByProject')
BEGIN
    DROP PROCEDURE sp_Task_GetByProject;
END
GO

CREATE PROCEDURE sp_Task_GetByProject
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, SectionName, CreatedBy, CreatedAt, UpdatedAt
    FROM Tasks
    WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND IsDeleted = 0
    ORDER BY [Order], CreatedAt DESC;
END
GO
PRINT 'sp_Task_GetByProject updated with Budget and Spent';
GO

PRINT '=== Migration 32: Budget and Spent columns added to Tasks ===';