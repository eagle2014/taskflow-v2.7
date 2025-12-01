# Project & CRM Implementation Plan

> **Created**: 2025-12-01
> **Status**: Draft
> **Scope**: Full Feature Set (Option B)

---

## 1. Executive Summary

### Objective
Implement VTiger-style Project management with integrated CRM entities (Customer, Contact, Deal, Quote).

### Key Features
- **Create Project Dialog**: Modal với 3 collapsible sections
- **Edit Project Page**: Full page với 10+ tabs
- **CRM Integration**: Customer, Contact, Deal, Quote entities
- **Entity Pickers**: Real-time search + inline creation

### Design References
- Create Project: Modal dialog với sections (Project Details, Custom Info, Description)
- Edit Project: Full page tabs (Summary, Details, Events, Documents, Invoices, Quotes, Cases, etc.)

---

## 2. Database Schema

### 2.1 New Tables

#### Customers (Khách hàng/Tổ chức)
```sql
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
```

#### Contacts (Liên hệ)
```sql
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
```

#### Deals (Thương vụ)
```sql
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
```

#### Quotes (Báo giá)
```sql
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

CREATE INDEX IX_Quotes_DealID ON Quotes(DealID) WHERE IsDeleted = 0;
```

#### QuoteItems (Chi tiết báo giá)
```sql
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

    CONSTRAINT FK_QuoteItems_Quote FOREIGN KEY (QuoteID)
        REFERENCES Quotes(QuoteID) ON DELETE CASCADE
);
```

### 2.2 Alter Projects Table

```sql
ALTER TABLE Projects ADD
    AssigneeID UNIQUEIDENTIFIER NULL,
    CustomerID UNIQUEIDENTIFIER NULL,
    ContactID UNIQUEIDENTIFIER NULL,
    DealID UNIQUEIDENTIFIER NULL,
    ActualEndDate DATE NULL,
    ProjectUrl NVARCHAR(500) NULL,
    Progress INT DEFAULT 0;

-- Add foreign keys
ALTER TABLE Projects ADD
    CONSTRAINT FK_Projects_Assignee FOREIGN KEY (AssigneeID) REFERENCES Users(UserID),
    CONSTRAINT FK_Projects_Customer FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    CONSTRAINT FK_Projects_Contact FOREIGN KEY (ContactID) REFERENCES Contacts(ContactID),
    CONSTRAINT FK_Projects_Deal FOREIGN KEY (DealID) REFERENCES Deals(DealID);

-- Note: Budget column already exists in schema
```

### 2.3 Deal Pipeline Stages
```
Lead → Qualified → Proposal → Negotiation → ClosedWon / ClosedLost
```

### 2.4 Quote Statuses
```
Draft → Sent → Accepted → Rejected → Expired
```

---

## 3. Backend Implementation

### 3.1 Entities (Models/Entities/)

| File | Fields |
|------|--------|
| `Customer.cs` | CustomerID, SiteID, CustomerCode, CustomerName, CustomerType, Industry, Website, TaxCode, Phone, Email, Address, City, Country, AnnualRevenue, EmployeeCount, Status, Source, Notes, CreatedBy, CreatedAt, UpdatedAt, IsDeleted |
| `Contact.cs` | ContactID, SiteID, CustomerID, FirstName, LastName, Email, Phone, Mobile, Position, Department, IsPrimary, Status, LinkedIn, Notes, CreatedBy, CreatedAt, UpdatedAt, IsDeleted |
| `Deal.cs` | DealID, SiteID, CustomerID, ContactID, DealCode, DealName, Description, DealValue, Currency, Stage, Probability, ExpectedCloseDate, ActualCloseDate, Status, LostReason, OwnerID, Source, CreatedBy, CreatedAt, UpdatedAt, IsDeleted |
| `Quote.cs` | QuoteID, SiteID, DealID, CustomerID, ContactID, QuoteNumber, QuoteName, Version, QuoteDate, ValidUntil, SubTotal, DiscountPercent, DiscountAmount, TaxPercent, TaxAmount, TotalAmount, Currency, Status, PaymentTerms, DeliveryTerms, Notes, CreatedBy, CreatedAt, UpdatedAt, IsDeleted |
| `QuoteItem.cs` | QuoteItemID, QuoteID, ItemOrder, ItemName, ItemDescription, Quantity, Unit, UnitPrice, DiscountPercent, Amount |

### 3.2 DTOs (Models/DTOs/)

