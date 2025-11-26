-- =============================================
-- TaskFlow Database Seed Data (FIXED)
-- Purpose: Sample data for development and testing
-- All GETUTCDATE() calls moved to variables
-- =============================================

USE TaskFlowDB_Dev;

PRINT 'Starting seed data insertion...';

-- Pre-calculate current time to avoid subquery errors
DECLARE @Now DATETIME2 = GETUTCDATE();

-- =============================================
-- 1. Create Sample Sites (Tenants)
-- =============================================
PRINT 'Creating sample sites...';

DECLARE @Site1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Site2ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sites (SiteID, SiteName, SiteCode, Domain, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt)
VALUES
    (@Site1ID, 'ACME Corporation', 'ACME', 'acme.taskflow.com', 1, 100, 50, @Now, @Now),
    (@Site2ID, 'Tech Startup Inc', 'TECHSTART', 'techstart.taskflow.com', 1, 50, 25, @Now, @Now);

PRINT 'Sites created successfully.';

-- =============================================
-- 2. Create Sample Users for ACME Corporation
-- =============================================
PRINT 'Creating sample users for ACME...';

DECLARE @AdminUserID UNIQUEIDENTIFIER = NEWID();
DECLARE @ManagerUserID UNIQUEIDENTIFIER = NEWID();
DECLARE @Member1UserID UNIQUEIDENTIFIER = NEWID();
DECLARE @Member2UserID UNIQUEIDENTIFIER = NEWID();

