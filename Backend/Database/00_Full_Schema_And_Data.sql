-- =============================================
-- TaskFlow Complete Database Setup
-- Purpose: Creates schema, sample stored procedures, and sample data
-- =============================================

USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TaskFlowDB_Dev')
BEGIN
    CREATE DATABASE TaskFlowDB_Dev;
    PRINT 'Database TaskFlowDB_Dev created';
END
ELSE
BEGIN
    PRINT 'Database TaskFlowDB_Dev already exists';
END
GO

USE TaskFlowDB_Dev;
GO

-- =============================================
-- SCHEMA CREATION
-- =============================================
PRINT 'Creating schema...';

-- Sites table (Multi-tenant)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sites')
BEGIN
    CREATE TABLE Sites (
        SiteID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteName NVARCHAR(200) NOT NULL,
        SiteCode NVARCHAR(50) NOT NULL UNIQUE,
        Domain NVARCHAR(200),
        IsActive BIT NOT NULL DEFAULT 1,
        MaxUsers INT DEFAULT 100,
        MaxProjects INT DEFAULT 50,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Sites table created';
END

-- Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Avatar NVARCHAR(500),
        Role NVARCHAR(50) NOT NULL DEFAULT 'Member',
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        RefreshToken NVARCHAR(500),
        RefreshTokenExpiry DATETIME2,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        LastActive DATETIME2,
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        CONSTRAINT UQ_User_Email_Site UNIQUE (SiteID, Email)
    );
    PRINT 'Users table created';
END

-- ProjectCategories table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProjectCategories')
BEGIN
    CREATE TABLE ProjectCategories (
        CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        Color NVARCHAR(50),
        Icon NVARCHAR(100),
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );
    PRINT 'ProjectCategories table created';
END

-- Projects table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Projects')
BEGIN
    CREATE TABLE Projects (
        ProjectID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        CategoryID UNIQUEIDENTIFIER,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        Priority NVARCHAR(50),
        StartDate DATE,
        EndDate DATE,
        Budget DECIMAL(18,2),
        Color NVARCHAR(50),
        Icon NVARCHAR(100),
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        FOREIGN KEY (CategoryID) REFERENCES ProjectCategories(CategoryID)
    );
    PRINT 'Projects table created';
END

-- Phases table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Phases')
BEGIN
    CREATE TABLE Phases (
        PhaseID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        ProjectID UNIQUEIDENTIFIER NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        Color NVARCHAR(50),
        [Order] INT,
        StartDate DATE,
        EndDate DATE,
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID)
    );
    PRINT 'Phases table created';
END

-- Tasks table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
BEGIN
    CREATE TABLE Tasks (
        TaskID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        ProjectID UNIQUEIDENTIFIER NOT NULL,
        PhaseID UNIQUEIDENTIFIER,
        ParentTaskID UNIQUEIDENTIFIER,
        Title NVARCHAR(500) NOT NULL,
        Description NVARCHAR(MAX),
        Status NVARCHAR(50) NOT NULL DEFAULT 'To Do',
        Priority NVARCHAR(50),
        AssigneeID UNIQUEIDENTIFIER,
        StartDate DATE,
        DueDate DATE,
        CompletedDate DATE,
        EstimatedHours DECIMAL(10,2),
        ActualHours DECIMAL(10,2),
        Progress INT DEFAULT 0,
        Tags NVARCHAR(MAX),
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID),
        FOREIGN KEY (PhaseID) REFERENCES Phases(PhaseID),
        FOREIGN KEY (ParentTaskID) REFERENCES Tasks(TaskID),
        FOREIGN KEY (AssigneeID) REFERENCES Users(UserID)
    );
    PRINT 'Tasks table created';
END

-- Comments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Comments')
BEGIN
    CREATE TABLE Comments (
        CommentID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        TaskID UNIQUEIDENTIFIER NOT NULL,
        UserID UNIQUEIDENTIFIER NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        ParentCommentID UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID),
        FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (ParentCommentID) REFERENCES Comments(CommentID)
    );
    PRINT 'Comments table created';
END

-- CalendarEvents table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalendarEvents')
BEGIN
    CREATE TABLE CalendarEvents (
        EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        Title NVARCHAR(500) NOT NULL,
        Description NVARCHAR(MAX),
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        IsAllDay BIT NOT NULL DEFAULT 0,
        Location NVARCHAR(500),
        Color NVARCHAR(50),
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );
    PRINT 'CalendarEvents table created';
END

-- Spaces table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Spaces')
BEGIN
    CREATE TABLE Spaces (
        SpaceID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID UNIQUEIDENTIFIER NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        Color NVARCHAR(50),
        Icon NVARCHAR(100),
        ProjectIDs NVARCHAR(MAX),
        CreatedBy UNIQUEIDENTIFIER,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsDeleted BIT NOT NULL DEFAULT 0,
        FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );
    PRINT 'Spaces table created';
END

PRINT 'Schema creation completed';
GO

PRINT 'Database schema ready!';
GO
