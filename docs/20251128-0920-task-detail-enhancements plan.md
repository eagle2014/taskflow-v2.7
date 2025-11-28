# Task Detail Enhancements Implementation Plan

**Date**: 2025-11-28
**Status**: Planning Complete
**Complexity**: Medium
**Estimated Effort**: 6-8 hours

## Executive Summary

Fix 4 critical UX issues in TaskDetailDialog to match design spec from screenshot:
1. **Assignee functionality not working** - Add button exists but no action
2. **Start/End Date pickers incomplete** - UI exists but doesn't save to backend
3. **Description field missing** - Add button present but no editor
4. **Comment/Activity feature incomplete** - UI shown but not functional

## Current State Analysis

### TaskDetailDialog.tsx Current Implementation

**What EXISTS:**
- ✅ Assignee display (read-only) - lines 566-588
- ✅ Date pickers UI (Start/End) - lines 590-625
- ✅ "Add description" button - lines 708-714
- ✅ Comment input box - lines 857-922
- ✅ Activity timeline - lines 785-846
- ✅ Local state management for dates/comments

**What's BROKEN:**
- ❌ No assignee selector (button has no onClick)
- ❌ Date changes not persisted to backend
- ❌ Description editor not implemented
- ❌ Comments only saved to localStorage (not API)

### Backend API Status

**Task Entity** (Backend/TaskFlow.API/Models/Entities/Task.cs):
```csharp
public class Task {
    public Guid TaskID { get; set; }
    public Guid AssignedTo { get; set; }  // ✅ EXISTS
    public DateTime? StartDate { get; set; }  // ✅ EXISTS
    public DateTime? DueDate { get; set; }   // ✅ EXISTS
    public string Description { get; set; }  // ✅ EXISTS
}
```

**Comment Entity** - Need to verify if exists in backend

## Root Causes

### Issue 1: Assignee Selection Not Working
- **Location**: Lines 583-586
- **Problem**: Button renders but no onClick handler
- **Missing**:
  - User list dropdown/modal
  - Assignment API call
  - State update after assignment

### Issue 2: Date Pickers Don't Save
- **Location**: Lines 597-625
- **Problem**: setStartDate/setEndDate only update local state
- **Missing**:
  - API call to tasksApi.update() with dates
  - Error handling
  - Success feedback

### Issue 3: Description Editor Missing
- **Location**: Lines 708-714
- **Problem**: Button exists, no editor shown on click
- **Missing**:
  - Rich text editor (Textarea component)
  - Show/hide toggle state
  - Save to backend via tasksApi.update()
  - AI assist integration (optional)

### Issue 4: Comments Not Persisted
- **Location**: Lines 857-922
- **Problem**: Comments only in localStorage
- **Missing**:
  - Backend Comment API endpoints
  - POST /api/comments
  - GET /api/tasks/{id}/comments
  - Comment entity/DTO/repository/controller

## Solution Design

### Architecture Decisions

**1. Use Existing Patterns**
- Follow existing tasksApi pattern in api.ts
- Use existing Select/Popover components
- Maintain current dialog structure

**2. Backend First Approach**
- Create Comment endpoints before frontend
- Ensure Task.AssignedTo accepts GUID
- Add Description to UpdateTaskDto if missing

**3. Incremental Implementation**
- Each issue = separate phase
- Test after each phase
- Maintain backward compatibility

## Implementation Phases

### Phase 1: Fix Assignee Selection (2 hours)

**Backend Changes:**
- ✅ Verify Task.AssignedTo column exists
- ✅ Verify sp_Task_Update accepts @AssignedTo
- ✅ Add to UpdateTaskDto if missing

**Frontend Changes:**
- Add users list state (fetch from usersApi)
- Create assignee selector (reuse Select component)
- Implement handleAssigneeChange:
  ```typescript
  const handleAssigneeChange = async (userID: string) => {
    await tasksApi.update(task.id, { assignedTo: userID });
    onTaskUpdate?.({ ...task, assignee: selectedUser });
    toast.success('Assignee updated');
  };
  ```
- Show selector in Popover on "Add" click

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 566-588)

### Phase 2: Persist Date Changes (1 hour)

**Backend Changes:**
- ✅ Verify sp_Task_Update accepts @StartDate, @DueDate
- ✅ UpdateTaskDto has StartDate/DueDate properties

**Frontend Changes:**
- Add handleDateChange function:
  ```typescript
  const handleStartDateChange = async (date: Date | undefined) => {
    setStartDate(date);
    await tasksApi.update(task.id, {
      startDate: date?.toISOString()
    });
    toast.success('Start date updated');
  };
  ```
- Replace setStartDate/setEndDate with handlers
- Add error handling

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 597-625)

### Phase 3: Implement Description Editor (2 hours)

**Backend Changes:**
- ✅ Verify Task.Description column exists
- ✅ UpdateTaskDto includes Description

**Frontend Changes:**
- Add showDescriptionEditor state
- Replace "Add description" button with:
  ```tsx
  {showDescriptionEditor ? (
    <div>
      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        onBlur={handleSaveDescription}
        className="min-h-[120px]"
      />
    </div>
  ) : (
    <Button onClick={() => setShowDescriptionEditor(true)}>
      Add description
    </Button>
  )}
  ```
