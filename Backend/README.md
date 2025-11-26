# TaskFlow Backend API

Multi-tenant Task Management System backend built with .NET 8.0, Dapper, and SQL Server.

## Architecture Overview

This backend implements a **multi-tenant architecture** with:
- **100% SQL Stored Procedures** - No dynamic SQL or LINQ queries
- **Dapper** for micro-ORM data access
- **JWT Authentication** with multi-tenant claims
- **Specific ID naming** (UserID, ProjectID, TaskID, etc.)
- **Soft deletes** with IsDeleted flag
- **Single project structure** with shared base classes

## Technology Stack

- **.NET 8.0 Web API**
- **Dapper** (Micro-ORM)
- **SQL Server 2022**
- **BCrypt.Net** (Password hashing)
- **JWT Bearer Authentication**
- **Swagger/OpenAPI** (API documentation)

## Project Structure

```
TaskFlow.API/
├── Controllers/              # API Controllers
│   ├── Base/
│   │   └── ApiControllerBase.cs      # Base controller with SiteID extraction
│   ├── AuthController.cs              # Authentication endpoints
│   ├── ProjectsController.cs          # Projects CRUD
│   ├── TasksController.cs             # Tasks CRUD
│   ├── UsersController.cs             # User management
│   ├── EventsController.cs            # Calendar events
│   ├── CommentsController.cs          # Task comments
│   ├── CategoriesController.cs        # Project categories
│   ├── SpacesController.cs            # Project spaces
│   └── PhasesController.cs            # Project phases
├── Models/
│   ├── Entities/             # Database entities
│   └── DTOs/                 # Data Transfer Objects
│       ├── Auth/             # Authentication DTOs
│       ├── Common/           # Shared DTOs
│       ├── Project/          # Project DTOs
│       ├── Task/             # Task DTOs
│       ├── Event/            # Event DTOs
│       ├── Comment/          # Comment DTOs
│       ├── Category/         # Category DTOs
│       ├── Space/            # Space DTOs
│       └── Phase/            # Phase DTOs
├── Repositories/             # Data access layer
│   ├── Base/
│   │   └── DapperRepository.cs       # Base repository (stored procs only)
│   ├── Interfaces/           # Repository interfaces
│   └── [Entity]Repository.cs # Specific repositories
├── Services/                 # Business logic
│   ├── AuthService.cs        # Authentication service
│   └── TokenService.cs       # JWT token generation
├── Middleware/               # Custom middleware
│   └── ErrorHandlerMiddleware.cs     # Global error handling
├── Database/                 # SQL scripts
│   ├── 01_CreateSchema.sql           # Database schema
│   ├── 02_StoredProcedures_Users.sql
│   ├── 03_StoredProcedures_Projects.sql
│   ├── 04_StoredProcedures_Tasks.sql
│   ├── 05_StoredProcedures_Events.sql
│   ├── 06_StoredProcedures_Comments.sql
│   ├── 07_StoredProcedures_Categories.sql
│   ├── 08_StoredProcedures_Spaces.sql
│   └── 09_StoredProcedures_Phases.sql
├── Program.cs                # Application entry point
├── appsettings.json          # Production configuration
└── appsettings.Development.json  # Development configuration
```

## Multi-Tenant Design

### Every Table Has SiteID

```sql
CREATE TABLE [TableName] (
    [EntityID] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID UNIQUEIDENTIFIER NOT NULL,
    -- other columns...
    FOREIGN KEY (SiteID) REFERENCES Sites(SiteID) ON DELETE CASCADE
);
```

### JWT Claims Include Tenant Context

```json
{
  "nameid": "user-guid-here",
  "email": "user@example.com",
  "role": "Admin",
  "siteId": "site-guid-here",
  "siteCode": "ACME",
  "exp": 1234567890
}
```

### Base Controller Extracts SiteID

```csharp
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid GetSiteId()
    {
        var siteIdClaim = User.FindFirst("siteId")?.Value;
        return Guid.Parse(siteIdClaim);
    }
}
```

### All Stored Procedures Filter by @SiteID

```sql
CREATE PROCEDURE sp_Task_GetAll
    @SiteID UNIQUEIDENTIFIER
AS
BEGIN
    SELECT * FROM Tasks
    WHERE SiteID = @SiteID AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END;
```

## Setup Instructions

### 1. Prerequisites

- .NET 8.0 SDK
- SQL Server 2022 (or SQL Server 2019+)
- SQL Server Management Studio (SSMS) or Azure Data Studio

### 2. Database Setup

