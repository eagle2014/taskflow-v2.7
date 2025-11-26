-- =============================================
-- Minimal Stored Procedures for Login Functionality
-- =============================================

USE TaskFlowDB_Dev;
GO

-- =============================================
-- sp_User_GetByEmail - Get user by email and site
-- =============================================
IF OBJECT_ID('sp_User_GetByEmail', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_GetByEmail;
GO

CREATE PROCEDURE sp_User_GetByEmail
    @SiteID UNIQUEIDENTIFIER,
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserID,
        SiteID,
        Email,
        PasswordHash,
        Name,
        Avatar,
        Role,
        Status,
        RefreshToken,
        RefreshTokenExpiry,
        CreatedAt,
        LastActive,
        UpdatedAt,
        IsDeleted
    FROM Users
    WHERE SiteID = @SiteID
        AND Email = @Email
        AND IsDeleted = 0;
END
GO

-- =============================================
-- sp_User_UpdateLastActive - Update user last active
-- =============================================
IF OBJECT_ID('sp_User_UpdateLastActive', 'P') IS NOT NULL
    DROP PROCEDURE sp_User_UpdateLastActive;
GO

CREATE PROCEDURE sp_User_UpdateLastActive
    @SiteID UNIQUEIDENTIFIER,
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET LastActive = GETUTCDATE(),
        UpdatedAt = GETUTCDATE()
    WHERE SiteID = @SiteID
        AND UserID = @UserID
        AND IsDeleted = 0;
END
GO

PRINT '✅ Login stored procedures created successfully!';