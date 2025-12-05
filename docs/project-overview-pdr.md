# Project Overview & Product Development Requirements (PDR)

**Project:** Modern Task Management System v2.7
**Version:** 2.7
**Status:** Phase 1 Complete
**Last Updated:** 2025-12-03

---

## 1. Project Vision & Goals

### Vision Statement

Create a comprehensive, enterprise-grade task management and CRM platform that enables teams and organizations to efficiently manage projects, tasks, and customer relationships in a unified system with multi-tenant capabilities.

### Primary Goals

1. **Multi-Tenant Architecture** - Support multiple independent organizations with complete data isolation
2. **Task Management Excellence** - Hierarchical task management with multiple visualization options
3. **CRM Integration** - Seamless customer, contact, deal, and quote management
4. **Collaboration** - Team communication, comments, and activity tracking
5. **User Experience** - Intuitive UI with modern design patterns and responsive layouts
6. **Security** - JWT authentication, role-based access control, data encryption
7. **Scalability** - Docker-based deployment, database optimization, API rate limiting
8. **Developer Experience** - Clean code, comprehensive documentation, automated tools

---

## 2. Product Scope & Functional Requirements

### Phase 1: Core Task Management + CRM (COMPLETE)

#### 2.1 Authentication & Authorization

**Requirement:** Multi-method authentication supporting both legacy JWT and modern OAuth/OIDC

**Specifications:**
- **Legacy JWT Flow** (Email/Password)
  - Email, password, and site code authentication
  - JWT access token (8-hour expiration)
  - Refresh token (30-day expiration)
  - Token refresh endpoint with auto-rotation
  - Secure password hashing with BCrypt (cost factor 10)

- **Logto OAuth/OIDC Integration** (New)
  - OAuth 2.0 authorization code flow
  - OpenID Connect (OIDC) support
  - Logto endpoint configuration: `http://localhost:3001`
  - Callback URL: `http://localhost:5600/auth/callback`
  - User sync to local database
  - Multi-site user mapping support

- **Role-Based Access Control**
  - Admin - Full system access, user management
  - Manager - Project management, team management
  - Member - Task assignment, comments, collaboration

- **Multi-Tenant Isolation**
  - SiteID-based isolation in all entities
  - JWT token includes SiteID claim
  - Database-level query filtering
  - Impossible to access other tenant data

**Acceptance Criteria:**
- Login with email/password works correctly
- Login with Logto works and syncs user
- Tokens refresh automatically on expiration
- Role-based endpoint protection functions
- SiteID filtering prevents data leakage
- Password hashing verified secure

---

#### 2.2 Project Management

**Requirement:** Create, manage, and organize projects with categorization and CRM linking

**Specifications:**
- Project CRUD operations
- Project fields:
  - Name, description, category
  - Status: Active, Planning, On Hold, Completed, Archived
  - Priority: Low, Medium, High, Critical
  - Start/end dates, actual end date
  - Budget tracking
  - Team assignment
  - CRM links: Customer, Contact, Deal

- Project categorization system
- Filter by category, status, priority
- Soft delete (IsDeleted flag)
- Audit timestamps (CreatedBy, CreatedAt, UpdatedAt)

**API Endpoints:**
```
GET    /api/projects
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
GET    /api/projects/category/{categoryId}
GET    /api/projects/status/{status}
```

**Acceptance Criteria:**
- Create project with all fields
- Update project properties
- Delete project (soft delete)
- Filter by category and status
- CRM entity links functional
- Budget tracking accurate

---

#### 2.3 Task Management

**Requirement:** Hierarchical task management with phases, spaces, and budget tracking

**Specifications:**
- Task hierarchy (Task -> Subtasks)
- Task fields:
  - Title, description, notes
  - Status: To Do, In Progress, Review, Done, Cancelled
  - Priority: Low, Medium, High, Critical
  - Progress: 0-100%
  - Budget & Spent hours tracking
  - Due date
  - Assigned user
  - Parent task (for subtasks)
  - Phase & Space assignment

- Phase management (workflow stages)
- Space management (task sections)
- Drag-and-drop reordering
- Comment discussions with nested replies
- Activity timeline

**API Endpoints:**
```
GET    /api/tasks
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
GET    /api/tasks/parent/{parentTaskId}
GET    /api/tasks/project/{projectId}
GET    /api/phases
POST   /api/phases
GET    /api/spaces
POST   /api/spaces
```

**Acceptance Criteria:**
- Create task with all fields
- Create subtasks linked to parent
- Update task status, priority, progress
- Track budget vs spent hours
- Manage phases and spaces
- Nested comments work correctly
- Activity timeline accurate

---

