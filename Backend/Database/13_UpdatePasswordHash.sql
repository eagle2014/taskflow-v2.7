-- =============================================
-- Update Password Hashes for Sample Users
-- Password: admin123
-- BCrypt Hash: $2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C
-- (Verified working hash generated with BCrypt.Net work factor 12)
-- =============================================

USE TaskFlowDB_Dev;
GO

PRINT 'Updating password hashes for all users...';

-- Update all users with correct BCrypt hash for "admin123"
UPDATE Users
SET PasswordHash = '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C',
    UpdatedAt = GETUTCDATE()
WHERE IsDeleted = 0;

PRINT '✅ Password hashes updated successfully!';
PRINT 'All users now have password: admin123';

-- Show updated users
SELECT
    Email,
    Name,
    Role,
    Status,
    LEFT(PasswordHash, 20) + '...' AS PasswordHash
FROM Users
WHERE IsDeleted = 0
ORDER BY Email;

GO