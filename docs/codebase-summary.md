# Codebase Summary

**Project:** Modern Task Management System v2.7
**Updated:** 2025-12-03
**Status:** Phase 1 Complete (TaskDetailDialog Redesign & CRM Implementation)
**Repo Type:** Multi-tenant, full-stack web application

---

## Executive Summary

Modern Task Management System v2.7 is a comprehensive, multi-tenant task management platform with integrated CRM capabilities. The system features a React 18 frontend, .NET 8.0 backend, SQL Server database, and Docker-based deployment stack. Recent Phase 1 completion includes TaskDetailDialog redesign with dark theme support, responsive fixes, and CRM entity integration (Customers, Contacts, Deals, Quotes).

**Key Metrics:**
- Total files: 470 (code + config + docs)
- Total tokens: 686,283
- Total characters: 2,788,400
- Controllers: 14 (Auth, Projects, Tasks, Phases, Spaces, Categories, Comments, Events, Users, Customers, Contacts, Deals, Quotes, Logto)
- API Endpoints: 50+
- Frontend Components: 50+ (UI library + feature components)
- Backend Entities: 13 (Core + CRM)
- Repositories: 11

---

## 1. Project Structure

```
Modern Task Management System_v2.7/
├── src/                                   # React 18 Frontend
│   ├── components/
│   │   ├── ui/                           # shadcn/ui + Radix (30+ components)
│   │   ├── TaskDetailDialog/             # Redesigned task detail panel
│   │   │   ├── TaskDetailDialog.tsx      # Main component
│   │   │   ├── components/               # Subcomponents (Header, Tabs, Actions)
│   │   │   ├── fields/                   # Input fields (DatePicker, Status, etc)
│   │   │   ├── hooks/                    # useAutoSave custom hook
│   │   │   └── types.ts                  # Type definitions
│   │   ├── workspace/                    # Project workspace module
│   │   │   ├── WorkspaceListView.tsx     # Table-based task view
│   │   │   ├── WorkspaceSidebar.tsx      # Navigation sidebar
│   │   │   ├── WorkspaceToolbar.tsx      # View controls
│   │   │   ├── hooks/                    # Custom hooks (useTaskManagement, etc)
│   │   │   └── utils/                    # Calculation/helper utilities
│   │   ├── Projects.tsx                  # Project list view
│   │   ├── CreateProjectDialog.tsx       # Project creation with CRM links
│   │   ├── EditProjectDialog.tsx         # Project editing
│   │   ├── KanbanBoard.tsx               # Kanban view
│   │   ├── GanttChart.tsx                # Gantt timeline
│   │   ├── MindMapView.tsx               # Hierarchical view
│   │   ├── Calendar.tsx                  # Calendar events
│   │   ├── DealsView.tsx                 # CRM deals dashboard
│   │   ├── CreateCustomerDialog.tsx      # CRM customer creation
│   │   ├── CreateContactDialog.tsx       # CRM contact creation
│   │   ├── CreateDealDialog.tsx          # CRM deal creation
│   │   └── [40+ other feature components]
│   ├── services/
│   │   ├── api.ts                        # Main API client with auth interceptors
│   │   ├── spacesService.ts              # Spaces API service
│   │   └── eventsAdapter.ts              # Event adapter
│   ├── config/
│   │   └── logto.config.ts               # Logto OAuth/OIDC configuration
│   ├── hooks/
│   │   └── useDebounce.ts                # Debounce hook for form inputs
│   ├── types/
│   │   ├── api-types.tsx                 # API response types
│   │   ├── crm.ts                        # CRM type definitions
│   │   └── workspace.ts                  # Workspace types
│   ├── utils/
│   │   ├── api/                          # API utilities by feature
│   │   └── i18n/                         # Internationalization
│   ├── App.tsx                           # Root component
│   ├── main.tsx                          # Entry point
│   └── index.css                         # Tailwind + custom styles
│
├── Backend/
│   ├── TaskFlow.API/                     # .NET 8.0 Web API
│   │   ├── Controllers/                  # 14 API endpoints
│   │   │   ├── AuthController.cs         # JWT + token management
│   │   │   ├── LogtoController.cs        # Logto OAuth/OIDC integration
│   │   │   ├── ProjectsController.cs     # Project CRUD with CRM links
│   │   │   ├── TasksController.cs        # Task CRUD + hierarchy
│   │   │   ├── PhasesController.cs       # Phase management
│   │   │   ├── SpacesController.cs       # Space/section management
│   │   │   ├── CategoriesController.cs   # Category management
│   │   │   ├── CommentsController.cs     # Task comments
│   │   │   ├── EventsController.cs       # Calendar events
│   │   │   ├── UsersController.cs        # User management
│   │   │   ├── CustomersController.cs    # CRM customers
│   │   │   ├── ContactsController.cs     # CRM contacts
│   │   │   ├── DealsController.cs        # CRM deals
│   │   │   ├── QuotesController.cs       # CRM quotes
│   │   │   └── Base/ApiControllerBase.cs # Base controller with tenant helpers
│   │   ├── Models/
│   │   │   ├── Entities/                 # Domain models (13 total)
│   │   │   │   ├── Core: Site, User, Project, Task, Phase, Space, Category, Comment, CalendarEvent
│   │   │   │   └── CRM: Customer, Contact, Deal, Quote, QuoteItem
│   │   │   └── DTOs/                     # Data transfer objects (50+)
│   │   │       ├── Auth/                 # Login, Register, TokenRefresh
│   │   │       ├── Project/              # CreateProject, UpdateProject
│   │   │       ├── Task/                 # CreateTask, UpdateTask
│   │   │       ├── Customer/             # CreateCustomer, UpdateCustomer
│   │   │       ├── Contact/              # CreateContact, UpdateContact
│   │   │       ├── Deal/                 # CreateDeal, UpdateDeal
│   │   │       ├── Quote/                # CreateQuote, UpdateQuote
│   │   │       └── [Other feature DTOs]
│   │   ├── Repositories/                 # Data access layer (11 total)
│   │   │   ├── Interfaces/               # Repository contracts
│   │   │   └── [Implementations]         # Dapper-based queries
│   │   ├── Services/                     # Business logic
│   │   │   ├── AuthService.cs            # Authentication & JWT
│   │   │   ├── LogtoAuthService.cs       # Logto integration
│   │   │   ├── TokenService.cs           # Token generation/validation
│   │   │   └── IAuthService/ITokenService # Interfaces
│   │   ├── Middleware/
│   │   │   └── ErrorHandlerMiddleware.cs # Global error handling
│   │   ├── Program.cs                    # Startup configuration
│   │   └── appsettings.json              # Configuration (DB, JWT, Logto)
│   │
│   └── Database/
│       ├── 00_Full_Schema_And_Data.sql   # Complete schema
│       ├── 10-42_*.sql                   # Migration scripts
│       ├── 40_CRM_Entities.sql           # CRM tables (Customer, Contact, Deal, Quote)
│       ├── 41_CRM_Fix_Indexes.sql        # CRM index optimization
│       └── [Stored procedures for all entities]
│
├── docker/                               # Docker configuration
│   ├── docker-compose.yml                # Multi-service orchestration
│   ├── backend/Dockerfile                # .NET API image
│   ├── frontend/Dockerfile               # React app image
│   └── database/                         # SQL Server setup
│
├── .claude/                              # AI Agent configuration
│   ├── agents/                           # 15 agent roles
│   ├── commands/                         # 30+ slash commands
│   ├── skills/                           # 20+ skill libraries
│   └── workflows/                        # Development workflows
│
├── docs/                                 # Project documentation
│   ├── codebase-summary.md               # This file
│   ├── project-overview-pdr.md           # Requirements & spec
│   ├── code-standards.md                 # Coding conventions
│   ├── system-architecture.md            # Architecture details
│   ├── project-roadmap.md                # Implementation status
│   ├── deployment-guide.md               # Deploy procedures
│   ├── design-guidelines.md              # UI/UX patterns
│   └── logto-integration-guide.md        # Logto setup
│
├── package.json                          # Frontend dependencies
├── vite.config.ts                        # Vite build config
├── docker-compose.yml                    # Docker orchestration
├── CLAUDE.md                             # Project guidelines
└── README.md                             # Project overview
```

