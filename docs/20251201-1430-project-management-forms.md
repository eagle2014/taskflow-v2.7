# Project Management Forms Implementation Plan

> **Created**: 2025-12-01 14:30
> **Scope**: VTiger-style Project Management UI (Create Dialog + Edit Page)
> **Estimated Duration**: 4-5 days

---

## Executive Summary

Implement VTiger-inspired Project Management interface with:
- **Create Project Dialog**: Modal với 3 collapsible sections, entity pickers, inline creation
- **Edit Project Page**: Full page với 10+ tabs (Summary, Details, Events, Milestones, Documents, Quotes, Cases, Invoices, Settings, Updates)
- **CRM Integration**: Customer, Contact, Deal, Quote entities
- **Entity Pickers**: Real-time search (debounce 300ms) + inline "+Create" functionality

---

## Architecture Context

### Tech Stack
- **Backend**: .NET 8.0 + Dapper ORM + SQL Server 2022
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Multi-tenant**: SiteID isolation on all entities

### Existing Components to Reuse
- `RichTextEditor.tsx` - For description fields
- `GanttChart.tsx` - For Gantt View button in ProjectHeader
- `TaskDetailDialog/` - Pattern reference for modals and tabs
- `ui/dialog.tsx`, `ui/tabs.tsx`, `ui/collapsible.tsx` - shadcn/ui primitives

### Backend Patterns
- Controllers extend `ApiControllerBase` with `GetSiteId()`, `GetUserId()`
- Repositories use Dapper with stored procedures
- DTOs separate API contracts from entities
- Standard response: `ApiResponse<T> { success, data, error, message }`

---

## Implementation Phases

