# Comments Table Partition Strategy

> **Status:** PLANNED
> **Priority:** Medium
> **Target:** When Comments table > 1M records
> **Created:** 2025-11-30
> **Last Updated:** 2025-11-30

---

## Todo List

| # | Task | Description | Status |
|---|------|-------------|--------|
| 1 | Analyze table structure | Kiểm tra cấu trúc hiện tại, đếm số records, xác định query patterns phổ biến, đo performance baseline | ⬜ Pending |
| 2 | Design partition strategy | Chọn partition key (`CreatedAt` monthly), xác định số partitions cần tạo, tính toán data distribution | ⬜ Pending |
| 3 | Create partition function | Định nghĩa boundary values cho từng tháng, sử dụng `RANGE RIGHT` để data mới vào partition đúng | ⬜ Pending |
| 4 | Create partition scheme | Map partition function → filegroups, quyết định dùng filegroups riêng hay PRIMARY | ⬜ Pending |
| 5 | Create filegroups | Tạo filegroups riêng cho mỗi năm (FG_Comments_2024, 2025...), thêm data files với size phù hợp | ⬜ Pending |
| 6 | Migrate existing table | Tạo bảng mới với partition, INSERT data từ bảng cũ, rename tables, verify data integrity | ⬜ Pending |
| 7 | Update indexes | Tạo partition-aligned indexes (TaskID, SiteID, UserID), drop old indexes, verify execution plans | ⬜ Pending |
| 8 | Update stored procedures | Thêm `CreatedAt` filter vào queries để leverage partition elimination, optimize SP parameters | ⬜ Pending |
| 9 | Create maintenance job | SQL Agent job chạy monthly để SPLIT RANGE thêm partition mới, job yearly để archive/merge old partitions | ⬜ Pending |
| 10 | Test performance | So sánh query performance trước/sau partition, verify partition elimination hoạt động, load test | ⬜ Pending |

---

## Recommended Strategy

### Partition by `CreatedAt` (Monthly)

```
Comments_Partitioned
├── P_ARCHIVE  → Data trước 2024 (merged)
├── P_2024_01  → Jan 2024
├── P_2024_02  → Feb 2024
├── ...
├── P_2025_11  → Nov 2025
├── P_2025_12  → Dec 2025
└── P_FUTURE   → Future data (sliding window)
```

### Tại sao chọn `CreatedAt` làm Partition Key?

| Lý do | Giải thích |
|-------|------------|
| **Query Pattern phù hợp** | Comments thường được query theo `TaskID` + khoảng thời gian gần đây (3-6 tháng). Partition by date giúp SQL Server chỉ scan partitions cần thiết (partition elimination) |
| **Data Growth tự nhiên** | Comments tăng theo thời gian, partition monthly giúp phân bổ data đều giữa các partitions |
| **Archive/Purge dễ dàng** | Data cũ > 2 năm có thể archive bằng `SWITCH PARTITION` (instant, no data movement) hoặc `TRUNCATE PARTITION` |
| **Index Maintenance hiệu quả** | Có thể `REBUILD INDEX` từng partition riêng biệt, giảm downtime và log growth |
| **Backup/Restore linh hoạt** | Nếu dùng filegroups riêng, có thể backup/restore từng năm độc lập |
| **Sliding Window Pattern** | Dễ dàng thêm partition mới hàng tháng và merge partitions cũ |

### Tại sao KHÔNG chọn các Partition Key khác?

| Partition Key | Lý do không chọn |
|---------------|------------------|
| `SiteID` | Số lượng Sites ít và cố định, không cần partition. Nếu 1 Site có nhiều data hơn → partition không cân bằng |
| `TaskID` | Quá nhiều unique values, không phù hợp làm partition key. Query đã có index trên TaskID |
| `UserID` | Tương tự TaskID, quá nhiều unique values và không phù hợp với query pattern |
| `CommentID` | GUID random, không có ý nghĩa business, không giúp gì cho query optimization |

---

## Multi-tenant Consideration

### Tại sao KHÔNG cần partition theo `SiteID`?

**Phân tích Data Model:**

```sql
-- TaskID là UNIQUEIDENTIFIER (GUID) - globally unique
TaskID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID()

-- Kết quả kiểm tra: TaskID KHÔNG trùng giữa các Sites
-- TotalTasks = 26, UniqueTasks = 26 → 100% unique
```

