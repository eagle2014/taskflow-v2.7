-- =============================================
-- TaskFlow Database Seed Data
-- Purpose: Sample data for development and testing
-- =============================================

USE TaskFlowDB_Dev;
GO

PRINT 'Starting seed data insertion...';

-- =============================================
-- 1. Create Sample Sites (Tenants)
-- =============================================
PRINT 'Creating sample sites...';

DECLARE @Site1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Site2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Site3ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Sites (SiteID, SiteName, SiteCode, Domain, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt)
VALUES
    (@Site1ID, 'ACME Corporation', 'ACME', 'acme.taskflow.com', 1, 100, 50, GETUTCDATE(), GETUTCDATE()),
    (@Site2ID, 'Tech Startup Inc', 'TECHSTART', 'techstart.taskflow.com', 1, 50, 25, GETUTCDATE(), GETUTCDATE()),
    (@Site3ID, 'Consulting Group', 'CONSULT', 'consult.taskflow.com', 1, 200, 100, GETUTCDATE(), GETUTCDATE());

PRINT 'Sites created successfully.';

-- =============================================
-- 2. Create Sample Users for ACME Corporation
-- =============================================
PRINT 'Creating sample users for ACME...';

DECLARE @AdminUserID UNIQUEIDENTIFIER = NEWID();
DECLARE @ManagerUserID UNIQUEIDENTIFIER = NEWID();
DECLARE @Member1UserID UNIQUEIDENTIFIER = NEWID();
DECLARE @Member2UserID UNIQUEIDENTIFIER = NEWID();
DECLARE @CurrentTime DATETIME2 = GETUTCDATE();

