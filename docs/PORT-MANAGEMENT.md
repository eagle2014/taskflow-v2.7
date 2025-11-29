# Port Management - Strict Port Configuration

## Overview

Hệ thống được cấu hình để **strictly enforce** các port cố định:
- **Frontend**: Port 5600 (Vite)
- **Backend**: Port 5001 (.NET API)

Các script tự động **kill processes** đang sử dụng port trước khi start services.

---

## Quick Commands

### Start All Services (Recommended)

```bash
npm start
```

**What it does:**
1. Kill process trên port 5600 (nếu có)
2. Kill process trên port 5001 (nếu có)
3. Start Backend API trong new window
4. Start Frontend trong new window

### Start Individual Services

**Frontend only:**
```bash
npm run dev
```
- Auto-kill port 5600
- Start Vite dev server

**Backend only:**
```bash
npm run backend
```
- Auto-kill port 5001
- Start .NET API

---

## Configuration Files

### Vite Config (Frontend)

**File**: `vite.config.ts`

```typescript
server: {
  port: 5600,
  strictPort: true,  // Throw error if port is busy
  open: true,
}
```

### Backend Config

**File**: `Backend/TaskFlow.API/Properties/launchSettings.json`

```json
{
  "applicationUrl": "http://localhost:5001"
}
```

---

## Scripts

### 1. start-all.ps1

**Location**: `scripts/start-all.ps1`

**Purpose**: Start both Frontend + Backend

**Features:**
- Kill processes on ports 5600 and 5001
- Start services in separate windows
- Display service URLs

**Usage:**
```bash
npm start
# or
powershell -ExecutionPolicy Bypass -File ./scripts/start-all.ps1
```

### 2. start-dev.ps1

**Location**: `scripts/start-dev.ps1`

**Purpose**: Start Frontend only

**Features:**
- Kill process on port 5600
- Start Vite dev server

**Usage:**
```bash
npm run dev
```

### 3. start-backend.ps1

**Location**: `scripts/start-backend.ps1`

**Purpose**: Start Backend only

**Features:**
- Kill process on port 5001
- Start .NET API

**Usage:**
```bash
npm run backend
```

---

## Manual Port Management

### Check Port Usage

**Windows:**
```powershell
# Check port 5600
netstat -ano | findstr :5600

# Check port 5001
netstat -ano | findstr :5001
```

### Kill Process Manually

**Windows:**
```powershell
# Find PID
$pid = (Get-NetTCPConnection -LocalPort 5600).OwningProcess

# Kill process
Stop-Process -Id $pid -Force
```

**Or one-liner:**
```powershell
Get-NetTCPConnection -LocalPort 5600 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## Troubleshooting

### Error: "Port 5600 is already in use"

**Cause**: Another process is using port 5600

**Solution:**
```bash
# Use auto-kill script
npm run dev

# Or manual kill
Get-NetTCPConnection -LocalPort 5600 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Error: "Port 5001 is already in use"

**Cause**: Backend API already running

**Solution:**
```bash
# Use auto-kill script
npm run backend

# Or manual kill
Get-NetTCPConnection -LocalPort 5001 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Services won't start in new windows

**Cause**: PowerShell execution policy

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or bypass for one command
powershell -ExecutionPolicy Bypass -File ./scripts/start-all.ps1
```

---

## Why Strict Ports?

### Benefits:

1. **Consistency**: Same URLs across all environments
2. **No guessing**: Always know where services are
3. **CORS**: Frontend CORS config points to exact backend URL
4. **Documentation**: URLs in docs always accurate
5. **API Clients**: Services can hardcode endpoints
6. **Docker**: Port mapping is predictable

### Drawbacks:

- Can't run multiple instances on same machine
- Need to kill old processes before starting

**Solution**: Auto-kill scripts handle this automatically!

---

## Port Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 5600 | http://localhost:5600 | React Vite dev server |
| Backend | 5001 | http://localhost:5001 | .NET Web API |
| Swagger | 5001 | http://localhost:5001/swagger | API Documentation |
| SQL Server | 1433 | localhost:1433 | Database (Docker) |

---

## Environment Variables

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5001/api
```

**Backend** (`appsettings.Development.json`):
```json
{
  "Urls": "http://localhost:5001",
  "CorsOrigins": ["http://localhost:5600"]
}
```

---

## Development Workflow

### Standard Workflow

```bash
# 1. Start all services
npm start

# 2. Open browser (auto-opens)
# Frontend: http://localhost:5600
# Backend: http://localhost:5001/swagger

# 3. Make changes
# Both services support hot reload

# 4. Stop services
# Ctrl+C in each terminal window
```

### Alternative: Manual Start

```bash
# Terminal 1: Backend
cd Backend/TaskFlow.API
dotnet watch run

# Terminal 2: Frontend
npm run dev:raw
```

**Note**: `npm run dev:raw` is the raw Vite command without auto-kill.

---

## CI/CD Considerations

**Docker Compose** uses same ports:
```yaml
services:
  frontend:
    ports:
      - "5600:5600"

  backend:
    ports:
      - "5001:5001"
```

**GitHub Actions** can use these ports safely in isolated runners.

---

## Best Practices

1. **Always use `npm start`** for development
2. **Don't manually change ports** in config files
3. **Use scripts** instead of killing processes manually
4. **Document port changes** if absolutely necessary
5. **Update all configs** if port must change (Vite, .NET, CORS, Docker)

---

## Future Enhancements

Possible improvements:

- [ ] Add health check endpoints
- [ ] Auto-detect available ports (optional mode)
- [ ] Port usage dashboard
- [ ] Service status CLI command
- [ ] Auto-restart on crash

---

**Last Updated**: 2025-11-29
**Author**: Development Team
