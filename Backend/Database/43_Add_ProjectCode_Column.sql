USE DB_PMS;
GO

-- Add ProjectCode column to Projects table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'ProjectCode')
BEGIN
    ALTER TABLE Projects ADD ProjectCode NVARCHAR(50) NULL;
    PRINT 'Added ProjectCode column to Projects table';
END
GO

-- Update sp_Project_GetAll to include ProjectCode
IF OBJECT_ID('sp_Project_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetAll;
GO

CREATE PROCEDURE sp_Project_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID, SiteID, ProjectCode, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- Update sp_Project_GetById to include ProjectCode
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
        ProjectID, SiteID, ProjectCode, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND IsDeleted = 0;
END
GO

-- Update sp_Project_Create to include ProjectCode
IF OBJECT_ID('sp_Project_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Create;
GO

CREATE PROCEDURE sp_Project_Create
    @ProjectID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectCode NVARCHAR(50) = NULL,
    @Name NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @CategoryID NVARCHAR(50) = NULL,
    @Status NVARCHAR(50),
    @Priority NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @CustomerID UNIQUEIDENTIFIER = NULL,
    @ContactID UNIQUEIDENTIFIER = NULL,
    @DealID UNIQUEIDENTIFIER = NULL,
    @ActualEndDate DATE = NULL,
    @ProjectUrl NVARCHAR(500) = NULL,
    @Progress INT = 0,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Auto-generate ProjectCode if not provided
    DECLARE @FinalProjectCode NVARCHAR(50) = @ProjectCode;
    IF @FinalProjectCode IS NULL
    BEGIN
        -- Generate code like PRJ-0001, PRJ-0002, etc.
        DECLARE @MaxNum INT;
        SELECT @MaxNum = ISNULL(MAX(CAST(SUBSTRING(ProjectCode, 5, LEN(ProjectCode)) AS INT)), 0)
        FROM Projects
        WHERE SiteID = @SiteID AND ProjectCode LIKE 'PRJ-%';

        SET @FinalProjectCode = 'PRJ-' + RIGHT('0000' + CAST(@MaxNum + 1 AS VARCHAR), 4);
    END

    INSERT INTO Projects (
        ProjectID, SiteID, ProjectCode, Name, Description, CategoryID, Status, Priority,
        StartDate, EndDate, AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @ProjectID, @SiteID, @FinalProjectCode, @Name, @Description, @CategoryID, @Status, @Priority,
        @StartDate, @EndDate, @AssigneeID, @CustomerID, @ContactID, @DealID,
        @ActualEndDate, @ProjectUrl, @Progress,
        @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );
END
GO

-- Update sp_Project_Update to include ProjectCode
IF OBJECT_ID('sp_Project_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Update;
GO

CREATE PROCEDURE sp_Project_Update
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @ProjectCode NVARCHAR(50) = NULL,
    @Name NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @CategoryID NVARCHAR(50) = NULL,
    @Status NVARCHAR(50),
    @Priority NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AssigneeID UNIQUEIDENTIFIER = NULL,
    @CustomerID UNIQUEIDENTIFIER = NULL,
    @ContactID UNIQUEIDENTIFIER = NULL,
    @DealID UNIQUEIDENTIFIER = NULL,
    @ActualEndDate DATE = NULL,
    @ProjectUrl NVARCHAR(500) = NULL,
    @Progress INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Projects
    SET
        ProjectCode = COALESCE(@ProjectCode, ProjectCode),
        Name = @Name,
        Description = @Description,
        CategoryID = @CategoryID,
        Status = @Status,
        Priority = @Priority,
        StartDate = @StartDate,
        EndDate = @EndDate,
        AssigneeID = @AssigneeID,
        CustomerID = @CustomerID,
        ContactID = @ContactID,
        DealID = @DealID,
        ActualEndDate = @ActualEndDate,
        ProjectUrl = @ProjectUrl,
        Progress = COALESCE(@Progress, Progress),
        UpdatedAt = GETUTCDATE()
    WHERE
        SiteID = @SiteID
        AND ProjectID = @ProjectID
        AND IsDeleted = 0;
END
GO

-- Update sp_Project_GetByCategory to include ProjectCode
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
        ProjectID, SiteID, ProjectCode, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND CategoryID = @CategoryID AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- Update sp_Project_GetByStatus to include ProjectCode
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
        ProjectID, SiteID, ProjectCode, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND Status = @Status AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- Auto-generate ProjectCode for existing projects that don't have one
UPDATE p
SET ProjectCode = 'PRJ-' + RIGHT('0000' + CAST(rn AS VARCHAR), 4)
FROM (
    SELECT ProjectID, ROW_NUMBER() OVER (PARTITION BY SiteID ORDER BY CreatedAt) as rn
    FROM Projects
    WHERE ProjectCode IS NULL
) sub
INNER JOIN Projects p ON p.ProjectID = sub.ProjectID
WHERE p.ProjectCode IS NULL;
GO

PRINT 'ProjectCode column added and stored procedures updated successfully';