#### 2.4 Workspace Views

**Requirement:** Multiple visualization options for task management

**Specifications:**

**List View (Table)**
- Task table with all fields
- Inline editing
- Column customization (future)
- Sorting & filtering
- Bulk operations (future)

**Kanban Board**
- Columns by status
- Drag-and-drop between columns
- Task cards with key info
- Column statistics

**Gantt Chart**
- Timeline visualization
- Task duration bars
- Dependency lines (future)
- Milestone markers
- Zoom controls

**Mind Map**
- Hierarchical tree structure
- Parent-child relationships
- Expandable nodes
- Visual organization

**Acceptance Criteria:**
- All views display tasks correctly
- Drag-drop works in Kanban
- Gantt timeline accurate to dates
- Mind map hierarchy correct
- View switching smooth

---

#### 2.5 CRM Integration (New - Phase 1)

**Requirement:** Customer Relationship Management with Customers, Contacts, Deals, and Quotes

**Specifications:**

**Customers**
- Fields: CustomerCode, CustomerName, CustomerType (Company/Individual)
- Extended: Industry, Website, TaxCode
- Contact: Phone, Email, Address, City, Country
- Business: AnnualRevenue, EmployeeCount
- Status: Active, Inactive, Lead
- Source tracking, notes
- Soft delete support

**Contacts**
- Link to Customer
- Fields: FirstName, LastName, Email, Phone, Title, Department
- Address information
- Status tracking

**Deals**
- Link to Customer & Contact
- Fields: DealName, DealValue, Status
- Status: Lead, Negotiation, Won, Lost
- Expected & actual close dates
- Probability percentage
- Notes & follow-up

**Quotes**
- Link to Deal
- Fields: QuoteNumber, QuoteDate, ExpirationDate
- Quote items with pricing
- Tax calculation
- Subtotal & total
- Status: Draft, Sent, Accepted, Rejected

**API Endpoints:**
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/{id}
PUT    /api/customers/{id}
DELETE /api/customers/{id}