-- Password: "admin123" - BCrypt hash (work factor 12)
-- Note: In production, use actual BCrypt.Net to generate these hashes
INSERT INTO Users (UserID, SiteID, Email, PasswordHash, Name, Avatar, Role, Status, CreatedAt, LastActive, UpdatedAt, IsDeleted)
VALUES
    (@AdminUserID, @Site1ID, 'admin@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'Admin', 'Active', @CurrentTime, @CurrentTime, @CurrentTime, 0),
    (@ManagerUserID, @Site1ID, 'manager@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'Project Manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager', 'Manager', 'Active', @CurrentTime, @CurrentTime, @CurrentTime, 0),
    (@Member1UserID, @Site1ID, 'john@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'Member', 'Active', @CurrentTime, @CurrentTime, @CurrentTime, 0),
    (@Member2UserID, @Site1ID, 'jane@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', 'Member', 'Active', @CurrentTime, @CurrentTime, @CurrentTime, 0);

PRINT 'Users created successfully.';

-- =============================================
-- 3. Create Sample Categories for ACME
-- =============================================
PRINT 'Creating sample categories...';

DECLARE @WebDevCategoryID UNIQUEIDENTIFIER = NEWID();
DECLARE @MobileDevCategoryID UNIQUEIDENTIFIER = NEWID();
DECLARE @MarketingCategoryID UNIQUEIDENTIFIER = NEWID();

INSERT INTO ProjectCategories (CategoryID, SiteID, Name, Description, Color, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@WebDevCategoryID, @Site1ID, 'Web Development', 'Web application development projects', '#3B82F6', GETUTCDATE(), GETUTCDATE(), 0),
    (@MobileDevCategoryID, @Site1ID, 'Mobile Development', 'Mobile app development projects', '#10B981', GETUTCDATE(), GETUTCDATE(), 0),
    (@MarketingCategoryID, @Site1ID, 'Marketing', 'Marketing and promotional projects', '#F59E0B', GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Categories created successfully.';

-- =============================================
-- 4. Create Sample Projects for ACME
-- =============================================
PRINT 'Creating sample projects...';

DECLARE @Project1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Project2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Project3ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Projects (ProjectID, SiteID, Name, Description, CategoryID, Status, Priority, StartDate, EndDate, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Project1ID, @Site1ID, 'TaskFlow Application', 'Build a comprehensive task management system with multi-tenant support', @WebDevCategoryID, 'Active', 'High', '2025-01-01', '2025-12-31', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Project2ID, @Site1ID, 'Mobile App Redesign', 'Redesign the company mobile application with modern UI/UX', @MobileDevCategoryID, 'Active', 'Medium', '2025-02-01', '2025-06-30', @ManagerUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Project3ID, @Site1ID, 'Q1 Marketing Campaign', 'Launch comprehensive marketing campaign for Q1 2025', @MarketingCategoryID, 'Planning', 'High', '2025-03-01', '2025-03-31', @ManagerUserID, GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Projects created successfully.';

-- =============================================
-- 5. Create Sample Phases for Projects
-- =============================================
PRINT 'Creating sample phases...';

DECLARE @Phase1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase3ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Phase4ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Phases (PhaseID, SiteID, ProjectID, Name, Description, Color, [Order], StartDate, EndDate, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Phase1ID, @Site1ID, @Project1ID, 'Planning & Design', 'Initial planning and design phase', '#3B82F6', 1, '2025-01-01', '2025-02-28', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Phase2ID, @Site1ID, @Project1ID, 'Development', 'Core development phase', '#10B981', 2, '2025-03-01', '2025-09-30', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Phase3ID, @Site1ID, @Project1ID, 'Testing & QA', 'Quality assurance and testing', '#F59E0B', 3, '2025-10-01', '2025-11-30', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Phase4ID, @Site1ID, @Project1ID, 'Deployment', 'Production deployment', '#EF4444', 4, '2025-12-01', '2025-12-31', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Phases created successfully.';

-- =============================================
-- 6. Create Sample Tasks
-- =============================================
PRINT 'Creating sample tasks...';

DECLARE @Task1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task2ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task3ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task4ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Task5ID UNIQUEIDENTIFIER = NEWID();

INSERT INTO Tasks (TaskID, SiteID, ProjectID, Title, Description, Status, Priority, AssigneeID, DueDate, EstimatedHours, ActualHours, Tags, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Task1ID, @Site1ID, @Project1ID, 'Design database schema', 'Create multi-tenant database schema with stored procedures', 'Done', 'High', @Member1UserID, '2025-01-15', 16, 18, 'database,backend', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Task2ID, @Site1ID, @Project1ID, 'Implement authentication', 'Implement JWT authentication with multi-tenant support', 'In Progress', 'High', @Member1UserID, '2025-01-25', 24, 12, 'backend,auth', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Task3ID, @Site1ID, @Project1ID, 'Build frontend UI', 'Create React components for main application', 'In Progress', 'High', @Member2UserID, '2025-02-15', 40, 15, 'frontend,react', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Task4ID, @Site1ID, @Project1ID, 'API integration', 'Integrate frontend with backend API', 'To Do', 'Medium', @Member2UserID, '2025-03-01', 20, 0, 'frontend,backend,integration', @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Task5ID, @Site1ID, @Project2ID, 'Create mockups', 'Design UI mockups for mobile app redesign', 'In Progress', 'High', @ManagerUserID, '2025-02-10', 16, 8, 'design,mobile', @ManagerUserID, GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Tasks created successfully.';

-- =============================================
-- 7. Create Sample Comments
-- =============================================
PRINT 'Creating sample comments...';

INSERT INTO Comments (CommentID, SiteID, TaskID, UserID, Content, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site1ID, @Task1ID, @AdminUserID, 'Great work on the database design! The multi-tenant architecture looks solid.', GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, @Task1ID, @Member1UserID, 'Thanks! I made sure all tables have SiteID and proper indexes.', GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, @Task2ID, @ManagerUserID, 'How is the JWT implementation going?', GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, @Task2ID, @Member1UserID, 'Making good progress. The token generation is working, now implementing refresh tokens.', GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, @Task3ID, @AdminUserID, 'Looking forward to seeing the UI components!', GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Comments created successfully.';

-- =============================================
-- 8. Create Sample Calendar Events
-- =============================================
PRINT 'Creating sample calendar events...';

INSERT INTO CalendarEvents (EventID, SiteID, Title, Description, TaskID, Type, Date, StartTime, EndTime, Location, Attendees, Color, ReminderMinutes, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site1ID, 'Sprint Planning Meeting', 'Plan tasks for the next 2-week sprint', NULL, 'meeting', '2025-02-01', '09:00:00', '10:30:00', 'Conference Room A', 'admin@acme.com,manager@acme.com,john@acme.com,jane@acme.com', '#3B82F6', 15, @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, 'Database Review', 'Review database schema with team', @Task1ID, 'review', '2025-01-20', '14:00:00', '15:00:00', 'Online - Zoom', 'admin@acme.com,john@acme.com', '#10B981', 30, @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, 'API Documentation Deadline', 'Deadline for completing API documentation', @Task4ID, 'deadline', '2025-03-01', NULL, NULL, NULL, NULL, '#EF4444', 1440, @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site1ID, 'Team Standup', 'Daily standup meeting', NULL, 'meeting', '2025-01-26', '09:00:00', '09:15:00', 'Main Office', 'admin@acme.com,manager@acme.com,john@acme.com,jane@acme.com', '#F59E0B', 5, @ManagerUserID, GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Calendar events created successfully.';

-- =============================================
-- 9. Create Sample Spaces
-- =============================================
PRINT 'Creating sample spaces...';

DECLARE @Space1ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Space2ID UNIQUEIDENTIFIER = NEWID();

-- Pre-compute ProjectIDs string to avoid subquery errors
DECLARE @Space1ProjectIDs NVARCHAR(MAX) = CAST(@Project1ID AS NVARCHAR(36)) + ',' + CAST(@Project2ID AS NVARCHAR(36));
DECLARE @Space2ProjectIDs NVARCHAR(MAX) = CAST(@Project3ID AS NVARCHAR(36));

INSERT INTO Spaces (SpaceID, SiteID, Name, Description, Color, Icon, ProjectIDs, CreatedBy, CreatedAt, UpdatedAt, IsDeleted)
VALUES
    (@Space1ID, @Site1ID, 'Development', 'All development projects', '#3B82F6', 'Code', @Space1ProjectIDs, @AdminUserID, GETUTCDATE(), GETUTCDATE(), 0),
    (@Space2ID, @Site1ID, 'Marketing & Sales', 'Marketing and sales projects', '#F59E0B', 'TrendingUp', @Space2ProjectIDs, @ManagerUserID, GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Spaces created successfully.';

-- =============================================
-- 10. Create Sample Users for Tech Startup
-- =============================================
PRINT 'Creating sample users for Tech Startup...';

INSERT INTO Users (UserID, SiteID, Email, PasswordHash, Name, Avatar, Role, Status, CreatedAt, LastActive, UpdatedAt, IsDeleted)
VALUES
    (NEWID(), @Site2ID, 'ceo@techstart.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'CEO Tech', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO', 'Admin', 'Active', GETUTCDATE(), GETUTCDATE(), GETUTCDATE(), 0),
    (NEWID(), @Site2ID, 'dev@techstart.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIiLkRxW.2', 'Lead Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', 'Manager', 'Active', GETUTCDATE(), GETUTCDATE(), GETUTCDATE(), 0);

PRINT 'Tech Startup users created successfully.';

-- =============================================
-- Verification Queries
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Seed Data Summary:';
PRINT '========================================';

PRINT 'Sites: ' + CAST((SELECT COUNT(*) FROM Sites) AS NVARCHAR(10));
PRINT 'Users (Total): ' + CAST((SELECT COUNT(*) FROM Users WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Users (ACME): ' + CAST((SELECT COUNT(*) FROM Users WHERE SiteID = @Site1ID AND IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Users (Tech Startup): ' + CAST((SELECT COUNT(*) FROM Users WHERE SiteID = @Site2ID AND IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Categories: ' + CAST((SELECT COUNT(*) FROM ProjectCategories WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Projects: ' + CAST((SELECT COUNT(*) FROM Projects WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Phases: ' + CAST((SELECT COUNT(*) FROM Phases WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Tasks: ' + CAST((SELECT COUNT(*) FROM Tasks WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Comments: ' + CAST((SELECT COUNT(*) FROM Comments WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Events: ' + CAST((SELECT COUNT(*) FROM CalendarEvents WHERE IsDeleted = 0) AS NVARCHAR(10));
PRINT 'Spaces: ' + CAST((SELECT COUNT(*) FROM Spaces WHERE IsDeleted = 0) AS NVARCHAR(10));

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
PRINT 'Seed data insertion completed successfully!';
PRINT '========================================';

GO