```bash
# 1. Open SQL Server Management Studio
# 2. Connect to your SQL Server instance
# 3. Execute scripts in order:

# Create database
CREATE DATABASE TaskFlowDB_Dev;
GO
USE TaskFlowDB_Dev;
GO

# Run scripts in this order:
# - Database/01_CreateSchema.sql
# - Database/02_StoredProcedures_Users.sql
# - Database/03_StoredProcedures_Projects.sql
# - Database/04_StoredProcedures_Tasks.sql
# - Database/05_StoredProcedures_Events.sql
# - Database/06_StoredProcedures_Comments.sql
# - Database/07_StoredProcedures_Categories.sql
# - Database/08_StoredProcedures_Spaces.sql
# - Database/09_StoredProcedures_Phases.sql
```

### 3. Create Initial Site (Tenant)

```sql
-- Insert your first tenant
INSERT INTO Sites (SiteID, SiteName, SiteCode, IsActive, MaxUsers, MaxProjects)
VALUES (
    NEWID(),
    'ACME Corporation',
    'ACME',
    1,
    100,
    50
);
```

### 4. Configure Connection String

Update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=TaskFlowDB_Dev;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

### 5. Run the API

```bash
cd Backend/TaskFlow.API
dotnet restore
dotnet build
dotnet run
```

The API will start at:
- **HTTPS**: https://localhost:7001
- **HTTP**: http://localhost:5001
- **Swagger UI**: http://localhost:5001 (root)

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email, password, and siteCode |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout (client-side token removal) |
| GET | `/api/auth/validate` | Validate current token |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/{id}` | Get project by ID |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project (soft delete) |
| GET | `/api/projects/category/{categoryId}` | Get projects by category |
| GET | `/api/projects/status/{status}` | Get projects by status |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task (soft delete) |
| GET | `/api/tasks/project/{projectId}` | Get tasks by project |
| GET | `/api/tasks/assignee/{assigneeId}` | Get tasks by assignee |
| GET | `/api/tasks/status/{status}` | Get tasks by status |
| GET | `/api/tasks/overdue` | Get overdue tasks |
| GET | `/api/tasks/due-soon/{days}` | Get tasks due within X days |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}` | Update user profile |
| DELETE | `/api/users/{id}` | Delete user (Admin only) |
| GET | `/api/users/role/{role}` | Get users by role |
| GET | `/api/users/status/{status}` | Get users by status |
| POST | `/api/users/update-activity` | Update last active timestamp |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/{id}` | Get event by ID |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/range?startDate=...&endDate=...` | Get events by date range |
| GET | `/api/events/task/{taskId}` | Get events by task |
| GET | `/api/events/type/{type}` | Get events by type |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/task/{taskId}` | Get comments by task |
| GET | `/api/comments/{id}` | Get comment by ID |
| POST | `/api/comments` | Create new comment |
| PUT | `/api/comments/{id}` | Update comment (own comments only) |
| DELETE | `/api/comments/{id}` | Delete comment (own comments only) |
| GET | `/api/comments/user/{userId}` | Get comments by user |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/categories/name/{name}` | Get category by name |

### Spaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/spaces` | Get all spaces |
| GET | `/api/spaces/{id}` | Get space by ID |
| POST | `/api/spaces` | Create new space |
| PUT | `/api/spaces/{id}` | Update space |
| DELETE | `/api/spaces/{id}` | Delete space |
| POST | `/api/spaces/{spaceId}/projects/{projectId}` | Add project to space |
| DELETE | `/api/spaces/{spaceId}/projects/{projectId}` | Remove project from space |

### Phases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/phases/project/{projectId}` | Get phases by project |
| GET | `/api/phases/{id}` | Get phase by ID |
| POST | `/api/phases` | Create new phase |
| PUT | `/api/phases/{id}` | Update phase |
| DELETE | `/api/phases/{id}` | Delete phase |
| POST | `/api/phases/project/{projectId}/reorder` | Reorder phases |

## Authentication Flow

### 1. Register a New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "siteCode": "ACME"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userID": "...",
      "email": "john@acme.com",
      "name": "John Doe",
      "siteCode": "ACME",
      "siteName": "ACME Corporation"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 28800
  },
  "message": "Registration successful"
}
```

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePassword123",
  "siteCode": "ACME"
}
```

### 3. Use Access Token

