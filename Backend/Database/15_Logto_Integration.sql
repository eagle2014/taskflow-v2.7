-- =============================================
-- Logto Authentication Integration
-- Purpose: Add Logto support for OAuth/OIDC authentication
-- =============================================

USE TaskFlowDB_Dev;
GO

PRINT 'Adding Logto integration support...';

-- =============================================
-- 1. Add LogtoUserID column to Users table
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Users')
    AND name = 'LogtoUserID'
)
BEGIN
    ALTER TABLE Users
    ADD LogtoUserID NVARCHAR(255) NULL;

    PRINT 'LogtoUserID column added to Users table';
END
ELSE
BEGIN
    PRINT 'LogtoUserID column already exists in Users table';
END
GO

-- Add unique index on LogtoUserID (nullable unique constraint)
IF NOT EXISTS (
    SELECT * FROM sys.indexes
    WHERE name = 'IX_Users_LogtoUserID'
    AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Users_LogtoUserID
    ON Users(LogtoUserID)
    WHERE LogtoUserID IS NOT NULL;

    PRINT 'Unique index created on Users.LogtoUserID';
END
ELSE
BEGIN
    PRINT 'Index IX_Users_LogtoUserID already exists';
END
GO

-- =============================================
-- 2. Create LogtoUserSiteMappings table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LogtoUserSiteMappings')
BEGIN
    CREATE TABLE LogtoUserSiteMappings (
        MappingID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        LogtoUserID NVARCHAR(255) NOT NULL,
        SiteID UNIQUEIDENTIFIER NOT NULL,
        UserID UNIQUEIDENTIFIER NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Avatar NVARCHAR(500),
        Role NVARCHAR(50) NOT NULL DEFAULT 'Member',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        LastSyncAt DATETIME2,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT UQ_LogtoUser_Site UNIQUE (LogtoUserID, SiteID)
    );

    -- Create index on LogtoUserID for faster lookups
    CREATE NONCLUSTERED INDEX IX_LogtoUserSiteMappings_LogtoUserID
    ON LogtoUserSiteMappings(LogtoUserID);

    -- Create index on UserID for faster joins
    CREATE NONCLUSTERED INDEX IX_LogtoUserSiteMappings_UserID
    ON LogtoUserSiteMappings(UserID);

    PRINT 'LogtoUserSiteMappings table created with indexes';
END
ELSE
BEGIN
    PRINT 'LogtoUserSiteMappings table already exists';
END
GO

-- =============================================
-- 3. Create stored procedure: GetLogtoUserSites
-- Purpose: Get all sites assigned to a Logto user
-- =============================================
IF OBJECT_ID('dbo.GetLogtoUserSites', 'P') IS NOT NULL
    DROP PROCEDURE dbo.GetLogtoUserSites;
GO

CREATE PROCEDURE dbo.GetLogtoUserSites
    @LogtoUserID NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.MappingID,
        m.LogtoUserID,
        m.UserID,
        m.SiteID,
        s.SiteCode,
        s.SiteName,
        s.Domain,
        m.Email,
        m.Name,
        m.Avatar,
        m.Role,
        m.IsActive,
        m.CreatedAt,
        m.LastSyncAt
    FROM LogtoUserSiteMappings m
    INNER JOIN Sites s ON m.SiteID = s.SiteID
    WHERE m.LogtoUserID = @LogtoUserID
        AND m.IsActive = 1
        AND s.IsActive = 1
    ORDER BY m.CreatedAt DESC;
END
GO

PRINT 'Stored procedure GetLogtoUserSites created';
GO

-- =============================================
-- 4. Create stored procedure: SyncLogtoUser
-- Purpose: Sync Logto user to TaskFlow database
-- =============================================
IF OBJECT_ID('dbo.SyncLogtoUser', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SyncLogtoUser;
GO

CREATE PROCEDURE dbo.SyncLogtoUser
    @LogtoUserID NVARCHAR(255),
    @SiteID UNIQUEIDENTIFIER,
    @Email NVARCHAR(255),
    @Name NVARCHAR(200),
    @Avatar NVARCHAR(500) = NULL,
    @Role NVARCHAR(50) = 'Member'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID UNIQUEIDENTIFIER;
    DECLARE @ExistingMapping UNIQUEIDENTIFIER;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Check if mapping already exists
        SELECT @ExistingMapping = MappingID, @UserID = UserID
        FROM LogtoUserSiteMappings
        WHERE LogtoUserID = @LogtoUserID AND SiteID = @SiteID;

        IF @ExistingMapping IS NOT NULL
        BEGIN
            -- Update existing mapping
            UPDATE LogtoUserSiteMappings
            SET
                Email = @Email,
                Name = @Name,
                Avatar = ISNULL(@Avatar, Avatar),
                UpdatedAt = GETUTCDATE(),
                LastSyncAt = GETUTCDATE(),
                IsActive = 1
            WHERE MappingID = @ExistingMapping;

            -- Update corresponding user record
            UPDATE Users
            SET
                Email = @Email,
                Name = @Name,
                Avatar = ISNULL(@Avatar, Avatar),
                UpdatedAt = GETUTCDATE(),
                LastActive = GETUTCDATE()
            WHERE UserID = @UserID;

            PRINT 'Logto user mapping updated';
        END
        ELSE
        BEGIN
            -- Check if user exists with this email in the site
            SELECT @UserID = UserID
            FROM Users
            WHERE Email = @Email AND SiteID = @SiteID;

            IF @UserID IS NULL
            BEGIN
                -- Create new user
                SET @UserID = NEWID();

                INSERT INTO Users (
                    UserID, SiteID, Email, PasswordHash, Name, Avatar,
                    Role, Status, LogtoUserID, CreatedAt, UpdatedAt, LastActive
                )
                VALUES (
                    @UserID, @SiteID, @Email,
                    'LOGTO_AUTH', -- Placeholder password for Logto users
                    @Name, @Avatar, @Role, 'Active', @LogtoUserID,
                    GETUTCDATE(), GETUTCDATE(), GETUTCDATE()
                );

                PRINT 'New user created for Logto authentication';
            END
            ELSE
            BEGIN
                -- Link existing user to Logto
                UPDATE Users
                SET
                    LogtoUserID = @LogtoUserID,
                    UpdatedAt = GETUTCDATE(),
                    LastActive = GETUTCDATE()
                WHERE UserID = @UserID;

                PRINT 'Existing user linked to Logto';
            END

            -- Create mapping
            INSERT INTO LogtoUserSiteMappings (
                MappingID, LogtoUserID, SiteID, UserID,
                Email, Name, Avatar, Role, IsActive,
                CreatedAt, UpdatedAt, LastSyncAt
            )
            VALUES (
                NEWID(), @LogtoUserID, @SiteID, @UserID,
                @Email, @Name, @Avatar, @Role, 1,
                GETUTCDATE(), GETUTCDATE(), GETUTCDATE()
            );

            PRINT 'Logto user mapping created';
        END

        COMMIT TRANSACTION;

        -- Return user details
        SELECT
            u.UserID,
            u.SiteID,
            u.Email,
            u.Name,
            u.Avatar,
            u.Role,
            u.Status,
            u.LogtoUserID,
            s.SiteCode,
            s.SiteName
        FROM Users u
        INNER JOIN Sites s ON u.SiteID = s.SiteID
        WHERE u.UserID = @UserID;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'Stored procedure SyncLogtoUser created';
GO

-- =============================================
-- 5. Create stored procedure: DeactivateLogtoMapping
-- Purpose: Deactivate a Logto user mapping (soft delete)
-- =============================================
IF OBJECT_ID('dbo.DeactivateLogtoMapping', 'P') IS NOT NULL
    DROP PROCEDURE dbo.DeactivateLogtoMapping;
GO

CREATE PROCEDURE dbo.DeactivateLogtoMapping
    @LogtoUserID NVARCHAR(255),
    @SiteID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE LogtoUserSiteMappings
    SET
        IsActive = 0,
        UpdatedAt = GETUTCDATE()
    WHERE LogtoUserID = @LogtoUserID
        AND SiteID = @SiteID;

    IF @@ROWCOUNT > 0
        PRINT 'Logto user mapping deactivated';
    ELSE
        PRINT 'No mapping found to deactivate';
END
GO

PRINT 'Stored procedure DeactivateLogtoMapping created';
GO

PRINT '✅ Logto integration migration completed successfully!';
GO
