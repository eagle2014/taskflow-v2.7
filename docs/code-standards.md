# Code Standards & Development Guidelines

**Project:** Modern Task Management System v2.7
**Updated:** 2025-12-03

---

## 1. Core Principles

We follow **YAGNI, KISS, DRY** principles:

- **YAGNI (You Aren't Gonna Need It)** - Don't build features "just in case"
- **KISS (Keep It Simple, Stupid)** - Prioritize simplicity over clever solutions
- **DRY (Don't Repeat Yourself)** - Extract reusable logic, avoid duplication

---

## 2. Frontend Standards (React + TypeScript)

### File Organization

```
src/
├── components/
│   ├── ui/                    # shadcn/ui wrapper components
│   ├── TaskDetailDialog/      # Feature with subcomponents
│   │   ├── index.ts           # Exports
│   │   ├── TaskDetailDialog.tsx
│   │   ├── components/
│   │   ├── fields/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── workspace/             # Feature module with hooks
│   └── FeatureName.tsx        # Simple feature (if no subcomponents)
├── hooks/                     # Custom hooks (useDebounce, etc)
├── services/                  # API client (api.ts)
├── types/                     # TypeScript definitions
├── utils/                     # Utility functions
└── App.tsx                    # Root component
```

### File Size

- **Max Component File Size:** 200 lines
- **Max Hook Size:** 150 lines
- **Max Util File:** 100 lines

**Strategy:** If a file exceeds limits, split into smaller components/hooks.

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `TaskDetailDialog.tsx` |
| Hooks | camelCase with 'use' prefix | `useTaskManagement.ts` |
| Utils | camelCase | `calculateProgress.ts` |
| Types | PascalCase | `TaskDetailProps.ts` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT = 5000` |
| Files | kebab-case (components PascalCase) | `task-detail.tsx` |

### React Best Practices

**Hooks:**
```typescript
// ✅ Good: Custom hook encapsulates logic
function MyComponent() {
  const { tasks, updateTask } = useTaskManagement();
  return <div>{tasks.map(...)}</div>;
}

// ❌ Avoid: Logic in component
function MyComponent() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    // Complex fetch logic
  }, []);
}
```

**Functional Components Only:**
- No class components
- Use hooks for all state management
- Extract logic to custom hooks

**Props & Destructuring:**
```typescript
// ✅ Good
interface TaskProps {
  id: string;
  title: string;
  onUpdate: (id: string) => void;
}

function Task({ id, title, onUpdate }: TaskProps) {
  return <div onClick={() => onUpdate(id)}>{title}</div>;
}

// ❌ Avoid: Passing large objects
function Task(props: any) {
  return <div>{props.task.title}</div>;
}
```

**Effect Dependencies:**
```typescript
// ✅ Good: Explicit dependencies
useEffect(() => {
  fetchTask(taskId);
}, [taskId]); // Re-fetch when taskId changes

// ❌ Avoid: Empty dependencies
useEffect(() => {
  fetchTask(taskId);
}, []); // Wrong! taskId won't update
```

### TypeScript Best Practices

**Strict Mode Enabled:**
- `strict: true` in tsconfig.json
- No `any` types without justification
- Proper null handling

```typescript
// ✅ Good
interface Task {
  id: string;
  title: string;
  description?: string; // Optional
}

function getTask(id: string): Task | null {
  // ...
}

// ❌ Avoid
const task: any = getTask();
const title: string = task?.title; // Unsafe
```

**Type Organization:**
```typescript
// ✅ Good: Types in separate file
// types/task.ts
export interface Task {
  id: string;
  title: string;
}

export type TaskStatus = 'todo' | 'inProgress' | 'done';

// ✅ Good: Feature types in feature folder
// components/TaskDetail/types.ts
export interface TaskDetailProps {
  taskId: string;
}
```

### Styling with Tailwind

**Guidelines:**
- Use Tailwind utility classes
- No inline styles
- Extract repeated patterns to components

```typescript
// ✅ Good
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Save
</button>

// ✅ Better: Extract to Button component
<Button variant="primary">Save</Button>

