-- =============================================
-- TaskFlow Seed Data for Remote DB_PMS
-- Run on: kiena.vietgoat.com,400
-- =============================================

USE DB_PMS;
GO

-- Check if Sites table exists and what data it has
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Sites')
BEGIN
    PRINT 'Sites table exists. Current data:';
    SELECT SiteID, SiteName, SiteCode, IsActive FROM Sites;
END
ELSE
BEGIN
    PRINT 'Sites table does not exist!';
END
GO

-- Check Users
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    PRINT 'Users table exists. Current data:';
    SELECT TOP 10 UserID, Email, Name, Role, SiteID FROM Users WHERE IsDeleted = 0;
END
GO
