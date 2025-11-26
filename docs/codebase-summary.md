# Codebase Summary

**Project:** Modern Task Management System v2.7
**Generated:** 2025-10-30
**Repository:** Multi-tenant task management application with React frontend and .NET backend

---

## Executive Summary

Modern Task Management System v2.7 is a full-stack, multi-tenant task management platform featuring:
- **Frontend**: React 18.3.1 + TypeScript + Vite, with shadcn/ui component library
- **Backend**: .NET 8.0 Web API with JWT authentication
- **Database**: Microsoft SQL Server 2022 with Dapper ORM
- **Infrastructure**: Docker Compose for local development and deployment
- **AI Integration**: Comprehensive Claude AI agent configuration for assisted development

**Key Metrics:**
- Total files: 622 tracked files
- Total tokens: ~1.54 million
- Total characters: ~5.81 million
- Largest file: ProjectWorkspace.tsx (233KB, 48k tokens)

---

## 1. Project Structure

```
Modern Task Management System_v2.7/
├── src/                          # React/TypeScript frontend
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui component library (30+)
│   │   ├── workspace/            # Project workspace feature module
│   │   └── *.tsx                 # Feature components
│   ├── services/                 # API client and adapters
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── data/                     # Mock data
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Application entry point
│
├── Backend/                      # .NET 8.0 Web API
│   ├── TaskFlow.API/             # Main API project
│   │   ├── Controllers/          # API endpoints (10 controllers)
│   │   ├── Models/               # Entities and DTOs
│   │   │   ├── Entities/         # Domain models (9 entities)
│   │   │   └── DTOs/             # Data transfer objects (40+)
│   │   ├── Repositories/         # Data access layer (8 repositories)
│   │   ├── Services/             # Business logic (2 services)
│   │   ├── Middleware/           # Error handling middleware
│   │   └── Program.cs            # Application startup
│   └── Database/                 # SQL Server scripts
│       └── *.sql                 # Schema and seed data scripts
│
├── .claude/                      # AI agent configuration
│   ├── agents/                   # Agent role definitions (15 agents)
│   ├── commands/                 # Slash commands (30+)
│   ├── skills/                   # Skill libraries (20+)
│   └── workflows/                # Development workflows
│
├── docs/                         # Project documentation
├── tests/                        # E2E tests
├── scripts/                      # PowerShell automation scripts
├── plans/                        # Implementation plans and reports
├── docker-compose.yml            # Container orchestration
├── package.json                  # Frontend dependencies
└── vite.config.ts                # Vite build configuration
```

---

## 2. Technology Stack

### Frontend Stack

**Core Framework:**
- React 18.3.1 - UI library with hooks and automatic JSX runtime
- TypeScript 5.x - Type safety and developer experience
- Vite 6.3.5 - Fast build tool with HMR using SWC compiler

**UI & Styling:**
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - Accessible component library
- Radix UI - 30+ primitive components (accordion, dialog, dropdown, select, etc.)
- Lucide React 0.487.0 - Icon library with 1000+ icons
- Class Variance Authority 0.7.1 - Component variant management
- Tailwind Merge - Utility class merging

**State Management:**
- React Hooks - Local state (useState, useEffect, useReducer)
- Custom hooks - Feature-specific state logic in workspace module
- LocalStorage - Token and user session persistence

**Forms & Validation:**
- React Hook Form 7.55.0 - Performant form management
- Input OTP 1.4.2 - One-time password input components

**Date & Time:**
- date-fns - Modern date utility library
- React Day Picker 8.10.1 - Accessible calendar component

**Data Visualization:**
- Recharts 2.15.2 - Composable chart library
- Custom Gantt chart implementation
- Custom Mind map visualization

**Drag & Drop:**
- react-dnd - Flexible drag and drop framework
- react-dnd-html5-backend - HTML5 drag and drop backend
- react-draggable - Simple draggable components
- re-resizable - Resizable panels and components
- React Resizable Panels 2.1.7 - Declarative resizable panel groups

