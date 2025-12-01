-- =============================================
-- Stored Procedure: sp_Task_GetByParentTask
-- Purpose: Get all subtasks for a parent task
-- =============================================

USE [DB_PMS]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Task_GetByParentTask')
    DROP PROCEDURE sp_Task_GetByParentTask
GO

CREATE PROCEDURE sp_Task_GetByParentTask
    @SiteID NVARCHAR(50),
    @ParentTaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        SiteID,
        ProjectID,
        PhaseID,
        ParentTaskID,
        [Order],
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
        Budget,
        Spent,
        Tags,
        SectionName,
        CreatedBy,
        CreatedAt,
        UpdatedAt
    FROM Tasks
    WHERE SiteID = @SiteID
        AND ParentTaskID = @ParentTaskID
        AND IsDeleted = 0
    ORDER BY [Order], CreatedAt
END
GO

PRINT 'Stored procedure sp_Task_GetByParentTask created successfully'
GO