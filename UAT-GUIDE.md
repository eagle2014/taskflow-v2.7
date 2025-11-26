# 🧪 TaskFlow - UAT (User Acceptance Testing) Guide

Hướng dẫn chạy Frontend và Backend để thực hiện UAT testing.

## 📋 Chuẩn Bị

### Yêu Cầu
- ✅ Docker Desktop đang chạy
- ✅ .NET 8.0 SDK đã cài đặt
- ✅ Node.js 20+ đã cài đặt

## 🚀 Bước 1: Khởi Động SQL Server

```powershell
# Windows PowerShell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# Khởi động SQL Server trong Docker
docker-compose -f docker-compose.sql.yml up -d

# Chờ 30 giây để database khởi tạo
timeout /t 30

# Kiểm tra SQL Server đã chạy
docker ps | findstr taskflow-sqlserver
```

**Linux/Mac:**
```bash
cd "/d/TFS/aidev/Modern Task Management System_v2.7"
docker-compose -f docker-compose.sql.yml up -d
sleep 30
docker ps | grep taskflow-sqlserver
```

## 🔧 Bước 2: Khởi Động Backend API

Mở **Terminal/PowerShell mới**:

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7\Backend\TaskFlow.API"

# Restore dependencies (chỉ cần lần đầu)
dotnet restore

# Chạy backend
dotnet run
```

**Kết quả mong đợi:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Test Backend:**
- Swagger UI: http://localhost:5001
- Health Check: http://localhost:5001/health

## 🎨 Bước 3: Khởi Động Frontend

Mở **Terminal/PowerShell mới** (terminal thứ 2):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# Install dependencies (chỉ cần lần đầu)
npm install

# Khởi động frontend
npm run dev
```

**Kết quả mong đợi:**
```
VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Test Frontend:**
- Mở trình duyệt: http://localhost:3000

## ✅ UAT Test Checklist

### 1. Backend API Testing (Swagger)

Mở http://localhost:5001 và test:

#### ✅ Authentication Flow
- [ ] **POST /api/auth/register** - Đăng ký user mới
  ```json
  {
    "email": "uat@acme.com",
    "password": "UAT123!",
    "name": "UAT Tester",
    "siteCode": "ACME"
  }
  ```
  - Copy `accessToken` từ response

- [ ] **Authorize** - Click nút "Authorize"
  - Nhập: `Bearer YOUR_ACCESS_TOKEN`
  - Click "Authorize"

- [ ] **GET /api/auth/me** - Lấy thông tin user hiện tại
  - Verify user data returned

#### ✅ Project Management
- [ ] **POST /api/categories** - Tạo category
  ```json
  {
    "name": "UAT Testing Category",
    "description": "Category for UAT",
    "color": "#3B82F6"
  }
  ```
  - Copy `categoryID`

- [ ] **POST /api/projects** - Tạo project
  ```json
  {
    "name": "UAT Test Project",
    "description": "Project for UAT testing",
    "categoryID": "PASTE_CATEGORY_ID_HERE",
    "status": "Active",
    "priority": "High"
  }
  ```
  - Copy `projectID`

- [ ] **GET /api/projects** - Lấy tất cả projects
  - Verify project vừa tạo có trong list

#### ✅ Task Management
- [ ] **POST /api/tasks** - Tạo task
  ```json
  {
    "projectID": "PASTE_PROJECT_ID_HERE",
    "title": "UAT Test Task",
    "description": "Testing task creation",
    "status": "To Do",
    "priority": "High",
    "estimatedHours": 8
  }
  ```
  - Copy `taskID`

- [ ] **GET /api/tasks/project/{projectId}** - Lấy tasks của project
  - Verify task vừa tạo có trong list

- [ ] **PUT /api/tasks/{taskId}** - Update task
  ```json
  {
    "status": "In Progress",
    "actualHours": 2
  }
  ```
  - Verify task được update

#### ✅ Comments & Events
- [ ] **POST /api/comments** - Tạo comment
  ```json
  {
    "taskID": "PASTE_TASK_ID_HERE",
    "content": "This is a UAT test comment"
  }
  ```

- [ ] **GET /api/comments/task/{taskId}** - Lấy comments
  - Verify comment vừa tạo

- [ ] **POST /api/events** - Tạo event
  ```json
  {
    "title": "UAT Test Meeting",
    "description": "Testing event creation",
    "type": "meeting",
    "date": "2025-11-01",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "color": "#3B82F6"
  }
  ```

- [ ] **GET /api/events** - Lấy tất cả events
  - Verify event vừa tạo

### 2. Frontend Testing (với mockApi)

Mở http://localhost:3000:

#### ✅ Authentication
- [ ] Click "Sign In" / Login
- [ ] Sử dụng credentials sample:
  - Email: `admin@acme.com`
  - Password: `admin123`
  - (hoặc tạo user mới nếu có Register form)
- [ ] Verify login thành công
- [ ] Verify hiển thị user name/avatar

#### ✅ Dashboard
- [ ] Verify Dashboard hiển thị
- [ ] Kiểm tra các widgets/stats
- [ ] Kiểm tra recent activities

#### ✅ Projects
- [ ] Navigate to Projects view
- [ ] Tạo project mới
- [ ] Edit project
- [ ] Verify project hiển thị trong list
- [ ] Delete project

#### ✅ Tasks
- [ ] Navigate to Tasks view
- [ ] Tạo task mới
- [ ] Drag & drop task giữa các columns (Board view)
- [ ] Update task status
- [ ] Edit task details
- [ ] Add comment to task
- [ ] Verify comment hiển thị

#### ✅ Calendar/Events
- [ ] Navigate to Calendar view
- [ ] Tạo event mới
- [ ] Verify event hiển thị trên calendar
- [ ] Click event để xem details

#### ✅ UI/UX Testing
- [ ] Dark mode hoạt động
- [ ] Responsive design (resize browser)
- [ ] Icons hiển thị đúng
- [ ] Colors/Theming nhất quán
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications

### 3. Integration Testing (Frontend + Backend)

**Để test integration, cần update frontend để sử dụng real API:**

1. Update `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:5001/api';
   ```

2. Replace mockApi calls với real API calls trong components

3. Test lại toàn bộ flow

### 4. Multi-Tenant Testing

#### Test với Site ACME
- [ ] Register user: `user1@acme.com` với siteCode: `ACME`
- [ ] Tạo project cho ACME
- [ ] Tạo task cho ACME

#### Test với Site TECHSTART
- [ ] Register user: `user1@techstart.com` với siteCode: `TECHSTART`
- [ ] Tạo project cho TECHSTART
- [ ] Verify KHÔNG thấy data của ACME

#### Verify Data Isolation
```sql
-- Connect to SQL Server
docker exec -it taskflow-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong"

