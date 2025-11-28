-- =============================================
-- Add GetByProject Stored Procedures for DB_PMS
-- Schema matches remote DB: kiena.vietgoat.com,400
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Task_GetByProject
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
        AND ProjectID = @ProjectID
        AND IsDeleted = 0
    ORDER BY [Order], CreatedAt;
END
GO

-- =============================================
-- sp_Phase_GetByProject
-- =============================================
IF OBJECT_ID('sp_Phase_GetByProject', 'P') IS NOT NULL
    DROP PROCEDURE sp_Phase_GetByProject;
GO

CREATE PROCEDURE sp_Phase_GetByProject
    @SiteID NVARCHAR(50),
    @ProjectID UNIQUEIDENTIFIER
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
        AND ProjectID = @ProjectID
        AND IsDeleted = 0
    ORDER BY [Order], CreatedAt;
END
GO

PRINT 'GetByProject stored procedures created successfully!';
GO