**UI Enhancements:**
- Sonner 2.0.3 - Beautiful toast notifications
- Embla Carousel 8.6.0 - Extensible carousel/slider
- Vaul 1.1.2 - Drawer/modal component
- CMDK 1.1.1 - Command palette/menu

**Development Tools:**
- @vitejs/plugin-react-swc - Fast refresh with SWC compiler
- @types/node 20.10.0 - Node.js type definitions
- TSX 4.7.0 - Execute TypeScript files directly

### Backend Stack

**Framework:**
- .NET 8.0 LTS - Latest long-term support version
- ASP.NET Core Web API - RESTful API framework
- C# 12 - Modern language features

**Authentication & Security:**
- Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0 - JWT authentication middleware
- System.IdentityModel.Tokens.Jwt 7.0.3 - JWT token handling
- BCrypt.Net-Next 4.0.3 - Secure password hashing (cost factor 10)

**Database & ORM:**
- Microsoft.Data.SqlClient 5.1.5 - SQL Server data provider
- Dapper 2.1.35 - Lightweight micro-ORM for performance
- SQL Server 2022 - Enterprise-grade RDBMS

**API Documentation:**
- Swashbuckle.AspNetCore 6.5.0 - Swagger/OpenAPI generator
- Microsoft.AspNetCore.OpenApi 8.0.0 - OpenAPI specification support

**Development Features:**
- Hot reload support for rapid development
- XML documentation generation
- Nullable reference types enabled
- Response compression middleware

### Infrastructure & DevOps

**Containerization:**
- Docker - Application containerization platform
- Docker Compose - Multi-container orchestration
- Services: SQL Server, Backend API, Frontend, DB-Init

**Development Tools:**
- PowerShell scripts - Database initialization and testing automation
- Bash scripts - Cross-platform build and deployment
- npm scripts - Frontend development workflow
- E2E testing with TypeScript

**Environment Configuration:**
- Environment variables for sensitive configuration
- Docker health checks for service dependencies
- CORS configuration for cross-origin requests
- Multi-environment support (Development, Production)

---

## 3. Core Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Multi-tenant isolation via SiteID
- Role-based access control (Admin, Manager, Member)
- Secure password hashing with BCrypt
- Token expiration and automatic refresh
- Site code-based tenant identification

### Project Management
- Create, read, update, delete projects
- Project categorization system
- Project status tracking (Active, Planning, On Hold, Completed, Archived)
- Priority levels (Low, Medium, High, Critical)
- Budget tracking
- Date range management (start/end dates)
- Project ownership and team assignment

### Task Management
- Hierarchical task structure with subtasks
- Task phases for workflow organization
- Task status workflow (To Do, In Progress, Review, Done, Cancelled)
- Priority levels
- Progress tracking (0-100%)
- Time estimation and actual hours tracking
- Due date management
- Task assignment to team members
- Tag system for categorization
- Drag-and-drop task reordering

### Workspace Views
- **List View**: Table-based task management with inline editing
- **Kanban Board**: Visual task board with drag-and-drop between columns
- **Gantt Chart**: Timeline visualization for project scheduling
- **Mind Map View**: Hierarchical task relationship visualization

### Calendar & Events
- Calendar event management
- Event types (Meeting, Deadline, Milestone, Review)
- Event-project-task linking
- Date range support
- Location tracking

### Collaboration
- Team member management
- Task comments and discussions
- Nested comment replies
- User avatars and profiles
- Activity tracking

### Reporting & Analytics
- Project statistics and KPIs
- Task completion rates
- Team workload analysis
- Custom report generation

---

## 4. Architecture Patterns

### Multi-Tenant Architecture

**Pattern**: Shared database with tenant isolation via SiteID foreign key

**Implementation**:
- Every entity contains `SiteID` column
- All queries automatically filtered by current user's `SiteID`
- Database constraints enforce tenant boundaries
- JWT token includes `SiteID` claim for authentication context

