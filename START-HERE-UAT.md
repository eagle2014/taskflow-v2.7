# 🚀 TaskFlow - UAT Quick Start

## Khởi Động Nhanh cho UAT (3 Bước)

### Bước 1: Khởi Động SQL Server

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
.\start-uat.ps1
```

**Hoặc thủ công:**
```powershell
docker-compose -f docker-compose.sql.yml up -d
```

⏳ Chờ 30 giây để SQL Server khởi tạo database

---

### Bước 2: Khởi Động Backend

Mở **Terminal mới**:

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7\Backend\TaskFlow.API"
dotnet restore  # Chỉ cần lần đầu
dotnet run
```

✅ Khi thấy: `Now listening on: http://localhost:5001`

**Test Backend:**
- Swagger UI: http://localhost:5001
- Health: http://localhost:5001/health

---

### Bước 3: Khởi Động Frontend

Mở **Terminal mới** (terminal thứ 2):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
npm install  # Chỉ cần lần đầu
npm run dev
```

✅ Khi thấy: `Local: http://localhost:3000/`

**Test Frontend:**
- Open: http://localhost:3000

---

## 🧪 Bắt Đầu UAT Testing

### Test Backend API (Swagger)

1. Mở http://localhost:5001
2. Click **POST /api/auth/register**
3. Nhập:
```json
{
  "email": "uat@acme.com",
  "password": "UAT123!",
  "name": "UAT Tester",
  "siteCode": "ACME"
}
```
4. Copy `accessToken`
5. Click **Authorize** button
6. Paste: `Bearer YOUR_TOKEN`
7. Test các endpoints khác!

### Test Frontend

1. Mở http://localhost:3000
2. Login với:
   - Email: `admin@acme.com`
   - Password: `admin123`
3. Test create project, task, comment, etc.

---

## 📋 UAT Checklist

Xem file chi tiết: **[UAT-GUIDE.md](UAT-GUIDE.md)**

### Quick Checklist

**Backend API:**
- [ ] User Registration
- [ ] User Login
- [ ] Create Category
- [ ] Create Project
- [ ] Create Task
- [ ] Update Task
- [ ] Add Comment
- [ ] Create Event
- [ ] Multi-Tenant Isolation

**Frontend:**
- [ ] Login
- [ ] Dashboard
- [ ] Projects CRUD
- [ ] Tasks CRUD
- [ ] Comments
- [ ] Calendar/Events
- [ ] UI/UX Testing

---

## 🗄️ Sample Data

Database đã có sẵn:

**Site: ACME**
- admin@acme.com / admin123 (Admin)
- manager@acme.com / admin123 (Manager)
- john@acme.com / admin123 (Member)

**Site: TECHSTART**
- ceo@techstart.com / admin123 (Admin)

**3 Projects, 5 Tasks, 5 Comments đã có sẵn**

---

## 🛑 Dừng Services

```powershell
# Backend: Ctrl+C trong terminal backend
# Frontend: Ctrl+C trong terminal frontend
# SQL Server:
docker-compose -f docker-compose.sql.yml down
```

---

## 🐛 Troubleshooting

### Port 5001 đã được sử dụng
```powershell
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### SQL Server không chạy
```powershell
docker ps | findstr taskflow-sqlserver
docker logs taskflow-sqlserver
docker restart taskflow-sqlserver
```

### Backend lỗi connection
Kiểm tra `Backend/TaskFlow.API/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskFlowDB_Dev;User Id=sa;Password=TaskFlow@2025!Strong;..."
  }
}
```

---

## 📊 UAT Status Dashboard

| Service | URL | Status |
|---------|-----|--------|
| SQL Server | localhost:1433 | Check: `docker ps` |
| Backend API | http://localhost:5001 | Check: `/health` |
| Backend Swagger | http://localhost:5001 | Browse |
| Frontend | http://localhost:3000 | Browse |

---

## ✅ UAT Sign-Off

**Test Date:** __________

**Tested By:** __________

**Results:**
- Backend API: ✅ ☐  ❌ ☐
- Frontend: ✅ ☐  ❌ ☐
- Integration: ✅ ☐  ❌ ☐
- Multi-Tenant: ✅ ☐  ❌ ☐

**Approved for Next Phase:** Yes ☐  No ☐

**Signature:** __________

---

**Happy Testing! 🎉**

Xem chi tiết hơn tại: [UAT-GUIDE.md](UAT-GUIDE.md)
