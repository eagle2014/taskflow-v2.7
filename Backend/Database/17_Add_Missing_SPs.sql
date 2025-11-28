-- =============================================
-- Add Missing Stored Procedures for DB_PMS
-- Schema matches remote DB: kiena.vietgoat.com,400
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Task_GetAll
-- =============================================
IF OBJECT_ID('sp_Task_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE sp_Task_GetAll;
GO

CREATE PROCEDURE sp_Task_GetAll
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
        AssigneeID,
        StartDate,
        DueDate,
        CompletedDate,
        EstimatedHours,
        ActualHours,
        Progress,
        Tags,
        CreatedBy,
        CreatedAt,
        UpdatedAt,
        IsDeleted,
        [Order]
    FROM Tasks
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
    ORDER BY [Order], CreatedAt;
END
GO

-- =============================================
-- sp_Project_GetAll
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
        Description,
        Status,
        Priority,
        StartDate,
        EndDate,
        Budget,
        Color,
        Icon,
        CategoryID,
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

PRINT 'Stored procedures created successfully!';
GO
