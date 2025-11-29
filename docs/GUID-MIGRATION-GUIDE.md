# Hướng Dẫn Migration Task IDs sang GUID

**Ngày**: 2025-11-28
**Mục đích**: Convert tất cả Task IDs sang format GUID hợp lệ để frontend có thể save description

## 🎯 Tại Sao Cần Migration?

### Vấn đề hiện tại:
- Frontend sử dụng mock data với task IDs dạng `"task-1"`, `"task-2"` (không phải GUID)
- Backend API yêu cầu task ID phải là GUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Khi save description → 400 Bad Request vì ID không hợp lệ

### Sau khi migration:
- ✅ Tất cả tasks có GUID hợp lệ
- ✅ Description save thành công
- ✅ Tất cả features trong TaskDetailDialog hoạt động
- ✅ Đồng bộ giữa database và frontend

## 📋 Chuẩn Bị

### Yêu cầu:
- SQL Server đang chạy (localhost hoặc Docker)
- PowerShell (đã có sẵn trên Windows)
- Quyền truy cập database: `sa` / `TaskFlow@2025!Strong`

### Backup (TÙY CHỌN nhưng KHUYẾN NGHỊ):
```powershell
# Tạo thư mục backup
New-Item -ItemType Directory -Path "D:\Backup" -Force

# Backup database
sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -Q "BACKUP DATABASE TaskFlowDB_Dev TO DISK = 'D:\Backup\TaskFlow_BeforeMigration.bak' WITH FORMAT, INIT"
```

## 🚀 Cách Chạy Migration

### Option 1: Sử dụng PowerShell Script (KHUYẾN NGHỊ)

**Bước 1**: Mở PowerShell trong thư mục `Backend/Database`:
```powershell
cd "d:\TFS\aidev\Modern Task Management System_v2.7\Backend\Database"
```

**Bước 2**: Chạy dry-run để xem trước (không thay đổi dữ liệu):
```powershell
.\run-guid-migration.ps1 -DryRun
```

**Bước 3**: Chạy migration thực sự VỚI backup:
```powershell
.\run-guid-migration.ps1 -Backup
```

**Bước 4**: Xác nhận khi được hỏi:
```
⚠️  WARNING: This will regenerate all Task GUIDs!
             All tasks will get new IDs!
             Continue? (Y/N)
```
→ Nhập `Y` và Enter

### Option 2: Chạy SQL Script Trực Tiếp

```bash
# Chạy từ PowerShell
sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -d TaskFlowDB_Dev -i "28_Migrate_Tasks_To_GUID.sql"
```

### Option 3: Chạy trong Docker SQL Server

```bash
# Copy script vào container
docker cp 28_Migrate_Tasks_To_GUID.sql taskflow-sqlserver:/tmp/

# Chạy script
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -d TaskFlowDB_Dev -i /tmp/28_Migrate_Tasks_To_GUID.sql
```

## 📊 Kết Quả Mong Đợi

### Console Output:

```
==========================================
Current Task ID Status:
==========================================
TotalTasks  NullTaskIDs  InvalidGUIDs
10          0            0

Generated 10 new GUIDs

==========================================
Sample ID Mapping (first 10):
==========================================
Title                      OldTaskID                             NewTaskID
Design Homepage UI         12345678-1234-1234-1234-123456789012  a1b2c3d4-e5f6-7890-abcd-ef1234567890
...

Updating ParentTaskID references...
Updated 3 ParentTaskID references

Migrating TaskID to new GUIDs...
Updated 10 TaskIDs

==========================================
Migration Complete!
==========================================

Next Steps:
1. Export task list: SELECT TaskID, Title FROM Tasks WHERE SiteID = 'your-site'
2. Update frontend mock data with real TaskIDs from database
3. Test TaskDetailDialog with real task data
4. Verify description save works with GUID TaskIDs
```

### File Output:

**File**: `Backend/Database/sample-task-ids.txt`
```
TaskID                                  Title                Status        Priority
a1b2c3d4-e5f6-7890-abcd-ef1234567890   Design Homepage UI   in-progress   high
b2c3d4e5-f6a7-8901-bcde-f12345678901   Fix Login Bug        done          critical
...
```

## ✅ Verification

### Bước 1: Kiểm tra database

```sql
-- Kiểm tra tất cả tasks có GUID hợp lệ
SELECT
    COUNT(*) as TotalTasks,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) = 36 THEN 1 END) as ValidGUIDs,
    COUNT(CASE WHEN LEN(CAST(TaskID AS NVARCHAR(50))) < 36 THEN 1 END) as InvalidGUIDs
FROM Tasks
WHERE IsDeleted = 0;
```

**Expected**:
```
TotalTasks  ValidGUIDs  InvalidGUIDs
10          10          0
```

### Bước 2: Xem sample TaskIDs

```sql
SELECT TOP 10
    TaskID,
    Title,
    Status,
    Priority
FROM Tasks
WHERE IsDeleted = 0
ORDER BY CreatedAt DESC;
```

Copy các TaskID này để update frontend.

### Bước 3: Test frontend

1. **Mở browser console** (F12)
2. **Navigate to Workspace**
3. **Click vào một task**
4. **Click "Add description"**
5. **Type**: "Testing GUID migration"
6. **Wait 1 giây**