| Câu hỏi | Trả lời | Giải thích |
|---------|---------|------------|
| **TaskID có trùng giữa các Sites không?** | ❌ KHÔNG | GUID unique toàn cục, mỗi Task có ID duy nhất trên toàn hệ thống |
| **Query Comments có cần SiteID không?** | Về logic: KHÔNG | Vì TaskID đã unique, query by TaskID sẽ hit đúng row |
| **Tại sao SP vẫn filter SiteID?** | Security layer | Double-check để đảm bảo tenant isolation, không phải vì data overlap |

**Query Pattern thực tế:**

```sql
-- Cả 2 query này trả về kết quả GIỐNG NHAU vì TaskID là GUID unique
SELECT * FROM Comments WHERE TaskID = @TaskID;
SELECT * FROM Comments WHERE TaskID = @TaskID AND SiteID = @SiteID;

-- SiteID filter chỉ là SECURITY CHECK, không ảnh hưởng performance
```

### Kết luận cho Multi-tenant

| Yếu tố | Quyết định |
|--------|------------|
| **Partition by SiteID?** | ❌ KHÔNG CẦN - TaskID đã unique, không có data overlap giữa Sites |
| **Partition by CreatedAt?** | ✅ HỢP LÝ - Giúp archive old data, index maintenance, sliding window |
| **SiteID trong query?** | Giữ nguyên làm security layer, không ảnh hưởng partition strategy |

---

## Overview

Bảng `Comments` có khả năng tăng trưởng lớn theo thời gian. Document này mô tả chiến lược partition để đảm bảo performance và scalability.

## Current Table Structure

```sql
CREATE TABLE Comments (
    CommentID UNIQUEIDENTIFIER PRIMARY KEY,
    SiteID NVARCHAR(50) NOT NULL,
    TaskID UNIQUEIDENTIFIER NOT NULL,
    UserID UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ParentCommentID UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);
```

## Partition Strategy

### Recommended: Partition by CreatedAt (Monthly)

**Lý do:**
- Comments thường được query theo TaskID + time range
- Dễ dàng archive/purge data cũ
- Partition elimination hiệu quả khi filter theo ngày
- Phù hợp với sliding window pattern

### Partition Layout

```
Comments_Partitioned
├── P_2024_01  → Jan 2024
├── P_2024_02  → Feb 2024
├── ...
├── P_2025_11  → Nov 2025
├── P_2025_12  → Dec 2025
└── P_FUTURE   → Future data (sliding window)
```

## Implementation Steps

### Step 1: Create Filegroups (Optional but Recommended)

```sql
-- Tạo filegroups cho mỗi năm
ALTER DATABASE DB_PMS ADD FILEGROUP FG_Comments_2024;
ALTER DATABASE DB_PMS ADD FILEGROUP FG_Comments_2025;
ALTER DATABASE DB_PMS ADD FILEGROUP FG_Comments_2026;
ALTER DATABASE DB_PMS ADD FILEGROUP FG_Comments_Archive;

-- Thêm data files vào filegroups
ALTER DATABASE DB_PMS ADD FILE (
    NAME = 'Comments_2024',
    FILENAME = 'D:\SQLData\Comments_2024.ndf',
    SIZE = 100MB,
    FILEGROWTH = 50MB
) TO FILEGROUP FG_Comments_2024;

-- Repeat cho các năm khác...
```

### Step 2: Create Partition Function

```sql
-- Partition function theo tháng
CREATE PARTITION FUNCTION pf_Comments_Monthly (DATETIME2)
AS RANGE RIGHT FOR VALUES (
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01',
    '2024-05-01', '2024-06-01', '2024-07-01', '2024-08-01',
    '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01',
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01',
    '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01',
    '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01',
    '2026-01-01'
);
```

### Step 3: Create Partition Scheme