```
Models/DTOs/
├── Customer/
│   ├── CustomerDto.cs
│   ├── CreateCustomerDto.cs
│   ├── UpdateCustomerDto.cs
│   └── CustomerSearchDto.cs
├── Contact/
│   ├── ContactDto.cs
│   ├── CreateContactDto.cs
│   ├── UpdateContactDto.cs
│   └── ContactSearchDto.cs
├── Deal/
│   ├── DealDto.cs
│   ├── CreateDealDto.cs
│   ├── UpdateDealDto.cs
│   └── DealSearchDto.cs
├── Quote/
│   ├── QuoteDto.cs
│   ├── CreateQuoteDto.cs
│   ├── UpdateQuoteDto.cs
│   ├── QuoteItemDto.cs
│   └── CreateQuoteItemDto.cs
└── Project/
    ├── ProjectDto.cs (UPDATE: add new fields)
    ├── CreateProjectDto.cs (UPDATE)
    └── UpdateProjectDto.cs (UPDATE)
```

### 3.3 Repositories (Repositories/)

| Repository | Methods |
|------------|---------|
| `ICustomerRepository` | GetAll, GetById, Search, Create, Update, Delete |
| `IContactRepository` | GetAll, GetByCustomerId, GetById, Search, Create, Update, Delete |
| `IDealRepository` | GetAll, GetByCustomerId, GetByStage, GetById, Search, Create, Update, Delete |
| `IQuoteRepository` | GetAll, GetByDealId, GetById, Create, Update, Delete |
| `IQuoteItemRepository` | GetByQuoteId, Create, Update, Delete |

### 3.4 Controllers (Controllers/)

| Controller | Endpoints |
|------------|-----------|
| `CustomersController` | GET /customers, GET /customers/{id}, GET /customers/search?q=, POST, PUT, DELETE |
| `ContactsController` | GET /contacts, GET /contacts/{id}, GET /contacts/customer/{customerId}, GET /contacts/search?q=, POST, PUT, DELETE |
| `DealsController` | GET /deals, GET /deals/{id}, GET /deals/customer/{customerId}, GET /deals/stage/{stage}, GET /deals/search?q=, POST, PUT, DELETE |
| `QuotesController` | GET /quotes, GET /quotes/{id}, GET /quotes/deal/{dealId}, POST, PUT, DELETE |

### 3.5 Stored Procedures

```
sp_Customer_Create, sp_Customer_GetById, sp_Customer_GetAll, sp_Customer_Search, sp_Customer_Update, sp_Customer_Delete
sp_Contact_Create, sp_Contact_GetById, sp_Contact_GetByCustomerId, sp_Contact_Search, sp_Contact_Update, sp_Contact_Delete
sp_Deal_Create, sp_Deal_GetById, sp_Deal_GetByCustomerId, sp_Deal_GetByStage, sp_Deal_Search, sp_Deal_Update, sp_Deal_Delete
sp_Quote_Create, sp_Quote_GetById, sp_Quote_GetByDealId, sp_Quote_Update, sp_Quote_Delete
sp_QuoteItem_Create, sp_QuoteItem_GetByQuoteId, sp_QuoteItem_Update, sp_QuoteItem_Delete
sp_Project_Update (UPDATE: new fields)
```

---

## 4. Frontend Implementation

### 4.1 Types (src/types/ or src/services/api.ts)

```typescript
// Customer
interface Customer {
  customerID: string;
  siteID: string;
  customerCode: string;
  customerName: string;
  customerType: 'Company' | 'Individual';
  industry?: string;
  website?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  annualRevenue?: number;
  employeeCount?: number;
  status: 'Active' | 'Inactive' | 'Lead';
  source?: string;
  notes?: string;
}

// Contact
interface Contact {
  contactID: string;
  siteID: string;
  customerID?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  status: 'Active' | 'Inactive';
}

// Deal
interface Deal {
  dealID: string;
  siteID: string;
  customerID: string;
  contactID?: string;
  dealCode: string;
  dealName: string;
  description?: string;
  dealValue?: number;
  currency: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'ClosedWon' | 'ClosedLost';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: 'Open' | 'Won' | 'Lost';
  ownerID?: string;
}

// Quote
interface Quote {
  quoteID: string;
  dealID: string;
  customerID: string;
  quoteNumber: string;
  quoteName?: string;
  version: number;
  quoteDate: string;
  validUntil?: string;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  items: QuoteItem[];
}

// Extended Project
interface Project {
  // ... existing fields
  assigneeID?: string;
  customerID?: string;
  contactID?: string;
  dealID?: string;
  actualEndDate?: string;
  projectUrl?: string;
  progress: number;
  // Expanded for display
  assignee?: User;
  customer?: Customer;
  contact?: Contact;
  deal?: Deal;
}
```

