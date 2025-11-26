# Simple SQL Server Docker Setup

## Cấu trúc đơn giản - 1 service duy nhất

### Ưu điểm
✅ **1 service** thay vì 2 (sqlserver + db-init)
✅ **Tự động init** scripts khi tạo DB lần đầu
✅ **Persist data** trong folder `sqlserver/data` (MDF/LDF files)
✅ **Không cần recreate** - attach MDF file khi restart

---

## Cách sử dụng

### Lần đầu tiên
```bash
cd docker
docker-compose -f docker-compose.simple.yml up -d
```

### Kiểm tra logs
```bash
docker logs -f taskflow-sqlserver
```

### Stop
```bash
docker-compose -f docker-compose.simple.yml down
```

### Start lại (data vẫn còn)
```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Xóa hoàn toàn (bao gồm data)
```bash
docker-compose -f docker-compose.simple.yml down -v
rm -rf sqlserver/data sqlserver/log sqlserver/backup
```

---

## Cấu trúc folder

```
docker/
├── docker-compose.simple.yml   ← Compose file đơn giản
├── init-db.sh                  ← Script tự động init DB
└── sqlserver/                  ← Folder lưu data (tự tạo)
    ├── data/                   ← MDF files (database files)
    ├── log/                    ← LDF files (log files)
    └── backup/                 ← Backup files
```

---

## Cách hoạt động

1. **Lần đầu start**:
   - Container start SQL Server
   - Chạy init-db.sh script
   - Kiểm tra DB có tồn tại chưa
   - Nếu chưa → Chạy `00_Full_Schema_And_Data.sql`
   - Tạo MDF/LDF trong folder `sqlserver/data`

2. **Lần sau start**:
   - Container start SQL Server
   - SQL Server tự động attach MDF file từ folder
   - Script kiểm tra và skip init (DB đã tồn tại)
   - Data vẫn còn nguyên

---

## So sánh với setup cũ

### Setup cũ (2 services)
```yaml
services:
  sqlserver:      # Service 1
    ...
  db-init:        # Service 2 - chạy riêng
    depends_on: sqlserver
    command: bash -c "..."
```

### Setup mới (1 service)
```yaml
services:
  sqlserver:      # Service duy nhất
    command: >
      /bin/bash -c "
      /opt/mssql/bin/sqlservr &
      /bin/bash /init-db.sh
      wait
      "
```

---

## Troubleshooting

### Nếu muốn reset DB hoàn toàn
```bash
# Stop container
docker-compose -f docker-compose.simple.yml down

# Xóa data folder
rm -rf sqlserver/data sqlserver/log

# Start lại (sẽ init từ đầu)
docker-compose -f docker-compose.simple.yml up -d
```

### Nếu muốn backup
```bash
# Copy MDF/LDF files
cp sqlserver/data/*.mdf /path/to/backup/
cp sqlserver/data/*.ldf /path/to/backup/
```

### Nếu muốn restore từ backup
```bash
# Stop container
docker-compose -f docker-compose.simple.yml down

# Copy backup files vào
cp /path/to/backup/*.mdf sqlserver/data/
cp /path/to/backup/*.ldf sqlserver/data/

# Start lại
docker-compose -f docker-compose.simple.yml up -d
```

---

## Connection String

Backend sẽ connect như bình thường:
```
Server=localhost,1433;Database=TaskFlowDB_Dev;User Id=sa;Password=TaskFlow@2025!Strong;TrustServerCertificate=True
```

---

## Notes

- **SA_PASSWORD**: `TaskFlow@2025!Strong`
- **Database name**: `TaskFlowDB_Dev`
- **Port**: `1433`
- **Init script**: Chỉ chạy 1 lần khi DB chưa tồn tại
- **Data persistence**: MDF/LDF lưu trong `docker/sqlserver/data`