**Base Controller**:
```csharp
public class ApiControllerBase : ControllerBase
{
    protected Guid GetCurrentSiteID()
        => Guid.Parse(User.FindFirst("SiteID")?.Value);

    protected Guid GetCurrentUserID()
        => Guid.Parse(User.FindFirst("UserID")?.Value);
}
```

### Repository Pattern

**Purpose**: Abstract data access from business logic

**Structure**:
```
IRepository<T>                    (Generic interface)
    ↓
IProjectRepository : IRepository<Project>  (Specific interface)
    ↓
ProjectRepository : IProjectRepository     (Dapper implementation)
```

**Benefits**:
- Testability through dependency injection
- Centralized data access logic
- Easy to swap ORM or database
- Consistent query patterns

### DTO Pattern

**Purpose**: Separate API contracts from internal domain models

**Structure**:
- **Entities**: Internal domain models (`Models/Entities/`)
- **DTOs**: API request/response objects (`Models/DTOs/`)
- **Organized by feature**: Auth/, Project/, Task/, etc.

**Benefits**:
- API versioning flexibility
- Prevent over-posting attacks
- Control data exposure
- Optimize network payloads

### Error Handling

**Backend**:
- Global exception middleware (`ErrorHandlerMiddleware`)
- Standardized `ApiResponse<T>` wrapper
- HTTP status codes (200, 400, 401, 404, 500)
- Detailed error messages in development
- Generic messages in production

**Frontend**:
- Try-catch blocks in API calls
- Toast notifications for user feedback
- Loading states during async operations
- Error boundaries for component errors (recommended, not fully implemented)

---

## 5. API Architecture

### Base URL
- Development: `http://localhost:5001/api`
- Docker: `http://backend:80/api`

### Authentication Endpoints (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login with JWT
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout

### Resource Endpoints

**Projects** (`/api/projects`):
- `GET /api/projects` - List projects (filtered by SiteID)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Soft delete project

