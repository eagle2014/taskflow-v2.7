USE DB_PMS;
GO

-- ============================================================================
-- Migration: Rename ProjectID -> RowPointer, ProjectCode -> ProjectID
-- Purpose: Unify convention with SiteID (human-readable code as primary identifier)
-- ============================================================================

-- Step 1: Drop Foreign Key constraints that reference ProjectID
PRINT 'Dropping foreign key constraints...';

-- Drop FK from Tasks table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Tasks_Projects')
    ALTER TABLE Tasks DROP CONSTRAINT FK_Tasks_Projects;

-- Step 2: Drop indexes on ProjectID
PRINT 'Dropping indexes...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Projects_ProjectID' AND object_id = OBJECT_ID('Projects'))
    DROP INDEX IX_Projects_ProjectID ON Projects;

-- Step 3: Rename columns
PRINT 'Renaming columns...';

-- Rename ProjectID -> RowPointer
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'ProjectID')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'RowPointer')
BEGIN
    EXEC sp_rename 'Projects.ProjectID', 'RowPointer', 'COLUMN';
    PRINT 'Renamed ProjectID to RowPointer';
END
GO

-- Rename ProjectCode -> ProjectID
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'ProjectCode')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'ProjectID')
BEGIN
    EXEC sp_rename 'Projects.ProjectCode', 'ProjectID', 'COLUMN';
    PRINT 'Renamed ProjectCode to ProjectID';
END
GO

-- Step 4: Make ProjectID NOT NULL (it was nullable as ProjectCode)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Projects') AND name = 'ProjectID' AND is_nullable = 1)
BEGIN
    -- First update any NULL values
    UPDATE Projects SET ProjectID = 'PRJ-' + RIGHT('0000' + CAST(ROW_NUMBER() OVER (ORDER BY CreatedAt) AS VARCHAR), 4)
    FROM (SELECT RowPointer, ROW_NUMBER() OVER (ORDER BY CreatedAt) as rn FROM Projects WHERE ProjectID IS NULL) sub
    WHERE Projects.RowPointer = sub.RowPointer AND Projects.ProjectID IS NULL;

    ALTER TABLE Projects ALTER COLUMN ProjectID NVARCHAR(50) NOT NULL;
    PRINT 'Made ProjectID NOT NULL';
END
GO

-- Step 5: Update Tasks table - rename ProjectID -> ProjectRowPointer
PRINT 'Updating Tasks table...';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Tasks') AND name = 'ProjectID')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Tasks') AND name = 'ProjectRowPointer')
BEGIN
    EXEC sp_rename 'Tasks.ProjectID', 'ProjectRowPointer', 'COLUMN';
    PRINT 'Renamed Tasks.ProjectID to Tasks.ProjectRowPointer';
END
GO

-- Step 6: Recreate Foreign Key constraint
PRINT 'Recreating foreign key constraints...';

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Tasks_Projects')
BEGIN
    ALTER TABLE Tasks ADD CONSTRAINT FK_Tasks_Projects
    FOREIGN KEY (ProjectRowPointer) REFERENCES Projects(RowPointer);
    PRINT 'Recreated FK_Tasks_Projects';
END
GO

-- Step 7: Create unique index on ProjectID within SiteID
PRINT 'Creating indexes...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_Projects_SiteID_ProjectID' AND object_id = OBJECT_ID('Projects'))
BEGIN
    CREATE UNIQUE INDEX UX_Projects_SiteID_ProjectID ON Projects(SiteID, ProjectID);
    PRINT 'Created unique index UX_Projects_SiteID_ProjectID';
END
GO

-- ============================================================================
-- Update Stored Procedures
-- ============================================================================

-- sp_Project_GetAll
IF OBJECT_ID('sp_Project_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetAll;
GO

CREATE PROCEDURE sp_Project_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- sp_Project_GetById (now by ProjectID string)
IF OBJECT_ID('sp_Project_GetById', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetById;
GO

CREATE PROCEDURE sp_Project_GetById
    @SiteID NVARCHAR(50),
    @ProjectID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND IsDeleted = 0;
END
GO

-- sp_Project_GetByRowPointer (for internal use)
IF OBJECT_ID('sp_Project_GetByRowPointer', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetByRowPointer;
GO

CREATE PROCEDURE sp_Project_GetByRowPointer
    @SiteID NVARCHAR(50),
    @RowPointer UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND RowPointer = @RowPointer AND IsDeleted = 0;
END
GO

-- sp_Project_Create
IF OBJECT_ID('sp_Project_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Create;
GO

CREATE PROCEDURE sp_Project_Create
    @RowPointer UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @ProjectID NVARCHAR(50) = NULL,
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

    -- Auto-generate ProjectID if not provided
    DECLARE @FinalProjectID NVARCHAR(50) = @ProjectID;
    IF @FinalProjectID IS NULL
    BEGIN
        -- Generate code like PRJ-0001, PRJ-0002, etc.
        DECLARE @MaxNum INT;
        SELECT @MaxNum = ISNULL(MAX(CAST(SUBSTRING(ProjectID, 5, LEN(ProjectID)) AS INT)), 0)
        FROM Projects
        WHERE SiteID = @SiteID AND ProjectID LIKE 'PRJ-%';

        SET @FinalProjectID = 'PRJ-' + RIGHT('0000' + CAST(@MaxNum + 1 AS VARCHAR), 4);
    END

    INSERT INTO Projects (
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID, Status, Priority,
        StartDate, EndDate, AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @RowPointer, @SiteID, @FinalProjectID, @Name, @Description, @CategoryID, @Status, @Priority,
        @StartDate, @EndDate, @AssigneeID, @CustomerID, @ContactID, @DealID,
        @ActualEndDate, @ProjectUrl, @Progress,
        @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );

    -- Return the created project
    SELECT @FinalProjectID AS ProjectID;
END
GO

-- sp_Project_Update
IF OBJECT_ID('sp_Project_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Update;
GO

CREATE PROCEDURE sp_Project_Update
    @SiteID NVARCHAR(50),
    @ProjectID NVARCHAR(50),
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

-- sp_Project_Delete
IF OBJECT_ID('sp_Project_Delete', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Delete;
GO

CREATE PROCEDURE sp_Project_Delete
    @SiteID NVARCHAR(50),
    @ProjectID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Projects
    SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID AND ProjectID = @ProjectID AND IsDeleted = 0;
END
GO

-- sp_Project_GetByCategory
IF OBJECT_ID('sp_Project_GetByCategory', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_GetByCategory;
GO

CREATE PROCEDURE sp_Project_GetByCategory
    @SiteID NVARCHAR(50),
    @CategoryID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND CategoryID = @CategoryID AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

-- sp_Project_GetByStatus
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
        RowPointer, SiteID, ProjectID, Name, Description, CategoryID,
        Status, Priority, StartDate, EndDate,
        AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt
    FROM Projects
    WHERE SiteID = @SiteID AND Status = @Status AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

PRINT 'Migration completed: ProjectID -> RowPointer, ProjectCode -> ProjectID';