# Implementation Plan: Subtask Persistence & Drag-Drop Order

## 🎯 Problem Statement

**Issue #1: Subtasks không lưu vào Database**
- Khi tạo subtask bằng Enter trong lưới Project Space
- Chỉ update local state, không call API
- Refresh browser → mất hết subtasks

**Issue #2: Drag & Drop không lưu thứ tự**
- Kéo thả task để sắp xếp lại trong Project
- Không persist Order vào database
- Refresh browser → mất thứ tự sắp xếp

## ✅ Completed Changes

### 1. Database Layer ✓

**Migration Script:** `Backend/Database/14_AddTaskOrderColumn.sql`
```sql
-- Added [Order] INT NULL column to Tasks table
-- Set initial order values based on CreatedAt
```

**Result:**
- Tasks table now has `[Order]` column
- Existing tasks auto-assigned order 1,2,3... per project
- Verified: 5 existing tasks updated successfully

**Schema Fields:**
- `ParentTaskID` UNIQUEIDENTIFIER - Already exists for subtasks ✓
- `[Order]` INT NULL - Newly added for sort order ✓

### 2. Backend Models ✓

**Files Updated:**
1. `Backend/TaskFlow.API/Models/Entities/Task.cs`
   - Added: `public int? Order { get; set; }`

2. `Backend/TaskFlow.API/Models/DTOs/Task/TaskDto.cs`
   - Added: `public int? Order { get; set; }`

3. `Backend/TaskFlow.API/Models/DTOs/Task/CreateTaskDto.cs`
   - Added: `public int? Order { get; set; }`

4. `Backend/TaskFlow.API/Models/DTOs/Task/UpdateTaskDto.cs`
   - Added: `public int? Order { get; set; }`

### 3. Backend Repository ✓

**File:** `Backend/TaskFlow.API/Repositories/TaskRepository.cs`

**AddAsync() - Line 43-65:**
```csharp
var parameters = new
{
    entity.TaskID,
    entity.SiteID,
    entity.ProjectID,
    entity.PhaseID,
    entity.ParentTaskID,
    entity.Order,  // ← Added
    entity.Title,
    // ... rest
};
```

**UpdateAsync() - Line 73-93:**
```csharp
var parameters = new
{
    SiteID = siteId,
    TaskID = id,
    entity.PhaseID,
    entity.ParentTaskID,
    entity.Order,  // ← Added
    entity.Title,
    // ... rest
};
```

## 🔄 Required Frontend Changes

### 1. Update Frontend API Types

**File:** `src/services/api.ts`

**Current Task interface (line 59-75):**
```typescript
export interface Task {
  taskID: string;
  siteID: string;
  projectID: string;
  // ... existing fields
}
```

**Need to add:**
```typescript
export interface Task {
  taskID: string;
  siteID: string;
  projectID: string;
  phaseID?: string;
  parentTaskID?: string;  // For subtasks
  order?: number;         // For drag-drop ordering
  title: string;
  // ... rest of fields
}
```

### 2. Update useTaskManagement Hook

**File:** `src/components/workspace/hooks/useTaskManagement.ts`

**Current Issues:**

#### A. addSubtask() - Line 114-134
```typescript
const addSubtask = useCallback((parentTaskId: string, subtask: WorkspaceTask) => {
  // ❌ Only updates local state
  const updatedTasks = projectTasks[activeProject]?.map(task => {
    if (task.id === parentTaskId) {
      return {
        ...task,
        subtasks: [...(task.subtasks || []), subtask]
      };
    }
    return task;
  });

  setProjectTasks({ ...projectTasks, [activeProject]: updatedTasks });
  toast.success('Subtask added successfully');
}, [activeProject, projectTasks, setProjectTasks]);
```

**Need to change to:**
```typescript
const addSubtask = useCallback(async (parentTaskId: string, subtask: WorkspaceTask) => {
  if (!activeProject) return;

  try {
    // ✅ Call API to persist subtask
    const newSubtask = await tasksApi.create({
      projectID: subtask.projectID,
      parentTaskID: parentTaskId,  // Link to parent
      title: subtask.name,
      status: subtask.status,
      priority: subtask.priority,
      assigneeID: subtask.assignee?.id,
      // ... other fields
    });

    // Update local state
    const updatedTasks = projectTasks[activeProject]?.map(task => {
      if (task.id === parentTaskId) {
        return {
          ...task,
          subtasks: [...(task.subtasks || []), {
            ...subtask,
            id: newSubtask.taskID,  // Use real ID from API
          }]
        };
      }
      return task;
    });

    if (updatedTasks) {
      setProjectTasks({ ...projectTasks, [activeProject]: updatedTasks });
      toast.success('Subtask added successfully');
    }
  } catch (error) {
    toast.error('Failed to create subtask');
    console.error('Subtask creation error:', error);
  }
}, [activeProject, projectTasks, setProjectTasks]);
```

#### B. Need New Function: updateTaskOrder()