### 4.2 Components Structure

```
src/components/
├── project/
│   ├── CreateProjectDialog/
│   │   ├── CreateProjectDialog.tsx       # Main modal
│   │   ├── ProjectDetailsSection.tsx     # Section 1: collapsible
│   │   ├── CustomInfoSection.tsx         # Section 2: collapsible
│   │   ├── DescriptionSection.tsx        # Section 3: collapsible
│   │   ├── EntityPicker.tsx              # Reusable search + select + inline create
│   │   ├── InlineCustomerForm.tsx        # Inline form for new Customer
│   │   ├── InlineContactForm.tsx         # Inline form for new Contact
│   │   ├── InlineDealForm.tsx            # Inline form for new Deal
│   │   └── types.ts
│   │
│   ├── ProjectDetailPage/
│   │   ├── ProjectDetailPage.tsx         # Full page container
│   │   ├── ProjectHeader.tsx             # Name + icons + Gantt View button
│   │   ├── ProjectTabs.tsx               # Tab navigation
│   │   ├── tabs/
│   │   │   ├── SummaryTab.tsx            # Activity + Analytics sidebar
│   │   │   ├── DetailsTab.tsx            # Form (reuse CreateProjectDialog sections)
│   │   │   ├── EventsTab.tsx             # CalendarEvents list
│   │   │   ├── MilestonesTab.tsx         # Project milestones
│   │   │   ├── DocumentsTab.tsx          # Documents list
│   │   │   ├── QuotesTab.tsx             # Quotes list
│   │   │   ├── InvoicesTab.tsx           # Invoices list
│   │   │   ├── CasesTab.tsx              # Cases list
│   │   │   └── UpdatesTab.tsx            # Activity log
│   │   └── components/
│   │       ├── QuickFieldsBar.tsx        # Inline editable fields
│   │       ├── ActivitySection.tsx       # Comments + activity
│   │       ├── AnalyticsSidebar.tsx      # Right sidebar
│   │       └── EmptyState.tsx            # Reusable empty state
│   │
│   └── shared/
│       ├── CollapsibleSection.tsx        # Expand/collapse section
│       └── ProgressDropdown.tsx          # 0-100% dropdown + input
│
├── crm/
│   ├── CustomerPicker.tsx
│   ├── ContactPicker.tsx
│   ├── DealPicker.tsx
│   └── forms/
│       ├── CustomerForm.tsx
│       ├── ContactForm.tsx
│       └── DealForm.tsx
```

### 4.3 API Service Extensions

```typescript
// src/services/api.ts additions

// Customer API
searchCustomers(query: string): Promise<Customer[]>
getCustomer(id: string): Promise<Customer>
createCustomer(data: CreateCustomerRequest): Promise<Customer>
updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer>

// Contact API
searchContacts(query: string, customerId?: string): Promise<Contact[]>
getContact(id: string): Promise<Contact>
getContactsByCustomer(customerId: string): Promise<Contact[]>
createContact(data: CreateContactRequest): Promise<Contact>

// Deal API
searchDeals(query: string, customerId?: string): Promise<Deal[]>
getDeal(id: string): Promise<Deal>
getDealsByCustomer(customerId: string): Promise<Deal[]>
getDealsByStage(stage: string): Promise<Deal[]>
createDeal(data: CreateDealRequest): Promise<Deal>

// Quote API
getQuotesByDeal(dealId: string): Promise<Quote[]>
createQuote(data: CreateQuoteRequest): Promise<Quote>
```

---

## 5. UI Components Detail