```sql
-- Nếu dùng filegroups riêng
CREATE PARTITION SCHEME ps_Comments_Monthly
AS PARTITION pf_Comments_Monthly
TO (
    FG_Comments_Archive,  -- Before 2024-01
    FG_Comments_2024, FG_Comments_2024, FG_Comments_2024, FG_Comments_2024,
    FG_Comments_2024, FG_Comments_2024, FG_Comments_2024, FG_Comments_2024,
    FG_Comments_2024, FG_Comments_2024, FG_Comments_2024, FG_Comments_2024,
    FG_Comments_2025, FG_Comments_2025, FG_Comments_2025, FG_Comments_2025,
    FG_Comments_2025, FG_Comments_2025, FG_Comments_2025, FG_Comments_2025,
    FG_Comments_2025, FG_Comments_2025, FG_Comments_2025, FG_Comments_2025,
    FG_Comments_2026  -- 2026 onwards
);

-- Hoặc đơn giản dùng PRIMARY
CREATE PARTITION SCHEME ps_Comments_Monthly
AS PARTITION pf_Comments_Monthly
ALL TO ([PRIMARY]);
```

### Step 4: Create Partitioned Table

```sql
-- Tạo bảng mới với partition
CREATE TABLE Comments_Partitioned (
    CommentID UNIQUEIDENTIFIER NOT NULL,
    SiteID NVARCHAR(50) NOT NULL,
    TaskID UNIQUEIDENTIFIER NOT NULL,
    UserID UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ParentCommentID UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,

    -- Composite primary key để partition-aligned
    CONSTRAINT PK_Comments_Partitioned
        PRIMARY KEY (CommentID, CreatedAt)
) ON ps_Comments_Monthly(CreatedAt);

-- Hoặc nếu muốn giữ CommentID là unique
CREATE TABLE Comments_Partitioned (
    CommentID UNIQUEIDENTIFIER NOT NULL,
    SiteID NVARCHAR(50) NOT NULL,
    TaskID UNIQUEIDENTIFIER NOT NULL,
    UserID UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ParentCommentID UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
) ON ps_Comments_Monthly(CreatedAt);

-- Unique constraint (non-clustered)
ALTER TABLE Comments_Partitioned
ADD CONSTRAINT UQ_Comments_CommentID UNIQUE NONCLUSTERED (CommentID);

-- Clustered index on partition key
CREATE CLUSTERED INDEX IX_Comments_CreatedAt
ON Comments_Partitioned(CreatedAt, CommentID);
```

### Step 5: Migrate Data

```sql
-- Insert data từ bảng cũ sang bảng mới
SET IDENTITY_INSERT Comments_Partitioned ON;

INSERT INTO Comments_Partitioned (
    CommentID, SiteID, TaskID, UserID, Content,
    ParentCommentID, CreatedAt, UpdatedAt, IsDeleted
)
SELECT
    CommentID, SiteID, TaskID, UserID, Content,
    ParentCommentID, CreatedAt, UpdatedAt, IsDeleted
FROM Comments;

SET IDENTITY_INSERT Comments_Partitioned OFF;

-- Verify data
SELECT COUNT(*) FROM Comments;
SELECT COUNT(*) FROM Comments_Partitioned;

-- Rename tables
EXEC sp_rename 'Comments', 'Comments_Old';
EXEC sp_rename 'Comments_Partitioned', 'Comments';

-- Drop old table after verification
-- DROP TABLE Comments_Old;
```

### Step 6: Create Partition-Aligned Indexes

```sql
-- Index cho query by TaskID
CREATE NONCLUSTERED INDEX IX_Comments_TaskID
ON Comments(TaskID, CreatedAt)
INCLUDE (UserID, Content, IsDeleted)
ON ps_Comments_Monthly(CreatedAt);

-- Index cho query by SiteID
CREATE NONCLUSTERED INDEX IX_Comments_SiteID
ON Comments(SiteID, CreatedAt)
ON ps_Comments_Monthly(CreatedAt);

-- Index cho query by UserID
CREATE NONCLUSTERED INDEX IX_Comments_UserID
ON Comments(UserID, CreatedAt)
ON ps_Comments_Monthly(CreatedAt);

-- Index cho Parent-Child relationships
CREATE NONCLUSTERED INDEX IX_Comments_ParentID
ON Comments(ParentCommentID)
WHERE ParentCommentID IS NOT NULL
ON ps_Comments_Monthly(CreatedAt);
```

### Step 7: Update Stored Procedures (if needed)

Stored procedures không cần thay đổi nếu query đã filter theo `CreatedAt`. SQL Server tự động sử dụng partition elimination.

**Tối ưu query để leverage partition:**