---

## 2. Technology Stack

### Frontend (React 18 + TypeScript + Vite)

**Core Framework:**
- React 18.3.1 - UI library with hooks & automatic JSX runtime
- TypeScript 5.x - Type safety and DX
- Vite 6.3.5 - Fast build tool with HMR + SWC compiler
- Tailwind CSS 3.x - Utility-first styling

**Component Libraries:**
- shadcn/ui - Accessible component library (30+ components)
- Radix UI - Primitive UI components
- Lucide React - Icon library (1000+ icons)
- Class Variance Authority - Component variant management
- Tailwind Merge - Utility class merging

**State Management:**
- React Hooks - Local state management
- Custom hooks - Feature-specific logic (workspace, task management)
- LocalStorage - Token & session persistence

**Forms & Validation:**
- React Hook Form 7.55.0 - Performant form management
- Input OTP - OTP input components

**Date & Time:**
- date-fns - Date utilities
- React Day Picker - Calendar picker

**Data Visualization:**
- Recharts 2.15.2 - Chart library
- Custom Gantt implementation
- Custom Mind Map visualization

**Drag & Drop:**
- react-dnd - Flexible drag-drop framework
- react-dnd-html5-backend - HTML5 backend
- re-resizable - Resizable panels

**UI Enhancements:**
- Sonner 2.0.3 - Toast notifications
- Embla Carousel - Carousel/slider
- Vaul - Drawer/modal
- CMDK - Command palette