**Tasks** (`/api/tasks`):
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/project/{projectId}` - Tasks by project
- `GET /api/tasks/{id}` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**Spaces** (`/api/spaces`): CRUD operations for workspace spaces

**Phases** (`/api/phases`):
- CRUD operations
- `POST /api/phases/reorder` - Reorder phases

**Categories** (`/api/categories`): CRUD for project categories

**Comments** (`/api/comments`):
- `GET /api/comments/task/{taskId}` - Get task comments
- `POST /api/comments` - Add comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

**Events** (`/api/events`):
- CRUD operations
- `GET /api/events/date-range` - Events in date range

**Users** (`/api/users`):
- `GET /api/users` - List users in site
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

### API Response Format

```json
{
  "success": true,
  "data": { /* resource data */ },
  "error": null,
  "message": "Operation completed successfully"
}
```

---

## 6. Database Schema

### Core Entities

**Sites** (Multi-tenant root):
- SiteID (PK, UNIQUEIDENTIFIER)
- SiteName, SiteCode (unique)
- Domain, IsActive
- MaxUsers, MaxProjects (tenant limits)
- CreatedAt, UpdatedAt

**Users**:
- UserID (PK, UNIQUEIDENTIFIER)
- SiteID (FK to Sites)
- Email (unique per site), PasswordHash
- Name, Avatar, Role, Status
- RefreshToken, RefreshTokenExpiry
- CreatedAt, LastActive, UpdatedAt, IsDeleted
- Constraint: `UQ_User_Email_Site UNIQUE (SiteID, Email)`

**ProjectCategories**:
- CategoryID (PK), SiteID (FK)
- Name, Description, Color, Icon
- CreatedBy (FK to Users)

**Projects**:
- ProjectID (PK), SiteID (FK), CategoryID (FK)
- Name, Description
- Status, Priority
- StartDate, EndDate, Budget
- Color, Icon
- CreatedBy (FK), CreatedAt, UpdatedAt, IsDeleted

**Phases** (Project stages):
- PhaseID (PK), SiteID (FK), ProjectID (FK)
- Name, Description, Color
- Order (INT) - Display sequence
- StartDate, EndDate

**Tasks**:
- TaskID (PK), SiteID (FK), ProjectID (FK), PhaseID (FK nullable)
- ParentTaskID (FK self-referencing)
- Order (INT) - Display sequence within phase
- Title, Description
- Status, Priority, Progress (0-100)
- AssigneeID (FK to Users)
- StartDate, DueDate, CompletedDate
- EstimatedHours, ActualHours (DECIMAL)
- Tags (NVARCHAR)

**Spaces** (Workspaces):
- SpaceID (PK), SiteID (FK), ProjectID (FK)
- Name, Description, Icon
- IsPrivate (BIT)
- CreatedBy (FK)

**Comments**:
- CommentID (PK), SiteID (FK), TaskID (FK), UserID (FK)
- Content (NVARCHAR(MAX))
- ParentCommentID (FK self-referencing)

**CalendarEvents**:
- EventID (PK), SiteID (FK)
- Title, Description
- StartDate, EndDate (DATETIME2)
- EventType, Location
- ProjectID (FK nullable), TaskID (FK nullable)
- CreatedBy (FK)

### Data Conventions
- **Primary Keys**: UNIQUEIDENTIFIER (GUID) for distributed systems
- **Foreign Keys**: UNIQUEIDENTIFIER with CASCADE or RESTRICT
- **Dates**: DATETIME2 (high precision, UTC recommended)
- **Text**: NVARCHAR for Unicode support
- **Money**: DECIMAL(18,2)
- **Booleans**: BIT (0/1)
- **Soft Deletes**: IsDeleted BIT DEFAULT 0
- **Audit**: CreatedAt, UpdatedAt, CreatedBy

---

## 7. Frontend Architecture

### Component Organization

**Feature-based structure**:
- Related components grouped in feature folders
- UI components separated in `components/ui/`
- Co-located types, hooks, and utilities
- Barrel exports for clean imports

**Naming Conventions**:
- Components: PascalCase (ProjectWorkspace.tsx)
- Hooks: camelCase with "use" prefix (useTaskManagement.ts)
- Utils: camelCase (calculations.ts)
- Types: PascalCase interfaces (User, Project)

### Key Components

**Application Shell**:
- `App.tsx` - Root component with routing and authentication
- `Header.tsx` - Top navigation with user menu
- `Sidebar.tsx` - Left navigation menu

**Feature Components**:
- `Dashboard.tsx` - Project overview dashboard
- `Projects.tsx` - Project list and grid view
- `ProjectWorkspace.tsx` - Main workspace (233KB, needs refactoring)
- `MyTasks.tsx` - User's personal task list
- `Calendar.tsx` - Calendar event view
- `Team.tsx` - Team member management
- `Reports.tsx` - Analytics and reporting

**Workspace Module** (`components/workspace/`):
- `index.tsx` - Main workspace component
- `WorkspaceListView.tsx` - List view implementation
- `WorkspaceSidebar.tsx` - Workspace navigation
- `WorkspaceToolbar.tsx` - Action toolbar
- **Hooks**:
  - `useWorkspaceState.ts` - Global state management
  - `useTaskManagement.ts` - Task CRUD operations
  - `useSpaceManagement.ts` - Space operations
  - `usePhaseManagement.ts` - Phase operations
  - `useWorkspaceData.ts` - Data fetching logic
- **Utils**:
  - `calculations.ts` - Progress and statistics
  - `helpers.ts` - Utility functions

### State Management Approach

**Local State**:
- useState for component-specific state
- useEffect for side effects and data fetching
- useReducer for complex state logic

**Custom Hooks**:
- Encapsulate feature-specific logic
- Reusable across components
- Separation of concerns

**Persistence**:
- LocalStorage for tokens and user data
- No global state library (Redux, Zustand) currently used
- Context API used minimally (I18nProvider)

### API Client Architecture

**Structure**:
```
TokenManager - Token and user storage management
    ↓
