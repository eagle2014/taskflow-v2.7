-- =============================================
-- Stored Procedures for Categories
-- CategoryID: NVARCHAR(50)
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Category_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_GetAll')
    DROP PROCEDURE sp_Category_GetAll;
GO

CREATE PROCEDURE sp_Category_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM ProjectCategories
    WHERE SiteID = @SiteID
      AND IsDeleted = 0
    ORDER BY Name;
END
GO

-- =============================================
-- sp_Category_GetById
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_GetById')
    DROP PROCEDURE sp_Category_GetById;
GO

CREATE PROCEDURE sp_Category_GetById
    @SiteID NVARCHAR(50),
    @CategoryID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM ProjectCategories
    WHERE SiteID = @SiteID
      AND CategoryID = @CategoryID
      AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Category_GetByName
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_GetByName')
    DROP PROCEDURE sp_Category_GetByName;
GO

CREATE PROCEDURE sp_Category_GetByName
    @SiteID NVARCHAR(50),
    @Name NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM ProjectCategories
    WHERE SiteID = @SiteID
      AND Name = @Name
      AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Category_Create
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_Create')
    DROP PROCEDURE sp_Category_Create;
GO

CREATE PROCEDURE sp_Category_Create
    @CategoryID NVARCHAR(50),
    @SiteID NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(500) = NULL,
    @Color NVARCHAR(20) = '#3B82F6',
    @Icon NVARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ProjectCategories (
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    )
    VALUES (
        @CategoryID,
        @SiteID,
        @Name,
        @Description,
        @Color,
        @Icon,
        GETUTCDATE(),
        GETUTCDATE(),
        0
    );

    SELECT
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM ProjectCategories
    WHERE CategoryID = @CategoryID;
END
GO

-- =============================================
-- sp_Category_Update
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_Update')
    DROP PROCEDURE sp_Category_Update;
GO

CREATE PROCEDURE sp_Category_Update
    @SiteID NVARCHAR(50),
    @CategoryID NVARCHAR(50),
    @Name NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL,
    @Color NVARCHAR(20) = NULL,
    @Icon NVARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ProjectCategories
    SET
        Name = ISNULL(@Name, Name),
        Description = ISNULL(@Description, Description),
        Color = ISNULL(@Color, Color),
        Icon = ISNULL(@Icon, Icon),
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
      AND CategoryID = @CategoryID
      AND IsDeleted = 0;

    SELECT
        CategoryID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM ProjectCategories
    WHERE CategoryID = @CategoryID;
END
GO

-- =============================================
-- sp_Category_Delete
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_Category_Delete')
    DROP PROCEDURE sp_Category_Delete;
GO

CREATE PROCEDURE sp_Category_Delete
    @SiteID NVARCHAR(50),
    @CategoryID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ProjectCategories
    SET
        IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
      AND CategoryID = @CategoryID;

    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

PRINT '✓ Category stored procedures created successfully!';
GO