-- Password: "admin123" - BCrypt hash (work factor 12) - Verified working
INSERT INTO Users (UserID, SiteID, Email, PasswordHash, Name, Avatar, Role, Status, CreatedAt, LastActive, UpdatedAt, IsDeleted)
VALUES
    (@AdminUserID, @Site1ID, 'admin@acme.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'Admin', 'Active', @Now, @Now, @Now, 0),
    (@ManagerUserID, @Site1ID, 'manager@acme.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'Project Manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager', 'Manager', 'Active', @Now, @Now, @Now, 0),
    (@Member1UserID, @Site1ID, 'john@acme.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'Member', 'Active', @Now, @Now, @Now, 0),
    (@Member2UserID, @Site1ID, 'jane@acme.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'Member', 'Active', @Now, @Now, @Now, 0);

PRINT 'ACME users created successfully.';

-- =============================================
-- 3. Create Sample Users for Tech Startup
-- =============================================
PRINT 'Creating sample users for Tech Startup...';

INSERT INTO Users (UserID, SiteID, Email, PasswordHash, Name, Avatar, Role, Status, CreatedAt, LastActive, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site2ID, 'ceo@techstart.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'CEO Tech', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO', 'Admin', 'Active', @Now, @Now, @Now, 0),
    (NEWID(), @Site2ID, 'dev@techstart.com', '$2a$12$OlqYNkHdxaaKh4nFbSGpmOqk59PeKBdv03DIkPifYRvZGn5HVkb9C', 'Lead Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', 'Manager', 'Active', @Now, @Now, @Now, 0);

PRINT 'Tech Startup users created successfully.';

-- =============================================
-- 4. Create Sample Categories
-- =============================================
PRINT 'Creating sample categories...';

DECLARE @WebDevCategoryID UNIQUEIDENTIFIER = NEWID();
DECLARE @MobileDevCategoryID UNIQUEIDENTIFIER = NEWID();
DECLARE @MarketingCategoryID UNIQUEIDENTIFIER = NEWID();

INSERT INTO ProjectCategories (CategoryID, SiteID, Name, Description, Color, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@WebDevCategoryID, @Site1ID, 'Web Development', 'Web application development projects', '#3B82F6', @AdminUserID, @Now, @Now, 0),
    (@MobileDevCategoryID, @Site1ID, 'Mobile Development', 'Mobile app development projects', '#10B981', @AdminUserID, @Now, @Now, 0),
    (@MarketingCategoryID, @Site1ID, 'Marketing', 'Marketing and promotional projects', '#F59E0B', @ManagerUserID, @Now, @Now, 0);

PRINT 'Categories created successfully.';

-- =============================================
-- 5. Create Sample Projects
-- =============================================
PRINT 'Creating sample projects...';

DECLARE @Project1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Project2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Project3ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Projects (ProjectID, SiteID, Name, Description, CategoryID, Status, Priority, StartDate, EndDate, Budget, Color, Icon, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Project1ID, @Site1ID, 'TaskFlow Application', 'Build a comprehensive task management system with multi-tenant support', @WebDevCategoryID, 'Active', 'High', '2025-01-01', '2025-12-31', 150000.00, '#3B82F6', 'Laptop', @AdminUserID, @Now, @Now, 0),
    (@Project2ID, @Site1ID, 'Mobile App Redesign', 'Redesign the company mobile application with modern UI/UX', @MobileDevCategoryID, 'Active', 'Medium', '2025-02-01', '2025-06-30', 75000.00, '#10B981', 'Smartphone', @ManagerUserID, @Now, @Now, 0),
    (@Project3ID, @Site1ID, 'Q1 Marketing Campaign', 'Launch comprehensive marketing campaign for Q1 2025', @MarketingCategoryID, 'Planning', 'High', '2025-03-01', '2025-03-31', 50000.00, '#F59E0B', 'TrendingUp', @ManagerUserID, @Now, @Now, 0);

PRINT 'Projects created successfully.';

-- =============================================
-- 6. Create Sample Phases
-- =============================================
PRINT 'Creating sample phases...';

DECLARE @Phase1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase3ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase4ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Phases (PhaseID, SiteID, ProjectID, Name, Description, Color, [Order], StartDate, EndDate, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Phase1ID, @Site1ID, @Project1ID, 'Planning & Design', 'Initial planning and design phase', '#3B82F6', 1, '2025-01-01', '2025-02-28', @AdminUserID, @Now, @Now, 0),
    (@Phase2ID, @Site1ID, @Project1ID, 'Development', 'Core development phase', '#10B981', 2, '2025-03-01', '2025-09-30', @AdminUserID, @Now, @Now, 0),
    (@Phase3ID, @Site1ID, @Project1ID, 'Testing & QA', 'Quality assurance and testing', '#F59E0B', 3, '2025-10-01', '2025-11-30', @AdminUserID, @Now, @Now, 0),
    (@Phase4ID, @Site1ID, @Project1ID, 'Deployment', 'Production deployment', '#EF4444', 4, '2025-12-01', '2025-12-31', @AdminUserID, @Now, @Now, 0);

PRINT 'Phases created successfully.';

-- =============================================
-- 7. Create Sample Tasks
-- =============================================
PRINT 'Creating sample tasks...';

DECLARE @Task1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task3ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task4ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task5ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Tasks (TaskID, SiteID, ProjectID, PhaseID, Title, Description, Status, Priority, AssigneeID, DueDate, EstimatedHours, ActualHours, Progress, Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Task1ID, @Site1ID, @Project1ID, @Phase1ID, 'Design database schema', 'Create multi-tenant database schema with stored procedures', 'Done', 'High', @Member1UserID, '2025-01-15', 16, 18, 100, 'database,backend', @AdminUserID, @Now, @Now, 0),
    (@Task2ID, @Site1ID, @Project1ID, @Phase2ID, 'Implement authentication', 'Implement JWT authentication with multi-tenant support', 'In Progress', 'High', @Member1UserID, '2025-01-25', 24, 12, 50, 'backend,auth', @AdminUserID, @Now, @Now, 0),
    (@Task3ID, @Site1ID, @Project1ID, @Phase2ID, 'Build frontend UI', 'Create React components for main application', 'In Progress', 'High', @Member2UserID, '2025-02-15', 40, 15, 40, 'frontend,react', @AdminUserID, @Now, @Now, 0),
    (@Task4ID, @Site1ID, @Project1ID, @Phase2ID, 'API integration', 'Integrate frontend with backend API', 'To Do', 'Medium', @Member2UserID, '2025-03-01', 20, 0, 0, 'frontend,backend,integration', @AdminUserID, @Now, @Now, 0),
    (@Task5ID, @Site1ID, @Project2ID, NULL, 'Create mockups', 'Design UI mockups for mobile app redesign', 'In Progress', 'High', @ManagerUserID, '2025-02-10', 16, 8, 30, 'design,mobile', @ManagerUserID, @Now, @Now, 0);

PRINT 'Tasks created successfully.';

-- =============================================
-- 8. Create Sample Comments
-- =============================================
PRINT 'Creating sample comments...';

INSERT INTO Comments (CommentID, SiteID, TaskID, UserID, Content, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site1ID, @Task1ID, @AdminUserID, 'Great work on the database design! The multi-tenant architecture looks solid.', @Now, @Now, 0),
    (NEWID(), @Site1ID, @Task1ID, @Member1UserID, 'Thank you! I made sure all tables include SiteID for proper tenant isolation.', @Now, @Now, 0),
    (NEWID(), @Site1ID, @Task2ID, @ManagerUserID, 'How is the JWT implementation coming along?', @Now, @Now, 0),
    (NEWID(), @Site1ID, @Task2ID, @Member1UserID, 'Making good progress. The token includes siteId, siteCode, userId, and role claims.', @Now, @Now, 0),
    (NEWID(), @Site1ID, @Task3ID, @AdminUserID, 'Remember to use the existing UI components from the components/ui folder.', @Now, @Now, 0);

PRINT 'Comments created successfully.';

-- =============================================
-- 9. Create Sample Calendar Events
-- =============================================
PRINT 'Creating sample events...';

INSERT INTO CalendarEvents (EventID, SiteID, Title, Description, StartDate, EndDate, IsAllDay, Location, Color, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site1ID, 'Sprint Planning', 'Plan tasks for upcoming 2-week sprint', '2025-01-20 09:00:00', '2025-01-20 11:00:00', 0, 'Conference Room A', '#3B82F6', @AdminUserID, @Now, @Now, 0),
    (NEWID(), @Site1ID, 'Client Demo', 'Demo TaskFlow features to potential client', '2025-01-25 14:00:00', '2025-01-25 15:30:00', 0, 'Virtual - Zoom', '#10B981', @ManagerUserID, @Now, @Now, 0),
    (NEWID(), @Site1ID, 'Team Retrospective', 'Discuss what went well and what can improve', '2025-02-03 10:00:00', '2025-02-03 11:30:00', 0, 'Conference Room B', '#F59E0B', @AdminUserID, @Now, @Now, 0),
    (NEWID(), @Site1ID, 'Project Deadline', 'TaskFlow MVP must be completed', '2025-03-31', '2025-03-31', 1, NULL, '#EF4444', @AdminUserID, @Now, @Now, 0);

PRINT 'Events created successfully.';

-- =============================================
-- 10. Create Sample Spaces
-- =============================================
PRINT 'Creating sample spaces...';

DECLARE @Space1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Space2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Space1ProjectIDs NVARCHAR(MAX) = CAST(@Project1ID AS NVARCHAR(36)) + ',' + CAST(@Project2ID AS NVARCHAR(36));
DECLARE @Space2ProjectIDs NVARCHAR(MAX) = CAST(@Project3ID AS NVARCHAR(36));

INSERT INTO Spaces (SpaceID, SiteID, Name, Description, Color, Icon, ProjectIDs, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Space1ID, @Site1ID, 'Development', 'All development projects', '#3B82F6', 'Code', @Space1ProjectIDs, @AdminUserID, @Now, @Now, 0),
    (@Space2ID, @Site1ID, 'Marketing & Sales', 'Marketing and sales projects', '#F59E0B', 'TrendingUp', @Space2ProjectIDs, @ManagerUserID, @Now, @Now, 0);

PRINT 'Spaces created successfully.';

-- =============================================
-- Verification Summary
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Seed Data Summary:';
PRINT '========================================';

DECLARE @SiteCount INT = (SELECT COUNT(*) FROM Sites);
DECLARE @UserCount INT = (SELECT COUNT(*) FROM Users WHERE IsDeleted = 0);
DECLARE @CategoryCount INT = (SELECT COUNT(*) FROM ProjectCategories WHERE IsDeleted = 0);
DECLARE @ProjectCount INT = (SELECT COUNT(*) FROM Projects WHERE IsDeleted = 0);
DECLARE @PhaseCount INT = (SELECT COUNT(*) FROM Phases WHERE IsDeleted = 0);
DECLARE @TaskCount INT = (SELECT COUNT(*) FROM Tasks WHERE IsDeleted = 0);
DECLARE @CommentCount INT = (SELECT COUNT(*) FROM Comments WHERE IsDeleted = 0);
DECLARE @EventCount INT = (SELECT COUNT(*) FROM CalendarEvents WHERE IsDeleted = 0);
DECLARE @SpaceCount INT = (SELECT COUNT(*) FROM Spaces WHERE IsDeleted = 0);

PRINT 'Sites: ' + CAST(@SiteCount AS NVARCHAR(10));
PRINT 'Users: ' + CAST(@UserCount AS NVARCHAR(10));
PRINT 'Categories: ' + CAST(@CategoryCount AS NVARCHAR(10));
PRINT 'Projects: ' + CAST(@ProjectCount AS NVARCHAR(10));
PRINT 'Phases: ' + CAST(@PhaseCount AS NVARCHAR(10));
PRINT 'Tasks: ' + CAST(@TaskCount AS NVARCHAR(10));
PRINT 'Comments: ' + CAST(@CommentCount AS NVARCHAR(10));
PRINT 'Events: ' + CAST(@EventCount AS NVARCHAR(10));
PRINT 'Spaces: ' + CAST(@SpaceCount AS NVARCHAR(10));

PRINT '';
PRINT '========================================';
PRINT 'Sample Login Credentials:';
PRINT '========================================';
PRINT 'Site: ACME';
PRINT '  Admin: admin@acme.com / admin123';
PRINT '  Manager: manager@acme.com / admin123';
PRINT '  Member: john@acme.com / admin123';
PRINT '  Member: jane@acme.com / admin123';
PRINT '';
PRINT 'Site: TECHSTART';
PRINT '  Admin: ceo@techstart.com / admin123';
PRINT '  Manager: dev@techstart.com / admin123';
PRINT '';
PRINT '✅ Seed data completed successfully!';