```sql
-- BAD: Full scan all partitions
SELECT * FROM Comments WHERE TaskID = @TaskID;

-- GOOD: Partition elimination (chỉ scan partitions cần thiết)
SELECT * FROM Comments
WHERE TaskID = @TaskID
AND CreatedAt >= DATEADD(MONTH, -3, GETDATE());
```

### Step 8: Maintenance Jobs

#### 8.1 Add New Partition (Monthly Job)

```sql
-- Chạy đầu mỗi tháng để thêm partition mới
CREATE PROCEDURE sp_Comments_AddMonthlyPartition
AS
BEGIN
    DECLARE @NextMonth DATE = DATEADD(MONTH, 2, GETDATE());
    DECLARE @NextMonthStart DATE = DATEFROMPARTS(YEAR(@NextMonth), MONTH(@NextMonth), 1);

    -- Split partition để thêm boundary mới
    ALTER PARTITION FUNCTION pf_Comments_Monthly()
    SPLIT RANGE (@NextMonthStart);

    PRINT 'Added partition for: ' + CAST(@NextMonthStart AS VARCHAR);
END;
```

#### 8.2 Archive Old Partitions (Yearly Job)

```sql
-- Archive data > 2 năm
CREATE PROCEDURE sp_Comments_ArchiveOldPartitions
    @YearsToKeep INT = 2
AS
BEGIN
    DECLARE @CutoffDate DATE = DATEADD(YEAR, -@YearsToKeep, GETDATE());

    -- Option 1: Switch partition to archive table
    -- Option 2: Truncate old partitions
    -- Option 3: Merge old partitions

    -- Example: Merge partitions older than cutoff
    -- ALTER PARTITION FUNCTION pf_Comments_Monthly()
    -- MERGE RANGE (@OldBoundary);

    PRINT 'Archived partitions before: ' + CAST(@CutoffDate AS VARCHAR);
END;
```

## Monitoring Queries

### Check Partition Distribution

```sql
-- Xem số records mỗi partition
SELECT
    p.partition_number,
    p.rows,
    prv.value AS boundary_value,
    fg.name AS filegroup_name
FROM sys.partitions p
JOIN sys.indexes i ON p.object_id = i.object_id AND p.index_id = i.index_id
JOIN sys.partition_schemes ps ON i.data_space_id = ps.data_space_id
JOIN sys.partition_functions pf ON ps.function_id = pf.function_id
LEFT JOIN sys.partition_range_values prv ON pf.function_id = prv.function_id
    AND p.partition_number = prv.boundary_id + 1
JOIN sys.destination_data_spaces dds ON ps.data_space_id = dds.partition_scheme_id
    AND p.partition_number = dds.destination_id
JOIN sys.filegroups fg ON dds.data_space_id = fg.data_space_id
WHERE p.object_id = OBJECT_ID('Comments')
    AND i.index_id <= 1
ORDER BY p.partition_number;
```

### Check Partition Elimination

```sql
-- Verify partition elimination đang hoạt động
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT * FROM Comments
WHERE TaskID = 'xxx'
AND CreatedAt >= '2025-01-01';

-- Xem actual partitions được scan trong execution plan
```

## Performance Considerations

### Pros
- Query performance tốt hơn với partition elimination
- Dễ dàng archive/purge old data
- Index maintenance nhanh hơn (rebuild từng partition)
- Backup/restore từng filegroup

### Cons
- Complexity tăng
- Cần maintenance jobs
- Query không có CreatedAt filter sẽ scan all partitions

## Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Design & Review | 1 day |
| 2 | Create partition infrastructure | 2 hours |
| 3 | Migrate data (depends on volume) | 1-4 hours |
| 4 | Update indexes | 1 hour |
| 5 | Testing | 1 day |
| 6 | Setup maintenance jobs | 2 hours |

## Rollback Plan

1. Keep `Comments_Old` table for 1 week after migration
2. If issues occur, rename tables back:
   ```sql
   EXEC sp_rename 'Comments', 'Comments_Partitioned_Failed';
   EXEC sp_rename 'Comments_Old', 'Comments';
   ```

## References

- [SQL Server Table Partitioning](https://docs.microsoft.com/en-us/sql/relational-databases/partitions/partitioned-tables-and-indexes)
- [Partition Function](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-partition-function-transact-sql)
- [Sliding Window Pattern](https://docs.microsoft.com/en-us/previous-versions/sql/sql-server-2008-r2/ms190787(v=sql.105))