### Backend (.NET 8.0 + C# 12)

**Framework:**
- .NET 8.0 LTS - Latest stable framework
- ASP.NET Core Web API - RESTful API
- C# 12 - Modern language features

**Authentication & Security:**
- JWT Bearer Authentication - Token-based auth
- BCrypt.Net-Next 4.0.3 - Password hashing (cost 10)
- Rate Limiting - Brute-force protection
- CORS Configuration - Cross-origin support

**Data Access:**
- Dapper 2.1.35 - Lightweight micro-ORM
- Microsoft.Data.SqlClient - SQL Server provider
- Stored Procedures - Complex queries

**API Documentation:**
- Swashbuckle.AspNetCore 6.5.0 - Swagger/OpenAPI
- XML Documentation - Code comments

**Middleware & Utilities:**
- ErrorHandlerMiddleware - Global error handling
- Response Compression - Performance optimization
- Health Checks - Service monitoring

### Database (SQL Server 2022)

**Features:**
- Multi-tenant schema with SiteID isolation
- Stored procedures for complex queries
- Indexes for performance optimization
- Soft deletes (IsDeleted flag)
- Audit timestamps (CreatedAt, UpdatedAt)
- Foreign key constraints for referential integrity

**Core Tables:**
- Site - Tenant organizations
- User - User accounts with JWT claims
- Project - Project management
- Task - Hierarchical tasks with budget
- Phase - Workflow phases
- Space - Task sections
- Category - Project categories
- Comment - Task discussions
- CalendarEvent - Event management

**CRM Tables (New):**
- Customer - Customer management
- Contact - Contact information
- Deal - Sales pipeline
- Quote - Quote generation
- QuoteItem - Quote line items

### Infrastructure & DevOps

**Containerization:**
- Docker - Container platform
- Docker Compose - Multi-service orchestration
- Services: Frontend, Backend, SQL Server, DB-Init

**Development Tools:**
- PowerShell scripts - Database automation
- Bash scripts - Cross-platform scripts
- npm scripts - Frontend workflows
- dotnet CLI - Backend workflows

---

## 3. Core Features & Implementation

### Authentication & Authorization

**Legacy JWT Flow:**
1. User submits email, password, site code
2. Backend validates credentials & generates tokens (access + refresh)
3. Frontend stores tokens in localStorage
4. API requests include Authorization header: `Bearer <token>`
5. Automatic refresh on expiration via `/api/auth/refresh`

