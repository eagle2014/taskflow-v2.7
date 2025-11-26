# 🚀 TaskFlow - Run UAT Testing

## Hướng dẫn chạy HOÀN CHỈNH để UAT Testing

### ⚠️ YÊU CẦU
- Docker Desktop đang chạy
- .NET 8.0 SDK đã cài
- Node.js 20+ đã cài

---

## 📝 BƯỚC 1: Khởi Động SQL Server

Mở **PowerShell**:

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# Khởi động SQL Server
docker-compose -f docker-compose.sql.yml up -d

# Chờ SQL Server khởi động (20 giây)
Start-Sleep -Seconds 20
```

---

## 📝 BƯỚC 2: Tạo Database và Seed Data

**Trong cùng PowerShell:**

```powershell
# Chạy script init database
.\init-database.ps1
```

**Kết quả mong đợi:**
```
================================================
TaskFlow Database Initialization
================================================

✅ SQL Server is running
✅ Database ready
✅ Schema Creation completed
✅ User Stored Procedures completed
✅ Project Stored Procedures completed
✅ Task Stored Procedures completed
...
✅ Sample Data Seeding completed

================================================
Database Initialization Complete!
================================================

Sample Login Credentials:
  Site: ACME
    Email: admin@acme.com
    Password: admin123
```

---

## 📝 BƯỚC 3: Khởi Động Backend API

Mở **PowerShell MỚI** (Terminal 2):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7\Backend\TaskFlow.API"

# Lần đầu tiên chạy:
dotnet restore

# Chạy backend
dotnet run
```

**Kết quả mong đợi:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5001
```

✅ **Test Backend:** Mở http://localhost:5001 (Swagger UI)

---

## 📝 BƯỚC 4: Khởi Động Frontend

Mở **PowerShell MỚI** (Terminal 3):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# Lần đầu tiên chạy:
npm install

# Chạy frontend
npm run dev
```

**Kết quả mong đợi:**
```
VITE v6.3.5  ready in 500 ms
  ➜  Local:   http://localhost:3000/
```

✅ **Test Frontend:** Mở http://localhost:3000

---

## 🧪 BƯỚC 5: BẮT ĐẦU UAT TESTING

### Option A: Test Backend API (Swagger)

1. Mở http://localhost:5001
2. Click **POST /api/auth/login**
3. Click "Try it out"
4. Nhập:
```json
{
  "email": "admin@acme.com",
  "password": "admin123",
  "siteCode": "ACME"
}
```
5. Click "Execute"
6. Copy `accessToken` từ response
7. Click nút **"Authorize"** ở đầu trang
8. Nhập: `Bearer YOUR_ACCESS_TOKEN`
9. Click "Authorize"
10. Bây giờ test các endpoints khác!

### Option B: Test Frontend

1. Mở http://localhost:3000
2. Login với:
   - Email: `admin@acme.com`
   - Password: `admin123`
3. Browse Dashboard, Projects, Tasks...

---

## ✅ Sample Data Có Sẵn

### 🏢 Tenants
- **ACME Corporation** (SiteCode: ACME)
- **Tech Startup Inc** (SiteCode: TECHSTART)

### 👤 Users

**ACME:**
- admin@acme.com / admin123 (Admin)
- manager@acme.com / admin123 (Manager)
- john@acme.com / admin123 (Member)
- jane@acme.com / admin123 (Member)

**TECHSTART:**
- ceo@techstart.com / admin123 (Admin)
- dev@techstart.com / admin123 (Manager)

### 📊 Data
- ✅ 3 Categories
- ✅ 3 Projects
- ✅ 5 Tasks
- ✅ 5 Comments
- ✅ 4 Events
- ✅ 2 Spaces
- ✅ 4 Phases

---

## 📋 UAT Test Checklist

### Backend API (Swagger - http://localhost:5001)

#### Authentication
- [ ] Login với admin@acme.com
- [ ] Register user mới
- [ ] Get current user (/api/auth/me)
- [ ] Logout
- [ ] Token refresh

#### Projects
- [ ] Get all projects
- [ ] Get project by ID
- [ ] Create project
- [ ] Update project
- [ ] Delete project
- [ ] Get projects by category

#### Tasks
- [ ] Get all tasks
- [ ] Get tasks by project
- [ ] Create task
- [ ] Update task
- [ ] Delete task
- [ ] Get tasks by assignee
- [ ] Get overdue tasks

#### Comments
- [ ] Get comments by task
- [ ] Create comment
- [ ] Update comment (own comments only)
- [ ] Delete comment (own comments only)

#### Events
- [ ] Get all events
- [ ] Create event
- [ ] Update event
- [ ] Delete event
- [ ] Get events by date range

### Frontend (http://localhost:3000)

#### UI/UX
- [ ] Login screen
- [ ] Dashboard loads
- [ ] Projects view
- [ ] Tasks view (List, Board, Gantt, etc.)
- [ ] Calendar view
- [ ] Dark mode works
- [ ] Responsive design

#### Functionality
- [ ] Create project
- [ ] Create task
- [ ] Drag & drop tasks (Board view)
- [ ] Update task status
- [ ] Add comment to task
- [ ] Create calendar event
- [ ] Search/Filter works

---

## 🐛 Troubleshooting

### SQL Server không chạy
```powershell
docker ps | findstr taskflow-sqlserver
docker logs taskflow-sqlserver
docker restart taskflow-sqlserver
```

### Database chưa có data
```powershell
# Chạy lại init script
.\init-database.ps1
```

### Backend lỗi connection
```powershell
# Kiểm tra connection string trong:
# Backend\TaskFlow.API\appsettings.Development.json

# Đảm bảo:
"Server=localhost;Database=TaskFlowDB_Dev;User Id=sa;Password=TaskFlow@2025!Strong;..."
```

### Port 5001 bị chiếm
```powershell
netstat -ano | findstr :5001
# Kill process nếu cần
taskkill /PID <PID> /F
```

### Port 3000 bị chiếm (Frontend)
```powershell
# Frontend sẽ tự chọn port khác (5173, 5174...)
# Hoặc stop process chiếm port 3000
```

---

## 🛑 Dừng Services

```powershell
# Backend: Ctrl+C trong terminal backend
# Frontend: Ctrl+C trong terminal frontend

# SQL Server:
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
docker-compose -f docker-compose.sql.yml down

# Keep data (không xóa volumes):
docker stop taskflow-sqlserver
```

---

## 📊 Tổng Kết

Khi hoàn thành UAT, điền form:

**UAT Sign-Off Form**

- Test Date: _______________
- Tester Name: _______________
- Backend Status: ✅ Pass / ❌ Fail
- Frontend Status: ✅ Pass / ❌ Fail
- Integration: ✅ Pass / ❌ Fail
- Multi-Tenant: ✅ Pass / ❌ Fail

**Issues Found:**
1. _______________
2. _______________

**Approved for Production:** ☐ Yes  ☐ No

**Signature:** _______________

---

## 🎯 Next Steps After UAT

1. Fix bugs found during UAT
2. Performance testing
3. Security audit
4. Production deployment (see Backend/DEPLOYMENT.md)

---

**Happy Testing! 🚀**
