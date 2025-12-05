USE DB_PMS;
GO

-- Update sp_Project_Create to include CRM fields
IF OBJECT_ID('sp_Project_Create', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Create;
GO

CREATE PROCEDURE sp_Project_Create
    @ProjectID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
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

    INSERT INTO Projects (
        ProjectID, SiteID, Name, Description, CategoryID, Status, Priority,
        StartDate, EndDate, AssigneeID, CustomerID, ContactID, DealID,
        ActualEndDate, ProjectUrl, Progress,
        CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    )
    VALUES (
        @ProjectID, @SiteID, @Name, @Description, @CategoryID, @Status, @Priority,
        @StartDate, @EndDate, @AssigneeID, @CustomerID, @ContactID, @DealID,
        @ActualEndDate, @ProjectUrl, @Progress,
        @CreatedBy, GETUTCDATE(), GETUTCDATE(), 0
    );
END
GO

-- Update sp_Project_Update to include CRM fields
IF OBJECT_ID('sp_Project_Update', 'P') IS NOT NULL
    DROP PROCEDURE sp_Project_Update;
GO

CREATE PROCEDURE sp_Project_Update
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER,
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

PRINT 'Project stored procedures updated successfully with CRM fields';