**Token Claims:**
- `UserID` - User GUID
- `SiteID` - Tenant GUID
- `Email` - User email
- `Role` - User role (Admin, Manager, Member)
- `exp` - Expiration (8 hours for access token)
- `iat` - Issued at timestamp

**Logto OAuth/OIDC (New):**
- OAuth 2.0 authorization code flow
- Logto endpoint: `http://localhost:3001`
- Redirect URI: `http://localhost:5600/auth/callback`
- Backend syncs users to local database with site mapping
- LogtoUserSiteMappings table for multi-tenant support

**Multi-Tenant Isolation:**
- Every entity has `SiteID` column
- All queries filtered by current user's SiteID
- Database constraints enforce tenant boundaries
- JWT token includes SiteID claim for context

### Project Management

**Features:**
- Create, read, update, delete projects
- Project categorization system
- Status tracking: Active, Planning, On Hold, Completed, Archived
- Priority levels: Low, Medium, High, Critical
- Budget tracking & expense management
- Timeline management (start/end dates, actual end date)
- Team assignment & project ownership
- Link to CRM entities: Customer, Contact, Deal

**API Endpoints:**
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Soft delete project
- `GET /api/projects/category/{categoryId}` - Filter by category
- `GET /api/projects/status/{status}` - Filter by status

### Task Management

**Hierarchy:**
- Projects contain Tasks
- Tasks can have unlimited Subtasks
- Tasks belong to Phases (workflow stages)
- Tasks assigned to Spaces (sections)

**Task Fields:**
- Title, description, notes
- Status: To Do, In Progress, Review, Done, Cancelled
- Priority: Low, Medium, High, Critical
- Progress: 0-100% completion
- Budget & Spent hours tracking
- Due date & timeline
- Assigned user
- Tags for categorization

**Features:**
- Drag-and-drop reordering
- Phase-based workflow
- Subtask hierarchy
- Comment discussions (nested replies)
- Activity timeline
- Bulk operations

**API Endpoints:**
- `GET /api/tasks` - List tasks
- `GET /api/tasks/{id}` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Soft delete
- `GET /api/tasks/parent/{parentTaskId}` - Get subtasks
- `GET /api/tasks/project/{projectId}` - Filter by project

### Workspace Views

**List View:**
- Table-based task management
- Inline editing of task fields
- Column customization
- Sorting & filtering
- Bulk selection & operations

**Kanban Board:**
- Visual columns by status
- Drag-and-drop between columns
- Task cards with key information
- Column statistics (task count, estimated hours)

**Gantt Chart:**
- Timeline visualization
- Task duration bars
- Dependency visualization
- Milestone markers
- Zoom controls

**Mind Map View:**
- Hierarchical tree structure
- Parent-child relationships
- Expandable nodes
- Visual organization

### CRM Integration (New Phase 1)

**Customers:**
- Customer management (B2B/B2C)
- Business details: company name, industry, website, tax code
- Contact info: phone, email, address, country
- Financial: annual revenue, employee count
- Status: Active, Inactive, Lead
- Source tracking & notes

**Contacts:**
- Individual contact management
- Link to Customer
- Personal details: name, email, phone, title, department
- Address information
- Relationship & interaction tracking

**Deals:**
- Sales pipeline management
- Link to Customer & Contact
- Deal status: Lead, Negotiation, Won, Lost
- Amount tracking
- Timeline: expected close date, actual close date
- Probability percentage
- Notes & follow-up details

**Quotes:**
- Quote generation from deals
- Quote items with individual pricing
- Tax calculation
- Subtotal & total amounts
- Status: Draft, Sent, Accepted, Rejected
- Expiration date
- Notes

**Integration with Projects:**
- Projects can link to Customers, Contacts, Deals
- CRM entities accessible from project detail view
- Seamless workflow between projects and sales pipeline

### Collaboration Features

**Comments:**
- Nested comment replies
- User mentions (@ mentions)
- Comment editing & deletion
- Timestamps and user info
- Activity timeline integration

**Activity Timeline:**
- Task creation, updates, deletions
- Status changes
- Assignment changes
- Comment additions
- Phase transitions

