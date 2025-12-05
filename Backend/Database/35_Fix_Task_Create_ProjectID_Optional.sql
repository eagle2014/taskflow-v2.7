-- =============================================
-- Fix: Make ProjectID optional in sp_Task_Create
-- Purpose: Allow creating subtasks without project
-- =============================================

USE DB_PMS;
GO

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_Create')
    DROP PROCEDURE sp_Task_Create;
GO

CREATE PROCEDURE sp_Task_Create
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER = NULL,  -- ✅ Changed: Added = NULL to make it optional
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
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Auto-assign Order if not provided
    -- For subtasks (with ParentTaskID), order within parent
    -- For top-level tasks, order within project
    IF @Order IS NULL
    BEGIN
        IF @ParentTaskID IS NOT NULL
        BEGIN
            -- Subtask: order within parent
            SELECT @Order = ISNULL(MAX([Order]), 0) + 1
            FROM Tasks
            WHERE SiteID = @SiteID AND ParentTaskID = @ParentTaskID;
        END
        ELSE IF @ProjectID IS NOT NULL
        BEGIN
            -- Top-level task: order within project
            SELECT @Order = ISNULL(MAX([Order]), 0) + 1
            FROM Tasks
            WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND ParentTaskID IS NULL;
        END
        ELSE
        BEGIN
            -- Orphan task: order within site
            SELECT @Order = ISNULL(MAX([Order]), 0) + 1
            FROM Tasks
            WHERE SiteID = @SiteID AND ProjectID IS NULL AND ParentTaskID IS NULL;
        END
    END

    INSERT INTO Tasks (
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        DueDate, StartDate,
        EstimatedHours, ActualHours, Progress,
        Budget, Spent,
        Tags,
        CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @TaskID, @SiteID, @ProjectID, @PhaseID, @ParentTaskID, @Order,
        @Title, @Description, @Status, @Priority, @AssigneeID,
        @DueDate, @StartDate,
        @EstimatedHours, @ActualHours, @Progress,
        @Budget, @Spent,
        @Tags,
        @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );

    -- Return created task
    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Budget, Spent,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE TaskID = @TaskID;
END
GO

PRINT 'Fixed: sp_Task_Create now allows ProjectID to be NULL for subtasks';
GO