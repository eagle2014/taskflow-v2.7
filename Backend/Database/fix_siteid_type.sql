-- Fix SiteID parameter type in remaining stored procedures
USE DB_PMS;
GO

-- sp_Task_GetOverdue
ALTER PROCEDURE sp_Task_GetOverdue
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
        AND DueDate < CAST(GETUTCDATE() AS DATE)
        AND Status != 'Completed'
    ORDER BY DueDate;
END
GO

-- sp_Task_GetDueSoon
ALTER PROCEDURE sp_Task_GetDueSoon
    @SiteID NVARCHAR(50),
    @Days INT = 7
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID, SiteID, ProjectID, PhaseID, ParentTaskID, [Order],
        Title, Description, Status, Priority, AssigneeID,
        StartDate, DueDate, CompletedDate,
        EstimatedHours, ActualHours, Progress,
        Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted
    FROM Tasks
    WHERE SiteID = @SiteID
        AND IsDeleted = 0
        AND DueDate BETWEEN CAST(GETUTCDATE() AS DATE) AND DATEADD(DAY, @Days, CAST(GETUTCDATE() AS DATE))
        AND Status != 'Completed'
    ORDER BY DueDate;
END
GO

PRINT 'All task stored procedures updated successfully!';
