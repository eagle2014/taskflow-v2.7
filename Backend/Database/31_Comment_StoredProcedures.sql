-- =============================================
-- Migration: Create Comment Stored Procedures
-- Purpose: Support Comment CRUD operations via API
-- Date: 2025-11-30
-- Target: DB_PMS (Remote SQL Server)
-- =============================================

USE DB_PMS;
GO

-- =============================================
-- sp_Comment_GetAll
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_GetAll') AND type in (N'P'))
DROP PROCEDURE sp_Comment_GetAll;
GO

CREATE PROCEDURE sp_Comment_GetAll
    @SiteID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE SiteID = @SiteID
    AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

PRINT 'sp_Comment_GetAll created successfully';
GO

-- =============================================
-- sp_Comment_GetById
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_GetById') AND type in (N'P'))
DROP PROCEDURE sp_Comment_GetById;
GO

CREATE PROCEDURE sp_Comment_GetById
    @SiteID NVARCHAR(50),
    @CommentID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE CommentID = @CommentID
    AND SiteID = @SiteID
    AND IsDeleted = 0;
END
GO

PRINT 'sp_Comment_GetById created successfully';
GO

-- =============================================
-- sp_Comment_GetByTask
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_GetByTask') AND type in (N'P'))
DROP PROCEDURE sp_Comment_GetByTask;
GO

CREATE PROCEDURE sp_Comment_GetByTask
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE TaskID = @TaskID
    AND SiteID = @SiteID
    AND IsDeleted = 0
    ORDER BY CreatedAt ASC;
END
GO

PRINT 'sp_Comment_GetByTask created successfully';
GO

-- =============================================
-- sp_Comment_GetByUser
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_GetByUser') AND type in (N'P'))
DROP PROCEDURE sp_Comment_GetByUser;
GO

CREATE PROCEDURE sp_Comment_GetByUser
    @SiteID NVARCHAR(50),
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE UserID = @UserID
    AND SiteID = @SiteID
    AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END
GO

PRINT 'sp_Comment_GetByUser created successfully';
GO

-- =============================================
-- sp_Comment_Create
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_Create') AND type in (N'P'))
DROP PROCEDURE sp_Comment_Create;
GO

CREATE PROCEDURE sp_Comment_Create
    @CommentID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @TaskID UNIQUEIDENTIFIER,
    @UserID UNIQUEIDENTIFIER,
    @Content NVARCHAR(MAX),
    @ParentCommentID UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Comments (
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    )
    VALUES (
        @CommentID,
        @SiteID,
        @TaskID,
        @UserID,
        @Content,
        @ParentCommentID,
        GETUTCDATE(),
        GETUTCDATE(),
        0
    );

    -- Return the created comment
    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE CommentID = @CommentID;
END
GO

PRINT 'sp_Comment_Create created successfully';
GO

-- =============================================
-- sp_Comment_Update
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_Update') AND type in (N'P'))
DROP PROCEDURE sp_Comment_Update;
GO

CREATE PROCEDURE sp_Comment_Update
    @SiteID NVARCHAR(50),
    @CommentID UNIQUEIDENTIFIER,
    @Content NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Comments
    SET
        Content = @Content,
        UpdatedAt = GETUTCDATE()
    WHERE CommentID = @CommentID
    AND SiteID = @SiteID
    AND IsDeleted = 0;

    -- Return the updated comment
    SELECT
        CommentID,
        SiteID,
        TaskID,
        UserID,
        Content,
        ParentCommentID,
        CreatedAt,
        UpdatedAt,
        IsDeleted
    FROM Comments
    WHERE CommentID = @CommentID;
END
GO

PRINT 'sp_Comment_Update created successfully';
GO

-- =============================================
-- sp_Comment_Delete (Soft Delete)
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sp_Comment_Delete') AND type in (N'P'))
DROP PROCEDURE sp_Comment_Delete;
GO

CREATE PROCEDURE sp_Comment_Delete
    @SiteID NVARCHAR(50),
    @CommentID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Comments
    SET
        IsDeleted = 1,
        UpdatedAt = GETUTCDATE()
    WHERE CommentID = @CommentID
    AND SiteID = @SiteID;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

PRINT 'sp_Comment_Delete created successfully';
GO

PRINT '===========================================';
PRINT 'Migration 31_Comment_StoredProcedures completed successfully.';
PRINT '===========================================';
GO