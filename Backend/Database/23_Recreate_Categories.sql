-- =============================================
-- Recreate Categories with String IDs
-- Purpose: Delete old GUID-based categories and create new string-based ones
-- =============================================

USE DB_PMS;
GO

-- Delete existing categories
DELETE FROM ProjectCategories WHERE SiteID = 'T0001';
GO

-- Insert sample categories with string IDs
INSERT INTO ProjectCategories (CategoryID, SiteID, Name, Color, Icon, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    ('CAT001', 'T0001', 'Development', '#3B82F6', '💻', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT002', 'T0001', 'Design', '#8B5CF6', '🎨', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT003', 'T0001', 'Marketing', '#10B981', '📢', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT004', 'T0001', 'Sales', '#F59E0B', '💰', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT005', 'T0001', 'Research', '#6366F1', '🔬', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT006', 'T0001', 'Operations', '#EF4444', '⚙️', GETUTCDATE(), GETUTCDATE(), 0);
GO

PRINT '✓ Categories recreated with string IDs successfully!';
GO

-- Show all categories
SELECT CategoryID, SiteID, Name, Color, Icon
FROM ProjectCategories
WHERE SiteID = 'T0001' AND IsDeleted = 0;
GO