-- Check users per site
SELECT s.SiteName, u.Email, u.Name
FROM Sites s
JOIN Users u ON s.SiteID = u.SiteID
WHERE u.IsDeleted = 0
GO

-- Check projects per site
SELECT s.SiteName, p.Name, p.Status
FROM Sites s
JOIN Projects p ON s.SiteID = p.SiteID
WHERE p.IsDeleted = 0
GO
```

## 📊 UAT Test Report Template

### Test Summary
- **Tester**: [Tên người test]
- **Date**: [Ngày test]
- **Environment**: Local Development
- **Backend**: .NET 8.0 API @ http://localhost:5001
- **Frontend**: React @ http://localhost:3000
- **Database**: SQL Server 2022 in Docker

### Results

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅/❌ | |
| User Login | ✅/❌ | |
| Create Project | ✅/❌ | |
| Create Task | ✅/❌ | |
| Update Task | ✅/❌ | |
| Add Comment | ✅/❌ | |
| Create Event | ✅/❌ | |
| Multi-Tenant Isolation | ✅/❌ | |
| UI/UX | ✅/❌ | |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]

## 🐛 Troubleshooting

### SQL Server không khởi động
```powershell
# Xem logs
docker logs taskflow-sqlserver

# Restart
docker restart taskflow-sqlserver
```

### Backend lỗi connection
```powershell
# Verify connection string trong appsettings.Development.json
# Đảm bảo SQL Server đang chạy
docker ps | findstr taskflow-sqlserver
```

### Frontend không load
```powershell
# Clear cache và reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

## 🛑 Dừng Services

```powershell
# Stop backend (Ctrl+C trong terminal backend)
# Stop frontend (Ctrl+C trong terminal frontend)

# Stop SQL Server
docker-compose -f docker-compose.sql.yml down

# Hoặc giữ SQL Server chạy để test tiếp sau
```

## ✅ Sign-Off

UAT completed by: _________________

Date: _________________

Signature: _________________

Approved for Production: Yes ☐  No ☐

---

**Happy Testing! 🚀**
