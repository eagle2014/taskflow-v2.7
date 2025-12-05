# System Architecture

**Project:** Modern Task Management System v2.7
**Version:** 1.0
**Updated:** 2025-12-03

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                      │
│            React 18 SPA + TypeScript + Tailwind CSS             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
     ┌──────────▼─────────┐     ┌────────────▼────────┐
     │  Logto OAuth       │     │   API Client        │
     │  localhost:3001    │     │   localhost:5001    │
     └────────────────────┘     └──────────┬──────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────┐
│                  API Gateway Layer (Optional)                   │
│           (Future: Load Balancer, Rate Limiting)               │
└──────────────────────────────────────────┬──────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────┐
│              Application Layer (.NET 8.0 Web API)              │
│                       TaskFlow.API                              │
├──────────────────────────────────────────────────────────────────┤
│  • 14 Controllers (Auth, Projects, Tasks, CRM, Events, etc.)   │
│  • Business Logic Services (Auth, Logto, Token)                │
│  • Dependency Injection Container                              │
│  • Error Handling Middleware                                   │
│  • CORS Configuration                                          │
│  • Rate Limiting                                               │
└──────────────────────────────────────────┬──────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────┐
│              Data Access Layer (Dapper ORM)                     │
│                    11 Repositories                              │
├──────────────────────────────────────────────────────────────────┤
│  • Project Repository                  • Phase Repository      │
│  • Task Repository                     • Space Repository      │
│  • User Repository                     • Comment Repository    │
│  • Category Repository                 • Event Repository      │
│  • Customer Repository (CRM)           • Contact Repository    │
│  • Deal Repository (CRM)               • Quote Repository      │
└──────────────────────────────────────────┬──────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────┐
│              Persistence Layer (SQL Server 2022)               │
│                   TaskFlowDB_Dev / Production                   │
├──────────────────────────────────────────────────────────────────┤
│  • 13 Core Tables (Site, User, Project, Task, etc.)            │
│  • 5 CRM Tables (Customer, Contact, Deal, Quote, QuoteItem)   │
│  • Stored Procedures (50+)                                     │
│  • Indexes (SiteID, Foreign Keys)                              │
│  • Constraints (Multi-tenant, referential integrity)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── Auth.tsx / LogtoAuth.tsx (Authentication)
├── Dashboard.tsx (Dashboard View)
├── Projects.tsx (Project List)
│   ├── CreateProjectDialog.tsx
│   ├── EditProjectDialog.tsx
│   └── ProjectDetail.tsx
│       └── ProjectTabs/ (Details, Events, Quotes, etc.)
├── ProjectWorkspaceV1.tsx (Main Workspace)
│   ├── WorkspaceSidebar.tsx (Navigation)
│   ├── WorkspaceToolbar.tsx (View Controls)
│   └── WorkspaceListView.tsx
│       ├── WorkspaceDraggableTaskRow.tsx
│       └── TaskDetailDialog/ (Redesigned)
│           ├── TaskHeader.tsx
│           ├── TaskMetadata.tsx
│           ├── TaskTabs.tsx
│           └── Components/ (Subcomponents)
├── KanbanBoard.tsx (Kanban View)
├── GanttChart.tsx (Gantt View)
├── MindMapView.tsx (Mind Map View)
├── Calendar.tsx (Calendar View)
├── DealsView.tsx (CRM Deals)
├── CreateCustomerDialog.tsx (CRM)
├── CreateContactDialog.tsx (CRM)
├── CreateDealDialog.tsx (CRM)
└── Header.tsx, Sidebar.tsx (Navigation)
```

### State Management Strategy

**Hierarchy:**
```
Application State (React Context - Future)
  └── Feature State (Custom Hooks)
      ├── useWorkspaceState() - Workspace-wide state (filters, view)
      ├── useTaskManagement() - Task CRUD operations
      ├── usePhaseManagement() - Phase management
      ├── useSpaceManagement() - Space management
      └── useAutoSave() - Form auto-save
          └── Component State (useState)
              └── Form State (React Hook Form)
```

**Data Flow:**
1. Component mounts, custom hook runs
2. Hook calls API service (api.ts)
3. API client handles auth/error
4. Data returned, state updated
5. Component re-renders

**Persistence:**
- LocalStorage: auth tokens, user preferences
- SessionStorage: (future) temporary data

### Service Architecture

```typescript
services/api.ts
├── Interceptors
│   ├── Authorization (Add JWT token)
│   ├── Error Handling (Toast notifications)
│   └── Token Refresh (Auto-refresh on 401)
├── API Methods (Generic)
│   ├── get<T>(url)
│   ├── post<T>(url, data)
│   ├── put<T>(url, data)
│   └── delete<T>(url)
└── Endpoint Groups (Future)
    ├── projects.*()
    ├── tasks.*()
    ├── customers.*()
    └── deals.*()