**Team Management:**
- User roles: Admin, Manager, Member
- Project team assignment
- Task assignment to team members
- User profiles & avatars

### Calendar & Events

**Event Management:**
- Create, read, update, delete events
- Event types: Meeting, Deadline, Milestone, Review
- Date range support
- Location & description
- Link to projects & tasks
- Recurring events (future enhancement)

**Calendar View:**
- Monthly/weekly/day view
- Event visualization
- Drag-to-create events
- Multi-calendar support

---

## 4. Architecture Patterns

### Multi-Tenant Architecture

**Pattern:** Shared database with SiteID-based isolation

**Implementation:**
- Every entity contains SiteID column (string, not GUID)
- JWT token includes SiteID claim
- All queries filtered: `WHERE SiteID = @siteId`
- Database constraints: Foreign keys include SiteID
- No tenant data leakage possible due to query filters

**Base Controller Pattern:**
```csharp
public class ApiControllerBase : ControllerBase
{
    protected string GetSiteId() => User.FindFirst("SiteID")?.Value;
    protected Guid GetUserId() => Guid.Parse(User.FindFirst("UserID")?.Value);

    protected IActionResult Success<T>(T data, string message = "")
        => Ok(ApiResponse<T>.SuccessResponse(data, message));
}
```

**Tenant Isolation Guarantees:**
- User claims always include SiteID
- Controllers extract SiteID from claims
- Repositories accept SiteID parameter
- Database queries always filter by SiteID
- Cannot request other tenant's data

### Repository Pattern

**Purpose:** Abstract data access, enable testability

**Structure:**
```
IRepository<T>                    (Base interface)
    ↓
IProjectRepository : IRepository<T>  (Specific interface)
    ↓
ProjectRepository : IProjectRepository    (Dapper implementation)
```

**Dapper Implementation:**
- Micro-ORM approach: Lightweight, performant
- SQL queries with parameter binding
- Strongly-typed result mapping
- Stored procedures for complex logic
- No change tracking overhead

**Benefits:**
- Testability via DI
- Centralized data access logic
- Easy to swap ORM or database
- Consistent patterns across codebase

### DTO Pattern

**Purpose:** Separate API contracts from domain models

**Structure:**
- **Entities:** Internal domain models (Models/Entities/)
- **DTOs:** API request/response objects (Models/DTOs/)
- **Organization:** By feature (Auth/, Project/, Task/, CRM/)

**Benefits:**
- API versioning flexibility
- Prevent over-posting attacks
- Control data exposure
- Optimize network payloads
- Validation separation

**Example:**
```csharp
// Entity (internal domain model)
public class Task
{
    public Guid TaskID { get; set; }
    public string SiteID { get; set; }
    public string Title { get; set; }
    public decimal Budget { get; set; }
    // ...many more properties
}

// DTO (API contract)
public class CreateTaskDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal? Budget { get; set; }
    // Only exposed fields
}
```

### Error Handling

**Backend Pattern:**
- Global ErrorHandlerMiddleware catches all exceptions
- Standardized ApiResponse<T> wrapper
- HTTP status codes: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Detailed error messages in development, generic in production

**Response Format:**
```json
{
    "success": true,
    "data": { /* response payload */ },
    "message": "Operation successful",
    "error": null
}
```

**Frontend Pattern:**
- Try-catch blocks in API calls
- Sonner toast notifications for errors
- Error boundary for component crashes
- User-friendly error messages

### State Management

**Frontend:**
- React Hooks (useState, useEffect, useReducer)
- Custom hooks for feature logic
- LocalStorage for persistence (tokens, preferences)
- No Redux/MobX (KISS principle)

**Custom Hooks:**
- `useWorkspaceState` - Workspace-wide state
- `useTaskManagement` - Task operations
- `usePhaseManagement` - Phase operations
- `useSpaceManagement` - Space operations
- `useAutoSave` - Auto-save for form changes

---

## 5. API Design

### REST Conventions

