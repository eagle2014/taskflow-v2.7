-- =============================================
-- Fix SiteID Mismatch Between Database and Frontend
-- Frontend expects: 9A25EC5C-5E1D-4013-BF0E-48AD4DB30EAE
-- Database has: E49BCCB0-E641-4381-8D26-7430E5F9692A
-- =============================================

USE TaskFlowDB_Dev;

DECLARE @OldSiteID UNIQUEIDENTIFIER = 'E49BCCB0-E641-4381-8D26-7430E5F9692A';
DECLARE @NewSiteID UNIQUEIDENTIFIER = '9A25EC5C-5E1D-4013-BF0E-48AD4DB30EAE';

PRINT 'Starting SiteID migration from ' + CAST(@OldSiteID AS VARCHAR(36)) + ' to ' + CAST(@NewSiteID AS VARCHAR(36));

BEGIN TRANSACTION;

BEGIN TRY
    -- Step 1: Update all child tables first (to maintain referential integrity)

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

    -- Step 2: Finally update the Sites table (parent)
    PRINT 'Updating Sites table...';
    UPDATE Sites SET SiteID = @NewSiteID WHERE SiteID = @OldSiteID;
    PRINT '  Affected rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

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

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT 'ERROR: SiteID migration failed!';
    PRINT '========================================';
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));

    THROW;
END CATCH;