```

### Hooks Organization

**Custom Hooks** (src/components/workspace/hooks/):
- `useWorkspaceState()` - Manages workspace filters, view mode
- `useTaskManagement()` - Task CRUD + bulk operations
- `usePhaseManagement()` - Phase CRUD
- `useSpaceManagement()` - Space CRUD
- `useAutoSave()` - Debounced auto-save

**Utility Hooks** (src/hooks/):
- `useDebounce()` - Debounce values
- `useAsync()` - (future) Async operation helper

---

## 3. Backend Architecture

### Layered Architecture

```
Presentation Layer (Controllers)
        ↓
Business Logic Layer (Services)
        ↓
Data Access Layer (Repositories)
        ↓
Persistence Layer (Dapper + SQL Server)
```

### Controller Layer

**Purpose:** Handle HTTP requests, route to services, return responses

**Structure:**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Default: require authentication
public class ProjectsController : ApiControllerBase
{
    // GET, POST, PUT, DELETE endpoints
    // Error handling with try-catch
    // Logging with ILogger
}
```

**Key Methods:**
- `GetSiteId()` - Extract tenant ID from JWT
- `GetUserId()` - Extract user ID from JWT
- `Success<T>()` - Standardized success response

**Coverage:** 14 controllers covering all features

### Service Layer

**Purpose:** Encapsulate business logic

**Services:**
1. `AuthService` - User authentication, JWT validation
2. `LogtoAuthService` - Logto OAuth/OIDC integration
3. `TokenService` - JWT generation, refresh tokens
4. (Future) UserService, ProjectService, TaskService

**Pattern:**
```csharp
public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto login);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public async Task<AuthResponseDto> LoginAsync(LoginDto login)
    {
        // Validate credentials
        // Generate tokens
        // Return response
    }
}
```

### Repository Layer

**Purpose:** Abstract data access, enable testability

**Pattern:**
```csharp
public interface IRepository<T>
{
    Task<IEnumerable<T>> GetAllAsync(string siteId);
    Task<T?> GetByIdAsync(string siteId, Guid id);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(string siteId, Guid id, T entity);
    Task DeleteAsync(string siteId, Guid id);
}

public interface IProjectRepository : IRepository<Project>
{
    Task<IEnumerable<Project>> GetByCategoryAsync(string siteId, string categoryId);
    Task<IEnumerable<Project>> GetByStatusAsync(string siteId, string status);
}
```

**Implementation:**
```csharp
public class ProjectRepository : IProjectRepository
{
    private readonly IConfiguration _config;

    public async Task<IEnumerable<Project>> GetAllAsync(string siteId)
    {
        using var conn = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        const string sql = @"
            SELECT * FROM Project
            WHERE SiteID = @siteId AND IsDeleted = 0
            ORDER BY CreatedAt DESC";
        return await conn.QueryAsync<Project>(sql, new { siteId });
    }
}
```

**Coverage:** 11 repositories (Core + CRM entities)

### Middleware

**Error Handler Middleware:**
```csharp
public class ErrorHandlerMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.ErrorResponse("An error occurred");
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
```

**Registered in Program.cs** (first in pipeline):
```csharp
app.UseMiddleware<ErrorHandlerMiddleware>();
```

### Startup Configuration (Program.cs)

**Service Registration:**
1. Controllers with JSON options (camelCase)
2. Swagger/OpenAPI
3. CORS (Development/Production)
4. JWT Authentication
5. Authorization policies
6. Application services (Auth, Token, Logto)
7. Repositories (Project, Task, Customer, etc.)
8. Health checks
9. Response compression
10. Rate limiting
11. Logging

**Middleware Pipeline:**
```
1. Error Handler
2. CORS
3. HTTPS Redirect
4. Response Compression
5. Rate Limiting
6. Authentication
7. Authorization
8. Routing
9. Endpoints
```

---

## 4. Database Architecture

### Multi-Tenant Schema Design

**Key Pattern:** SiteID-based isolation

```sql
-- Every table has SiteID
CREATE TABLE Project (
    ProjectID UNIQUEIDENTIFIER PRIMARY KEY,
    SiteID NVARCHAR(50) NOT NULL,  -- Tenant identifier
    ProjectName NVARCHAR(255) NOT NULL,
    -- Foreign key includes SiteID
    CONSTRAINT FK_Project_Site FOREIGN KEY (SiteID) REFERENCES Site(SiteID)
);

-- Every query filters by SiteID
WHERE SiteID = @siteId AND IsDeleted = 0
```

**Isolation Guarantee:**
- Impossible to access other tenant data in single query
- SiteID comes from authenticated JWT claims
- Controllers extract SiteID from claims
- Repositories accept SiteID parameter