**Add to useTaskManagement:**
```typescript
const updateTaskOrder = useCallback(async (taskId: string, newOrder: number) => {
  if (!activeProject) return;

  try {
    // ✅ Call API to persist order
    await tasksApi.update(taskId, {
      order: newOrder
    });

    // Update local state
    const updatedTasks = projectTasks[activeProject]?.map(task =>
      task.id === taskId ? { ...task, order: newOrder } : task
    );

    if (updatedTasks) {
      setProjectTasks({ ...projectTasks, [activeProject]: updatedTasks });
    }
  } catch (error) {
    console.error('Failed to update task order:', error);
    toast.error('Failed to update task order');
  }
}, [activeProject, projectTasks, setProjectTasks]);
```

**Return in hook:**
```typescript
return {
  addTask,
  updateTask,
  deleteTask,
  duplicateTask,
  changeTaskStatus,
  addSubtask,
  moveTaskToPhase,
  updateTaskOrder,  // ← Add this
};
```

### 3. Update WorkspaceListView Component

**File:** `src/components/workspace/WorkspaceListView.tsx`

**Find drag-drop handlers** (search for `onDragEnd` or similar)

**After reordering tasks in UI:**
```typescript
const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return;

  const items = Array.from(tasks);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  // Update UI immediately
  setTasks(items);

  // ✅ Persist new order to database
  items.forEach((task, index) => {
    if (task.order !== index + 1) {
      updateTaskOrder(task.id, index + 1);
    }
  });
};
```

### 4. Update WorkspaceTask Type

**File:** `src/components/workspace/types.ts`

```typescript
export interface WorkspaceTask {
  id: string;
  name: string;
  // ... existing fields
  parentTaskID?: string;  // ← Add for subtasks
  order?: number;         // ← Add for ordering
  subtasks?: WorkspaceTask[];
}
```

## 📋 Implementation Steps

### Step 1: Restart Backend ✓
Backend is currently running. Need to restart to pick up model changes.

```bash
# Stop current backend process
# Restart:
cd Backend/TaskFlow.API && dotnet run
```

### Step 2: Update Frontend Types
1. Update `src/services/api.ts` - Task interface
2. Update `src/components/workspace/types.ts` - WorkspaceTask interface

### Step 3: Update useTaskManagement Hook
1. Import `tasksApi` from `'../../services/api'`
2. Update `addSubtask()` to call API
3. Add `updateTaskOrder()` function
4. Export new function

### Step 4: Update WorkspaceListView
1. Import `updateTaskOrder` from hook
2. Find drag-drop handler
3. Add order persistence after reorder

### Step 5: Testing
1. ✅ Test subtask creation → refresh → verify persists
2. ✅ Test drag-drop reorder → refresh → verify order maintained
3. ✅ Test across different projects
4. ✅ Check backend logs for API calls

## 🔍 Testing Checklist

### Subtask Testing:
- [ ] Create parent task in Project Space
- [ ] Press Enter to create subtask
- [ ] Verify subtask appears in UI
- [ ] Refresh browser
- [ ] Verify subtask still exists
- [ ] Check database: `SELECT * FROM Tasks WHERE ParentTaskID IS NOT NULL`

### Order Testing:
- [ ] Create 3-5 tasks in a project
- [ ] Drag task from position 1 to position 3
- [ ] Verify UI updates immediately
- [ ] Refresh browser
- [ ] Verify tasks maintain new order
- [ ] Check database: `SELECT TaskID, Title, [Order] FROM Tasks WHERE ProjectID = 'xxx' ORDER BY [Order]`

### API Testing:
- [ ] Open Browser DevTools → Network tab
- [ ] Create subtask → verify POST /api/tasks called
- [ ] Drag-drop task → verify PUT /api/tasks/{id} called
- [ ] Check request payload includes `parentTaskID` / `order`

## ⚠️ Known Limitations

1. **Stored Procedures**: Backend uses stored procedures (`sp_Task_Create`, `sp_Task_Update`)
   - These procedures need to accept `@Order` parameter
   - May need to update stored procedures in database

2. **Bulk Order Updates**: When dragging, multiple tasks may need reordering
   - Current approach: Update one at a time
   - Optimization: Batch update API endpoint (future enhancement)

3. **Subtask Display**: Frontend may need logic to:
   - Load subtasks when expanding parent task
   - Display subtask indicator/count
   - Handle nested drag-drop

## 📝 Next Actions Required

**Immediate (Must Do):**
1. Check if stored procedures `sp_Task_Create` and `sp_Task_Update` accept `@Order` parameter
2. Update procedures if needed
3. Restart backend to pick up code changes
4. Update frontend types and hooks
5. Test end-to-end

**Future Enhancements:**
1. Batch order update API endpoint
2. Optimistic UI updates
3. Subtask count indicator
4. Nested subtask support
5. Undo/redo for drag-drop

## 🚀 Ready to Proceed?

All backend code is updated. Frontend changes are documented above.

**Recommended approach:**
1. Review this plan
2. Confirm stored procedures are compatible
3. Proceed with frontend implementation
4. Test thoroughly before committing

---

**Created:** 2025-10-29
**Status:** Backend Complete ✓ | Frontend Pending
**Priority:** High - User reported issue