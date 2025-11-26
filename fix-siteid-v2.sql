-- =============================================
-- Fix SiteID Mismatch Between Database and Frontend (V2)
-- Frontend expects: 9A25EC5C-5E1D-4013-BF0E-48AD4DB30EAE
-- Database has: E49BCCB0-E641-4381-8D26-7430E5F9692A
-- Strategy: Disable FK constraints, update all tables, re-enable constraints
-- =============================================

USE TaskFlowDB_Dev;

DECLARE @OldSiteID UNIQUEIDENTIFIER = 'E49BCCB0-E641-4381-8D26-7430E5F9692A';
DECLARE @NewSiteID UNIQUEIDENTIFIER = '9A25EC5C-5E1D-4013-BF0E-48AD4DB30EAE';

PRINT 'Starting SiteID migration from ' + CAST(@OldSiteID AS VARCHAR(36)) + ' to ' + CAST(@NewSiteID AS VARCHAR(36));

BEGIN TRANSACTION;

BEGIN TRY
    -- Step 1: Disable all foreign key constraints
    PRINT 'Disabling foreign key constraints...';
    EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

    -- Step 2: Update Sites table first (parent table)
    PRINT 'Updating Sites table...';
    UPDATE Sites SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- Step 3: Update all child tables
    PRINT 'Updating Users table...';
    UPDATE Users SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating ProjectCategories table...';
    UPDATE ProjectCategories SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating Projects table...';
    UPDATE Projects SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating Phases table...';
    UPDATE Phases SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating Tasks table...';
    UPDATE Tasks SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating Comments table...';
    UPDATE Comments SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating CalendarEvents table...';
    UPDATE CalendarEvents SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    PRINT 'Updating Spaces table...';
    UPDATE Spaces SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- Step 4: Re-enable all foreign key constraints
    PRINT 'Re-enabling foreign key constraints...';
    EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT 'SUCCESS: SiteID migration completed!';
    PRINT '========================================';

    -- Verification
    PRINT '';
    PRINT 'Verification:';
    SELECT
        CAST(SiteID AS VARCHAR(36)) AS SiteID,
        SiteCode,
        SiteName,
        IsActive
    FROM Sites
    WHERE SiteID = @NewSiteID;

    SELECT
        CAST(UserID AS VARCHAR(36)) AS UserID,
        Email,
        Name,
        Role,
        CAST(SiteID AS VARCHAR(36)) AS SiteID
    FROM Users
    WHERE Email = 'admin@acme.com';

    PRINT '';
    PRINT '========================================';
    PRINT 'Updated Login Credentials:';
    PRINT '========================================';
    PRINT 'Site ID: 9A25EC5C-5E1D-4013-BF0E-48AD4DB30EAE';
    PRINT 'Email: admin@acme.com';
    PRINT 'Password: admin123';
    PRINT '========================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    -- Attempt to re-enable constraints even if error occurs
    BEGIN TRY
        EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';
    END TRY
    BEGIN CATCH
        PRINT 'Warning: Could not re-enable some constraints';
    END CATCH

    PRINT '';
    PRINT '========================================';
    PRINT 'ERROR: SiteID migration failed!';
    PRINT '========================================';
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));

    THROW;
END CATCH;