// ❌ Avoid
<button style={{padding: '8px 16px', backgroundColor: 'blue'}}>Save</button>
```

### Form Handling

**React Hook Form:**
```typescript
// ✅ Good: Minimal re-renders, good performance
const form = useForm<TaskForm>({
  defaultValues: { title: '' }
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title', { required: 'Title required' })} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
}
```

### API Client

**Using services/api.ts:**
```typescript
// ✅ Good: Centralized API calls
const task = await api.get<Task>('/tasks/123');

// ✅ Good: Error handling
try {
  await api.post('/tasks', taskData);
} catch (error) {
  console.error('Failed to create task', error);
  toast.error('Failed to create task');
}
```

---

## 3. Backend Standards (.NET 8.0 + C#)

### Project Structure

```
TaskFlow.API/
├── Controllers/           # API endpoints
│   └── Base/ApiControllerBase.cs
├── Models/
│   ├── Entities/         # Domain models
│   ├── DTOs/             # API contracts
│   └── Common/           # Shared (ApiResponse)
├── Repositories/
│   ├── Interfaces/       # Repository contracts
│   └── [Implementations] # Dapper-based
├── Services/             # Business logic
├── Middleware/           # Error handling
└── Program.cs            # Startup config
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `ProjectRepository` |
| Methods | PascalCase | `GetAllAsync()` |
| Properties | PascalCase | `ProjectName` |
| Interfaces | PascalCase with 'I' prefix | `IProjectRepository` |
| Private fields | _camelCase | `_projectRepository` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Parameters | camelCase | `projectId` |

### Controller Guidelines

**Base Class:**
```csharp
public class ApiControllerBase : ControllerBase
{
    protected string GetSiteId() => User.FindFirst("SiteID")?.Value ?? string.Empty;
    protected Guid GetUserId() => Guid.Parse(User.FindFirst("UserID")?.Value ?? Guid.Empty.ToString());

    protected IActionResult Success<T>(T data, string message = "")
        => Ok(ApiResponse<T>.SuccessResponse(data, message));
}
```

**Controller Pattern:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ApiControllerBase
{
    private readonly IProjectRepository _repository;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IProjectRepository repository, ILogger<ProjectsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetAll()
    {
        try
        {
            var siteId = GetSiteId();
            var projects = await _repository.GetAllAsync(siteId);
            return Success(projects, "Projects retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving projects");
            return StatusCode(500, ApiResponse<IEnumerable<ProjectDto>>.ErrorResponse("Error retrieving projects"));
        }
    }
}
```

**Key Guidelines:**
- All endpoints should be documented with XML comments
- Always extract SiteID from claims
- Use try-catch with logging
- Return standardized ApiResponse wrapper
- Validate input with model state

### Repository Pattern

**Interface:**
```csharp
public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllAsync(string siteId);
    Task<Project?> GetByIdAsync(string siteId, Guid id);
    Task<Project> AddAsync(Project project);
    Task<Project> UpdateAsync(string siteId, Guid id, Project project);
    Task DeleteAsync(string siteId, Guid id);
}
```

**Implementation with Dapper:**
```csharp
public class ProjectRepository : IProjectRepository
{
    private readonly IConfiguration _config;
    private readonly ILogger<ProjectRepository> _logger;

    public ProjectRepository(IConfiguration config, ILogger<ProjectRepository> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<IEnumerable<Project>> GetAllAsync(string siteId)
    {
        using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        const string sql = "SELECT * FROM Projects WHERE SiteID = @siteId AND IsDeleted = 0 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Project>(sql, new { siteId });
    }
}
```

**Guidelines:**
- Use IDbConnection abstraction
- Parameterize all queries (prevent SQL injection)
- Filter by SiteID in every query
- Use stored procedures for complex logic
- Include proper error handling

### DTO Pattern

**Purpose:** Separate API contracts from domain models

```csharp
// Entity (internal)
public class Project
{
    public Guid ProjectID { get; set; }
    public string SiteID { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Budget { get; set; }
    public decimal Spent { get; set; }
    // ... many more internal fields
    public DateTime CreatedAt { get; set; }
}

// DTO (API)
public class ProjectDto
{
    public Guid ProjectID { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Budget { get; set; }
    // Only expose what API needs
}

// Create DTO (request)
public class CreateProjectDto
{
    [Required(ErrorMessage = "Project name is required")]
    [StringLength(255)]
    public string Name { get; set; }

    public string Description { get; set; }
    public decimal? Budget { get; set; }
}
```

### Error Handling

**Global Middleware:**
```csharp
public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlerMiddleware> _logger;

