# CRM Implementation Test Guide

## Overview
Comprehensive testing guide for VTiger-style Project Management with full CRM integration across 4 phases.

**Implementation Date:** December 2, 2025
**Status:** ✅ All phases completed, builds verified
**Database Migration:** ✅ Executed successfully on kiena.vietgoat.com,400

---

## ✅ Phase 1: Backend CRM Implementation

### Entities Implemented
1. **Customer** - Company/Individual customer management
2. **Contact** - Contact persons associated with customers
3. **Deal** - Sales opportunities with stages and probabilities
4. **Quote** - Quotations with line items
5. **QuoteItem** - Individual quote line items

### API Endpoints Created

#### Customers API (`/api/customers`)
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Soft delete customer
- `POST /api/customers/search` - Search customers (supports pagination)

#### Contacts API (`/api/contacts`)
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/{id}` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Soft delete contact
- `POST /api/contacts/search` - Search contacts (supports customer filter)

#### Deals API (`/api/deals`)
- `GET /api/deals` - List all deals
- `GET /api/deals/{id}` - Get deal by ID
- `POST /api/deals` - Create new deal
- `PUT /api/deals/{id}` - Update deal
- `DELETE /api/deals/{id}` - Soft delete deal
- `POST /api/deals/search` - Search deals (supports customer filter)

#### Quotes API (`/api/quotes`)
- `GET /api/quotes` - List all quotes
- `GET /api/quotes/{id}` - Get quote with items
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Soft delete quote
- `POST /api/quotes/search` - Search quotes

### Database Schema

#### Customers Table
```sql
CREATE TABLE Customers (
    CustomerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID NVARCHAR(50) NOT NULL,
    CustomerCode NVARCHAR(50) NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL,
    CustomerType NVARCHAR(50) NOT NULL, -- 'Company' or 'Individual'
    Industry NVARCHAR(100),
    Website NVARCHAR(200),
    TaxCode NVARCHAR(50),
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    Country NVARCHAR(100),
    Status NVARCHAR(50) DEFAULT 'Active',
    AnnualRevenue DECIMAL(18,2),
    EmployeeCount INT,
    Notes NVARCHAR(MAX),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsDeleted BIT DEFAULT 0
);
```

#### Contacts Table
```sql
CREATE TABLE Contacts (
    ContactID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID NVARCHAR(50) NOT NULL,
    CustomerID UNIQUEIDENTIFIER,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Mobile NVARCHAR(20),
    Position NVARCHAR(100),
    Department NVARCHAR(100),
    LinkedIn NVARCHAR(200),
    IsPrimary BIT DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Active',
    Notes NVARCHAR(MAX),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);
