-- =============================================
-- Alter CategoryID from UNIQUEIDENTIFIER to NVARCHAR(50) - Complete Version
-- Purpose: Change data type to simplify category management
-- =============================================

USE DB_PMS;
GO

-- Step 1: Drop foreign key constraint from Projects table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__Projects__Catego__5629CD9C')
    ALTER TABLE Projects DROP CONSTRAINT FK__Projects__Catego__5629CD9C;
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Projects_Categories')
    ALTER TABLE Projects DROP CONSTRAINT FK_Projects_Categories;
GO

-- Step 2: Update existing Projects to set CategoryID to NULL
UPDATE Projects SET CategoryID = NULL;
GO

-- Step 3: Drop primary key from ProjectCategories
DECLARE @pkName NVARCHAR(255);
SELECT @pkName = name FROM sys.key_constraints
WHERE type = 'PK' AND parent_object_id = OBJECT_ID('ProjectCategories');
IF @pkName IS NOT NULL
    EXEC('ALTER TABLE ProjectCategories DROP CONSTRAINT ' + @pkName);
GO

-- Step 4: Drop default constraint from ProjectCategories.CategoryID
DECLARE @dfName NVARCHAR(255);
SELECT @dfName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ProjectCategories')
AND parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ProjectCategories') AND name = 'CategoryID');
IF @dfName IS NOT NULL
    EXEC('ALTER TABLE ProjectCategories DROP CONSTRAINT ' + @dfName);
GO

-- Step 5: Alter ProjectCategories.CategoryID to NVARCHAR(50)
ALTER TABLE ProjectCategories
ALTER COLUMN CategoryID NVARCHAR(50) NOT NULL;
GO

-- Step 6: Re-create primary key on ProjectCategories
ALTER TABLE ProjectCategories
ADD CONSTRAINT PK_ProjectCategories PRIMARY KEY (CategoryID);
GO

-- Step 7: Alter Projects.CategoryID to NVARCHAR(50)
ALTER TABLE Projects
ALTER COLUMN CategoryID NVARCHAR(50) NULL;
GO

-- Step 8: Re-create foreign key constraint
ALTER TABLE Projects
ADD CONSTRAINT FK_Projects_Categories
FOREIGN KEY (CategoryID) REFERENCES ProjectCategories(CategoryID);
GO

-- Step 9: Delete old GUID-based categories
DELETE FROM ProjectCategories WHERE SiteID = 'T0001';
GO

-- Step 10: Insert sample categories with string IDs
INSERT INTO ProjectCategories (CategoryID, SiteID, Name, Color, Icon, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    ('CAT001', 'T0001', 'Development', '#3B82F6', '💻', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT002', 'T0001', 'Design', '#8B5CF6', '🎨', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT003', 'T0001', 'Marketing', '#10B981', '📢', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT004', 'T0001', 'Sales', '#F59E0B', '💰', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT005', 'T0001', 'Research', '#6366F1', '🔬', GETUTCDATE(), GETUTCDATE(), 0),
    ('CAT006', 'T0001', 'Operations', '#EF4444', '⚙️', GETUTCDATE(), GETUTCDATE(), 0);
GO

PRINT '✓ CategoryID changed to NVARCHAR(50) and sample categories created!';
GO

-- Show all categories
SELECT CategoryID, SiteID, Name, Color, Icon
FROM ProjectCategories
WHERE SiteID = 'T0001' AND IsDeleted = 0;
GO