    public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.ErrorResponse("An error occurred. Please try again later.");
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
```

### Logging

**Guidelines:**
- Use ILogger<T> injected via DI
- Log at appropriate levels (Error, Warning, Information)
- Never log sensitive data (passwords, tokens)
- Include context (user ID, resource ID)

```csharp
// ✅ Good
_logger.LogError(ex, "Failed to create project for user {UserId}", userId);

// ❌ Avoid
_logger.LogError($"Failed to create project: {ex.Message}");
_logger.LogInformation($"User {password} logged in"); // Never log passwords
```

---

## 4. Database Standards (SQL Server)

### Naming Conventions

| Object | Convention | Example |
|--------|-----------|---------|
| Tables | PascalCase (singular) | `Project`, `Task` |
| Columns | PascalCase | `ProjectID`, `ProjectName` |
| Stored Procedures | sp[Name] | `spGetProjectsByCategory` |
| Indexes | IX[TableName][Field] | `IX_Project_SiteID` |
| Foreign Keys | FK[Child]_[Parent] | `FK_Task_Project` |
| Constraints | CK/UQ convention | `UQ_Project_Name` |

### Schema Design

**Primary Keys:**
- GUID (Guid/uniqueidentifier) for distributed systems
- Auto-increment integer for local identity

```sql
CREATE TABLE Project (
    ProjectID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID NVARCHAR(50) NOT NULL,
    ProjectName NVARCHAR(255) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Project_Site FOREIGN KEY (SiteID) REFERENCES Site(SiteID),
    CONSTRAINT IX_Project_SiteID_NotDeleted INDEX (SiteID, IsDeleted)
);
```

### Multi-Tenant Isolation

**Every table must include SiteID:**
```sql
-- ✅ Good: SiteID in every query filter
WHERE SiteID = @siteId AND IsDeleted = 0

-- ❌ Never: Query without SiteID filter
SELECT * FROM Project WHERE ProjectID = @projectId
-- This could return data from another tenant!
```

### Soft Deletes

**Standard pattern:**
```sql
-- Soft delete
UPDATE Project SET IsDeleted = 1 WHERE ProjectID = @projectId AND SiteID = @siteId

-- Query active only
SELECT * FROM Project WHERE SiteID = @siteId AND IsDeleted = 0

-- Permanently delete (rare, admin only)
DELETE FROM Project WHERE ProjectID = @projectId AND SiteID = @siteId
```

### Indexes

**Strategy:**
- Index frequently searched columns
- Include SiteID in composite indexes for tenant queries
- Index foreign key columns

```sql
-- ✅ Good
CREATE INDEX IX_Task_ProjectID_SiteID ON Task(ProjectID, SiteID) WHERE IsDeleted = 0

-- ✅ Good
CREATE INDEX IX_Task_Status_SiteID ON Task(Status, SiteID) WHERE IsDeleted = 0

-- ❌ Avoid excessive indexes (slow writes)
CREATE INDEX IX_Every_Column ON Task(...)
```

---

## 5. Git & Commit Standards

### Branch Naming

```
main                              # Production releases
feature/task-detail-redesign      # New features
fix/auth-token-expiration         # Bug fixes
docs/update-api-docs              # Documentation
chore/update-dependencies         # Maintenance
```

### Commit Messages

**Format:** `type: description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code reorganization (no functionality change)
- `test:` - Test additions/changes
- `chore:` - Maintenance, dependencies

**Examples:**
```
feat: add CRM customer management endpoints
fix: resolve task detail dialog height issue on mobile
docs: update API documentation for projects endpoint
refactor: extract task form validation to custom hook
chore: update React to 18.3.1
```

**Good Practices:**
- Write in present tense ("add" not "added")
- Be specific about what changed
- Reference issue numbers when relevant
- Keep messages <50 characters for subject line
- Add detailed description after blank line if needed

### Pre-Commit Checks

**Required before commit:**
- `npm run lint` - No linting errors
- `npm run type-check` - No TypeScript errors
- No hardcoded credentials or API keys
- No console.log statements in production code

**Backend:**
- `dotnet build` - Compilation succeeds
- Code follows naming conventions
- No test failures

---

## 6. Documentation Standards

### Code Comments

**When to comment:**
- Complex algorithms or business logic
- Non-obvious code requiring explanation
- Workarounds or hacks (with justification)

**When NOT to comment:**
- Self-explanatory code
- Variable names that describe purpose
- Function names that describe behavior

```typescript
// ✅ Good: Explains "why"
// Debounce API calls to prevent duplicate updates while user is typing
const debouncedSave = useCallback(
  debounce((data) => updateTask(data), 300),
  []
);

// ❌ Avoid: Obvious and redundant
// Set task status to done
task.status = 'done';
```

### JSDoc/XML Comments

**Frontend (JSDoc):**
```typescript
/**
 * Calculates task progress percentage
 * @param completedSubtasks - Number of completed subtasks
 * @param totalSubtasks - Total number of subtasks
 * @returns Progress percentage (0-100)
 */
function calculateProgress(completedSubtasks: number, totalSubtasks: number): number {
  return totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;
}
```

**Backend (XML):**
```csharp
/// <summary>
/// Retrieves all projects for the current tenant
/// </summary>
/// <returns>List of projects</returns>
[HttpGet]
public async Task<ActionResult<ApiResponse<IEnumerable<ProjectDto>>>> GetAll()
{
    // ...
}
```

---

## 7. Testing Standards

### Frontend Tests

**Types:**
- E2E tests (Playwright/Cypress) - User workflows
- Component tests (React Testing Library) - Isolated components
- Unit tests (Jest) - Utilities and hooks

**Example:**
```typescript
describe('TaskDetailDialog', () => {
  it('should save task with auto-save hook', async () => {
    const mockUpdate = jest.fn();
    render(<TaskDetailDialog taskId="123" onUpdate={mockUpdate} />);

    const input = screen.getByDisplayValue('Original Title');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Title');

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('123', { title: 'New Title' });
    }, { timeout: 500 }); // Account for debounce
  });
});
```

### Backend Tests

**Types:**
- Unit tests (xUnit) - Services, helpers
- Integration tests - API endpoints with database
- Repository tests - Dapper queries

```csharp
[Fact]
public async Task GetByIdAsync_WithValidId_ReturnsProject()
{
    // Arrange
    var siteId = "DEMO";
    var projectId = Guid.NewGuid();
    var repository = new ProjectRepository(_config, _logger);

    // Act
    var result = await repository.GetByIdAsync(siteId, projectId);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(projectId, result.ProjectID);
    Assert.Equal(siteId, result.SiteID);
}
```

---

## 8. Performance Guidelines

### Frontend

**Bundle Size:**
- Lazy load heavy components
- Tree-shake unused code
- Compress images
- Use CSS purging (Tailwind)

**Rendering:**
- Use React.memo for pure components
- Memoize expensive calculations with useMemo
- Debounce/throttle event handlers
- Virtual scroll for large lists (future)

### Backend

**Database:**
- Index frequently searched columns
- Use `WHERE IsDeleted = 0` in all queries
- Use stored procedures for complex logic
- Enable query results caching (future)

**API:**
- Enable response compression (gzip)
- Limit response size with pagination (future)
- Implement caching headers (future)

---

## 9. Security Guidelines

### Frontend

**Authentication:**
- Store tokens securely (consider HttpOnly cookies)
- Never expose tokens in logs
- Implement token refresh before expiration

**Input Validation:**
- Validate on client (UX)
- Validate on server (security)
- Sanitize user input to prevent XSS

**Sensitive Data:**
- Never log passwords or tokens
- Clear sensitive form data after submission
- Use HTTPS in production

### Backend

**Authentication:**
- Use JWT with HS256
- 32+ character secret key
- Validate token signature and claims
- Check token expiration

**Authorization:**
- Verify SiteID in every query
- Use [Authorize] attribute on protected endpoints
- Implement role-based access control

**Input Validation:**
- Validate all DTO properties
- Use parameterized queries (prevent SQL injection)
- Sanitize error messages (no stack traces to client)

---

## 10. Deployment Standards

### Build Process

**Frontend:**
```bash
npm run lint      # ESLint
npm run build     # Vite production build
```

**Backend:**
```bash
dotnet build      # Verify compilation
dotnet test       # Run tests
```

### Environment Configuration

**Development:**
- Debug symbols included
- Detailed error messages
- CORS allows localhost:*

**Production:**
- Optimized builds (no debug info)
- Generic error messages
- CORS restricted to specific origins
- HTTPS required
- Security headers enforced

---

## 11. Code Review Checklist

Before committing, verify:

**General:**
- [ ] Code follows standards in this document
- [ ] No hardcoded credentials
- [ ] No console.log/debug statements
- [ ] Meaningful variable/function names
- [ ] Functions <50 lines, components <200 lines

**Frontend:**
- [ ] TypeScript strict mode
- [ ] PropTypes or interface defined
- [ ] No `any` types without justification
- [ ] Responsive design verified
- [ ] Accessibility checked (keyboard nav, ARIA)

**Backend:**
- [ ] Compilation succeeds (dotnet build)
- [ ] SiteID extracted and filtered in all queries
- [ ] Error handling with try-catch
- [ ] Logging includes context
- [ ] DTOs properly structured

**Documentation:**
- [ ] JSDoc/XML comments on public APIs
- [ ] README updated if needed
- [ ] Commit message descriptive

---

## 12. Quick Reference

**Project Structure:**
- Frontend: `src/components/`, `src/services/`, `src/types/`
- Backend: `Controllers/`, `Models/`, `Repositories/`, `Services/`
- Database: `Backend/Database/*.sql`

**Key Technologies:**
- Frontend: React 18, TypeScript, Vite, Tailwind, shadcn/ui
- Backend: .NET 8.0, C# 12, Dapper, SQL Server
- Deployment: Docker, Docker Compose

**Important Files:**
- Frontend config: `vite.config.ts`, `tsconfig.json`
- Backend config: `Program.cs`, `appsettings.json`
- Database config: `docker-compose.yml`

---

## Contact & Questions

For questions about code standards, refer to:
- CLAUDE.md - Project guidelines
- README.md - Setup instructions
- Codebase Summary - Technical overview