**Standard CRUD Endpoints:**
```
GET    /api/{resource}              # List all
GET    /api/{resource}/{id}         # Get by ID
POST   /api/{resource}              # Create
PUT    /api/{resource}/{id}         # Update
DELETE /api/{resource}/{id}         # Delete
```

**Filtering & Search:**
```
GET /api/{resource}?status=Active
GET /api/{resource}?categoryId={id}
POST /api/{resource}/search         # Complex search
```

**Status Codes:**
- 200 OK - Successful GET/PUT/DELETE
- 201 Created - Successful POST
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing/invalid auth
- 404 Not Found - Resource not found
- 500 Internal Server Error - Unhandled exception

### Authentication Headers

**JWT Bearer Token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Refresh:**
```
POST /api/auth/refresh
Body: { "refreshToken": "..." }
```

### Common Query Parameters

- `pageNumber` - Pagination (future)
- `pageSize` - Items per page (future)
- `sortBy` - Sort field
- `sortDirection` - ASC/DESC
- `search` - Text search query

---

## 6. Frontend Architecture

### Component Organization

**UI Components** (`components/ui/`):
- Low-level Radix UI wrapper components
- Button, Input, Dialog, Select, etc.
- Consistent styling with Tailwind
- No business logic

**Feature Components** (`components/`):
- High-level feature implementations
- Projects.tsx, TaskDetailDialog.tsx, KanbanBoard.tsx
- Contains business logic
- Consume API services

**Workspace Module** (`components/workspace/`):
- Dedicated feature module with custom hooks
- WorkspaceListView, WorkspaceSidebar, WorkspaceToolbar
- Complex state management in custom hooks
- Reusable across views

### Hooks Strategy

**Custom Hooks** (Feature-specific logic):
- `useWorkspaceState()` - Workspace data & filters
- `useTaskManagement()` - Task CRUD operations
- `usePhaseManagement()` - Phase management
- `useAutoSave()` - Form auto-save on changes
- `useDebounce()` - Debounced input handling

**Benefits:**
- Separate business logic from UI rendering
- Testability of logic independent of components
- Reusable across components
- Cleaner component files (<200 lines)

### Forms & Validation

**React Hook Form Approach:**
- Register fields with hook form
- Validation rules at field level
- Form-level validation
- Error message display
- Minimal re-renders

**Auto-Save Implementation:**
- `useAutoSave` hook watches form changes
- Debounced API calls (300ms delay)
- Visual feedback (saving indicator)
- Error handling with user notification

---

## 7. Backend Architecture

### Startup Configuration (Program.cs)

**Service Registration:**
- Authentication (JWT Bearer)
- Authorization (Role-based policies)
- CORS (Development & Production)
- API versioning
- Swagger/OpenAPI documentation
- Rate limiting (global & per-endpoint)
- Response compression
- Health checks

**Middleware Pipeline:**
1. Error handling (global exception catch)
2. CORS (must be early)
3. HTTPS redirection
4. Response compression
5. Rate limiting
6. Authentication
7. Authorization
8. Controller routing

### Database Connection

**Connection String:**
```
Server=localhost;Database=TaskFlowDB_Dev;User ID=sa;Password=...;TrustServerCertificate=true;
```

**Dapper Integration:**
- SqlConnection for queries
- IDbConnection abstraction
- Automatic parameter binding
- Strongly-typed result mapping
- Stored procedure execution

### Logging Configuration

**Providers:**
- Console logging (development)
- Debug logging (development)
- Entity Framework queries (warnings only)

**Log Levels:**
- Error - Exception details
- Warning - Suspicious conditions
- Information - Application flow
- Debug - Detailed diagnostics

---

## 8. Security Considerations

### Authentication

**JWT Token Security:**
- 32+ character secret key
- HS256 algorithm (HMAC-SHA256)
- Short expiration: 8 hours (access), 30 days (refresh)
- Signature validation on every request
- Claims validation (issuer, audience)

**Password Security:**
- BCrypt hashing with cost factor 10
- No passwords in logs or responses
- Secure password reset flow (future)

### Authorization

**Role-Based Access Control:**
- Admin - Full system access
- Manager - Project & team management
- Member - Task assignment & comments

