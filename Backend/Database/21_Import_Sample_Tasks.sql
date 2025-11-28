USE DB_PMS;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Import sample tasks from mockup data
-- Project: TaskFlow Application (64694A4F-5838-48C7-B5DF-883E134E2AD7)
-- Created by: john@acme.com (b152eea6-e2d0-46e8-a155-ae2f4eb391f6)
-- Site: T0001

DECLARE @SiteID NVARCHAR(50) = 'T0001';
DECLARE @ProjectID UNIQUEIDENTIFIER = '64694A4F-5838-48C7-B5DF-883E134E2AD7';
DECLARE @CreatedBy UNIQUEIDENTIFIER = 'b152eea6-e2d0-46e8-a155-ae2f4eb391f6';
DECLARE @Now DATETIME2 = GETUTCDATE();

-- Phase IDs for TaskFlow Application
DECLARE @PlanningPhaseID UNIQUEIDENTIFIER = '0FB7E535-D227-41DF-904A-569AE010CC0A';
DECLARE @DevelopmentPhaseID UNIQUEIDENTIFIER = 'C833CD78-B3D2-421B-9579-F7E5BD639CE8';
DECLARE @TestingPhaseID UNIQUEIDENTIFIER = '2BE3AA1E-0E3B-4546-A207-A7ACFFF6C38F';
DECLARE @DeploymentPhaseID UNIQUEIDENTIFIER = 'B7EB2264-7CE2-4AFB-99FC-E88055D9AC65';

-- Phase 1 - Strategy (Planning & Design Phase)
-- Task 1: Win contract
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Win contract', 'Secure client agreement and project scope approval',
    'Completed', 'High', '2024-01-15', '2024-02-15', '2024-02-10', 100,
    @CreatedBy, @Now, @Now, 0, 1
);

-- Task 2: Hire engineers
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Hire engineers', 'Recruit and onboard development team members',
    'Completed', 'High', '2024-02-01', '2024-03-01', '2024-02-28', 100,
    @CreatedBy, @Now, @Now, 0, 2
);

-- Task 3: Research competition
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Research competition', 'Analyze competitor products and market positioning',
    'In Progress', 'Medium', '2024-02-15', '2024-03-15', NULL, 65,
    @CreatedBy, @Now, @Now, 0, 3
);

-- Phase 2 - Design (Planning & Design Phase)
-- Task 4: Plan build
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Plan build', 'Define technical architecture and development roadmap',
    'In Progress', 'High', '2024-03-01', '2024-03-20', NULL, 70,
    @CreatedBy, @Now, @Now, 0, 4
);

-- Task 5: Brainstorming
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Brainstorming', 'Team ideation sessions for feature requirements',
    'Completed', 'Medium', '2024-02-20', '2024-03-05', '2024-03-03', 100,
    @CreatedBy, @Now, @Now, 0, 5
);

-- Task 6: Knowledge base
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Knowledge base', 'Create internal documentation and resources hub',
    'Ready', 'Low', '2024-03-10', '2024-03-25', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 6
);

-- Task 7: Blueprint
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Blueprint', 'Design system architecture and technical specifications',
    'In Progress', 'High', '2024-03-05', '2024-03-30', NULL, 55,
    @CreatedBy, @Now, @Now, 0, 7
);

-- Task 8: Mockup
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @PlanningPhaseID,
    'Mockup', 'Create UI/UX design mockups and prototypes',
    'Ready', 'Medium', '2024-03-15', '2024-04-05', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 8
);

-- Phase 3 - Development
-- Task 9: MVP
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DevelopmentPhaseID,
    'MVP', 'Build minimum viable product with core features',
    'In Progress', 'High', '2024-04-01', '2024-05-15', NULL, 45,
    @CreatedBy, @Now, @Now, 0, 9
);

-- Task 10: Organize teams
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DevelopmentPhaseID,
    'Organize teams', 'Structure development teams and assign responsibilities',
    'Completed', 'High', '2024-03-25', '2024-04-05', '2024-04-03', 100,
    @CreatedBy, @Now, @Now, 0, 10
);

-- Task 11: Product meetings
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DevelopmentPhaseID,
    'Product meetings', 'Regular sync meetings for feature alignment',
    'In Progress', 'Medium', '2024-04-01', '2024-05-30', NULL, 60,
    @CreatedBy, @Now, @Now, 0, 11
);

-- Task 12: Prototype
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DevelopmentPhaseID,
    'Prototype', 'Develop working prototype for stakeholder review',
    'Ready', 'High', '2024-04-10', '2024-04-30', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 12
);

-- Task 13: Quality testing
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @TestingPhaseID,
    'Quality testing', 'Comprehensive QA testing and bug fixes',
    'Ready', 'High', '2024-05-01', '2024-05-20', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 13
);

-- Phase 4 - Execution (Deployment Phase)
-- Task 14: Showcase product
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Showcase product', 'Present final product to stakeholders and clients',
    'Pending', 'High', '2024-05-20', '2024-06-01', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 14
);

-- Task 15: Acquire funding
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Acquire funding', 'Secure additional funding for product scaling',
    'Pending', 'Medium', '2024-06-01', '2024-06-30', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 15
);

-- Task 16: Hire support
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Hire support', 'Build customer support and operations team',
    'Pending', 'Medium', '2024-06-05', '2024-06-20', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 16
);

-- Task 17: Scale marketing
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Scale marketing', 'Expand marketing campaigns and user acquisition',
    'Pending', 'High', '2024-06-10', '2024-07-10', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 17
);

-- Task 18: Build sales team
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Build sales team', 'Hire and train sales representatives',
    'Pending', 'Medium', '2024-06-15', '2024-07-05', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 18
);

-- Task 19: Reach valuation
INSERT INTO Tasks (
    TaskID, SiteID, ProjectID, PhaseID, Title, Description,
    Status, Priority, StartDate, DueDate, CompletedDate, Progress,
    CreatedBy, CreatedAt, UpdatedAt, IsDeleted, [Order]
) VALUES (
    NEWID(), @SiteID, @ProjectID, @DeploymentPhaseID,
    'Reach valuation', 'Achieve target company valuation milestone',
    'Pending', 'High', '2024-07-01', '2024-08-01', NULL, 0,
    @CreatedBy, @Now, @Now, 0, 19
);

SELECT @@ROWCOUNT as TasksInserted;
GO