- Implement handleSaveDescription:
  ```typescript
  const handleSaveDescription = async () => {
    await tasksApi.update(task.id, { description });
    toast.success('Description saved');
  };
  ```

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 708-721)

### Phase 4: Implement Comment System (3 hours)

**Backend Changes - NEW API REQUIRED:**

**4a. Create Comment Entity**
`Backend/TaskFlow.API/Models/Entities/Comment.cs`:
```csharp
public class Comment {
    public Guid CommentID { get; set; }
    public string SiteID { get; set; }
    public Guid TaskID { get; set; }
    public Guid UserID { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
}
```

**4b. Create DTOs**
`Backend/TaskFlow.API/Models/DTOs/Comment/`:
- CommentDto.cs
- CreateCommentDto.cs

**4c. Create Repository**
- ICommentRepository.cs
- CommentRepository.cs
- Stored procedures: sp_Comment_Create, sp_Comment_GetByTask

**4d. Create Controller**
`CommentsController.cs`:
- POST /api/comments
- GET /api/tasks/{taskId}/comments

**Frontend Changes:**
- Add commentsApi to api.ts:
  ```typescript
  export const commentsApi = {
    create: (comment: { taskID: string, content: string }) =>
      client.post('/comments', comment),
    getByTask: (taskID: string) =>
      client.get(`/tasks/${taskID}/comments`)
  };
  ```
- Load comments from API instead of localStorage
- Implement handleSendComment:
  ```typescript
  const handleSendComment = async () => {
    const newComment = await commentsApi.create({
      taskID: task.id,
      content: comment
    });
    setComments([...comments, newComment]);
    setComment('');
  };
  ```

**Files to Create:**
- Backend/TaskFlow.API/Models/Entities/Comment.cs
- Backend/TaskFlow.API/Models/DTOs/Comment/CommentDto.cs
- Backend/TaskFlow.API/Models/DTOs/Comment/CreateCommentDto.cs
- Backend/TaskFlow.API/Repositories/Interfaces/ICommentRepository.cs
- Backend/TaskFlow.API/Repositories/CommentRepository.cs
- Backend/TaskFlow.API/Controllers/CommentsController.cs
- Backend/Database/28_Comment_Tables_SPs.sql

**Files to Modify:**
- src/services/api.ts (add commentsApi)
- src/components/TaskDetailDialog.tsx (lines 857-922)

## Database Schema

### Comments Table
```sql
CREATE TABLE Comments (
    CommentID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteID NVARCHAR(50) NOT NULL,
    TaskID UNIQUEIDENTIFIER NOT NULL,
    UserID UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
```

## Testing Strategy

### Phase 1 Testing
- [ ] Click "Add" under Assignees
- [ ] Select user from dropdown
- [ ] Verify task.assignedTo updated in DB
- [ ] Reload page, verify assignee persists

### Phase 2 Testing
- [ ] Select Start Date
- [ ] Select End Date
- [ ] Check Network tab for PUT /api/tasks
- [ ] Reload page, verify dates persist

### Phase 3 Testing
- [ ] Click "Add description"
- [ ] Type description
- [ ] Click outside (blur event)
- [ ] Verify saved to DB
- [ ] Reload page, verify persists

### Phase 4 Testing
- [ ] Type comment
- [ ] Click Send
- [ ] Verify POST /api/comments
- [ ] Reload page, verify comments load
- [ ] Test multi-user comments

## Risk Assessment

### High Risk
- **Comment system** - Most complex, requires full CRUD backend
  - Mitigation: Create backend first, test API endpoints before frontend

### Medium Risk
- **Description editor** - Need to handle large text
  - Mitigation: Use existing Textarea, add character limit

### Low Risk
- **Assignee selector** - Simple dropdown
- **Date persistence** - Single API call

## Dependencies

### External Packages (Already Installed)
- ✅ react-draggable
- ✅ re-resizable
- ✅ date-fns
- ✅ sonner (toast)

### Internal Dependencies
- ✅ usersApi (for assignee list)
- ✅ tasksApi (for updates)
- ❌ commentsApi (need to create)

## Rollout Plan

1. **Phase 1 (Assignee)** - Deploy first, low risk
2. **Phase 2 (Dates)** - Deploy after Phase 1 tested
3. **Phase 3 (Description)** - Deploy independently
4. **Phase 4 (Comments)** - Deploy last, highest complexity

## Success Criteria

- ✅ Assignee can be selected and persists
- ✅ Start/End dates save to database
- ✅ Description can be added/edited
- ✅ Comments are saved to database
- ✅ All changes visible after page reload
- ✅ No console errors
- ✅ Matches design screenshot functionality

## Open Questions

1. Should Description support rich text (bold, links) or plain text?
   - **Recommendation**: Start with plain text (Textarea)
2. Should Comments support @mentions?
   - **Recommendation**: Phase 5 (future)
3. Should Activity timeline show system events (assignee changed, etc)?
   - **Recommendation**: Phase 5 (future)
4. Comment deletion/editing allowed?
   - **Recommendation**: Phase 5 (future, soft delete only)

## Next Steps

1. Review plan with user
2. Confirm backend Comment table doesn't exist yet
3. Start with Phase 1 (lowest risk)
4. Test each phase before next

---

**Total Estimated Time**: 8 hours
**Recommended Approach**: Implement phases sequentially
**Priority Order**: P1 (Assignee) → P2 (Dates) → P3 (Description) → P4 (Comments)