**Endpoint Protection:**
- [Authorize] attribute on all protected endpoints
- Multi-level: AllowAnonymous, default (Authorize), specific roles
- SiteID validation on every request

### Rate Limiting

**Global Limit:**
- 100 requests per 60 seconds (configurable)

**Auth Endpoint Limit:**
- 10 requests per minute (prevent brute force)
- Queue limit: 2 pending requests

### CORS Configuration

**Development:**
- Allows localhost:5600, 5173, 5174, 3000, 3001, 3007
- Allows all methods and headers
- Allows credentials (cookies)

**Production:**
- Configurable via environment variable
- Specific origins only
- Restrict headers/methods

### Data Validation

**Input Validation:**
- DTO property attributes ([Required], [StringLength], etc.)
- Model state validation in controllers
- Custom validation rules
- SQL parameter binding (prevent injection)

---

## 9. File Size Management

**Largest Files (Token Count):**
1. src/index.css - 37,258 tokens (Tailwind styles)
2. src/components/EditTaskForm.tsx - 17,931 tokens
3. src/components/ProjectWorkspaceV1.tsx - 11,489 tokens
4. src/components/TaskDetailDialog.old.tsx - 11,046 tokens (deprecated)
5. src/components/AddInvoiceDialog.tsx - 9,860 tokens

**File Organization:**
- Components kept under 200 lines (KISS principle)
- Large features split into subcomponents
- Hooks extracted to separate files
- Utils separated by feature

---

## 10. Development Workflow

### Git Conventions

**Branch Strategy:**
- `main` - Production releases
- `develop` - Integration branch (future)
- Feature branches: `feature/task-detail-redesign`
- Bugfix branches: `bugfix/auth-token-issue`

**Commit Messages:**
- Format: `type: brief description`
- Types: feat, fix, docs, refactor, test, chore
- Example: `feat: add CRM customer management`

**Pre-commit Checks:**
- Linting (ESLint)
- Type checking (TypeScript)
- No test failures
- No hardcoded credentials

### Build & Deployment

**Frontend Build:**
```bash
npm run build  # Vite production build -> dist/
```

**Backend Build:**
```bash
dotnet build   # Compile to obj/
dotnet publish # Release package
```

**Docker Build:**
```bash
docker-compose build
docker-compose up -d
```

### Testing Strategy

**Frontend:**
- E2E tests (Playwright/Cypress)
- Component tests (React Testing Library)
- Manual testing via UI

**Backend:**
- Unit tests (xUnit) - Repositories, Services
- Integration tests - API endpoints
- Database tests - Stored procedures

---

## 11. Performance Optimizations

### Frontend

**Code Splitting:**
- Dynamic imports for routes (future)
- Lazy loading of heavy components
- Chunk optimization in Vite

**Rendering Optimization:**
- React.memo for pure components
- useMemo/useCallback for expensive operations
- Virtual scrolling for large lists (future)
- Image lazy loading

**Bundle Size:**
- Tree-shaking unused code
- Minification & compression
- CSS purging (Tailwind)
- Gzip compression in Docker

### Backend

**Database Optimization:**
- Indexes on frequently queried columns
- Query optimization in Dapper
- Connection pooling
- Caching (future)

**API Optimization:**
- Response compression (gzip)
- Pagination (future)
- Sparse fieldsets (future)
- ETag caching support (future)

---

## 12. Unresolved Questions & Future Enhancements

### Known Limitations
- Pagination not yet implemented
- Recurring events in calendar (future)
- Real-time collaboration (WebSocket) - future
- File attachments to tasks (future)
- Advanced reporting & analytics (future)
- Mobile app (future)

### Tech Debt
- EditTaskForm.tsx is 80KB (should refactor subcomponents)
- Some duplicate code in controllers (could use base classes)
- Test coverage needs improvement
- Documentation needs screenshots/diagrams

### Security Improvements
- Implement refresh token rotation
- HttpOnly cookies instead of localStorage
- CSRF protection
- Content Security Policy (CSP) headers
- Rate limiting per user (not just global)