### 5.1 Create Project Dialog Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Creating Project :                   🔍 Type to search   ↗  ✕  │
├───────────────┬────────────────────────────────────────────────┤
│ Sections      │  ▼ Project Details                             │
│ ───────────   │  ┌────────────────┬─────────────────────────┐  │
│ ▸ Project     │  │ * Project Name │ Status ⓘ      [New ▼]  │  │
│   Details     │  │ [___________]  │                         │  │
│               │  ├────────────────┼─────────────────────────┤  │
│ ▸ Custom      │  │ Related To     │ * Assigned To           │  │
│   Information │  │ [search] 📋 +  │ [user picker ▼]         │  │
│               │  ├────────────────┼─────────────────────────┤  │
│ ▸ Description │  │ Start Date     │ Target End Date         │  │
│   Details     │  │ [____] 📅      │ [____] 📅               │  │
│               │  ├────────────────┼─────────────────────────┤  │
│               │  │ Actual End     │ Deal Name               │  │
│               │  │ [____] 📅      │ [search] 📋 +           │  │
│               │  ├────────────────┼─────────────────────────┤  │
│               │  │ Contact Name   │                         │  │
│               │  │ [search] 👤 +  │                         │  │
│               │  └────────────────┴─────────────────────────┘  │
│               │                                                 │
│               │  ▼ Custom Information                          │
│               │  ┌────────────────┬─────────────────────────┐  │
│               │  │ Target Budget  │ Project Url             │  │
│               │  │ [___________]  │ [___________]           │  │
│               │  ├────────────────┼─────────────────────────┤  │
│               │  │ Priority       │ Progress                │  │
│               │  │ [Select ▼]     │ [0-100% ▼]              │  │
│               │  └────────────────┴─────────────────────────┘  │
│               │                                                 │
│               │  ▼ Description Details                         │
│               │  ┌──────────────────────────────────────────┐  │
│               │  │ [B I U S | Size | Font | 📷 🔗 😀 ]      │  │
│               │  │ [Rich Text Editor                      ] │  │
│               │  └──────────────────────────────────────────┘  │
│               │                                                 │
│               │                                      [Save]    │
└───────────────┴────────────────────────────────────────────────┘
```

### 5.2 Entity Picker Component

```
EntityPicker Props:
- entityType: 'customer' | 'contact' | 'deal'
- value: string (ID)
- onChange: (id: string, entity: T) => void
- customerId?: string (filter contacts/deals by customer)
- allowCreate: boolean
- placeholder: string

