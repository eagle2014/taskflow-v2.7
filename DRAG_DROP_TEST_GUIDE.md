# Drag & Drop Implementation - Test Guide

## ✅ Implementation Complete

Drag & Drop functionality has been successfully implemented in the Project Workspace List View.

## 🎯 Features Implemented

### 1. **Draggable Task Rows**
- Created `DraggableTaskRow` component using `react-dnd`
- Drag handle icon (GripVertical) on left side of each task
- Visual feedback during drag (opacity 0.4)
- Only root-level tasks are draggable (not subtasks)

### 2. **Order Persistence**
- Task order saved to backend via API on drag end
- Batch update to minimize API calls
- Local state updated immediately for smooth UX
- Toast notifications for success/failure

### 3. **Integration Points**
- `WorkspaceListView.tsx` - Main list view with DnD provider
- `DraggableTaskRow.tsx` - Reusable draggable wrapper
- `ProjectWorkspaceV1.tsx` - Parent component with order handler
- `useTaskManagement.ts` - Hook with `updateTaskOrders()` function

## 🧪 Testing Instructions

### Step 1: Access the Workspace
1. Open browser: http://localhost:3001
2. Login with:
   - Email: `admin@acme.com`
   - Password: `admin123`
   - Site Code: `ACME`

### Step 2: Navigate to List View
1. Click on any **Space** or **Project** in left sidebar
2. Ensure you're in **List View** (should be default)
3. You should see tasks with a **grip icon** (⋮⋮) on the left

### Step 3: Test Drag & Drop
1. **Hover** over the grip icon - cursor should change to "move"
2. **Click and hold** the grip icon
3. **Drag** the task up or down
4. You should see:
   - Task becomes semi-transparent (opacity 0.4)
   - Other tasks shift to make room
5. **Release** mouse to drop
6. Should see toast: "Task order updated"

### Step 4: Verify Persistence
1. **Drag** a task to new position
2. **Refresh** the browser (F5)
3. Task should remain in new position
4. Check database:

```sql
SELECT TaskID, Title, ParentTaskID, [Order]
FROM Tasks
WHERE ProjectID = 'your-project-id'
ORDER BY [Order];
```

### Step 5: Test Grouping
1. Change grouping via toolbar (Group by Status, Assignee, etc.)
2. Drag tasks within same group
3. Order should persist within group

### Step 6: Test Edge Cases
- ❌ **Subtasks** - Should NOT be draggable (no grip icon)
- ✅ **Multiple projects** - Each project maintains independent order
- ✅ **Fast dragging** - No UI glitches or duplicate API calls
- ✅ **Drag cancel** - Drop back to original position works

## 🐛 Troubleshooting

### No Grip Icon Visible
- Check you're in **List View** (not Board/Gantt)
- Ensure project has tasks loaded
- Check `onReorderTasks` prop is passed to `WorkspaceListView`

### Drag Not Working
- Verify `DndProvider` wraps the list view
- Check browser console for errors
- Ensure `react-dnd` and `react-dnd-html5-backend` are installed

### Order Not Persisting
- Check Network tab in DevTools
- Look for `PUT /api/tasks/{id}` requests with `order` field
- Verify backend is running on port 5001
- Check SQL Server connection

### API Errors
- Backend: http://localhost:5001/health
- Database: Use SQL Server Management Studio
- Check `docker-compose ps` for container status

## 📊 Database Schema

```sql
-- Tasks table includes Order column
CREATE TABLE Tasks (
    TaskID UNIQUEIDENTIFIER PRIMARY KEY,
    ProjectID UNIQUEIDENTIFIER NOT NULL,
    ParentTaskID UNIQUEIDENTIFIER NULL,
    [Order] INT NULL,  -- <-- Order field
    Title NVARCHAR(500) NOT NULL,
    ...
);

-- Index for efficient ordering
CREATE INDEX IX_Tasks_Order
ON Tasks(ProjectID, [Order]);
```

## 🔧 Implementation Details

### Component Hierarchy
```
ProjectWorkspaceV1
  └─ WorkspaceListView (with DndProvider)
       └─ DraggableTaskRow (per task)
            └─ Task content (name, status, etc.)
```

### State Flow
```
1. User drags task
   ↓
2. moveTask() updates local array
   ↓
3. onDragEnd() triggers
   ↓
4. handleReorderTasks() in parent
   ↓
5. Update local state immediately
   ↓
6. Batch API calls to backend
   ↓
7. Show success toast
```

### API Endpoints Used
- `PUT /api/tasks/{id}` - Update single task order
- Request body: `{ "order": 3 }`

## 🚀 Performance

- **Optimistic updates** - UI responds instantly
- **Batch API calls** - All orders updated in parallel
- **Debounced** - Only persists after drag ends
- **Index optimized** - Database queries use ORDER column index

## 📝 Code Locations

- [DraggableTaskRow.tsx](src/components/workspace/DraggableTaskRow.tsx) - Draggable component
- [WorkspaceListView.tsx](src/components/workspace/WorkspaceListView.tsx#L67-L85) - DnD logic
- [ProjectWorkspaceV1.tsx](src/components/ProjectWorkspaceV1.tsx#L250-L278) - Order handler
- [useTaskManagement.ts](src/components/workspace/hooks/useTaskManagement.ts#L172-L225) - API integration

## ✨ Next Steps

1. ✅ Drag & Drop - **DONE**
2. ⏳ Subtask drag-drop within parent
3. ⏳ Cross-group drag (change status while reordering)
4. ⏳ Keyboard shortcuts (Ctrl+↑/↓ to reorder)
5. ⏳ Undo/Redo order changes

---

**Status**: ✅ Ready for Testing
**Version**: v1.0.0
**Date**: 2025-10-30