**Expected console output**:
```
✅ Description saved successfully
```

**Expected toast**:
```
✅ Description saved
```

**Expected Network tab**:
```
PUT /api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Status: 200 OK
```

## 🔄 Rollback (Nếu Cần)

### Nếu đã tạo backup:

```powershell
# Restore từ backup
sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -Q "RESTORE DATABASE TaskFlowDB_Dev FROM DISK = 'D:\Backup\TaskFlow_BeforeMigration.bak' WITH REPLACE"
```

### Verify rollback:

```sql
SELECT TOP 5 TaskID, Title FROM Tasks;
```

## 📝 Update Frontend (Sau Migration)

### Option 1: Load Tasks từ API (KHUYẾN NGHỊ)

Thay vì dùng mock data, fetch tasks từ backend:

```typescript
// src/components/workspace/index.tsx
useEffect(() => {
  const loadTasks = async () => {
    try {
      const tasks = await tasksApi.getAll();
      setWorkspaceTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  loadTasks();
}, []);
```

### Option 2: Update Mock Data với Real GUIDs

1. **Export TaskIDs từ database**:
```sql
SELECT
    TaskID,
    Title,
    Status,
    Priority,
    ISNULL(AssigneeID, '00000000-0000-0000-0000-000000000000') as AssigneeID
FROM Tasks
WHERE IsDeleted = 0;
```

2. **Update** `src/data/projectWorkspaceMockData.ts`:
```typescript
export const workspaceTasks: WorkspaceTask[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // ✅ Real GUID from DB
    name: 'Design Homepage UI',
    status: 'in-progress',
    priority: 'high',
    // ... rest of properties
  },
  // ...
];
```

## 🎯 Các Bảng Được Update

Migration script tự động update:

1. ✅ **Tasks.TaskID** → New GUID
2. ✅ **Tasks.ParentTaskID** → Reference to new GUID
3. ✅ **Comments.TaskID** → Reference to new GUID (if table exists)
4. ✅ **CalendarEvents.TaskID** → Reference to new GUID (if table exists)

## ⚠️ Lưu Ý Quan Trọng

### DO:
- ✅ Chạy dry-run trước khi migration thực sự
- ✅ Tạo backup database trước khi chạy
- ✅ Test trên development database trước
- ✅ Verify kết quả sau migration
- ✅ Update frontend sau khi migration thành công

### DON'T:
- ❌ Chạy trực tiếp trên production database mà không backup
- ❌ Skip verification steps
- ❌ Quên update frontend mock data
- ❌ Chạy script nhiều lần (sẽ generate GUIDs mới mỗi lần)

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Giải pháp**:
```powershell
# Kiểm tra SQL Server đang chạy
sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -Q "SELECT @@VERSION"

# Nếu dùng Docker
docker ps | grep sqlserver
docker start taskflow-sqlserver
```

### Error: "Login failed for user 'sa'"

**Giải pháp**:
```powershell
# Kiểm tra password đúng chưa
sqlcmd -S localhost -U sa -P 'TaskFlow@2025!Strong' -C -Q "SELECT 1"
```

### Error: "Foreign key constraint error"

**Nguyên nhân**: Script đã disable constraints tạm thời và re-enable sau.

**Giải pháp**: Script tự xử lý. Nếu vẫn lỗi, check:
```sql
-- Xem constraints
SELECT * FROM sys.foreign_keys WHERE referenced_object_id = OBJECT_ID('Tasks');

-- Disable manually
ALTER TABLE Tasks NOCHECK CONSTRAINT ALL;
-- ... run migration ...
ALTER TABLE Tasks WITH CHECK CHECK CONSTRAINT ALL;
```

### Frontend vẫn báo "Invalid task ID format"

**Nguyên nhân**: Browser cache vẫn load mock data cũ

**Giải pháp**:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard reload (Ctrl + Shift + R)
3. Close all browser tabs
4. Restart browser
5. Navigate to http://localhost:5600

## 📚 Files Liên Quan

- **Migration script**: [`Backend/Database/28_Migrate_Tasks_To_GUID.sql`](../Backend/Database/28_Migrate_Tasks_To_GUID.sql)
- **PowerShell script**: [`Backend/Database/run-guid-migration.ps1`](../Backend/Database/run-guid-migration.ps1)
- **Fix documentation**: [`description-error-fix-20251128.md`](./description-error-fix-20251128.md)
- **Original plan**: [`20251128-0920-task-detail-enhancements plan.md`](./20251128-0920-task-detail-enhancements plan.md)

## ✅ Success Criteria

Migration thành công khi:

- [ ] Script chạy không lỗi
- [ ] Tất cả TaskIDs là GUID hợp lệ (36 characters)
- [ ] ParentTaskID references được update
- [ ] Không có orphaned tasks
- [ ] Frontend load được tasks
- [ ] Description save thành công (200 OK)
- [ ] Console log: "✅ Description saved successfully"
- [ ] Toast: "✅ Description saved"

---

**Lưu ý**: Migration này chỉ cần chạy **MỘT LẦN**. Sau khi chạy xong, tất cả tasks sẽ có GUID hợp lệ vĩnh viễn.