```

#### Deals Table
```sql
CREATE TABLE Deals (
    DealID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID NVARCHAR(50) NOT NULL,
    DealName NVARCHAR(200) NOT NULL,
    CustomerID UNIQUEIDENTIFIER,
    ContactID UNIQUEIDENTIFIER,
    Amount DECIMAL(18,2),
    Stage NVARCHAR(50) DEFAULT 'Prospecting',
    Probability INT DEFAULT 0,
    ExpectedCloseDate DATE,
    ActualCloseDate DATE,
    Status NVARCHAR(50) DEFAULT 'Open',
    Description NVARCHAR(MAX),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (ContactID) REFERENCES Contacts(ContactID)
);
```

### Test Cases - Phase 1

#### TC-P1-001: Create Customer
**Input:**
```json
{
  "customerCode": "CUST-001",
  "customerName": "Acme Corporation",
  "customerType": "Company",
  "industry": "Technology",
  "email": "contact@acme.com",
  "phone": "+1 234 567 8900",
  "status": "Active"
}
```
**Expected:** 201 Created, Customer record in DB

#### TC-P1-002: Search Customers
**Input:** `searchTerm: "Acme", pageSize: 10`
**Expected:** Returns matching customers

#### TC-P1-003: Create Contact with Customer Association
**Input:**
```json
{
  "customerId": "{customer-guid}",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "position": "CEO",
  "isPrimary": true,
  "status": "Active"
}
```
**Expected:** 201 Created, Contact linked to Customer

#### TC-P1-004: Create Deal
**Input:**
```json
{
  "dealName": "Q1 2025 Enterprise License",
  "customerId": "{customer-guid}",
  "contactId": "{contact-guid}",
  "amount": 50000,
  "stage": "Proposal",
  "probability": 60,
  "expectedCloseDate": "2025-03-31",
  "status": "Open"
}
```
**Expected:** 201 Created, Deal record with FK references

---

## ✅ Phase 2: Frontend CRM Integration

### Components Implemented

#### 1. EntityPicker Components
**File:** `src/components/EntityPicker.tsx`

Features:
- Generic EntityPicker with search debouncing (300ms)
- Specialized variants: CustomerPicker, ContactPicker, DealPicker
- Dropdown with real-time search results
- "Create New" button integration
- Disabled state when dependencies not met

#### 2. Create Dialogs

**CreateCustomerDialog** (`src/components/CreateCustomerDialog.tsx`)
- Full customer creation form
- Fields: Code, Name, Type, Industry, Tax Code, Contact info, Address, Revenue, Employees
- VTiger-style collapsible sections
- Toast notifications for success/error

**CreateContactDialog** (`src/components/CreateContactDialog.tsx`)
- Contact creation with customer association
- Fields: Customer picker, First/Last name, Position, Department, Email, Phone, Mobile, LinkedIn
- Primary contact checkbox
- Nested dialog support

**CreateDealDialog** (`src/components/CreateDealDialog.tsx`)
- Deal creation form
- Fields: Customer picker, Contact picker, Deal name, Amount, Stage, Probability, Close dates
- Stage options: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- Probability slider (0-100%)

#### 3. CreateProjectDialog Enhancement
**File:** `src/components/CreateProjectDialog.tsx`

Enhanced with:
- VTiger-style 3 collapsible sections
- CRM entity pickers (Customer, Contact, Deal)
- Project URL field
- Progress slider (0-100%)
- Inline entity creation via nested dialogs

### Test Cases - Phase 2

#### TC-P2-001: CustomerPicker Search
**Steps:**
1. Type "Acme" in CustomerPicker
2. Wait 300ms for debounce
**Expected:** Dropdown shows matching customers

#### TC-P2-002: Inline Customer Creation
**Steps:**
1. Click "Create New" in CustomerPicker
2. Fill customer form
3. Click "Create Customer"
**Expected:** Dialog closes, customer auto-selected in picker

#### TC-P2-003: Contact Picker Dependency
**Steps:**
1. ContactPicker disabled when no customer selected
2. Select customer
3. ContactPicker enabled
**Expected:** Picker only shows contacts for selected customer

#### TC-P2-004: Project Creation with CRM
**Steps:**
1. Fill project name, status, priority
2. Select Customer, Contact, Deal
3. Set Progress to 25%
4. Submit form
**Expected:** Project created with all CRM associations

---

## ✅ Phase 3: Project Backend CRM Integration

### Database Changes

#### Projects Table - New Columns
```sql
ALTER TABLE Projects ADD
    AssigneeID UNIQUEIDENTIFIER NULL,
    CustomerID UNIQUEIDENTIFIER NULL,
    ContactID UNIQUEIDENTIFIER NULL,
    DealID UNIQUEIDENTIFIER NULL,
    ActualEndDate DATE NULL,
    ProjectUrl NVARCHAR(500) NULL,
    Progress INT DEFAULT 0;

ALTER TABLE Projects ADD
    CONSTRAINT FK_Projects_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    CONSTRAINT FK_Projects_Contact FOREIGN KEY (ContactID) REFERENCES Contacts(ContactID),
    CONSTRAINT FK_Projects_Deal FOREIGN KEY (DealID) REFERENCES Deals(DealID);