| Phase | Status | Description | Files | Duration |
|-------|--------|-------------|-------|----------|
| [Phase 1](#phase-1) | ⏳ Pending | Backend CRM Entities + Project Extensions | 35 files | 1.5 days |
| [Phase 2](#phase-2) | ⏳ Pending | Create Project Dialog (Modal) | 12 files | 1.5 days |
| [Phase 3](#phase-3) | ⏳ Pending | Edit Project Page (Core Tabs) | 8 files | 1 day |
| [Phase 4](#phase-4) | ⏳ Pending | Extended Tabs + Integrations | 10 files | 1 day |

---

## Phase 1: Backend CRM Entities + Project Extensions
**Status**: ⏳ Pending
**Duration**: 1.5 days
**Dependencies**: None

### Deliverables
- SQL migration script (4 new tables + Projects ALTER)
- C# Entities (Customer, Contact, Deal, Quote, QuoteItem)
- DTOs (Create/Update/Search for each entity)
- Repositories with Dapper
- Controllers with CRUD + search endpoints
- Stored procedures (30+ SPs)
- Extended Project entity with new fields

### Key Files
- `Backend/Database/40_CRM_Entities.sql`
- `Backend/TaskFlow.API/Models/Entities/Customer.cs`, `Contact.cs`, `Deal.cs`, `Quote.cs`, `QuoteItem.cs`
- `Backend/TaskFlow.API/Models/DTOs/Customer/`, `Contact/`, `Deal/`, `Quote/`
- `Backend/TaskFlow.API/Repositories/CustomerRepository.cs`, etc.
- `Backend/TaskFlow.API/Controllers/CustomersController.cs`, etc.

**See**: [phase-01-backend-crm-entities.md](./phase-01-backend-crm-entities.md)

---

## Phase 2: Create Project Dialog (Modal)
**Status**: ⏳ Pending
**Duration**: 1.5 days
**Dependencies**: Phase 1 complete

### Deliverables
- Create Project modal with 3 collapsible sections
- EntityPicker component (Customer/Contact/Deal) with real-time search
- Inline entity creation forms (expand below picker)
- ProgressDropdown (0-100% presets + custom input)
- Integration with RichTextEditor for description
- Form validation with React Hook Form
- API integration with toast notifications

### Key Files
- `src/components/project/CreateProjectDialog/CreateProjectDialog.tsx`
- `src/components/project/shared/EntityPicker.tsx`
- `src/components/project/shared/CollapsibleSection.tsx`
- `src/components/crm/CustomerPicker.tsx`, `ContactPicker.tsx`, `DealPicker.tsx`
- `src/services/api.ts` (extend with CRM endpoints)

**See**: [phase-02-create-project-dialog.md](./phase-02-create-project-dialog.md)

---

## Phase 3: Edit Project Page (Core Tabs)
**Status**: ⏳ Pending
**Duration**: 1 day
**Dependencies**: Phase 2 complete

### Deliverables
- ProjectDetailPage layout with header + tabs
- ProjectHeader with project name, icons, Gantt View button
- Summary Tab: Quick fields bar + Activity timeline + Analytics sidebar
- Details Tab: Reuse form sections from CreateProjectDialog
- Tab navigation with active state
- Empty states for tabs with no data
- Routing: `/projects/:id`

### Key Files
- `src/components/project/ProjectDetailPage/ProjectDetailPage.tsx`
- `src/components/project/ProjectDetailPage/ProjectHeader.tsx`
- `src/components/project/ProjectDetailPage/tabs/SummaryTab.tsx`, `DetailsTab.tsx`
- `src/components/project/ProjectDetailPage/components/QuickFieldsBar.tsx`, `AnalyticsSidebar.tsx`

**See**: [phase-03-edit-project-page.md](./phase-03-edit-project-page.md)

---

## Phase 4: Extended Tabs + Integrations
**Status**: ⏳ Pending
**Duration**: 1 day
**Dependencies**: Phase 3 complete

### Deliverables
- Events Tab (link CalendarEvents to project)
- Milestones Tab (create/list project milestones)
- Documents Tab (placeholder for future file upload)
- Quotes Tab (list quotes from linked deals)
- Invoices Tab (placeholder stub)
- Cases Tab (placeholder stub)
- Updates Tab (activity log/audit trail)
- Settings Tab (project-level settings)

### Key Files
- `src/components/project/ProjectDetailPage/tabs/EventsTab.tsx`, `MilestonesTab.tsx`, `DocumentsTab.tsx`, `QuotesTab.tsx`, `InvoicesTab.tsx`, `CasesTab.tsx`, `UpdatesTab.tsx`, `SettingsTab.tsx`
- `src/components/project/ProjectDetailPage/components/EmptyState.tsx`

**See**: [phase-04-extended-tabs.md](./phase-04-extended-tabs.md)

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Modal vs Full Page for Create | **Modal (Dialog)** | Quick creation without losing context, matches VTiger pattern |
| Entity Picker Search | **Real-time API (debounce 300ms)** | Fresh data, handles large datasets, server-side filtering |
| Inline Entity Creation | **Expand within same dialog** | Reduces context switching, faster UX, keeps user flow |
| Form Sections | **Collapsible Accordion** | Matches VTiger design, reduces visual clutter, progressive disclosure |
| Rich Text Editor | **Reuse RichTextEditor.tsx** | DRY principle, consistent styling, proven implementation |
| Progress Input | **Dropdown + custom input** | Flexibility with common presets (0%, 25%, 50%, 75%, 100%) |
| Tab State Management | **React useState + URL params** | Simple, no external state library needed |
| Quote Versioning | **Version field + QuoteNumber** | Track revisions per deal, audit trail |
| Document Storage | **Placeholder/future** | Infrastructure not ready, stub UI only |

---

## API Endpoints Overview

### Customer
- `GET /api/customers` - List all
- `GET /api/customers/{id}` - Get by ID
- `GET /api/customers/search?q={query}` - Search
- `POST /api/customers` - Create
- `PUT /api/customers/{id}` - Update
- `DELETE /api/customers/{id}` - Soft delete

### Contact
- `GET /api/contacts` - List all
- `GET /api/contacts/{id}` - Get by ID
- `GET /api/contacts/customer/{customerId}` - Filter by customer
- `GET /api/contacts/search?q={query}&customerId={id}` - Search
- `POST /api/contacts` - Create
- `PUT /api/contacts/{id}` - Update
- `DELETE /api/contacts/{id}` - Soft delete

### Deal
- `GET /api/deals` - List all
- `GET /api/deals/{id}` - Get by ID
- `GET /api/deals/customer/{customerId}` - Filter by customer
- `GET /api/deals/stage/{stage}` - Filter by pipeline stage
- `GET /api/deals/search?q={query}` - Search
- `POST /api/deals` - Create
- `PUT /api/deals/{id}` - Update
- `DELETE /api/deals/{id}` - Soft delete

### Quote
- `GET /api/quotes` - List all
- `GET /api/quotes/{id}` - Get by ID with line items
- `GET /api/quotes/deal/{dealId}` - Filter by deal
- `POST /api/quotes` - Create with items
- `PUT /api/quotes/{id}` - Update with items
- `DELETE /api/quotes/{id}` - Soft delete

---

## Database Schema Summary

### New Tables
- **Customers** (CustomerID, SiteID, CustomerCode, CustomerName, Industry, TaxCode, Phone, Email, Address, Status, etc.)
- **Contacts** (ContactID, SiteID, CustomerID, FirstName, LastName, Email, Phone, Position, Department, IsPrimary, etc.)
- **Deals** (DealID, SiteID, CustomerID, ContactID, DealCode, DealName, DealValue, Stage, Probability, ExpectedCloseDate, Status, etc.)
- **Quotes** (QuoteID, SiteID, DealID, CustomerID, QuoteNumber, Version, QuoteDate, SubTotal, TaxAmount, TotalAmount, Status, etc.)
- **QuoteItems** (QuoteItemID, QuoteID, ItemName, Quantity, UnitPrice, Amount, etc.)

### Projects Table Extensions
```sql
ALTER TABLE Projects ADD
    AssigneeID UNIQUEIDENTIFIER NULL,
    CustomerID UNIQUEIDENTIFIER NULL,
    ContactID UNIQUEIDENTIFIER NULL,
    DealID UNIQUEIDENTIFIER NULL,
    ActualEndDate DATE NULL,
    ProjectUrl NVARCHAR(500) NULL,
    Progress INT DEFAULT 0;
```

---

## Success Criteria

- [ ] Create Project dialog opens, all sections collapsible
- [ ] Entity pickers search with debounce, results display
- [ ] Inline "+Create" expands form, saves, auto-selects entity
- [ ] Project saved with CRM relationships
- [ ] Edit Project page displays at `/projects/:id`
- [ ] All 10 tabs render without errors
- [ ] Summary tab shows activity + analytics
- [ ] Details tab reuses Create dialog sections
- [ ] Empty states display proper illustrations
- [ ] Multi-tenant isolation works (SiteID filtering)
- [ ] Search returns results within 500ms
- [ ] No performance degradation with 100+ entities

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large entity dataset in pickers | Slow search | Pagination + debounce 300ms + limit 50 results |
| Complex form validation | Poor UX | Real-time validation + clear error messages + React Hook Form |
| Inline form state conflicts | Bugs | Isolated state per picker + proper cleanup on collapse |
| Many new DB tables | Migration issues | Incremental script + rollback plan + test on dev DB first |
| Quote calculations accuracy | Data errors | Server-side calculation + unit tests + decimal precision |
| Tab content lazy loading | Initial slow render | Lazy load tab content on first visit + skeleton states |

---

## Development Workflow

### Phase Completion Checklist
1. Run backend tests (if exist)
2. Run `dotnet build` to verify compilation
3. Test APIs with Swagger/Postman
4. Run frontend dev server, test UI
5. Check multi-tenant isolation (switch sites)
6. Update documentation if needed
7. Commit with descriptive message
8. Move phase status to ✅ Complete

### Testing Strategy
- **Unit Tests**: Quote calculations, form validation
- **Integration Tests**: API endpoints with database
- **E2E Tests**: Create project flow, entity pickers
- **Manual Tests**: Search performance, UX flows

---

## File Structure Overview

```
Backend/TaskFlow.API/
├── Models/
│   ├── Entities/
│   │   ├── Customer.cs (NEW)
│   │   ├── Contact.cs (NEW)
│   │   ├── Deal.cs (NEW)
│   │   ├── Quote.cs (NEW)
│   │   ├── QuoteItem.cs (NEW)
│   │   └── Project.cs (UPDATE)
│   └── DTOs/
│       ├── Customer/ (NEW)
│       ├── Contact/ (NEW)
│       ├── Deal/ (NEW)
│       ├── Quote/ (NEW)
│       └── Project/ (UPDATE)
├── Repositories/
│   ├── CustomerRepository.cs (NEW)
│   ├── ContactRepository.cs (NEW)
│   ├── DealRepository.cs (NEW)
│   └── QuoteRepository.cs (NEW)
└── Controllers/
    ├── CustomersController.cs (NEW)
    ├── ContactsController.cs (NEW)
    ├── DealsController.cs (NEW)
    └── QuotesController.cs (NEW)

src/components/
├── project/
│   ├── CreateProjectDialog/ (NEW - 8 files)
│   ├── ProjectDetailPage/ (NEW - 18 files)
│   └── shared/ (NEW - 3 files)
└── crm/ (NEW - 7 files)

Backend/Database/
└── 40_CRM_Entities.sql (NEW)
```

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ Execute Phase 1: Backend CRM Entities
3. ⏳ Execute Phase 2: Create Project Dialog
4. ⏳ Execute Phase 3: Edit Project Page
5. ⏳ Execute Phase 4: Extended Tabs

---

## Unresolved Questions

1. **Document Storage**: Local file system or cloud (S3/Azure Blob)? → Stub UI for now
2. **Invoice System**: Full billing or simple tracking? → Placeholder tab for future
3. **Cases Entity**: Full ticketing or simplified? → Placeholder tab for future
4. **ESign Integration**: Third-party API? → Placeholder tab for future
5. **Analytics Data Source**: Real-time queries or cached metrics? → Real-time for MVP
6. **Quote PDF Generation**: Server-side or client-side? → Phase 5+

---

*Plan Version: 1.0*
*Last Updated: 2025-12-01 14:30*
*Total Estimated Files: 65+*
*Total Estimated Duration: 4-5 days*