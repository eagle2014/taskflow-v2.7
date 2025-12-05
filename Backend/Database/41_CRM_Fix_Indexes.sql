-- =============================================
-- Fix Filtered Indexes for CRM Tables
-- Created: 2025-12-01
-- =============================================

USE DB_PMS;
GO

SET QUOTED_IDENTIFIER ON;
GO

-- Create filtered indexes for Customers
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Customers_SiteID' AND object_id = OBJECT_ID('Customers'))
BEGIN
    CREATE INDEX IX_Customers_SiteID ON Customers(SiteID) WHERE IsDeleted = 0;
    PRINT 'IX_Customers_SiteID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Customers_Code' AND object_id = OBJECT_ID('Customers'))
BEGIN
    CREATE INDEX IX_Customers_Code ON Customers(SiteID, CustomerCode) WHERE IsDeleted = 0;
    PRINT 'IX_Customers_Code created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Customers_Name' AND object_id = OBJECT_ID('Customers'))
BEGIN
    CREATE INDEX IX_Customers_Name ON Customers(SiteID, CustomerName) WHERE IsDeleted = 0;
    PRINT 'IX_Customers_Name created';
END

-- Create filtered indexes for Contacts
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_SiteID' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_SiteID ON Contacts(SiteID) WHERE IsDeleted = 0;
    PRINT 'IX_Contacts_SiteID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_CustomerID' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_CustomerID ON Contacts(CustomerID) WHERE IsDeleted = 0;
    PRINT 'IX_Contacts_CustomerID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_Name' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_Name ON Contacts(SiteID, FirstName, LastName) WHERE IsDeleted = 0;
    PRINT 'IX_Contacts_Name created';
END

-- Create filtered indexes for Deals
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Deals_SiteID' AND object_id = OBJECT_ID('Deals'))
BEGIN
    CREATE INDEX IX_Deals_SiteID ON Deals(SiteID) WHERE IsDeleted = 0;
    PRINT 'IX_Deals_SiteID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Deals_CustomerID' AND object_id = OBJECT_ID('Deals'))
BEGIN
    CREATE INDEX IX_Deals_CustomerID ON Deals(CustomerID) WHERE IsDeleted = 0;
    PRINT 'IX_Deals_CustomerID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Deals_Stage' AND object_id = OBJECT_ID('Deals'))
BEGIN
    CREATE INDEX IX_Deals_Stage ON Deals(SiteID, Stage) WHERE IsDeleted = 0;
    PRINT 'IX_Deals_Stage created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Deals_Name' AND object_id = OBJECT_ID('Deals'))
BEGIN
    CREATE INDEX IX_Deals_Name ON Deals(SiteID, DealName) WHERE IsDeleted = 0;
    PRINT 'IX_Deals_Name created';
END

-- Create filtered indexes for Quotes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Quotes_SiteID' AND object_id = OBJECT_ID('Quotes'))
BEGIN
    CREATE INDEX IX_Quotes_SiteID ON Quotes(SiteID) WHERE IsDeleted = 0;
    PRINT 'IX_Quotes_SiteID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Quotes_DealID' AND object_id = OBJECT_ID('Quotes'))
BEGIN
    CREATE INDEX IX_Quotes_DealID ON Quotes(DealID) WHERE IsDeleted = 0;
    PRINT 'IX_Quotes_DealID created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Quotes_Number' AND object_id = OBJECT_ID('Quotes'))
BEGIN
    CREATE INDEX IX_Quotes_Number ON Quotes(SiteID, QuoteNumber) WHERE IsDeleted = 0;
    PRINT 'IX_Quotes_Number created';
END

PRINT 'All CRM filtered indexes created successfully';
GO