### Core Tables (13)

```
Identity
├── Site (Tenant organizations)
└── User (User accounts with roles)

Project Management
├── Project (Projects)
├── Task (Hierarchical tasks)
├── Phase (Workflow stages)
├── Space (Task sections)
├── Category (Project categories)
└── ProjectCategory (M-M relationship)

Collaboration
├── Comment (Task discussions)
└── CalendarEvent (Event management)

CRM (New)
├── Customer (Customer management)
├── Contact (Individual contacts)
├── Deal (Sales pipeline)
├── Quote (Quote generation)
└── QuoteItem (Quote line items)
```

### Key Fields (Audit Trail)

**Every entity includes:**
```csharp
public Guid CreatedBy { get; set; }      // User ID
public DateTime CreatedAt { get; set; }  // UTC timestamp
public DateTime UpdatedAt { get; set; }  // UTC timestamp
public bool IsDeleted { get; set; }      // Soft delete flag
```

### Indexes Strategy

**Guidelines:**
- Index frequently searched columns
- Include SiteID in composite indexes
- Index foreign key columns
- Consider filter (WHERE IsDeleted = 0)

**Examples:**
```sql
-- Tenant + Status filter
CREATE INDEX IX_Task_SiteID_Status
ON Task(SiteID, Status)
WHERE IsDeleted = 0;

-- Parent task relationship
CREATE INDEX IX_Task_ParentTaskID_SiteID
ON Task(ParentTaskID, SiteID)
WHERE IsDeleted = 0;
```

---

## 5. Authentication & Authorization Architecture

### JWT Token Structure

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "UserID": "550e8400-e29b-41d4-a716-446655440000",
  "SiteID": "DEMO",
  "Email": "user@example.com",
  "Role": "Manager",
  "exp": 1735089600,
  "iat": 1735005600,
  "iss": "TaskFlowAPI_Dev",
  "aud": "TaskFlowClient_Dev"
}
```

**Configuration:**
```json
{
  "Jwt": {
    "SecretKey": "YourSecretKeyHere32CharsMinimum!",
    "Issuer": "TaskFlowAPI_Dev",
    "Audience": "TaskFlowClient_Dev",
    "AccessTokenExpirationMinutes": 480,
    "RefreshTokenExpirationDays": 30
  }
}
```

### Authentication Flow

**Legacy JWT:**
```
1. User submits email + password + siteCode
2. Backend validates credentials (BCrypt password hash)
3. Backend generates JWT + refresh token
4. Frontend stores tokens in localStorage
5. API requests include: Authorization: Bearer <token>
6. Backend validates token signature & claims
7. On expiration, frontend calls refresh endpoint
```

**Logto OAuth/OIDC:**
```
1. User clicks "Sign in with Logto"
2. Frontend redirects to Logto login
3. User authenticates with Logto
4. Logto redirects to callback URL with code
5. Frontend exchanges code for tokens (via backend)
6. Backend creates/updates user in database
7. Backend creates site mapping for multi-tenant
8. Frontend stores tokens, proceeds as JWT
```

### Authorization Patterns

**Endpoint Protection:**
```csharp
// ✅ All endpoints require JWT (default)
[HttpGet]
[Authorize]
public async Task<...> GetAll() { ... }

// ✅ Specific role requirement
[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public async Task<...> Delete(Guid id) { ... }

// ✅ No authentication required
[HttpPost("login")]
[AllowAnonymous]
public async Task<...> Login([FromBody] LoginDto dto) { ... }
```

**SiteID Validation:**
```csharp
// Controller always extracts SiteID from claims
var siteId = GetSiteId();

// Pass to repository for filtering
var tasks = await _taskRepository.GetAllAsync(siteId);

// Repository always filters by SiteID
WHERE SiteID = @siteId AND IsDeleted = 0
```

---

## 6. API Architecture

### REST Conventions

**Standard CRUD:**
```
GET    /api/projects              → List
GET    /api/projects/{id}         → Get
POST   /api/projects              → Create
PUT    /api/projects/{id}         → Update
DELETE /api/projects/{id}         → Delete
```

**Complex Operations:**
```
GET    /api/projects/category/{id}     → Filter
GET    /api/projects/status/{status}   → Filter
POST   /api/tasks/{id}/subtasks        → Nested create
GET    /api/tasks/{id}/comments        → Get related
POST   /api/customers/search           → Complex search
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation successful",
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "",
  "error": "Invalid credentials"
}
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET, PUT, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unhandled exception |

---

## 7. Deployment Architecture

### Docker Composition

