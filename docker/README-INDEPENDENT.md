# Independent Docker Services

Start 3 services riêng lẻ để test hệ thống.

## Cấu trúc

```
docker/
├── sql.yml         ← SQL Server standalone
├── backend.yml     ← Backend API standalone
├── frontend.yml    ← Frontend standalone
├── start-all.ps1   ← Start tất cả (PowerShell)
├── start-all.sh    ← Start tất cả (Bash)
├── stop-all.ps1    ← Stop tất cả (PowerShell)
└── stop-all.sh     ← Stop tất cả (Bash)
```

---

## Cách sử dụng

### Option 1: Start tất cả cùng lúc (PowerShell)

```powershell
cd docker
.\start-all.ps1
```

### Option 2: Start tất cả cùng lúc (Bash/Git Bash)

```bash
cd docker
./start-all.sh
```

### Option 3: Start từng service riêng lẻ

```bash
cd docker

# Start SQL Server trước
docker-compose -f sql.yml up -d

# Đợi SQL ready, rồi start Backend
docker-compose -f backend.yml up -d

# Cuối cùng start Frontend
docker-compose -f frontend.yml up -d
```

---

## Stop services

### Stop tất cả

```powershell
# PowerShell
.\stop-all.ps1

# Bash
./stop-all.sh
```

### Stop từng service riêng

```bash
docker-compose -f frontend.yml down
docker-compose -f backend.yml down
docker-compose -f sql.yml down
```

---

## Test từng service riêng

### Test 1: Chỉ SQL Server

```bash
docker-compose -f sql.yml up -d

# Check logs
docker logs -f taskflow-sqlserver

# Test connection
docker exec -it taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P TaskFlow@2025!Strong -C -Q "SELECT name FROM sys.databases"
```

### Test 2: SQL + Backend

```bash
# SQL đã chạy ở trên
docker-compose -f backend.yml up -d

# Check logs
docker logs -f taskflow-backend

# Test API
curl http://localhost:5001/api/health
```

### Test 3: Full stack

```bash
# SQL + Backend đã chạy
docker-compose -f frontend.yml up -d

# Check logs
docker logs -f taskflow-frontend

# Mở browser
http://localhost:3000
```

---

## Rebuild services

### Rebuild Backend

```bash
docker-compose -f backend.yml down
docker-compose -f backend.yml build --no-cache
docker-compose -f backend.yml up -d
```

### Rebuild Frontend

```bash
docker-compose -f frontend.yml down
docker-compose -f frontend.yml build --no-cache
docker-compose -f frontend.yml up -d
```

---

## Network

Tất cả 3 services dùng chung network: `taskflow-network`

- SQL Server tạo network
- Backend + Frontend join vào network đó
- Services giao tiếp qua container names:
  - SQL: `taskflow-sqlserver`
  - Backend: `taskflow-backend`
  - Frontend: `taskflow-frontend`

---

## Service URLs

- **SQL Server**: `localhost:1433`
- **Backend API**: `http://localhost:5001`
- **Frontend**: `http://localhost:3000`

---

## Logs

```bash
# Real-time logs
docker logs -f taskflow-sqlserver
docker logs -f taskflow-backend
docker logs -f taskflow-frontend

# Last 100 lines
docker logs --tail 100 taskflow-sqlserver
docker logs --tail 100 taskflow-backend
docker logs --tail 100 taskflow-frontend
```

---

## Troubleshooting

### SQL Server không healthy

```bash
docker logs taskflow-sqlserver

# Restart
docker-compose -f sql.yml restart
```

### Backend không connect được SQL

```bash
# Check network
docker network inspect taskflow-network

# Check SQL Server từ Backend container
docker exec taskflow-backend ping taskflow-sqlserver
```

### Frontend không connect được Backend

```bash
# Check backend health
curl http://localhost:5001/api/health

# Check frontend logs
docker logs taskflow-frontend
```

### Reset toàn bộ

```bash
# Stop tất cả
docker-compose -f frontend.yml down
docker-compose -f backend.yml down
docker-compose -f sql.yml down -v

# Xóa data
rm -rf sqlserver/data sqlserver/log

# Start lại
./start-all.sh
```

---

## So sánh với setup khác

### Single compose (docker-compose.yml)
```bash
docker-compose up -d    # Start tất cả
```
- ✅ Đơn giản
- ❌ Khó test riêng từng service
- ❌ Rebuild 1 service → rebuild tất cả

### Independent compose (sql.yml, backend.yml, frontend.yml)
```bash
docker-compose -f sql.yml up -d
docker-compose -f backend.yml up -d
docker-compose -f frontend.yml up -d
```
- ✅ Test riêng từng service
- ✅ Rebuild chỉ service cần thiết
- ✅ Debug dễ hơn
- ❌ Phải quản lý 3 files

---

## Development workflow

1. **Develop Backend**: Chỉ rebuild backend
   ```bash
   docker-compose -f backend.yml down
   # Edit code...
   docker-compose -f backend.yml up -d --build
   ```

2. **Develop Frontend**: Chỉ rebuild frontend
   ```bash
   docker-compose -f frontend.yml down
   # Edit code...
   docker-compose -f frontend.yml up -d --build
   ```

3. **Reset DB**: Chỉ reset SQL
   ```bash
   docker-compose -f sql.yml down -v
   rm -rf sqlserver/data
   docker-compose -f sql.yml up -d
   ```

---

## Production deployment

Để deploy production, dùng master compose file:

```bash
docker-compose up -d
```

Hoặc scale services:

```bash
docker-compose up -d --scale backend=3
```