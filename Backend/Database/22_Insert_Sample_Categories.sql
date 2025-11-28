-- =============================================
-- Insert Sample Categories
-- Purpose: Create sample categories from mockup data
-- =============================================

USE DB_PMS;
GO

-- Check existing categories first
IF NOT EXISTS (SELECT 1 FROM ProjectCategories WHERE SiteID = 'T0001')
BEGIN
    -- Insert sample categories for site T0001
    INSERT INTO ProjectCategories (CategoryID, SiteID, Name, Color, Icon, CreatedAt, UpdatedAt, IsDeleted)
    VALUES
        ('CAT001', 'T0001', 'Development', '#3B82F6', '💻', GETUTCDATE(), GETUTCDATE(), 0),
        ('CAT002', 'T0001', 'Design', '#8B5CF6', '🎨', GETUTCDATE(), GETUTCDATE(), 0),
        ('CAT003', 'T0001', 'Marketing', '#10B981', '📢', GETUTCDATE(), GETUTCDATE(), 0),
        ('CAT004', 'T0001', 'Sales', '#F59E0B', '💰', GETUTCDATE(), GETUTCDATE(), 0),
        ('CAT005', 'T0001', 'Research', '#6366F1', '🔬', GETUTCDATE(), GETUTCDATE(), 0),
        ('CAT006', 'T0001', 'Operations', '#EF4444', '⚙️', GETUTCDATE(), GETUTCDATE(), 0);

    PRINT '✓ Sample categories inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Categories already exist for site T0001';
END
GO

-- Show all categories
SELECT CategoryID, SiteID, Name, Color, Icon
FROM ProjectCategories
WHERE SiteID = 'T0001' AND IsDeleted = 0;
GO
