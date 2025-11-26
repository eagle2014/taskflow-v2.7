-- Add Logto user mapping for trungnt@T00001.com
-- Run this script on the remote database: kiena.vietgoat.com:400 / DB_PMS

USE DB_PMS;
GO

-- Check existing sites
SELECT SiteID, SiteCode, SiteName, IsActive FROM Sites;

-- Check existing users
SELECT UserID, Email, Name, Role, SiteID, LogtoUserID FROM Users WHERE IsDeleted = 0;

-- Option 1: Update existing user to have the Logto email
-- UPDATE Users
-- SET Email = 'trungnt@T00001.com', LogtoUserID = 'ri9nilb7wyxu'
-- WHERE Email = 'admin@acme.com' AND IsDeleted = 0;

-- Option 2: Insert new user with Logto email (requires knowing SiteID)
-- First, find an active SiteID:
-- DECLARE @SiteID NVARCHAR(50);
-- SELECT TOP 1 @SiteID = SiteID FROM Sites WHERE IsActive = 1;

-- INSERT INTO Users (UserID, SiteID, Email, Name, PasswordHash, Role, Status, LogtoUserID, CreatedAt, UpdatedAt, IsDeleted)
-- VALUES (NEWID(), @SiteID, 'trungnt@T00001.com', 'Trung NT', '', 'Admin', 'Active', 'ri9nilb7wyxu', GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Run the appropriate UPDATE or INSERT statement based on your needs';
