-- =============================================
-- Stored Procedures for Projects with CategoryID as NVARCHAR(50)
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Project_Create
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Project_Create')
    DROP PROCEDURE sp_Project_Create;
GO

CREATE PROCEDURE sp_Project_Create
    @ProjectID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @Name NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @CategoryID NVARCHAR(50) = NULL,
    @Status NVARCHAR(50) = 'Active',
    @Priority NVARCHAR(50) = 'Medium',
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Projects (
        ProjectID,
        SiteID,
        Name,
        Description,
        CategoryID,
        Status,
        Priority,
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    )
    VALUES (
        @ProjectID,
        @SiteID,
        @Name,
        @Description,
        @CategoryID,
        @Status,
        @Priority,
        @StartDate,
        @EndDate,
        @CreatedBy,
        GETUTCDATE(),
        GETUTCDATE(),
        0
    );
END
GO

-- =============================================
-- sp_Project_GetById
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Project_GetById')
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
        Description,
        CategoryID,
        Status,
        Priority,
        StartDate,
        EndDate,
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

-- =============================================
-- sp_Project_Update
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Project_Update')
    DROP PROCEDURE sp_Project_Update;
GO

CREATE PROCEDURE sp_Project_Update
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @Name NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @CategoryID NVARCHAR(50) = NULL,
    @Status NVARCHAR(50) = NULL,
    @Priority NVARCHAR(50) = NULL,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Projects
    SET
        Name = ISNULL(@Name, Name),
        Description = CASE WHEN @Description IS NOT NULL THEN @Description ELSE Description END,
        CategoryID = CASE WHEN @CategoryID IS NOT NULL THEN @CategoryID ELSE CategoryID END,
        Status = ISNULL(@Status, Status),
        Priority = ISNULL(@Priority, Priority),
        StartDate = CASE WHEN @StartDate IS NOT NULL THEN @StartDate ELSE StartDate END,
        EndDate = CASE WHEN @EndDate IS NOT NULL THEN @EndDate ELSE EndDate END,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
      AND ProjectID = @ProjectID
      AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Project_GetByCategory
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Project_GetByCategory')
    DROP PROCEDURE sp_Project_GetByCategory;
GO

CREATE PROCEDURE sp_Project_GetByCategory
    @SiteID NVARCHAR(50),
    @CategoryID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ProjectID,
        SiteID,
        Name,
        Description,
        CategoryID,
        Status,
        Priority,
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
      AND CategoryID = @CategoryID
      AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- =============================================
-- sp_Project_GetByStatus
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Project_GetByStatus')
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
        Description,
        CategoryID,
        Status,
        Priority,
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Projects
    WHERE SiteID = @SiteID
      AND Status = @Status
      AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

PRINT '✓ Project stored procedures created successfully!';
GO
