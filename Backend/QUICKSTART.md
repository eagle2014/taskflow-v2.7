# TaskFlow Backend - Quick Start Guide

Get your multi-tenant TaskFlow API running in 10 minutes.

## Prerequisites

- ✅ .NET 8.0 SDK installed
- ✅ SQL Server 2022 (or 2019+) installed
- ✅ SQL Server Management Studio (SSMS) or Azure Data Studio

## Step-by-Step Setup

### Step 1: Create Database (2 minutes)

Open **SQL Server Management Studio**:

```sql
-- 1. Create database
CREATE DATABASE TaskFlowDB_Dev;
GO

-- 2. Switch to the new database
USE TaskFlowDB_Dev;
GO
```

### Step 2: Run SQL Scripts (3 minutes)

Execute these scripts **in order** in SSMS:

```sql
-- Run all scripts in this exact order:
-- 1. Database/01_CreateSchema.sql              (Creates tables, indexes, constraints)
-- 2. Database/02_StoredProcedures_Users.sql    (User CRUD stored procedures)
-- 3. Database/03_StoredProcedures_Projects.sql (Project CRUD stored procedures)
-- 4. Database/04_StoredProcedures_Tasks.sql    (Task CRUD stored procedures)
-- 5. Database/05_StoredProcedures_Events.sql   (Event CRUD stored procedures)
-- 6. Database/06_StoredProcedures_Comments.sql (Comment CRUD stored procedures)
-- 7. Database/07_StoredProcedures_Categories.sql (Category CRUD stored procedures)
-- 8. Database/08_StoredProcedures_Spaces.sql   (Space CRUD stored procedures)
-- 9. Database/09_StoredProcedures_Phases.sql   (Phase CRUD stored procedures)
```

**Quick way to run all at once:**

1. Open each .sql file in SSMS
2. Press `Ctrl+A` to select all
3. Press `F5` to execute
4. Move to next file

### Step 3: Create Your First Tenant (1 minute)

```sql
-- Insert first tenant/site
INSERT INTO Sites (SiteID, SiteName, SiteCode, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt)
VALUES (
    NEWID(),
    'ACME Corporation',
    'ACME',
    1,              -- IsActive
    100,            -- MaxUsers
    50,             -- MaxProjects
    GETUTCDATE(),
    GETUTCDATE()
);

-- Verify it was created
SELECT * FROM Sites;
```

**Copy the SiteCode** (`ACME`) - you'll need it for registration!

### Step 4: Configure Connection String (1 minute)

Open `Backend/TaskFlow.API/appsettings.Development.json`:

Update the connection string to match your SQL Server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskFlowDB_Dev;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

**Common connection string variations:**

```
# Local SQL Server (Windows Authentication)
Server=localhost;Database=TaskFlowDB_Dev;Trusted_Connection=True;TrustServerCertificate=True;

# Local SQL Server (SQL Authentication)
Server=localhost;Database=TaskFlowDB_Dev;User Id=sa;Password=YourPassword;TrustServerCertificate=True;

# SQL Server Express
Server=localhost\\SQLEXPRESS;Database=TaskFlowDB_Dev;Trusted_Connection=True;TrustServerCertificate=True;

# SQL Server named instance
Server=localhost\\INSTANCENAME;Database=TaskFlowDB_Dev;Trusted_Connection=True;TrustServerCertificate=True;
```

### Step 5: Run the API (2 minutes)

Open terminal in `Backend/TaskFlow.API` folder:

```bash
# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run the API
dotnet run
```

You should see:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
info: Microsoft.Hosting.Lifetime[0]
      Application started.
```

### Step 6: Test with Swagger (1 minute)

1. Open browser: **http://localhost:5001**
2. You should see Swagger UI
3. Click on **POST /api/auth/register**
4. Click "Try it out"
5. Enter this test data:

```json
{
  "email": "admin@acme.com",
  "password": "admin123",
  "name": "Admin User",
  "siteCode": "ACME"
}
```

6. Click "Execute"
7. You should get a **200 response** with an access token!

## Quick Test Workflow

### 1. Register a User

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "admin@acme.com",
  "password": "admin123",
  "name": "Admin User",
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
      "email": "admin@acme.com",
      "name": "Admin User"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "...",
    "expiresIn": 28800
  }
}
```

### 2. Authorize in Swagger

1. Copy the `accessToken` from the response
2. Click the **"Authorize"** button at the top of Swagger UI
3. Enter: `Bearer YOUR_ACCESS_TOKEN_HERE`
4. Click "Authorize"
5. You're now authenticated!

### 3. Create a Project Category

**Endpoint:** `POST /api/categories`

```json
{
  "name": "Web Development",
  "description": "Web development projects",
  "color": "#3B82F6"
}
```

### 4. Create a Project

**Endpoint:** `POST /api/projects`