```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

## Data Access Pattern

### Repository Pattern (Dapper + Stored Procedures)

All repositories inherit from `DapperRepository<T>` and use only stored procedures:

```csharp
public class TaskRepository : DapperRepository<Task>, ITaskRepository
{
    public async Task<IEnumerable<Task>> GetAllAsync(Guid siteId)
    {
        return await ExecuteStoredProcedureAsync(
            "sp_Task_GetAll",
            new { SiteID = siteId }
        );
    }

    public async Task<Task> AddAsync(Task entity)
    {
        var result = await ExecuteStoredProcedureSingleAsync(
            "sp_Task_Create",
            new
            {
                entity.SiteID,
                entity.ProjectID,
                entity.Title,
                entity.Description,
                // ... other parameters
            }
        );
        return result ?? throw new Exception("Failed to create task");
    }
}
```

## Error Handling

Global error handler middleware provides consistent error responses:

```json
{
  "success": false,
  "error": "Invalid operation",
  "message": "Project not found",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `408` - Request Timeout
- `500` - Internal Server Error

## Development Tips

### Testing with Swagger

1. Start the API: `dotnet run`
2. Open browser: http://localhost:5001
3. Click "Authorize" button
4. Login via `/api/auth/login` endpoint
5. Copy the `accessToken` from response
6. Paste in Authorize dialog: `Bearer YOUR_TOKEN_HERE`
7. Test other endpoints

### Database Migrations

When modifying database schema:

1. Update `01_CreateSchema.sql`
2. Create new migration script (e.g., `10_Migration_AddNewField.sql`)
3. Run migration on database
4. Update entity models
5. Update stored procedures if needed
6. Test with Postman/Swagger

### Adding New Features

1. **Create stored procedures** in Database folder
2. **Update entity model** in Models/Entities
3. **Create DTOs** in Models/DTOs
4. **Create repository interface** in Repositories/Interfaces
5. **Implement repository** in Repositories
6. **Register in Program.cs** DI container
7. **Create controller** in Controllers
8. **Test with Swagger**

## Security Considerations

### Production Checklist

- [ ] Change JWT SecretKey in appsettings.json
- [ ] Enable HTTPS only (set `RequireHttpsMetadata = true`)
- [ ] Update CORS allowed origins
- [ ] Disable Swagger in production (`EnableSwagger = false`)
- [ ] Use strong password requirements
- [ ] Implement rate limiting
- [ ] Enable SQL Server encryption
- [ ] Use Azure Key Vault for secrets
- [ ] Enable application logging (Application Insights, Serilog)
- [ ] Configure proper firewall rules
- [ ] Implement input validation and sanitization
- [ ] Enable audit logging for sensitive operations

### Password Security

- Passwords are hashed using BCrypt with work factor 12
- No plain-text passwords are ever stored
- Password hashes are never returned in API responses

### JWT Security

- Tokens are signed with HMAC-SHA256
- Include expiration time (exp claim)
- Validate issuer and audience
- Short access token lifetime (60 min production, 8 hours dev)
- Longer refresh token lifetime (7 days production, 30 days dev)

## Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@acme.com","password":"password","name":"Test User","siteCode":"ACME"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@acme.com","password":"password","siteCode":"ACME"}'

# Get Projects (with token)
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Azure App Service

1. Create Azure SQL Database
2. Run SQL scripts on Azure SQL
3. Create Azure App Service (.NET 8)
4. Configure connection string in App Service settings
5. Deploy via Visual Studio or Azure DevOps
6. Configure custom domain and SSL

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskFlow.API/TaskFlow.API.csproj", "TaskFlow.API/"]
RUN dotnet restore "TaskFlow.API/TaskFlow.API.csproj"
COPY . .
WORKDIR "/src/TaskFlow.API"
RUN dotnet build "TaskFlow.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskFlow.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskFlow.API.dll"]
```

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to SQL Server

**Solution:**
1. Verify SQL Server is running
2. Check connection string in appsettings
3. Ensure SQL Server allows remote connections
4. Check firewall rules
5. Verify authentication mode (Windows vs SQL)

### Authentication Issues

**Problem:** 401 Unauthorized on protected endpoints

**Solution:**
1. Verify token is included in Authorization header
2. Check token hasn't expired
3. Ensure Bearer prefix is included
4. Verify JWT secret key matches in appsettings
5. Check user hasn't been deleted

### Multi-Tenant Issues

**Problem:** User sees data from other tenants

**Solution:**
1. Verify SiteID is being extracted correctly
2. Check stored procedures filter by @SiteID
3. Ensure JWT contains siteId claim
4. Verify foreign key constraints on SiteID

## Support

For issues, questions, or contributions, please contact the development team.

## License

Proprietary - ACME Corporation
