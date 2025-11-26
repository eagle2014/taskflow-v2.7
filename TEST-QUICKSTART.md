# 🚀 TaskFlow - Quick Test Guide

Hướng dẫn nhanh để test toàn bộ hệ thống TaskFlow (Frontend + Backend + Database).

## ⚡ Chạy Test Tự Động (1 Lệnh)

### Windows (PowerShell)
```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"
npm run test:docker
```

### Linux/Mac/Git Bash
```bash
cd "/d/TFS/aidev/Modern Task Management System_v2.7"
npm run test:docker:bash
```

**Lệnh này sẽ tự động:**
1. ✅ Khởi động SQL Server trong Docker
2. ✅ Tạo database TaskFlowDB_Dev
3. ✅ Chạy tất cả migrations (schema + stored procedures)
4. ✅ Seed sample data (2 tenants, users, projects, tasks)
5. ✅ Khởi động Backend API (.NET 8)
6. ✅ Chạy 15 end-to-end tests
7. ✅ Báo cáo kết quả chi tiết

## 📊 Kết Quả Mong Đợi

```
==================================================
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

✅ ALL TESTS PASSED!
```

## 🔧 Các Lệnh Hữu Ích

```bash
# Khởi động services
npm run docker:up

# Stop services
npm run docker:down

# Reset database (xóa hết và tạo lại)
npm run docker:reset

# Xem logs
npm run docker:logs

# Xem logs backend
npm run docker:logs:backend

# Xem logs SQL Server
npm run docker:logs:sql

# Chạy E2E tests (không reset Docker)
npm run test:e2e
```

## 🌐 Truy Cập Services

Sau khi chạy `npm run docker:up`:

- **Backend API (Swagger)**: http://localhost:5001
- **SQL Server**: localhost:1433
  - User: `sa`
  - Password: `TaskFlow@2025!Strong`
  - Database: `TaskFlowDB_Dev`

## 🧪 Test Thủ Công với Swagger

1. Mở http://localhost:5001
2. Click **POST /api/auth/register**
3. Nhập:
```json
{
  "email": "test@acme.com",
  "password": "Test123!",
  "name": "Test User",
  "siteCode": "ACME"
}
```
4. Click **Execute**
5. Copy `accessToken`
6. Click nút **Authorize** ở đầu trang
7. Nhập: `Bearer YOUR_TOKEN_HERE`
8. Test các endpoints khác!

## 📋 Sample Login Credentials

Sau khi seed data chạy thành công:

**Site: ACME**
- Email: `admin@acme.com`
- Password: `admin123`
- Role: Admin

**Site: TECHSTART**
- Email: `ceo@techstart.com`
- Password: `admin123`
- Role: Admin

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra port 5001
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F
```

### SQL Server không khởi động
```bash
# Xem logs
npm run docker:logs:sql

# Restart
docker-compose restart sqlserver
```

### Backend không kết nối database
```bash
# Xem logs backend
npm run docker:logs:backend

# Reset tất cả
npm run docker:reset
```

## 📖 Tài Liệu Chi Tiết

- [TESTING.md](TESTING.md) - Hướng dẫn testing đầy đủ
- [Backend/README.md](Backend/README.md) - Backend API documentation
- [Backend/QUICKSTART.md](Backend/QUICKSTART.md) - Backend setup guide
- [CLAUDE.md](CLAUDE.md) - Tổng quan architecture

## ✅ Test Coverage

**Backend:**
- 9 Controllers với 59 endpoints
- 8 Repositories
- 62 Stored Procedures
- Multi-tenant isolation
- JWT authentication

**Frontend:**
- API Client với auto token refresh
- Type-safe DTOs matching backend
- Error handling
- CORS configuration

**Database:**
- 2 Sample tenants (ACME, TECHSTART)
- 6 Sample users
- 3 Projects
- 5 Tasks
- 5 Comments
- 4 Events

## 🎯 Next Steps

1. ✅ Chạy tests: `npm run test:docker`
2. ✅ Test thủ công với Swagger: http://localhost:5001
3. ✅ Connect frontend với backend
4. ✅ Deploy to production

**Chúc bạn test thành công! 🚀**