**Services:**
```yaml
frontend:
  - React 18 SPA
  - Port: 5600
  - Base: node:20-alpine

backend:
  - .NET 8.0 API
  - Port: 5001
  - Base: mcr.microsoft.com/dotnet/aspnet:8.0

database:
  - SQL Server 2022
  - Port: 1433
  - Volume: /var/opt/mssql (persistent)

db-init:
  - SQL migration scripts
  - One-time initialization
  - Depends on database
```

**Network:**
```
frontend:5600 ←→ backend:5001 (CORS enabled)
backend:5001  ←→ database:1433 (Connection string)
```

**Volumes:**
```
database:
  - /var/opt/mssql/data     (Database files)
  - /var/opt/mssql/log      (Transaction logs)
  - /var/opt/mssql/backup   (Backup files)
```

### Configuration Management

**Environment Variables:**

**Backend (appsettings.*.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=..."
  },
  "Jwt": { ... },
  "Logto": { ... },
  "Cors": { ... },
  "RateLimiting": { ... }
}
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=30000
```

---

## 8. Scalability Considerations

### Current (Single Instance)

- Single backend instance
- Single database instance
- Docker Compose orchestration
- Suitable for: Small teams, development

### Future Scaling

**Horizontal Scaling:**
- Load balancer (nginx, Azure LB)
- Multiple backend instances
- Database read replicas
- Cache layer (Redis)

**Vertical Scaling:**
- Larger database server
- More backend resources
- Content delivery network (CDN)

**Database Optimization:**
- Query optimization
- Index tuning
- Partitioning by SiteID
- Archiving old data

---

## 9. Security Architecture

### Defense in Depth

**Layer 1: Network**
- HTTPS only (TLS 1.3)
- CORS whitelist
- Docker network isolation

**Layer 2: Authentication**
- JWT with HS256
- 32+ character secret key
- BCrypt password hashing
- Token expiration & refresh

**Layer 3: Authorization**
- Role-based access control
- SiteID tenant isolation
- Endpoint protection ([Authorize])

**Layer 4: Data**
- SQL parameter binding (prevent injection)
- Input validation (DTOs)
- Output encoding (JSON)
- Soft deletes (audit trail)

**Layer 5: Application**
- Error handling (no stack traces to client)
- Logging without sensitive data
- Rate limiting (prevent brute force)
- Health checks

---

## 10. Monitoring & Observability

### Logging Strategy

**Backend:**
```
Level | When | Example
------|------|--------
Error | Exceptions | "Failed to create project: {error}"
Warn | Edge cases | "Token expiration in 1 hour"
Info | Important events | "User login: {userId}"
Debug | Detailed flow | "Repository query executed"
```

**Frontend:**
- Console errors (development only)
- Error boundaries catch React crashes
- Toast notifications for user feedback
- No sensitive data logged

### Health Checks

**Backend Endpoint:**
```
GET /health → 200 OK
{ "status": "Healthy", "timestamp": "..." }
```

**Checks:**
- Database connectivity
- External service availability (Logto)
- Memory usage
- Disk space

---

## 11. Technology Decision Rationale

### Why React + .NET?

**React 18:**
- Mature, component-based
- Large ecosystem
- Good tooling (Vite)
- Excellent for SPAs

**.NET 8.0:**
- Type-safe (C#)
- High performance
- Built-in DI & logging
- Excellent ORM support (Dapper)

**Dapper over EF:**
- Lightweight (prefer KISS)
- Explicit control over queries
- Better performance
- SQL Server specific optimizations

**Shared Database Multi-Tenancy:**
- Cost-effective (single DB)
- Simpler operations
- Cross-tenant analytics possible
- Isolation enforced at application level

---

## 12. Future Architectural Improvements

### Planned Enhancements

1. **API Gateway** - Authentication centralization, rate limiting
2. **Service Discovery** - Dynamic service registration
3. **Event-Driven Architecture** - Message queues (RabbitMQ)
4. **Caching Layer** - Redis for performance
5. **Full-Text Search** - Elasticsearch for advanced search
6. **Real-Time Updates** - WebSocket/SignalR for live sync
7. **Background Jobs** - Hangfire for async processing
8. **API Versioning** - URL versioning (v1, v2)

### Microservices Potential

**Future Breakout Services:**
- Auth Service (isolated OAuth/JWT)
- CRM Service (dedicated customer domain)
- Reporting Service (OLAP optimization)
- Notification Service (email, push)

---

## 13. Architecture Diagram Legend

```
Solid lines → Synchronous calls (HTTP/REST)
Dashed lines → Asynchronous/Optional (Future)
Arrows → Direction of data flow
Boxes → Layers/Components
```

---

**Related Documentation:**
- System Architecture Diagram (visual)
- API Endpoints (Swagger: http://localhost:5001/swagger)
- Database Schema (Backend/Database/00_Full_Schema_And_Data.sql)
- Code Standards (See code-standards.md)
