# 🚀 TaskFlow - UAT Quick Start

Complete guide to run the entire TaskFlow system for User Acceptance Testing.

## ⚠️ Prerequisites

- ✅ Docker Desktop running
- ✅ .NET 8.0 SDK installed
- ✅ Node.js 20+ installed

---

## 📝 Step 1: Initialize Database

Open PowerShell and run:

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# Start SQL Server
docker-compose -f docker-compose.sql.yml up -d sqlserver

# Wait for SQL Server to start (25 seconds)
Start-Sleep -Seconds 25

# Initialize database with schema and sample data
.\init-database-simple.ps1
```

**Expected output:**
```
✅ SQL Server is running
✅ Schema created successfully
✅ Sample data seeded successfully

Sample Login Credentials:
  Site: ACME
    Email: admin@acme.com
    Password: admin123
```

---

## 📝 Step 2: Start Backend API

Open a **NEW PowerShell window** (Terminal 2):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7\Backend\TaskFlow.API"

# First time only: restore packages
dotnet restore

# Start backend
dotnet run
```

**Expected output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5001
```

✅ **Test Backend:** Open http://localhost:5001 (should see Swagger UI)

---

## 📝 Step 3: Start Frontend

Open a **NEW PowerShell window** (Terminal 3):

```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7"

# First time only: install dependencies
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
VITE v6.3.5  ready in 500 ms
  ➜  Local:   http://localhost:3000/
```

✅ **Test Frontend:** Open http://localhost:3000

---

## 🧪 Step 4: Test the System

### Option A: Test Backend API (Swagger)

1. Open **http://localhost:5001**
2. Click **POST /api/auth/login**
3. Click "Try it out"
4. Enter credentials:
```json
{
  "email": "admin@acme.com",
  "password": "admin123",
  "siteCode": "ACME"
}
```
5. Click "Execute"
6. Copy the `accessToken` from the response
7. Click the **"Authorize"** button at top of page
8. Enter: `Bearer YOUR_ACCESS_TOKEN`
9. Click "Authorize"
10. Now test other endpoints!

### Option B: Test Frontend

1. Open **http://localhost:3000**
2. Login with:
   - Email: `admin@acme.com`
   - Password: `admin123`
3. Navigate through the app!

---

## ✅ Sample Data Available

### 🏢 Tenants
- **ACME Corporation** (SiteCode: ACME)
- **Tech Startup Inc** (SiteCode: TECHSTART)

### 👤 Sample Users

**ACME:**
- admin@acme.com / admin123 (Admin)
- manager@acme.com / admin123 (Manager)
- john@acme.com / admin123 (Member)
- jane@acme.com / admin123 (Member)

**TECHSTART:**
- ceo@techstart.com / admin123 (Admin)
- dev@techstart.com / admin123 (Manager)

### 📊 Sample Data
- ✅ 3 Categories
- ✅ 3 Projects
- ✅ 5 Tasks with assignments
- ✅ 5 Comments
- ✅ 4 Calendar Events
- ✅ 2 Spaces
- ✅ 4 Phases

---

## 🐛 Troubleshooting

### SQL Server won't start
```powershell
# Check Docker Desktop is running
docker ps

# Check logs
docker logs taskflow-sqlserver

# Restart
docker restart taskflow-sqlserver
```

### Backend won't connect to database
```powershell
# Check connection string in:
# Backend\TaskFlow.API\appsettings.Development.json

# Should be:
"Server=localhost;Database=TaskFlowDB_Dev;User Id=sa;Password=TaskFlow@2025!Strong;..."
```

### Port 5001 already in use
```powershell
# Find process using port
netstat -ano | findstr :5001

# Kill it
taskkill /PID <PID> /F
```

### Port 3000 already in use
```powershell
# Vite will auto-select next available port (5173, 5174, etc.)
# Or kill process using port 3000
```

### "User not found" when logging in
```powershell
# Re-run database initialization
.\init-database-simple.ps1
```

---

## 🛑 Stop All Services

```powershell
# Backend: Ctrl+C in Terminal 2
# Frontend: Ctrl+C in Terminal 3

# SQL Server:
docker-compose -f docker-compose.sql.yml down

# To completely reset database:
docker-compose -f docker-compose.sql.yml down -v
```

---

## 📋 UAT Test Checklist

### Authentication
- [ ] Login with admin@acme.com works
- [ ] Login with wrong password fails
- [ ] Login with wrong siteCode fails
- [ ] Token refresh works

### Multi-Tenant Isolation
- [ ] ACME user can only see ACME data
- [ ] TECHSTART user can only see TECHSTART data
- [ ] Cross-tenant access blocked

### Projects
- [ ] Get all projects
- [ ] Create new project
- [ ] Update project
- [ ] Delete project

### Tasks
- [ ] Get all tasks
- [ ] Create task
- [ ] Assign task to user
- [ ] Update task status
- [ ] Delete task

### Comments
- [ ] Add comment to task
- [ ] Get task comments
- [ ] Update own comment
- [ ] Cannot update others' comments

### Calendar Events
- [ ] Create event
- [ ] Get events
- [ ] Update event
- [ ] Delete event

---

## 📖 Additional Documentation

- [TESTING.md](TESTING.md) - Full testing guide
- [Backend/README.md](Backend/README.md) - Backend API docs
- [Backend/QUICKSTART.md](Backend/QUICKSTART.md) - Backend setup details
- [CLAUDE.md](CLAUDE.md) - Architecture overview

---

**Ready to test! 🎉**