```json
{
  "name": "TaskFlow Application",
  "description": "Build an awesome task management system",
  "categoryID": "PASTE_CATEGORY_ID_FROM_STEP_3",
  "status": "Active",
  "priority": "High",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

### 5. Create a Task

**Endpoint:** `POST /api/tasks`

```json
{
  "projectID": "PASTE_PROJECT_ID_FROM_STEP_4",
  "title": "Design database schema",
  "description": "Create multi-tenant database schema with stored procedures",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2025-02-01",
  "estimatedHours": 16
}
```

### 6. Get All Tasks

**Endpoint:** `GET /api/tasks`

You should see the task you just created!

## Common Issues and Solutions

### Issue 1: Cannot connect to database

**Error:** `A network-related or instance-specific error occurred`

**Solution:**
1. Verify SQL Server is running:
   - Open "Services" (Win + R, type `services.msc`)
   - Find "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"
   - Ensure it's running
2. Check connection string matches your SQL Server instance name

### Issue 2: Login failed for user

**Error:** `Login failed for user 'NT AUTHORITY\SYSTEM'`

**Solution:**
- Change to SQL Authentication:
  ```json
  "Server=localhost;Database=TaskFlowDB_Dev;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
  ```

### Issue 3: 401 Unauthorized

**Error:** Getting 401 on protected endpoints

**Solution:**
1. Verify you clicked "Authorize" in Swagger
2. Ensure you included "Bearer " prefix
3. Check token hasn't expired (28800 seconds = 8 hours in dev)

### Issue 4: Port already in use

**Error:** `Failed to bind to address http://localhost:5001`

**Solution:**
1. Change port in `Properties/launchSettings.json`
2. Or stop other app using port 5001

### Issue 5: Cannot find stored procedure

**Error:** `Could not find stored procedure 'sp_Task_GetAll'`

**Solution:**
1. Ensure you ran all SQL scripts in order
2. Verify you're using the correct database (`USE TaskFlowDB_Dev`)
3. Check stored procedures exist:
   ```sql
   SELECT * FROM sys.procedures WHERE name LIKE 'sp_%'
   ```

## Testing Without Swagger

### Using cURL

```bash
# 1. Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@acme.com",
    "password": "test123",
    "name": "Test User",
    "siteCode": "ACME"
  }'

# 2. Login (copy the accessToken from response)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@acme.com",
    "password": "test123",
    "siteCode": "ACME"
  }'

# 3. Get Projects (replace YOUR_TOKEN with actual token)
curl -X GET http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import OpenAPI spec from http://localhost:5001/swagger/v1/swagger.json
2. Create environment variable `baseUrl = http://localhost:5001`
3. Create environment variable `token`
4. After login, set `token` to the accessToken from response
5. Add header to all requests: `Authorization: Bearer {{token}}`

## Next Steps

### Add More Tenants

```sql
INSERT INTO Sites (SiteID, SiteName, SiteCode, IsActive, MaxUsers, MaxProjects, CreatedAt, UpdatedAt)
VALUES
(NEWID(), 'Tech Startup Inc', 'TECHSTART', 1, 50, 25, GETUTCDATE(), GETUTCDATE()),
(NEWID(), 'Consulting Group', 'CONSULT', 1, 200, 100, GETUTCDATE(), GETUTCDATE());
```

### Test Multi-Tenant Isolation

1. Register user in ACME site (siteCode: "ACME")
2. Register user in TECHSTART site (siteCode: "TECHSTART")
3. Create projects in both sites
4. Verify users only see their own site's data

### Connect Frontend

Update frontend `src/utils/api.tsx` to call your API:

```typescript
const API_BASE_URL = 'http://localhost:5001/api';

export const login = async (email: string, password: string, siteCode: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, siteCode })
  });
  return response.json();
};
```

### Enable Production Mode

1. Update `appsettings.json` with production settings
2. Change JWT secret key
3. Update CORS allowed origins
4. Disable Swagger (`EnableSwagger: false`)
5. Set `RequireHttpsMetadata: true`
6. Deploy to Azure App Service or IIS

## API Documentation

Full API documentation available at:
- **Swagger UI**: http://localhost:5001
- **OpenAPI JSON**: http://localhost:5001/swagger/v1/swagger.json
- **README.md**: Complete API reference

## Architecture Highlights

✅ **100% Stored Procedures** - No dynamic SQL
✅ **Multi-Tenant via SiteID** - Complete data isolation
✅ **JWT Authentication** - Secure token-based auth
✅ **Specific IDs** - UserID, ProjectID, TaskID (not generic Id)
✅ **Soft Deletes** - Data preservation with IsDeleted flag
✅ **Dapper ORM** - Lightweight and fast
✅ **Base Controller** - Automatic SiteID extraction
✅ **Global Error Handler** - Consistent error responses

## Support

Check the main **README.md** for:
- Complete API endpoint reference
- Detailed architecture documentation
- Security best practices
- Deployment guides
- Troubleshooting tips

Happy coding! 🚀