ApiClient - HTTP client with automatic token refresh
    ↓
Feature APIs - Type-safe API methods
    - authApi
    - projectsApi
    - tasksApi
    - eventsApi
    - etc.
```

**Features**:
- Automatic token refresh on 401
- Request timeout handling (30s default)
- Retry logic with exponential backoff
- Centralized error handling
- TypeScript generics for type safety
- AbortController for cancellation

---

## 8. Development Workflow

### Local Development

**Prerequisites**:
- Node.js 20+ and npm/yarn
- .NET 8.0 SDK
- SQL Server 2022 or Docker
- Git

**Frontend Setup**:
```bash
npm install
npm run dev  # Starts on http://localhost:3000
```

**Backend Setup**:
```bash
cd Backend/TaskFlow.API
dotnet restore
dotnet run  # Starts on http://localhost:5001
```

**Docker Setup**:
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
# Swagger: http://localhost:5001/swagger
# SQL Server: localhost:1433
```

### Available Scripts

**Frontend** (package.json):
- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm test` - Run E2E tests
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run docker:reset` - Reset and restart services
- `npm run docker:logs` - View all logs
- `npm run docker:logs:backend` - Backend logs only

**Backend**:
- `dotnet run` - Start API server
- `dotnet build` - Compile project
- `dotnet test` - Run tests (if configured)
- `dotnet publish` - Create deployment package

### Testing Strategy

**E2E Tests**:
- Located in `tests/e2e-test.ts`
- Tests authentication, CRUD operations
- Run with `npm test`

**Manual Testing**:
- Swagger UI at `/swagger`
- Test HTML pages in project root
- PowerShell scripts for specific scenarios

---

## 9. AI Agent Integration

The project includes comprehensive Claude AI configuration in `.claude/`:

**Agent Roles** (15 agents):
- Planner, Developer, Debugger, Tester
- Documenter (Docs Manager)
- UI/UX Designer
- Database Admin
- Git Manager
- Researcher
- Code Reviewer
- Project Manager
- Copywriter
- Journal Writer
- Scout
- Brainstormer

**Slash Commands** (30+):
- `/ask` - Answer technical questions
- `/brainstorm` - Feature brainstorming
- `/bootstrap` - New project setup
- `/cook` - Implement features step by step
- `/debug` - Debug issues
- `/fix/*` - Fix specific issues (CI, types, tests, UI, logs)
- `/plan` - Create implementation plans
- `/test` - Run tests
- `/docs/*` - Documentation management
- `/git/*` - Git operations
- `/design/*` - Design implementations
- `/content/*` - Content writing

**Skills** (20+):
- Better Auth, Next.js, Tailwind CSS, shadcn/ui
- Document processing (PDF, DOCX, XLSX, PPTX)
- FFmpeg, ImageMagick
- MCP Builder, Repomix
- Problem-solving frameworks
- Shopify, Turborepo

**Workflows**:
- Primary workflow (`primary-workflow.md`)
- Development rules (`development-rules.md`)
- Orchestration protocol (`orchestration-protocol.md`)
- Documentation management (`documentation-management.md`)

---

## 10. Known Issues & Technical Debt

### High Priority

1. **ProjectWorkspace.tsx Complexity**:
   - Single 233KB file with 48k+ tokens
   - Difficult to maintain and test
   - Refactoring guide exists: `src/components/workspace/REFACTOR_GUIDE.md`
   - Migration guide available: `src/components/workspace/MIGRATION_GUIDE.md`

2. **Missing Test Coverage**:
   - No unit tests
   - No integration tests
   - Only manual E2E tests
   - Recommend: Jest + React Testing Library

3. **Security Gaps**:
   - No rate limiting on API endpoints
   - No account lockout after failed logins
   - Refresh tokens stored in localStorage (XSS vulnerable)
   - Recommend: HttpOnly cookies for tokens

