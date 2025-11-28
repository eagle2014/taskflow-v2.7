-- =============================================
-- Add Space Stored Procedures for DB_PMS
-- Schema matches remote DB: kiena.vietgoat.com,400
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Space_GetAll
-- =============================================
IF OBJECT_ID('sp_Space_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_GetAll;
GO

CREATE PROCEDURE sp_Space_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SpaceID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        ProjectIDs,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Spaces
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
    ORDER BY Name;
END
GO

-- =============================================
-- sp_Space_GetById
-- =============================================
IF OBJECT_ID('sp_Space_GetById', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_GetById;
GO

CREATE PROCEDURE sp_Space_GetById
    @SiteID NVARCHAR(50),
    @SpaceID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SpaceID,
        SiteID,
        Name,
        Description,
        Color,
        Icon,
        ProjectIDs,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Spaces
    WHERE SiteID = @SiteID
        AND SpaceID = @SpaceID
        AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Space_Create
-- =============================================
IF OBJECT_ID('sp_Space_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_Create;
GO

CREATE PROCEDURE sp_Space_Create
    @SpaceID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @Color NVARCHAR(50) = NULL,
    @Icon NVARCHAR(100) = NULL,
    @Order INT = 0,
    @ProjectIDs NVARCHAR(MAX) = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Spaces (SpaceID, SiteID, Name, Description, Color, Icon, ProjectIDs, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
    VALUES (@SpaceID, @SiteID, @Name, @Description, @Color, @Icon, @ProjectIDs, @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0);
END
GO

-- =============================================
-- sp_Space_Update
-- =============================================
IF OBJECT_ID('sp_Space_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_Update;
GO

CREATE PROCEDURE sp_Space_Update
    @SiteID NVARCHAR(50),
    @SpaceID UNIQUEIDENTIFIER,
    @ProjectID UNIQUEIDENTIFIER = NULL,
    @Name NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Color NVARCHAR(50) = NULL,
    @Icon NVARCHAR(100) = NULL,
    @ProjectIDs NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Spaces
    SET
        Name = ISNULL(@Name, Name),
        Description = ISNULL(@Description, Description),
        Color = ISNULL(@Color, Color),
        Icon = ISNULL(@Icon, Icon),
        ProjectIDs = ISNULL(@ProjectIDs, ProjectIDs),
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND SpaceID = @SpaceID
        AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_Space_Delete (soft delete)
-- =============================================
IF OBJECT_ID('sp_Space_Delete', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_Delete;
GO

CREATE PROCEDURE sp_Space_Delete
    @SiteID NVARCHAR(50),
    @SpaceID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Spaces
    SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND SpaceID = @SpaceID;
END
GO

-- =============================================
-- sp_Space_AddProject
-- =============================================
IF OBJECT_ID('sp_Space_AddProject', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_AddProject;
GO

CREATE PROCEDURE sp_Space_AddProject
    @SiteID NVARCHAR(50),
    @SpaceID UNIQUEIDENTIFIER,
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentProjectIDs NVARCHAR(MAX);
    SELECT @CurrentProjectIDs = ProjectIDs FROM Spaces WHERE SiteID = @SiteID AND SpaceID = @SpaceID;

    IF @CurrentProjectIDs IS NULL OR @CurrentProjectIDs = ''
        SET @CurrentProjectIDs = CAST(@ProjectID AS NVARCHAR(36));
    ELSE IF CHARINDEX(CAST(@ProjectID AS NVARCHAR(36)), @CurrentProjectIDs) = 0
        SET @CurrentProjectIDs = @CurrentProjectIDs + ',' + CAST(@ProjectID AS NVARCHAR(36));

    UPDATE Spaces
    SET ProjectIDs = @CurrentProjectIDs, UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND SpaceID = @SpaceID;
END
GO

-- =============================================
-- sp_Space_RemoveProject
-- =============================================
IF OBJECT_ID('sp_Space_RemoveProject', 'P') IS NOT NULL
    DROP PROCEDURE sp_Space_RemoveProject;
GO

CREATE PROCEDURE sp_Space_RemoveProject
    @SiteID NVARCHAR(50),
    @SpaceID UNIQUEIDENTIFIER,
    @ProjectID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentProjectIDs NVARCHAR(MAX);
    DECLARE @NewProjectIDs NVARCHAR(MAX) = '';
    SELECT @CurrentProjectIDs = ProjectIDs FROM Spaces WHERE SiteID = @SiteID AND SpaceID = @SpaceID;

    -- Remove the project ID from the comma-separated list
    IF @CurrentProjectIDs IS NOT NULL
    BEGIN
        DECLARE @ProjectIDStr NVARCHAR(36) = CAST(@ProjectID AS NVARCHAR(36));

        -- Split and rebuild without the project
        SELECT @NewProjectIDs = STRING_AGG(value, ',')
        FROM STRING_SPLIT(@CurrentProjectIDs, ',')
        WHERE value <> @ProjectIDStr AND value <> '';
    END

    UPDATE Spaces
    SET ProjectIDs = @NewProjectIDs, UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND SpaceID = @SpaceID;
END
GO

PRINT 'Space stored procedures created successfully!';
GO
