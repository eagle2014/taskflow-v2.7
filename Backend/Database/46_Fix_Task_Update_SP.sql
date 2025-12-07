-- Migration: Fix sp_Task_Update stored procedure
-- Date: 2025-12-06
-- Description: Ensure sp_Task_Update has correct parameters for PhaseID, Budget, Spent

-- Try all possible database names to find the correct one
IF DB_NAME() NOT IN ('TaskFlowDB', 'TaskFlowDB_Dev', 'DB_PMS')
BEGIN
    PRINT 'Warning: Current database is ' + DB_NAME();
END
GO

-- Drop and recreate sp_Task_Update with all parameters
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_Update')
BEGIN
    DROP PROCEDURE sp_Task_Update;
    PRINT 'Dropped existing sp_Task_Update';
END
GO

CREATE PROCEDURE sp_Task_Update
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER,
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
    @Tags NVARCHAR(MAX) = NULL
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
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND TaskID = @TaskID AND IsDeleted = 0;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Budget, Spent, Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE TaskID = @TaskID AND SiteID = @SiteID;
END
GO

PRINT '✓ sp_Task_Update fixed with correct parameter order (SiteID first, then TaskID)';
GO