GET    /api/contacts
POST   /api/contacts
GET    /api/deals
POST   /api/deals
GET    /api/quotes
POST   /api/quotes
```

**Project Integration:**
- Projects can link to Customers, Contacts, Deals
- CRM entities visible in project detail view
- Seamless workflow between projects and sales pipeline

**Acceptance Criteria:**
- CRUD operations work for all CRM entities
- Customer-Contact relationship maintained
- Deal-Customer-Contact linked correctly
- Quote items calculate correctly
- Project-CRM links functional
- SiteID isolation enforced

---

#### 2.6 Collaboration Features

**Requirement:** Team communication and transparency

**Specifications:**

**Comments**
- Nested reply support (thread)
- User mentions with @
- Edit & delete capabilities
- Timestamps and user info
- Activity integration

**Activity Timeline**
- Task creation, updates, deletions
- Status changes
- Assignment changes
- Comment additions
- Phase transitions

**Team Management**
- User roles: Admin, Manager, Member
- Project team assignment
- Task assignment to users
- User profiles & avatars

**Acceptance Criteria:**
- Comments save and display correctly
- Nested replies work as threads
- Activity timeline accurate
- User assignments prevent errors

---

#### 2.7 Calendar & Events

**Requirement:** Event management with project/task linking

**Specifications:**
- Event CRUD operations
- Event types: Meeting, Deadline, Milestone, Review
- Date range support
- Location & description fields
- Link to projects & tasks
- Calendar views: Monthly, Weekly, Day
- Recurring events (future)

**API Endpoints:**
```
GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
```

**Acceptance Criteria:**
- Events create/update/delete
- Calendar displays events correctly
- Event-project linking works

---

### Phase 2: Enhanced Features (Future)

- **Pagination** - Load large datasets efficiently
- **Advanced Reporting** - Custom reports, KPIs, analytics
- **File Attachments** - Documents, images to tasks
- **Real-time Collaboration** - WebSocket-based updates
- **Mobile App** - Native iOS/Android application
- **Integrations** - Slack, GitHub, Jira integration
- **Recurring Events** - Calendar event recurrence
- **Time Tracking** - Detailed time logging
- **Budget Management** - Advanced project budgeting

---

## 3. Non-Functional Requirements

### Performance

**Requirement:** System responds quickly and handles concurrent users

**Specifications:**
- API response time: <500ms for typical operations
- Database query optimization with indexes
- Frontend bundle size: <500KB gzipped
- Lazy loading for heavy components
- Caching strategy (future)
- Support 100+ concurrent users (single deployment)

**Acceptance Criteria:**
- Swagger UI loads in <2 seconds
- Project list loads in <1 second
- Task operations complete in <500ms
- No visual lag in UI interactions

---

### Scalability

**Requirement:** System scales with growing data and users

**Specifications:**
- Docker-based deployment
- Horizontal scaling via load balancing (future)
- Database connection pooling
- Rate limiting: 100 req/min globally, 10 req/min for auth
- Pagination support (future)
- Caching layer (future)

**Acceptance Criteria:**
- Docker containers deploy reliably
- Rate limiting prevents abuse
- Database handles >100K records

---

### Security

**Requirement:** Protect data and prevent unauthorized access

**Specifications:**

**Authentication**
- JWT with HS256 algorithm
- 32+ character secret key
- 8-hour access token, 30-day refresh token
- BCrypt password hashing (cost 10)

**Authorization**
- Role-based access control (Admin, Manager, Member)
- SiteID-based tenant isolation
- Endpoint protection with [Authorize] attribute

**Data Protection**
- HTTPS only (enforced in production)
- SQL parameter binding (prevent injection)
- Input validation on all endpoints
- CORS configuration for trusted origins

**Audit & Compliance**
- Audit timestamps on all entities
- Soft deletes maintain data history
- Error logging without sensitive data
- No credentials in logs

**Acceptance Criteria:**
- Password hashing verified with BCrypt
- SiteID filtering prevents data leakage
- SQL injection attempts fail
- HTTPS enforced in production
- Invalid credentials return 401

---

### Reliability

**Requirement:** System operates consistently and recovers from failures

**Specifications:**
- Global error handling middleware
- Health check endpoint (/health)
- Database connection retry logic
- Graceful error messages (no stack traces to users)
- Rollback capability for migrations (future)

**Acceptance Criteria:**
- Unhandled exceptions return 500 with friendly message
- Health check endpoint responds correctly
- Database reconnection works
- No data loss on errors

---

### Maintainability

**Requirement:** Code is clean, documented, and easy to extend

**Specifications:**
- Repository pattern for data access
- DTO pattern for API contracts
- Dependency injection for testability
- TypeScript for frontend type safety
- Comprehensive documentation
- Consistent code style
- Components <200 lines

**Acceptance Criteria:**
- Code passes linting
- TypeScript strict mode enabled
- Documentation covers main features
- README provides setup instructions

---

### Usability

**Requirement:** System is intuitive and accessible

**Specifications:**
- Modern UI with shadcn/ui components
- Responsive design (desktop, tablet)
- Dark theme support (implemented)
- Keyboard shortcuts (future)
- Accessibility compliance (WCAG 2.1 AA target)
- Toast notifications for feedback
- Clear error messages

**Acceptance Criteria:**
- UI loads without errors
- All interactions have visual feedback
- Error messages are helpful
- Responsive on mobile screens
- Accessible to keyboard-only users

---

## 4. Technical Specifications

### Architecture

**Multi-Tier Architecture:**
1. **Presentation Layer** - React 18 SPA
2. **API Layer** - .NET 8.0 Web API (REST)
3. **Business Logic Layer** - Service classes
4. **Data Access Layer** - Repository pattern with Dapper
5. **Data Layer** - SQL Server 2022

**Multi-Tenant Model:**
- Shared database with SiteID isolation
- One database per deployment (not per tenant)
- Application-level enforcement of tenant boundaries

---

### Technology Choices

**Frontend**
- React 18.3.1 - Mature, component-based UI framework
- TypeScript - Type safety prevents bugs
- Vite - Fast build tool with excellent DX
- Tailwind CSS - Utility-first styling, small bundle
- shadcn/ui - Accessible components, customizable

**Backend**
- .NET 8.0 - Modern, performant, type-safe
- C# 12 - Clean, expressive language
- Dapper - Lightweight ORM, excellent performance
- SQL Server 2022 - Enterprise-grade RDBMS

**Infrastructure**
- Docker - Consistent deployment environment
- Docker Compose - Local development orchestration
- PowerShell/Bash - Automation scripts

---

### Database Schema

**Core Tables:**
- `Sites` - Tenant organizations
- `Users` - User accounts with roles
- `Projects` - Project management
- `Tasks` - Task hierarchy with budget
- `Phases` - Workflow phases
- `Spaces` - Task sections/groups
- `Categories` - Project categories
- `Comments` - Task discussions
- `CalendarEvents` - Event management

**CRM Tables:**
- `Customers` - Customer management
- `Contacts` - Contact information
- `Deals` - Sales pipeline
- `Quotes` - Quote generation
- `QuoteItems` - Quote line items

**Key Design Principles:**
- SiteID in every table for isolation
- GUIDs for distributed system compatibility
- Soft deletes (IsDeleted flag)
- Audit timestamps (CreatedAt, UpdatedAt)
- Foreign key constraints for referential integrity
- Indexes on frequently queried columns

---

## 5. Deliverables

### Phase 1 (COMPLETE)

**Backend:**
- ✅ 14 API controllers with CRUD operations
- ✅ 13 domain entities with proper relationships
- ✅ 50+ DTOs for request/response
- ✅ 11 repositories with Dapper queries
- ✅ Authentication service (JWT + Logto)
- ✅ Error handling middleware
- ✅ Swagger/OpenAPI documentation
- ✅ Database schema with migrations
- ✅ Stored procedures for complex queries

**Frontend:**
- ✅ React components for all features
- ✅ TaskDetailDialog redesigned with dark theme
- ✅ Workspace module with custom hooks
- ✅ Multiple task views (List, Kanban, Gantt, Mind Map)
- ✅ CRM dialogs (Customer, Contact, Deal creation)
- ✅ API client with auto-refresh
- ✅ Form validation with React Hook Form
- ✅ Toast notifications with Sonner
- ✅ Responsive design

**Infrastructure:**
- ✅ Docker Compose setup
- ✅ Backend Dockerfile
- ✅ Frontend Dockerfile
- ✅ Database initialization scripts
- ✅ npm scripts for development

**Documentation:**
- ✅ README.md with setup instructions
- ✅ Codebase summary
- ✅ Code standards guide
- ✅ System architecture doc
- ✅ API documentation (Swagger)

---

## 6. Success Criteria

### Phase 1 Acceptance Criteria

**Functional:**
- All CRUD operations work correctly
- Multi-tenant isolation enforced
- Authentication (JWT & Logto) functions properly
- Task hierarchy and relationships maintained
- CRM entities manage correctly
- All views display data accurately

**Non-Functional:**
- API response time <500ms
- Database queries optimized with indexes
- Frontend bundle <500KB gzipped
- Docker deployment reliable
- Rate limiting prevents abuse
- Error messages helpful and secure

**Quality:**
- Code passes linting
- TypeScript strict mode enabled
- Documentation comprehensive
- No console errors in browser
- All critical paths tested manually

---

## 7. Risks & Mitigation

### Technical Risks

**Risk:** Database performance with large datasets
- **Mitigation:** Implement indexes, optimize queries, plan pagination

**Risk:** Frontend bundle size growing too large
- **Mitigation:** Code splitting, lazy loading, tree-shaking

**Risk:** Token expiration causing user frustration
- **Mitigation:** Automatic refresh, clear error messages

**Risk:** CORS issues with Logto integration
- **Mitigation:** Proper origin configuration, comprehensive testing

### Schedule Risks

**Risk:** Scope creep adding new features
- **Mitigation:** YAGNI principle, clear phase boundaries

**Risk:** Dependency upgrades breaking compatibility
- **Mitigation:** Selective updates, comprehensive testing

---

## 8. Assumptions & Constraints

### Assumptions

1. .NET 8.0 LTS will be maintained by Microsoft
2. React 18 is stable production-ready
3. SQL Server licensing available or Docker installation acceptable
4. Developer team comfortable with TypeScript/C#
5. Clients have modern browsers (ES2020+)

### Constraints

1. **Fixed Ports:** 5600 (frontend), 5001 (backend), 3001 (Logto)
2. **Database:** SQL Server (no switching to other databases)
3. **Authentication:** JWT and Logto integration required
4. **Multi-Tenancy:** Cannot be single-tenant only
5. **Time Zone:** UTC for all timestamps

---

## 9. Definitions & Glossary

- **SiteID** - Unique identifier for a tenant/organization
- **Soft Delete** - Marking records as deleted without removing data
- **DTO** - Data Transfer Object, API request/response model
- **ORM** - Object-Relational Mapping
- **Dapper** - Lightweight micro-ORM for .NET
- **JWT** - JSON Web Token for stateless authentication
- **OIDC** - OpenID Connect, identity layer on OAuth 2.0
- **Multi-Tenancy** - Single system serving multiple independent organizations
- **Workspace** - Project-specific task management interface
- **Phase** - Workflow stage for organizing tasks
- **Space** - Section or group within a project

---

## 10. Sign-Off & History

**Document Version:** 1.0
**Last Updated:** 2025-12-03
**Status:** APPROVED FOR PHASE 1

**Revision History:**
- v1.0 (2025-12-03) - Phase 1 complete, CRM integration added
- v0.2 (2025-11-29) - TaskDetailDialog redesign with dark theme
- v0.1 (2025-10-30) - Initial project scope

---

**Next Phase PDR Update:** After Phase 2 Planning (Future)
