-- Check Sites table
SELECT
    CAST(SiteID AS VARCHAR(36)) AS SiteID,
    SiteCode,
    SiteName,
    IsActive
FROM Sites;

-- Check Users for ACME site
SELECT
    CAST(u.UserID AS VARCHAR(36)) AS UserID,
    CAST(u.SiteID AS VARCHAR(36)) AS SiteID,
    u.Email,
    u.Name,
    u.Role,
    u.Status,
    LEFT(u.PasswordHash, 20) + '...' AS PasswordHashPreview
FROM Users u
WHERE u.Email = 'admin@acme.com';

-- Check if the specific SiteID from error exists
SELECT
    CAST(SiteID AS VARCHAR(36)) AS SiteID,
    SiteCode,
    SiteName,
    IsActive
FROM Sites
WHERE SiteID = '9a25ec5c-5e1d-4013-bf0e-48ad4db30eae';
