-- =============================================
-- Fix SiteID Parameter Type in Stored Procedures
-- Changes @SiteID from UNIQUEIDENTIFIER to NVARCHAR(50)
-- to match the actual database schema
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- USER STORED PROCEDURES
-- =============================================

IF OBJECT_ID('sp_User_GetByEmail', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetByEmail;
GO

CREATE PROCEDURE sp_User_GetByEmail
    @SiteID NVARCHAR(50),
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND Email = @Email
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_User_UpdateLastActive', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_UpdateLastActive;
GO

CREATE PROCEDURE sp_User_UpdateLastActive
    @SiteID NVARCHAR(50),
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET LastActive = GETUTCDATE(),
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND UserID = @UserID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_User_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetAll;
GO

CREATE PROCEDURE sp_User_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_User_GetById', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetById;
GO

CREATE PROCEDURE sp_User_GetById
    @SiteID NVARCHAR(50),
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND UserID = @UserID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_User_GetByRole', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetByRole;
GO

CREATE PROCEDURE sp_User_GetByRole
    @SiteID NVARCHAR(50),
    @Role NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND Role = @Role
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_User_GetByStatus', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetByStatus;
GO

CREATE PROCEDURE sp_User_GetByStatus
    @SiteID NVARCHAR(50),
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND Status = @Status
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_User_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_Create;
GO

CREATE PROCEDURE sp_User_Create
    @UserID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @Name NVARCHAR(255),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(MAX),
    @Role NVARCHAR(50),
    @Status NVARCHAR(50),
    @Avatar NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Users (UserID, SiteID, Name, Email, PasswordHash, Role, Status, Avatar, CreatedAt, UpdatedAt, IsDeleted)
    VALUES (@UserID, @SiteID, @Name, @Email, @PasswordHash, @Role, @Status, @Avatar, GETUTCDATE(), GETUTCDATE(), 0);
END
GO

IF OBJECT_ID('sp_User_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_Update;
GO

CREATE PROCEDURE sp_User_Update
    @SiteID NVARCHAR(50),
    @UserID UNIQUEIDENTIFIER,
    @Name NVARCHAR(255),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(MAX),
    @Role NVARCHAR(50),
    @Status NVARCHAR(50),
    @Avatar NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET Name = @Name,
        Email = @Email,
        PasswordHash = @PasswordHash,
        Role = @Role,
        Status = @Status,
        Avatar = @Avatar,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND UserID = @UserID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_User_Delete', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_Delete;
GO

CREATE PROCEDURE sp_User_Delete
    @SiteID NVARCHAR(50),
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND UserID = @UserID;
END
GO

-- =============================================
-- PROJECT STORED PROCEDURES
-- =============================================

IF OBJECT_ID('sp_Project_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetAll;
GO

CREATE PROCEDURE sp_Project_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID,
        SiteID,
        Name,
        [Key],
        Description,
        Status,
        StartDate,
        EndDate,
        OwnedBy,
        CategoryID,
        Color,
        Icon,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_Project_GetById', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetById;
GO

CREATE PROCEDURE sp_Project_GetById
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID,
        SiteID,
        Name,
        [Key],
        Description,
        Status,
        StartDate,
        EndDate,
        OwnedBy,
        CategoryID,
        Color,
        Icon,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
        AND ProjectID = @ProjectID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_Project_GetByCategory', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetByCategory;
GO

CREATE PROCEDURE sp_Project_GetByCategory
    @SiteID NVARCHAR(50),
    @CategoryID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID,
        SiteID,
        Name,
        [Key],
        Description,
        Status,
        StartDate,
        EndDate,
        OwnedBy,
        CategoryID,
        Color,
        Icon,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
        AND CategoryID = @CategoryID
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_Project_GetByStatus', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetByStatus;
GO

CREATE PROCEDURE sp_Project_GetByStatus
    @SiteID NVARCHAR(50),
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID,
        SiteID,
        Name,
        [Key],
        Description,
        Status,
        StartDate,
        EndDate,
        OwnedBy,
        CategoryID,
        Color,
        Icon,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
        AND Status = @Status
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

IF OBJECT_ID('sp_Project_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Create;
GO

CREATE PROCEDURE sp_Project_Create
    @ProjectID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @Name NVARCHAR(255),
    @Key NVARCHAR(10),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50),
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @OwnedBy UNIQUEIDENTIFIER = NULL,
    @CategoryID UNIQUEIDENTIFIER = NULL,
    @Color NVARCHAR(50) = NULL,
    @Icon NVARCHAR(50) = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Projects (ProjectID, SiteID, Name, [Key], Description, Status, StartDate, EndDate, OwnedBy, CategoryID, Color, Icon, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
    VALUES (@ProjectID, @SiteID, @Name, @Key, @Description, @Status, @StartDate, @EndDate, @OwnedBy, @CategoryID, @Color, @Icon, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0);
END
GO

IF OBJECT_ID('sp_Project_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Update;
GO

CREATE PROCEDURE sp_Project_Update
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @Name NVARCHAR(255),
    @Key NVARCHAR(10),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50),
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @OwnedBy UNIQUEIDENTIFIER = NULL,
    @CategoryID UNIQUEIDENTIFIER = NULL,
    @Color NVARCHAR(50) = NULL,
    @Icon NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Projects
    SET Name = @Name,
        [Key] = @Key,
        Description = @Description,
        Status = @Status,
        StartDate = @StartDate,
        EndDate = @EndDate,
        OwnedBy = @OwnedBy,
        CategoryID = @CategoryID,
        Color = @Color,
        Icon = @Icon,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND ProjectID = @ProjectID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_Project_Delete', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Delete;
GO

CREATE PROCEDURE sp_Project_Delete
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Projects
    SET IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND ProjectID = @ProjectID;
END
GO

-- =============================================
-- TASK STORED PROCEDURES
-- =============================================

IF OBJECT_ID('sp_Task_GetByProject', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetByProject;
GO

CREATE PROCEDURE sp_Task_GetByProject
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND ProjectID = @ProjectID
        AND IsDeleted = 0
    ORDER BY [Order], CreatedAt;
END
GO

IF OBJECT_ID('sp_Task_GetById', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetById;
GO

CREATE PROCEDURE sp_Task_GetById
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND TaskID = @TaskID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_Task_GetByAssignee', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetByAssignee;
GO

CREATE PROCEDURE sp_Task_GetByAssignee
    @SiteID NVARCHAR(50),
    @AssigneeID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND AssigneeID = @AssigneeID
        AND IsDeleted = 0
    ORDER BY DueDate, Priority;
END
GO

IF OBJECT_ID('sp_Task_GetByStatus', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetByStatus;
GO

CREATE PROCEDURE sp_Task_GetByStatus
    @SiteID NVARCHAR(50),
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND Status = @Status
        AND IsDeleted = 0
    ORDER BY DueDate, Priority;
END
GO

IF OBJECT_ID('sp_Task_GetDueSoon', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetDueSoon;
GO

CREATE PROCEDURE sp_Task_GetDueSoon
    @SiteID NVARCHAR(50),
    @DaysAhead INT = 7
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND DueDate IS NOT NULL
        AND DueDate <= DATEADD(DAY, @DaysAhead, GETUTCDATE())
        AND DueDate >= GETUTCDATE()
        AND Status NOT IN ('Done', 'Cancelled')
        AND IsDeleted = 0
    ORDER BY DueDate, Priority;
END
GO

IF OBJECT_ID('sp_Task_GetOverdue', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetOverdue;
GO

CREATE PROCEDURE sp_Task_GetOverdue
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
        Title,
        Description,
        Status,
        Priority,
        Type,
        AssigneeID,
        ReporterID,
        SprintID,
        EstimatedHours,
        ActualHours,
        DueDate,
        StartDate,
        CompletedAt,
        TaskNumber,
        [Order],
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND DueDate IS NOT NULL
        AND DueDate < GETUTCDATE()
        AND Status NOT IN ('Done', 'Cancelled')
        AND IsDeleted = 0
    ORDER BY DueDate, Priority;
END
GO

IF OBJECT_ID('sp_Task_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_Create;
GO

CREATE PROCEDURE sp_Task_Create
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Title NVARCHAR(500),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50),
    @Priority NVARCHAR(50),
    @Type NVARCHAR(50),
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @ReporterID UNIQUEIDENTIFIER = NULL,
    @SprintID UNIQUEIDENTIFIER = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @DueDate DATETIME2 = NULL,
    @StartDate DATETIME2 = NULL,
    @TaskNumber INT,
    @Order INT = 0,
    @Tags NVARCHAR(MAX) = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Tasks (TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, Title, Description, Status, Priority, Type, AssigneeID, ReporterID, SprintID, EstimatedHours, DueDate, StartDate, TaskNumber, [Order], Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
    VALUES (@TaskID, @SiteID, @ProjectID, @PhaseID, @ParentTaskID, @Title, @Description, @Status, @Priority, @Type, @AssigneeID, @ReporterID, @SprintID, @EstimatedHours, @DueDate, @StartDate, @TaskNumber, @Order, @Tags, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0);
END
GO

IF OBJECT_ID('sp_Task_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_Update;
GO

CREATE PROCEDURE sp_Task_Update
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER,
    @PhaseID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @Title NVARCHAR(500),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50),
    @Priority NVARCHAR(50),
    @Type NVARCHAR(50),
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @ReporterID UNIQUEIDENTIFIER = NULL,
    @SprintID UNIQUEIDENTIFIER = NULL,
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL,
    @DueDate DATETIME2 = NULL,
    @StartDate DATETIME2 = NULL,
    @Order INT = 0,
    @Tags NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET PhaseID = @PhaseID,
        ParentTaskID = @ParentTaskID,
        Title = @Title,
        Description = @Description,
        Status = @Status,
        Priority = @Priority,
        Type = @Type,
        AssigneeID = @AssigneeID,
        ReporterID = @ReporterID,
        SprintID = @SprintID,
        EstimatedHours = @EstimatedHours,
        ActualHours = @ActualHours,
        DueDate = @DueDate,
        StartDate = @StartDate,
        [Order] = @Order,
        Tags = @Tags,
        UpdatedAt = GETUTCDATE(),
        CompletedAt = CASE WHEN @Status = 'Done' AND CompletedAt IS NULL THEN GETUTCDATE() ELSE CompletedAt END
    WHERE SiteID = @SiteID
        AND TaskID = @TaskID
        AND IsDeleted = 0;
END
GO

IF OBJECT_ID('sp_Task_Delete', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_Delete;
GO

CREATE PROCEDURE sp_Task_Delete
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tasks
    SET IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND TaskID = @TaskID;
END
GO

PRINT 'All stored procedures have been updated to use NVARCHAR(50) for @SiteID parameter.';
GO