Behavior:
1. Input focus → show dropdown
2. Type → debounce 300ms → call search API
3. Select item → onChange
4. Click "+" → expand inline form
5. Submit inline form → create entity → select it
```

### 5.3 Inline Form Behavior

```
When user clicks "+" on EntityPicker:
1. Expand inline form below picker
2. Show minimal required fields only
3. On submit: create entity via API
4. On success: auto-select newly created entity
5. Collapse form
```

---

## 6. Implementation Phases

### Phase 1: Database & Backend Foundation (Priority: HIGH)
**Estimated Scope**: Database + Basic CRUD APIs

Tasks:
- [ ] Create SQL migration script for all new tables
- [ ] Create C# Entity classes (Customer, Contact, Deal, Quote, QuoteItem)
- [ ] Create DTOs for each entity
- [ ] Create Repositories with Dapper
- [ ] Create Controllers with search endpoints
- [ ] Update Project entity and DTOs
- [ ] Create stored procedures
- [ ] Test APIs with Postman/curl

### Phase 2: Create Project Dialog (Priority: HIGH)
**Estimated Scope**: Modal UI with all sections

Tasks:
- [ ] Create CollapsibleSection component
- [ ] Create EntityPicker component with search
- [ ] Create InlineCustomerForm component
- [ ] Create InlineContactForm component
- [ ] Create InlineDealForm component
- [ ] Create ProgressDropdown component
- [ ] Create CreateProjectDialog main component
- [ ] Integrate with existing RichTextEditor
- [ ] Add form validation
- [ ] Connect to API
- [ ] Test full flow

### Phase 3: Edit Project Page - Core Tabs (Priority: HIGH)
**Estimated Scope**: Page layout + Summary, Details tabs

Tasks:
- [ ] Create ProjectDetailPage layout
- [ ] Create ProjectHeader component
- [ ] Create ProjectTabs navigation
- [ ] Create SummaryTab (Activity + Analytics sidebar)
- [ ] Create DetailsTab (reuse form from Phase 2)
- [ ] Create QuickFieldsBar
- [ ] Create EmptyState component
- [ ] Add routing /projects/:id

### Phase 4: Edit Project Page - Extended Tabs (Priority: MEDIUM)
**Estimated Scope**: Events, Documents, Milestones tabs

Tasks:
- [ ] Create EventsTab (link CalendarEvents)
- [ ] Create DocumentsTab (upload/link)
- [ ] Create MilestonesTab
- [ ] Create UpdatesTab (activity log)
- [ ] Implement document upload (if storage ready)

### Phase 5: CRM Tabs (Priority: MEDIUM)
**Estimated Scope**: Quotes, Invoices, Cases tabs

Tasks:
- [ ] Create QuotesTab
- [ ] Create InvoicesTab
- [ ] Create CasesTab
- [ ] Create add/link dialogs for each
- [ ] Quote line items management

### Phase 6: CRM Management Pages (Priority: LOW)
**Estimated Scope**: Standalone CRM pages

Tasks:
- [ ] Customers list page
- [ ] Customer detail page
- [ ] Contacts list page
- [ ] Deals pipeline view
- [ ] Quotes management

---

## 7. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity Picker Search | Real-time API (debounce 300ms) | Fresh data, handles large datasets |
| Inline Entity Creation | Expand within same dialog | Less context switching, faster UX |
| Form Sections | Collapsible accordion | Matches design, reduces visual clutter |
| Rich Text Editor | Reuse existing RichTextEditor.tsx | DRY principle |
| Progress Input | Dropdown + custom input | Flexibility with common presets |
| Quote Versioning | Version field + QuoteNumber | Track revisions per deal |

---

## 8. API Endpoints Summary

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | Get all customers |
| GET | /api/customers/{id} | Get customer by ID |
| GET | /api/customers/search?q={query} | Search customers |
| POST | /api/customers | Create customer |
| PUT | /api/customers/{id} | Update customer |
| DELETE | /api/customers/{id} | Soft delete |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contacts | Get all contacts |
| GET | /api/contacts/{id} | Get contact by ID |
| GET | /api/contacts/customer/{customerId} | Get contacts by customer |
| GET | /api/contacts/search?q={query}&customerId={id} | Search contacts |
| POST | /api/contacts | Create contact |
| PUT | /api/contacts/{id} | Update contact |
| DELETE | /api/contacts/{id} | Soft delete |

### Deal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/deals | Get all deals |
| GET | /api/deals/{id} | Get deal by ID |
| GET | /api/deals/customer/{customerId} | Get deals by customer |
| GET | /api/deals/stage/{stage} | Get deals by stage |
| GET | /api/deals/search?q={query} | Search deals |
| POST | /api/deals | Create deal |
| PUT | /api/deals/{id} | Update deal |
| DELETE | /api/deals/{id} | Soft delete |

### Quote
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/quotes | Get all quotes |
| GET | /api/quotes/{id} | Get quote by ID |
| GET | /api/quotes/deal/{dealId} | Get quotes by deal |
| POST | /api/quotes | Create quote with items |
| PUT | /api/quotes/{id} | Update quote |
| DELETE | /api/quotes/{id} | Soft delete |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large dataset in entity pickers | Slow search | Pagination + debounce + limit results |
| Complex form validation | Poor UX | Real-time validation + clear error messages |
| Inline form state management | Bugs | Use React Hook Form + proper state isolation |
| Many new DB tables | Migration complexity | Incremental scripts + rollback plan |
| Quote calculations | Accuracy issues | Server-side calculation + unit tests |

---

## 10. Success Criteria

- [ ] Create Project dialog works with all entity pickers
- [ ] Inline entity creation works without page reload
- [ ] Edit Project page displays all tabs correctly
- [ ] Empty states show proper illustrations and CTAs
- [ ] Search returns results within 500ms
- [ ] Form saves without errors
- [ ] Multi-tenant isolation works correctly (SiteID filtering)

---

## 11. Resolved Questions

| Question | Decision | Notes |
|----------|----------|-------|
| Document Storage | **Local storage** | File system on server |
| Invoice Entity | **Full billing** | Complete invoice system |
| Cases Entity | **Ticket scope** | Implement later phase |
| ESign Integration | **DMS module** | Integrate later with DMS |
| Analytics Panel | **Real charts** | Actual data visualization |
| Gantt View | **Reuse existing** | `src/components/GanttChart.tsx` available |

### Existing GanttChart Component
Location: `src/components/GanttChart.tsx`

Features already implemented:
- Hierarchical tasks (project → phase → task)
- Timeline headers (months/weeks)
- Drag & drop task reordering
- Resize task duration (left/right handles)
- Today marker
- Progress bars
- Expand/collapse phases
- Dark theme styled

---

## 12. Next Steps

1. Review and approve this plan
2. Prioritize Phase 1 (Database + Backend)
3. Create SQL migration script
4. Start backend entity implementation
5. Parallel: Design reusable UI components

---

*Document version: 1.0*
*Last updated: 2025-12-01*