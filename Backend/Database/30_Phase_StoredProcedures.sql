-- =============================================
-- Migration: Create Phase Stored Procedures
-- Purpose: Support Phase CRUD operations via API
-- Date: 2025-11-30
-- Target: DB_PMS (Remote SQL Server)
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Phase_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_GetAll') AND type in (N'P'))
DROP PROCEDURE sp_Phase_GetAll;
GO

CREATE PROCEDURE sp_Phase_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PhaseID,
        SiteID,
        ProjectID,
        Name,
        Description,
        Color,
        [Order],
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Phases
    WHERE SiteID = @SiteID
    AND IsDeleted = 0
    ORDER BY [Order], Name;
END
GO

PRINT 'sp_Phase_GetAll created successfully';
GO

-- =============================================
-- sp_Phase_GetById
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_GetById') AND type in (N'P'))
DROP PROCEDURE sp_Phase_GetById;
GO

CREATE PROCEDURE sp_Phase_GetById
    @SiteID NVARCHAR(50),
    @PhaseID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PhaseID,
        SiteID,
        ProjectID,
        Name,
        Description,
        Color,
        [Order],
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Phases
    WHERE PhaseID = @PhaseID
    AND SiteID = @SiteID
    AND IsDeleted = 0;
END
GO

PRINT 'sp_Phase_GetById created successfully';
GO

-- =============================================
-- sp_Phase_Create
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_Create') AND type in (N'P'))
DROP PROCEDURE sp_Phase_Create;
GO

CREATE PROCEDURE sp_Phase_Create
    @PhaseID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @Name NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @Color NVARCHAR(50) = '#3B82F6',
    @Order INT = 0,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @CreatedBy UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Phases (
        PhaseID,
        SiteID,
        ProjectID,
        Name,
        Description,
        Color,
        [Order],
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    )
    VALUES (
        @PhaseID,
        @SiteID,
        @ProjectID,
        @Name,
        @Description,
        @Color,
        @Order,
        @StartDate,
        @EndDate,
        @CreatedBy,
        GETUTCDATE(),
        GETUTCDATE(),
        0
    );

    -- Return the created phase
    SELECT
        PhaseID,
        SiteID,
        ProjectID,
        Name,
        Description,
        Color,
        [Order],
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Phases
    WHERE PhaseID = @PhaseID;
END
GO

PRINT 'sp_Phase_Create created successfully';
GO

-- =============================================
-- sp_Phase_Update
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_Update') AND type in (N'P'))
DROP PROCEDURE sp_Phase_Update;
GO

CREATE PROCEDURE sp_Phase_Update
    @SiteID NVARCHAR(50),
    @PhaseID UNIQUEIDENTIFIER,
    @Name NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Color NVARCHAR(50) = NULL,
    @Order INT = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Phases
    SET
        Name = ISNULL(@Name, Name),
        Description = ISNULL(@Description, Description),
        Color = ISNULL(@Color, Color),
        [Order] = ISNULL(@Order, [Order]),
        StartDate = ISNULL(@StartDate, StartDate),
        EndDate = ISNULL(@EndDate, EndDate),
        UpdatedAt = GETUTCDATE()
    WHERE PhaseID = @PhaseID
    AND SiteID = @SiteID
    AND IsDeleted = 0;

    -- Return the updated phase
    SELECT
        PhaseID,
        SiteID,
        ProjectID,
        Name,
        Description,
        Color,
        [Order],
        StartDate,
        EndDate,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Phases
    WHERE PhaseID = @PhaseID;
END
GO

PRINT 'sp_Phase_Update created successfully';
GO

-- =============================================
-- sp_Phase_Delete (Soft Delete)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_Delete') AND type in (N'P'))
DROP PROCEDURE sp_Phase_Delete;
GO

CREATE PROCEDURE sp_Phase_Delete
    @SiteID NVARCHAR(50),
    @PhaseID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Phases
    SET
        IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE PhaseID = @PhaseID
    AND SiteID = @SiteID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

PRINT 'sp_Phase_Delete created successfully';
GO

-- =============================================
-- sp_Phase_Reorder
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Phase_Reorder') AND type in (N'P'))
DROP PROCEDURE sp_Phase_Reorder;
GO

CREATE PROCEDURE sp_Phase_Reorder
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
    @PhaseID UNIQUEIDENTIFIER,
    @Order INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Phases
    SET
        [Order] = @Order,
        UpdatedAt = GETUTCDATE()
    WHERE PhaseID = @PhaseID
    AND ProjectID = @ProjectID
    AND SiteID = @SiteID
    AND IsDeleted = 0;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

PRINT 'sp_Phase_Reorder created successfully';
GO

PRINT '===========================================';
PRINT 'Migration 30_Phase_StoredProcedures completed successfully.';
PRINT '===========================================';
GO
