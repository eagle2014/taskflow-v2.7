# Hướng dẫn tạo Docker SQL Server với file MDF có sẵn

## Bước 1: Init database lần đầu

1. Khởi động SQL Server với docker-compose.sql.yml:
```bash
docker compose -f docker/docker-compose.sql.yml up
```

2. Đợi cho quá trình init hoàn tất (khi thấy message "Database ready!")

3. Tìm container ID của SQL Server:
```bash
docker ps
```

4. Copy file MDF và LDF ra thư mục local:
```bash
# Tạo thư mục để chứa files
mkdir -p docker/database/data

# Copy từ container ra
docker cp taskflow-sqlserver:/var/opt/mssql/data/TaskFlowDB_Dev.mdf docker/database/data/
docker cp taskflow-sqlserver:/var/opt/mssql/data/TaskFlowDB_Dev_log.ldf docker/database/data/
```

5. Dừng và xóa containers:
```bash
docker compose -f docker/docker-compose.sql.yml down
```

## Bước 2: Tạo Docker Compose mới

1. Tạo file docker/database/docker-compose.yml với nội dung:
```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: taskflow-sqlserver
    environment:
      - ACCEPT_EULA=Y 
      - SA_PASSWORD=TaskFlow@2025!Strong
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - ./data:/var/opt/mssql/data      # Mount thư mục chứa file MDF/LDF
      - ./backup:/var/opt/mssql/backup  # Mount thư mục backup nếu cần
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaskFlow@2025!Strong" -Q "SELECT 1" || exit 1
      interval: 10s
      timeout: 3s
      retries: 10
      start_period: 10s
    networks:
      - taskflow-network
    restart: unless-stopped

networks:
  taskflow-network:
    driver: bridge
```

2. Tạo thư mục backup:
```bash
mkdir -p docker/database/backup
```

## Bước 3: Cập nhật file docker-compose.yml chính

1. Cập nhật file docker/docker-compose.yml để sử dụng cấu hình mới:
```yaml
version: '3.8'

services:
  # Database services
  sqlserver:
    extends:
      file: ./database/docker-compose.yml
      service: sqlserver

  # Backend services
  backend:
    extends:
      file: ./backend/docker-compose.yml
      service: backend
    depends_on:
      sqlserver:
        condition: service_healthy

  # Frontend services
  frontend:
    extends:
      file: ./frontend/docker-compose.yml
      service: frontend
    depends_on:
      - backend

networks:
  taskflow-network:
    driver: bridge
```

## Bước 4: Xóa các file không cần thiết

1. Sau khi đã copy file MDF/LDF thành công và kiểm tra mọi thứ hoạt động tốt, có thể xóa:
- docker-compose.sql.yml
- docker-compose.backend.yml (phần SQL)
- Các file SQL scripts không cần thiết nữa

## Lợi ích:
1. Khởi động nhanh hơn vì không cần chạy scripts
2. Cấu hình đơn giản hơn
3. Dữ liệu được lưu trữ trong file MDF/LDF
4. Giảm rủi ro lỗi khi chạy scripts

## Lưu ý:
1. Backup file MDF/LDF thường xuyên
2. Nếu cần update schema, tạo script riêng để update
3. Có thể tạo volume Docker để lưu trữ data thay vì bind mount
4. Kiểm tra quyền truy cập file MDF/LDF