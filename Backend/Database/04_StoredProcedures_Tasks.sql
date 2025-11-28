-- =============================================
-- Task Stored Procedures
-- Purpose: CRUD operations for Tasks table
-- =============================================

USE TaskFlowDB_Dev;
GO

-- =============================================
-- sp_Task_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetAll')
    DROP PROCEDURE sp_Task_GetAll;
GO

CREATE PROCEDURE sp_Task_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID AND IsDeleted = 0
    ORDER BY ProjectID, ISNULL([Order], 999), CreatedAt;
END
GO

-- =============================================
-- sp_Task_GetById
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetById')
    DROP PROCEDURE sp_Task_GetById;
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
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID AND TaskID = @TaskID AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Task_Create
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_Create')
    DROP PROCEDURE sp_Task_Create;
GO

CREATE PROCEDURE sp_Task_Create
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
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Auto-assign Order if not provided
    IF @Order IS NULL
    BEGIN
        SELECT @Order = ISNULL(MAX([Order]), 0) + 1
        FROM Tasks
        WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND ParentTaskID IS NULL;
    END

    INSERT INTO Tasks (
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @TaskID, @SiteID, @ProjectID, @PhaseID, @ParentTaskID, @Order,
        @Title, @Description, @Status, @Priority, @AssigneeID,
        @StartDate, @DueDate, @EstimatedHours, @ActualHours, @Progress,
        @Tags, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE TaskID = @TaskID;
END
GO

-- =============================================
-- sp_Task_Update
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_Update')
    DROP PROCEDURE sp_Task_Update;
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
        PhaseID = ISNULL(@PhaseID, PhaseID),
        ParentTaskID = CASE WHEN @ParentTaskID IS NOT NULL THEN @ParentTaskID ELSE ParentTaskID END,
        [Order] = ISNULL(@Order, [Order]),
        Title = ISNULL(@Title, Title),
        Description = CASE WHEN @Description IS NOT NULL THEN @Description ELSE Description END,
        Status = ISNULL(@Status, Status),
        Priority = ISNULL(@Priority, Priority),
        AssigneeID = CASE WHEN @AssigneeID IS NOT NULL THEN @AssigneeID ELSE AssigneeID END,
        DueDate = CASE WHEN @DueDate IS NOT NULL THEN @DueDate ELSE DueDate END,
        StartDate = CASE WHEN @StartDate IS NOT NULL THEN @StartDate ELSE StartDate END,
        EstimatedHours = CASE WHEN @EstimatedHours IS NOT NULL THEN @EstimatedHours ELSE EstimatedHours END,
        ActualHours = CASE WHEN @ActualHours IS NOT NULL THEN @ActualHours ELSE ActualHours END,
        Progress = ISNULL(@Progress, Progress),
        Tags = CASE WHEN @Tags IS NOT NULL THEN @Tags ELSE Tags END,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND TaskID = @TaskID AND IsDeleted = 0;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE TaskID = @TaskID;
END
GO

-- =============================================
-- sp_Task_Delete
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_Delete')
    DROP PROCEDURE sp_Task_Delete;
GO

CREATE PROCEDURE sp_Task_Delete
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND TaskID = @TaskID;

    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

-- =============================================
-- sp_Task_GetByProject
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetByProject')
    DROP PROCEDURE sp_Task_GetByProject;
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
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND IsDeleted = 0
    ORDER BY ISNULL([Order], 999), CreatedAt;
END
GO

-- =============================================
-- sp_Task_GetByAssignee
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetByAssignee')
    DROP PROCEDURE sp_Task_GetByAssignee;
GO

CREATE PROCEDURE sp_Task_GetByAssignee
    @SiteID NVARCHAR(50),
    @AssigneeID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID AND AssigneeID = @AssigneeID AND IsDeleted = 0
    ORDER BY ISNULL([Order], 999), CreatedAt;
END
GO

-- =============================================
-- sp_Task_GetByStatus
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetByStatus')
    DROP PROCEDURE sp_Task_GetByStatus;
GO

CREATE PROCEDURE sp_Task_GetByStatus
    @SiteID NVARCHAR(50),
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID AND Status = @Status AND IsDeleted = 0
    ORDER BY ISNULL([Order], 999), CreatedAt;
END
GO

-- =============================================
-- sp_Task_GetOverdue
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetOverdue')
    DROP PROCEDURE sp_Task_GetOverdue;
GO

CREATE PROCEDURE sp_Task_GetOverdue
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
        AND DueDate < CAST(GETUTCDATE() AS DATE)
        AND Status != 'Completed'
    ORDER BY DueDate;
END
GO

-- =============================================
-- sp_Task_GetDueSoon
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Task_GetDueSoon')
    DROP PROCEDURE sp_Task_GetDueSoon;
GO

CREATE PROCEDURE sp_Task_GetDueSoon
    @SiteID NVARCHAR(50),
    @Days INT = 7
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
        AND DueDate BETWEEN CAST(GETUTCDATE() AS DATE) AND DATEADD(DAY, @Days, CAST(GETUTCDATE() AS DATE))
        AND Status != 'Completed'
    ORDER BY DueDate;
END
GO

PRINT '✓ Task stored procedures created successfully!';