```

### Stored Procedures Updated

**sp_Project_Create** - Added 7 CRM parameters:
```sql
@AssigneeID UNIQUEIDENTIFIER = NULL,
@CustomerID UNIQUEIDENTIFIER = NULL,
@ContactID UNIQUEIDENTIFIER = NULL,
@DealID UNIQUEIDENTIFIER = NULL,
@ActualEndDate DATE = NULL,
@ProjectUrl NVARCHAR(500) = NULL,
@Progress INT = 0
```

**sp_Project_Update** - Added same 7 CRM parameters

### Backend Code Changes

**Files Updated:**
- `Models/Entities/Project.cs` - Added 7 CRM properties
- `Models/DTOs/Project/ProjectDto.cs` - Added CRM fields
- `Models/DTOs/Project/CreateProjectDto.cs` - Added CRM fields
- `Models/DTOs/Project/UpdateProjectDto.cs` - Added CRM fields
- `Controllers/ProjectsController.cs` - Updated all DTO mappings
- `Repositories/ProjectRepository.cs` - Updated SP parameter objects

### Test Cases - Phase 3

#### TC-P3-001: Create Project with CRM Fields
**API Request:**
```json
POST /api/projects
{
  "name": "Website Redesign",
  "status": "Active",
  "priority": "High",
  "customerID": "{customer-guid}",
  "contactID": "{contact-guid}",
  "dealID": "{deal-guid}",
  "projectUrl": "https://project.acme.com",
  "progress": 0
}
```
**Expected:** Project created with FK relationships

#### TC-P3-002: Update Project CRM Fields
**API Request:**
```json
PUT /api/projects/{id}
{
  "customerID": "{new-customer-guid}",
  "progress": 50,
  "actualEndDate": "2025-12-15"
}
```
**Expected:** Project updated, relationships changed

#### TC-P3-003: Get Project with CRM Data
**API Request:** `GET /api/projects/{id}`
**Expected:** Response includes all CRM fields

---

## ✅ Phase 4: Edit Project Page & Extended Tabs

### Components Implemented

#### EditProjectDialog
**File:** `src/components/EditProjectDialog.tsx`

Features:
- 10-tab navigation (Summary, Details, Events, Updates, Milestones, Documents, Quotes, Invoices, E-Sign, Settings)
- Tab icons from lucide-react
- Active tab highlighting
- Loading state
- Auto-load project data on mount

#### Tab Components

**1. SummaryTab** (`src/components/ProjectTabs/SummaryTab.tsx`)
- Project overview card (name, description, status, priority)
- Timeline card (start/end dates)
- Progress card (slider 0-100%)
- Additional info card (project URL)
- Save button (only shown when changes detected)

**2. DetailsTab** (`src/components/ProjectTabs/DetailsTab.tsx`)
- CRM information card (Customer, Contact, Deal pickers)
- Project dates card (planned start/end, actual end)
- Metadata card (Created by, Created at, Updated at, Project ID)
- Auto-load CRM entities by ID
- Save button for CRM changes

**3. Extended Tabs** (Placeholder Implementation)
- EventsTab - Calendar events
- UpdatesTab - Project updates/news
- MilestonesTab - Project milestones
- DocumentsTab - File uploads
- QuotesTab - Related quotes
- InvoicesTab - Related invoices
- ESignTab - Signature requests
- SettingsTab - Category settings, delete project

### Test Cases - Phase 4

#### TC-P4-001: Open Edit Project Dialog
**Steps:**
1. Click on existing project
2. EditProjectDialog opens
**Expected:** Dialog shows project name, tabs rendered

#### TC-P4-002: Summary Tab - Update Progress
**Steps:**
1. Navigate to Summary tab
2. Drag progress slider to 75%
3. Click "Save Changes"
**Expected:** Progress saved, toast notification

#### TC-P4-003: Details Tab - Change Customer
**Steps:**
1. Navigate to Details tab
2. Search and select new customer in CustomerPicker
3. Click "Save Changes"
**Expected:** Project.CustomerID updated

#### TC-P4-004: Tab Navigation
**Steps:**
1. Click each of 10 tabs sequentially
**Expected:** Tab content changes, active tab highlighted

#### TC-P4-005: Settings Tab - Delete Project
**Steps:**
1. Navigate to Settings tab
2. Click "Delete Project" in Danger Zone
**Expected:** Confirmation dialog (to be implemented)

---

## Build Verification

### Frontend Build ✅
```bash
npm run build
```
**Result:**
- ✅ 3536 modules transformed
- ✅ Build completed in 9.00s
- ⚠️ Warning: Chunk size > 500KB (optimization recommended, not blocking)
- **Status:** SUCCESS (0 errors)

### Backend Build ✅
```bash
cd Backend/TaskFlow.API && dotnet build
```
**Result:**
- ✅ All projects up-to-date
- ✅ TaskFlow.API.dll compiled
- ✅ 0 Warnings, 0 Errors
- ✅ Time: 1.64s
- **Status:** SUCCESS

### Database Migration ✅
```bash
sqlcmd -S 'kiena.vietgoat.com,400' -U sa -P '***' -C -d DB_PMS
  -i "Backend\Database\42_Update_Project_SP_CRM.sql"
