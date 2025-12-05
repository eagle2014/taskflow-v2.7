-- =============================================
-- CRM Entities Migration Script
-- Created: 2025-12-01
-- Description: Creates Customer, Contact, Deal, Quote entities
--              and extends Projects table with CRM relationships
-- =============================================

USE DB_PMS;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- 1. Create Customers Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID NVARCHAR(50) NOT NULL,

        -- Basic
        CustomerCode NVARCHAR(50) NOT NULL,
        CustomerName NVARCHAR(200) NOT NULL,
        CustomerType NVARCHAR(50) DEFAULT 'Company',

        -- Extended
        Industry NVARCHAR(100) NULL,
        Website NVARCHAR(500) NULL,
        TaxCode NVARCHAR(50) NULL,

        -- Contact
        Phone NVARCHAR(50) NULL,
        Email NVARCHAR(200) NULL,
        Address NVARCHAR(500) NULL,
        City NVARCHAR(100) NULL,
        Country NVARCHAR(100) NULL,

        -- Business
        AnnualRevenue DECIMAL(18,2) NULL,
        EmployeeCount INT NULL,

        -- Status
        Status NVARCHAR(50) DEFAULT 'Active',
        Source NVARCHAR(100) NULL,
        Notes NVARCHAR(MAX) NULL,

        -- Audit
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        IsDeleted BIT DEFAULT 0,

        CONSTRAINT FK_Customers_Site FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );

    CREATE INDEX IX_Customers_SiteID ON Customers(SiteID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Customers_Code ON Customers(SiteID, CustomerCode) WHERE IsDeleted = 0;
    CREATE INDEX IX_Customers_Name ON Customers(SiteID, CustomerName) WHERE IsDeleted = 0;

    PRINT 'Customers table created successfully';
END
ELSE
    PRINT 'Customers table already exists';
GO

-- =============================================
-- 2. Create Contacts Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Contacts')
BEGIN
    CREATE TABLE Contacts (
        ContactID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID NVARCHAR(50) NOT NULL,
        CustomerID UNIQUEIDENTIFIER NULL,

        -- Basic
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NULL,
        Email NVARCHAR(200) NULL,
        Phone NVARCHAR(50) NULL,
        Mobile NVARCHAR(50) NULL,

        -- Position
        Position NVARCHAR(100) NULL,
        Department NVARCHAR(100) NULL,

        -- Status
        IsPrimary BIT DEFAULT 0,
        Status NVARCHAR(50) DEFAULT 'Active',
        LinkedIn NVARCHAR(500) NULL,
        Notes NVARCHAR(MAX) NULL,

        -- Audit
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        IsDeleted BIT DEFAULT 0,

        CONSTRAINT FK_Contacts_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
        CONSTRAINT FK_Contacts_Site FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );

    CREATE INDEX IX_Contacts_SiteID ON Contacts(SiteID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Contacts_CustomerID ON Contacts(CustomerID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Contacts_Name ON Contacts(SiteID, FirstName, LastName) WHERE IsDeleted = 0;

    PRINT 'Contacts table created successfully';
END
ELSE
    PRINT 'Contacts table already exists';
GO

-- =============================================
-- 3. Create Deals Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Deals')
BEGIN
    CREATE TABLE Deals (
        DealID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID NVARCHAR(50) NOT NULL,
        CustomerID UNIQUEIDENTIFIER NOT NULL,
        ContactID UNIQUEIDENTIFIER NULL,

        -- Basic
        DealCode NVARCHAR(50) NOT NULL,
        DealName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,

        -- Value
        DealValue DECIMAL(18,2) NULL,
        Currency NVARCHAR(10) DEFAULT 'VND',

        -- Pipeline
        Stage NVARCHAR(50) DEFAULT 'Lead',
        Probability INT DEFAULT 0,

        -- Dates
        ExpectedCloseDate DATE NULL,
        ActualCloseDate DATE NULL,

        -- Status
        Status NVARCHAR(50) DEFAULT 'Open',
        LostReason NVARCHAR(500) NULL,
        OwnerID UNIQUEIDENTIFIER NULL,
        Source NVARCHAR(100) NULL,

        -- Audit
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        IsDeleted BIT DEFAULT 0,

        CONSTRAINT FK_Deals_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
        CONSTRAINT FK_Deals_Contact FOREIGN KEY (ContactID) REFERENCES Contacts(ContactID),
        CONSTRAINT FK_Deals_Site FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );

    CREATE INDEX IX_Deals_SiteID ON Deals(SiteID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Deals_CustomerID ON Deals(CustomerID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Deals_Stage ON Deals(SiteID, Stage) WHERE IsDeleted = 0;
    CREATE INDEX IX_Deals_Name ON Deals(SiteID, DealName) WHERE IsDeleted = 0;

    PRINT 'Deals table created successfully';
END
ELSE
    PRINT 'Deals table already exists';
GO

-- =============================================
-- 4. Create Quotes Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Quotes')
BEGIN
    CREATE TABLE Quotes (
        QuoteID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SiteID NVARCHAR(50) NOT NULL,
        DealID UNIQUEIDENTIFIER NOT NULL,
        CustomerID UNIQUEIDENTIFIER NOT NULL,
        ContactID UNIQUEIDENTIFIER NULL,

        -- Quote Info
        QuoteNumber NVARCHAR(50) NOT NULL,
        QuoteName NVARCHAR(200) NULL,
        Version INT DEFAULT 1,

        -- Dates
        QuoteDate DATE DEFAULT GETDATE(),
        ValidUntil DATE NULL,

        -- Values
        SubTotal DECIMAL(18,2) DEFAULT 0,
        DiscountPercent DECIMAL(5,2) DEFAULT 0,
        DiscountAmount DECIMAL(18,2) DEFAULT 0,
        TaxPercent DECIMAL(5,2) DEFAULT 10,
        TaxAmount DECIMAL(18,2) DEFAULT 0,
        TotalAmount DECIMAL(18,2) DEFAULT 0,
        Currency NVARCHAR(10) DEFAULT 'VND',

        -- Status
        Status NVARCHAR(50) DEFAULT 'Draft',
        PaymentTerms NVARCHAR(500) NULL,
        DeliveryTerms NVARCHAR(500) NULL,
        Notes NVARCHAR(MAX) NULL,

        -- Audit
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        IsDeleted BIT DEFAULT 0,

        CONSTRAINT FK_Quotes_Deal FOREIGN KEY (DealID) REFERENCES Deals(DealID),
        CONSTRAINT FK_Quotes_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
        CONSTRAINT FK_Quotes_Site FOREIGN KEY (SiteID) REFERENCES Sites(SiteID)
    );

    CREATE INDEX IX_Quotes_SiteID ON Quotes(SiteID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Quotes_DealID ON Quotes(DealID) WHERE IsDeleted = 0;
    CREATE INDEX IX_Quotes_Number ON Quotes(SiteID, QuoteNumber) WHERE IsDeleted = 0;

    PRINT 'Quotes table created successfully';
END
ELSE
    PRINT 'Quotes table already exists';
GO

-- =============================================
-- 5. Create QuoteItems Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuoteItems')
BEGIN
    CREATE TABLE QuoteItems (
        QuoteItemID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        QuoteID UNIQUEIDENTIFIER NOT NULL,

        ItemOrder INT DEFAULT 0,
        ItemName NVARCHAR(200) NOT NULL,
        ItemDescription NVARCHAR(MAX) NULL,

        Quantity DECIMAL(18,2) DEFAULT 1,
        Unit NVARCHAR(50) NULL,
        UnitPrice DECIMAL(18,2) DEFAULT 0,
        DiscountPercent DECIMAL(5,2) DEFAULT 0,
        Amount DECIMAL(18,2) DEFAULT 0,

        CONSTRAINT FK_QuoteItems_Quote FOREIGN KEY (QuoteID) REFERENCES Quotes(QuoteID) ON DELETE CASCADE
    );

    CREATE INDEX IX_QuoteItems_QuoteID ON QuoteItems(QuoteID);

    PRINT 'QuoteItems table created successfully';
END
ELSE
    PRINT 'QuoteItems table already exists';
GO

-- =============================================
-- 6. Extend Projects Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Projects') AND name = 'AssigneeID')
BEGIN
    ALTER TABLE Projects ADD
        AssigneeID UNIQUEIDENTIFIER NULL,
        CustomerID UNIQUEIDENTIFIER NULL,
        ContactID UNIQUEIDENTIFIER NULL,
        DealID UNIQUEIDENTIFIER NULL,
        ActualEndDate DATE NULL,
        ProjectUrl NVARCHAR(500) NULL,
        Progress INT DEFAULT 0;

    PRINT 'Projects table extended with new columns';
END
ELSE
    PRINT 'Projects table already has new columns';
GO

-- Add foreign keys if not exists
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Projects_Assignee')
BEGIN
    ALTER TABLE Projects ADD CONSTRAINT FK_Projects_Assignee FOREIGN KEY (AssigneeID) REFERENCES Users(UserID);
    PRINT 'FK_Projects_Assignee created';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Projects_Customer')
BEGIN
    ALTER TABLE Projects ADD CONSTRAINT FK_Projects_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);
    PRINT 'FK_Projects_Customer created';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Projects_Contact')
BEGIN
    ALTER TABLE Projects ADD CONSTRAINT FK_Projects_Contact FOREIGN KEY (ContactID) REFERENCES Contacts(ContactID);
    PRINT 'FK_Projects_Contact created';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Projects_Deal')
BEGIN
    ALTER TABLE Projects ADD CONSTRAINT FK_Projects_Deal FOREIGN KEY (DealID) REFERENCES Deals(DealID);
    PRINT 'FK_Projects_Deal created';
END
GO

PRINT '=============================================';
PRINT 'CRM Entities Migration Completed Successfully';
PRINT '=============================================';
PRINT 'Tables created: Customers, Contacts, Deals, Quotes, QuoteItems';
PRINT 'Projects table extended with: AssigneeID, CustomerID, ContactID, DealID, ActualEndDate, ProjectUrl, Progress';
GO