4. **Input Validation**:
   - No validation attributes on DTOs
   - Manual validation in controllers
   - Recommend: FluentValidation library

### Medium Priority

5. **No Caching Layer**:
   - Every request hits database
   - Recommend: Redis or In-Memory cache

6. **Type Safety Issues**:
   - Some `any` types in legacy code
   - Missing type definitions for some API responses

7. **State Management**:
   - No global state library
   - Props drilling in deep trees
   - Context API underutilized

8. **Database Migrations**:
   - SQL scripts only, no EF migrations
   - Manual schema changes required

### Low Priority

9. **GUID Performance**:
   - GUID primary keys can fragment indexes
   - Consider NEWSEQUENTIALID() for better performance

10. **Missing Indexes**:
    - No explicit indexes beyond PK/FK
    - Query performance may degrade at scale

11. **Documentation Gaps**:
    - No architecture diagrams
    - Incomplete API documentation beyond Swagger
    - No performance benchmarks

---

## 11. File Size Statistics

**Top 5 Files by Size**:
1. ProjectWorkspace.tsx - 233KB (48,373 tokens)
2. Various XSD schemas - Multiple large schema files
3. Database seed scripts - Multiple large SQL files

**Component Count**:
- React components: 95+ files
- shadcn/ui components: 30+ reusable UI components
- Backend controllers: 10
- Backend repositories: 8
- Database tables: 9

**Code Distribution**:
- Frontend TypeScript/TSX: ~60% of code
- Backend C#: ~25% of code
- Configuration/Documentation: ~10% of code
- Scripts/Tests: ~5% of code

---

## 12. Deployment Considerations

### Docker Deployment
- Multi-container setup via docker-compose.yml
- Services: SQL Server, Backend API, Frontend, DB-Init
- Health checks ensure proper startup sequence
- Volume mounts for database persistence

### Environment Variables
**Backend**:
- `ConnectionStrings__DefaultConnection` - Database connection
- `Jwt__SecretKey` - JWT signing key (32+ characters)
- `Jwt__Issuer`, `Jwt__Audience` - Token validation
- `Cors__AllowedOrigins` - CORS configuration

**Frontend**:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_API_TIMEOUT` - Request timeout

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong JWT secret (32+ chars)
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set secure password hash cost
- [ ] Implement rate limiting
- [ ] Enable account lockout
- [ ] Use HttpOnly cookies for tokens
- [ ] Configure Content Security Policy
- [ ] Enable SQL Server encryption
- [ ] Regular security audits

---

## 13. Future Enhancements

### Immediate Priorities
1. Refactor ProjectWorkspace.tsx into smaller modules
2. Add comprehensive test coverage
3. Implement caching layer (Redis)
4. Add input validation (FluentValidation)
5. Security hardening (rate limiting, account lockout)

### Medium-term Goals
1. Real-time collaboration (SignalR)
2. File attachments for tasks
3. Email notifications
4. Advanced reporting and analytics
5. Mobile-responsive improvements
6. Offline support with service workers

### Long-term Vision
1. Mobile apps (React Native)
2. Third-party integrations (Slack, GitHub, Jira)
3. AI-powered task suggestions
4. Advanced project templates
5. Time tracking and invoicing
6. Webhooks for external systems
7. Custom workflow automation

---

## Summary

The Modern Task Management System v2.7 is a well-architected, feature-rich application with:

**Strengths**:
- Clean architecture with separation of concerns
- Multi-tenant support with proper isolation
- Comprehensive API with Swagger documentation
- Modern React patterns and component library
- Docker-based development and deployment
- Extensive AI agent integration for development assistance

**Areas for Improvement**:
- Code complexity in ProjectWorkspace component
- Test coverage
- Security hardening
- Performance optimization
- State management strategy

The codebase is production-ready for small to medium deployments with a clear path for scaling and improvement documented in planning files and refactoring guides.

**Last Updated**: 2025-10-30
**Version**: 2.7
**Generated by**: Repomix + Manual Analysis