```
**Result:**
- ✅ Changed database context to 'DB_PMS'
- ✅ "Project stored procedures updated successfully with CRM fields"
- **Status:** EXECUTED

---

## Manual Testing Checklist

### Pre-requisites
- [ ] Backend running on http://localhost:5001
- [ ] Frontend running on http://localhost:5600 (or auto-selected port)
- [ ] Logto authentication configured
- [ ] User logged in with valid SiteID

### Phase 1 Testing - CRM Backend
- [ ] Create Customer via API
- [ ] Search Customers
- [ ] Create Contact linked to Customer
- [ ] Create Deal linked to Customer & Contact
- [ ] Verify FK relationships in database

### Phase 2 Testing - CRM Frontend
- [ ] CustomerPicker search works with debounce
- [ ] Click "Create New Customer" opens dialog
- [ ] Create customer inline, auto-selects in picker
- [ ] ContactPicker disabled until customer selected
- [ ] ContactPicker shows only customer's contacts
- [ ] DealPicker filters by customer

### Phase 3 Testing - Project CRM Integration
- [ ] Open CreateProjectDialog
- [ ] Select Customer, Contact, Deal
- [ ] Set Progress slider to 50%
- [ ] Enter Project URL
- [ ] Create project
- [ ] Verify Project record has CustomerID, ContactID, DealID in DB
- [ ] GET /api/projects/{id} returns CRM fields

### Phase 4 Testing - Edit Project Dialog
- [ ] Click existing project to open EditProjectDialog
- [ ] Summary tab shows project data
- [ ] Update project name, save, verify update
- [ ] Details tab loads Customer/Contact/Deal
- [ ] Change Customer, save, verify FK updated
- [ ] Navigate to all 10 tabs (no errors)
- [ ] Events tab shows empty state
- [ ] Documents tab shows upload button
- [ ] Settings tab shows delete button

### Database Verification
```sql
-- Verify Project with CRM data
SELECT p.ProjectID, p.Name, p.Progress, p.ProjectUrl,
       c.CustomerName, ct.FirstName, d.DealName
FROM Projects p
LEFT JOIN Customers c ON p.CustomerID = c.CustomerID
LEFT JOIN Contacts ct ON p.ContactID = ct.ContactID
LEFT JOIN Deals d ON p.DealID = d.DealID
WHERE p.SiteID = 'T0001'
ORDER BY p.CreatedAt DESC;
```

---

## Known Issues & Limitations

### Current Implementation
1. **Extended Tabs** - Placeholder UI only (Events, Updates, Milestones, Documents, Quotes, Invoices, E-Sign)
2. **Delete Project** - No confirmation dialog implemented in SettingsTab
3. **File Upload** - DocumentsTab UI only, no backend storage
4. **AssigneeID** - User picker not implemented in CreateProjectDialog

### Future Enhancements
1. Implement full CRUD for Events, Milestones, Documents
2. Add file upload to DocumentsTab with backend storage (Azure Blob/S3)
3. Implement Quote generation with PDF export
4. Add E-signature integration (DocuSign/HelloSign)
5. Implement Project timeline visualization (Gantt chart)
6. Add real-time updates via SignalR

---

## Success Criteria ✅

All criteria met:
- ✅ 4 CRM entities (Customer, Contact, Deal, Quote) with full CRUD APIs
- ✅ Database schema with proper FK relationships
- ✅ Frontend entity pickers with search & inline creation
- ✅ Projects extended with 7 CRM fields
- ✅ EditProjectDialog with 10 tabs (2 functional, 8 placeholders)
- ✅ Frontend build successful (0 errors)
- ✅ Backend build successful (0 errors)
- ✅ Database migration executed
- ✅ All TypeScript types defined
- ✅ VTiger-style UI patterns implemented

---

## Conclusion

**Implementation Status:** ✅ COMPLETE
**Quality Assurance:** ✅ BUILDS VERIFIED
**Database Migration:** ✅ EXECUTED
**Ready for:** Manual UI Testing with Logto Authentication

**Next Steps:**
1. Start both servers (backend + frontend)
2. Login via Logto
3. Follow Manual Testing Checklist
4. Report any bugs found
5. Implement extended tab functionality as needed

**Total Files Created/Modified:** 35+
**Total Lines of Code:** ~3000+
**Implementation Time:** Single session
**Test Coverage:** Build verification only (manual UI testing required)
