# TaskFlow - Testing Guide

Hướng dẫn đầy đủ về testing cho TaskFlow, bao gồm unit tests, integration tests và end-to-end tests.

## 📋 Mục Lục

1. [Yêu Cầu](#yêu-cầu)
2. [Automated Testing với Docker](#automated-testing-với-docker)
3. [Manual Testing](#manual-testing)
4. [Frontend-Backend Mapping Tests](#frontend-backend-mapping-tests)
5. [Troubleshooting](#troubleshooting)

---

## Yêu Cầu

### Phần Mềm Cần Thiết

- ✅ Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- ✅ Node.js 20+ và npm
- ✅ Git Bash (Windows) hoặc Terminal (Mac/Linux)

### Kiểm Tra Docker

```bash
# Kiểm tra Docker đã cài đặt
docker --version
docker-compose --version

# Kiểm tra Docker đang chạy
docker ps
```

---

## Automated Testing với Docker

### 🚀 Chạy Full Test Suite (Tự Động)

Test suite này sẽ:
1. ✅ Tự động khởi động SQL Server trong Docker
2. ✅ Tự động tạo database và chạy migrations
3. ✅ Tự động seed sample data
4. ✅ Khởi động Backend API (.NET 8)
5. ✅ Chạy end-to-end tests
6. ✅ Báo cáo kết quả chi tiết

**Windows (PowerShell):**
```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
.\scripts\run-tests.ps1
```

**Linux/Mac/Git Bash:**
```bash
cd "/d/TFS/aidev/Modern Task Management System_v2.7"
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

### 📊 Kết Quả Mong Đợi

```
==================================================
TaskFlow Automated Test Suite
==================================================

📋 Test Configuration:
   API URL: http://localhost:5001/api
   Site Code: ACME
   Max Wait Time: 180s

🧹 Cleaning up existing containers...
✅ Cleanup complete

🚀 Starting Docker Compose services...
⏳ Waiting for SQL Server to be ready...
✅ SQL Server is ready

🗄️  Initializing database...
✅ Database initialized successfully

⏳ Waiting for Backend API to be ready...
✅ Backend API is ready

🧪 Running End-to-End Tests...
==================================================
✅ Health Check - PASSED (45ms)
✅ User Registration - PASSED (234ms)
✅ User Login - PASSED (12ms)
✅ Get Current User - PASSED (67ms)
✅ Create Category - PASSED (89ms)
✅ Create Project - PASSED (123ms)
✅ Get All Projects - PASSED (78ms)
✅ Create Task - PASSED (156ms)
✅ Get Tasks by Project - PASSED (91ms)
✅ Update Task Status - PASSED (145ms)
✅ Create Comment - PASSED (98ms)
✅ Get Task Comments - PASSED (76ms)
✅ Create Event - PASSED (112ms)
✅ Get Events - PASSED (88ms)
✅ Token Refresh - PASSED (23ms)

==================================================
📊 Test Results Summary
==================================================

Total Tests: 15
✅ Passed: 15
❌ Failed: 0
⏱️  Total Duration: 1437ms
📈 Success Rate: 100.00%

==================================================
✅ ALL TESTS PASSED!
==================================================
```

---

## Manual Testing

### 1. Khởi Động Services Thủ Công

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f backend
docker-compose logs -f sqlserver

# Kiểm tra health
curl http://localhost:5001/health
```

### 2. Test Backend API với Swagger

1. Mở trình duyệt: **http://localhost:5001**
2. Swagger UI sẽ hiển thị
3. Test các endpoints:

#### Đăng Ký User Mới
```
POST /api/auth/register
Body:
{
  "email": "test@acme.com",
  "password": "Test123!",
  "name": "Test User",
  "siteCode": "ACME"
}
```

#### Đăng Nhập
```
POST /api/auth/login
Body:
{
  "email": "test@acme.com",
  "password": "Test123!",
  "siteCode": "ACME"
}
```

#### Authorize
1. Copy `accessToken` từ response
2. Click nút "Authorize" ở đầu trang
3. Nhập: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize"

#### Tạo Project
```
POST /api/projects
Body:
{
  "name": "My Test Project",
  "description": "Testing project creation",
  "status": "Active",
  "priority": "High"
}
```

#### Tạo Task
```
POST /api/tasks
Body:
{
  "projectID": "PASTE_PROJECT_ID_FROM_ABOVE",
  "title": "My First Task",
  "description": "Testing task creation",
  "status": "To Do",
  "priority": "High"
}
```

### 3. Test Frontend Integration

```bash
# Khởi động frontend với API integration
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
npm install
npm run dev
```

Mở http://localhost:3000 và test:
- ✅ Đăng ký user mới
- ✅ Đăng nhập
- ✅ Tạo project
- ✅ Tạo task
- ✅ Update task status
- ✅ Thêm comment

---

## Frontend-Backend Mapping Tests

### Mapping DTOs

Verify mapping giữa Frontend types và Backend DTOs:

#### User Mapping
```typescript
// Frontend: src/types/user.ts
interface User {
  id: string;          // Maps to: UserID (backend)
  email: string;       // Maps to: Email
  name: string;        // Maps to: Name
  avatar?: string;     // Maps to: Avatar
  role: string;        // Maps to: Role
}

// Backend: Models/DTOs/Auth/UserDto.cs
public class UserDto {
  public Guid UserID { get; set; }
  public string Email { get; set; }
  public string Name { get; set; }
  public string? Avatar { get; set; }
  public string Role { get; set; }
}
```

#### Project Mapping
```typescript
// Frontend: src/types/project.ts
interface Project {
  id: string;          // Maps to: ProjectID
  name: string;        // Maps to: Name
  description?: string;// Maps to: Description
  status: string;      // Maps to: Status
  priority: string;    // Maps to: Priority
}

// Backend: Models/DTOs/Project/ProjectDto.cs
public class ProjectDto {
  public Guid ProjectID { get; set; }
  public string Name { get; set; }
  public string? Description { get; set; }
  public string Status { get; set; }
  public string Priority { get; set; }
}
```

#### Task Mapping
```typescript
// Frontend: src/types/task.ts
interface Task {
  id: string;          // Maps to: TaskID
  projectId: string;   // Maps to: ProjectID
  title: string;       // Maps to: Title
  description?: string;// Maps to: Description
  status: string;      // Maps to: Status
  priority: string;    // Maps to: Priority
  assigneeId?: string; // Maps to: AssigneeID
  dueDate?: Date;      // Maps to: DueDate
}

// Backend: Models/DTOs/Task/TaskDto.cs
public class TaskDto {
  public Guid TaskID { get; set; }
  public Guid ProjectID { get; set; }
  public string Title { get; set; }
  public string? Description { get; set; }
  public string Status { get; set; }
  public string Priority { get; set; }
  public Guid? AssigneeID { get; set; }
  public DateTime? DueDate { get; set; }
}
```

### Test Mapping Script

Chạy test để verify tất cả mappings:

```bash
npm run test:mapping
```

File test: `tests/mapping-test.ts`

---

## Database Testing

### Connect to SQL Server trong Docker

```bash
# Get SQL Server container ID
docker ps | grep sqlserver

# Connect to SQL Server
docker exec -it taskflow-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong"

# Run queries
SELECT * FROM Sites;
SELECT * FROM Users WHERE IsDeleted = 0;
SELECT * FROM Projects WHERE IsDeleted = 0;
SELECT * FROM Tasks WHERE IsDeleted = 0;
GO
```

### Verify Multi-Tenant Isolation

```sql
-- Should see multiple sites
SELECT SiteID, SiteName, SiteCode FROM Sites;

-- Check users per site
SELECT s.SiteName, COUNT(u.UserID) as UserCount
FROM Sites s
LEFT JOIN Users u ON s.SiteID = u.SiteID AND u.IsDeleted = 0
GROUP BY s.SiteName;

-- Check data isolation
SELECT
    s.SiteName,
    COUNT(DISTINCT p.ProjectID) as Projects,
    COUNT(DISTINCT t.TaskID) as Tasks
FROM Sites s
LEFT JOIN Projects p ON s.SiteID = p.SiteID AND p.IsDeleted = 0
LEFT JOIN Tasks t ON s.SiteID = t.SiteID AND t.IsDeleted = 0
GROUP BY s.SiteName;
```

---

## Performance Testing

### Load Test với Artillery

Install Artillery:
```bash
npm install -g artillery
```

Create test config `artillery-config.yml`:
```yaml
config:
  target: "http://localhost:5001"
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "API Load Test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@acme.com"
            password: "admin123"
            siteCode: "ACME"
          capture:
            - json: "$.data.accessToken"
              as: "token"
      - get:
          url: "/api/projects"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/tasks"
          headers:
            Authorization: "Bearer {{ token }}"
```

Run load test:
```bash
artillery run artillery-config.yml
```

---

## Troubleshooting

### SQL Server không khởi động

```bash
# Check logs
docker-compose logs sqlserver

# Restart container
docker-compose restart sqlserver

# Check if port 1433 is available
netstat -ano | findstr :1433  # Windows
lsof -i :1433                 # Mac/Linux
```

### Backend API không kết nối database

```bash
# Check backend logs
docker-compose logs backend

# Verify connection string
docker-compose exec backend printenv | grep ConnectionStrings

# Test SQL connection manually
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong" -Q "SELECT 1"
```

### Frontend không kết nối Backend

```bash
# Check CORS settings in Backend
# Verify API_BASE_URL in frontend

# Test API directly
curl http://localhost:5001/health

# Check network
docker network ls
docker network inspect taskflow-network
```

### Tests thất bại

```bash
# Run tests với verbose logging
docker-compose logs -f backend &
npm run test:verbose

# Check database state
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong" -d TaskFlowDB_Dev -Q "SELECT COUNT(*) FROM Users"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port conflicts

```bash
# If port 5001 is in use
netstat -ano | findstr :5001  # Windows
lsof -i :5001                 # Mac/Linux

# Kill process using port
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux

# Or change port in docker-compose.yml
```

---

## Test Coverage

### Backend Coverage Goal

- ✅ Controllers: 80%+
- ✅ Services: 90%+
- ✅ Repositories: 85%+
- ✅ Overall: 85%+

### Frontend Coverage Goal

- ✅ Components: 70%+
- ✅ Services/API: 90%+
- ✅ Utils: 85%+
- ✅ Overall: 75%+

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Automated Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Run E2E Tests
      run: |
        chmod +x scripts/run-tests.sh
        ./scripts/run-tests.sh

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

---

## Các Lệnh Hữu Ích

```bash
# Khởi động full stack
docker-compose up -d

# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f backend
docker-compose logs -f sqlserver

# Stop tất cả services
docker-compose down

# Stop và xóa volumes (reset database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Check health của services
docker-compose ps

# Execute command trong container
docker-compose exec backend bash
docker-compose exec sqlserver bash

# View database
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong"
```

---

## Summary

✅ **Automated Testing**: Chạy full test suite với 1 lệnh
✅ **Manual Testing**: Test thủ công với Swagger UI
✅ **Integration Testing**: Verify frontend-backend integration
✅ **Database Testing**: Multi-tenant data isolation
✅ **Performance Testing**: Load testing với Artillery
✅ **CI/CD Ready**: GitHub Actions workflow

**Chạy test ngay bây giờ:**
```powershell
.\scripts\run-tests.ps1
```

Tất cả tests sẽ tự động chạy và báo cáo kết quả! 🚀
