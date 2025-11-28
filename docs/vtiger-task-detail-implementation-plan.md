# VTiger-Style Task Detail Implementation Plan

**Date**: 2025-11-28
**Status**: Ready for Implementation
**Complexity**: High
**Estimated Effort**: 22 hours
**Target**: TIER 3 (VTiger-Complete)

## Executive Summary

Implement VTiger-inspired task detail view with:
- **Two-column modal layout** (60/40 split)
- **Subtasks with sections** (single-level hierarchy)
- **File attachments** (local filesystem storage)
- **Inline editing** for all fields
- **Priority/Status** in header
- **Comments system** with activity feed
- **Time tracking** (estimate/actual hours)

## Architecture Decisions

### ✅ CONFIRMED SPECIFICATIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Layout** | Modal dialog (keep existing) | Less disruptive, familiar UX |
| **Subtask Depth** | Single-level only | YAGNI - avoid complexity |
| **File Storage** | Local filesystem | Simple, no cloud costs, migration path exists |
| **Target Users** | External customers | Need full feature parity |
| **Timeline** | TIER 3 (22 hours) | Complete VTiger feature set |
| **Description Editor** | Rich text (TipTap) | Professional requirement |

### Layout Strategy: Two-Column Modal

```
┌────────────────────────────────────────────────────────────────┐
│  [Task Title Input - Inline Edit]               [X] Close      │
│  [🔵 In Progress] [🔴 High Priority]                           │
├──────────────────────────┬─────────────────────────────────────┤
│                          │                                     │
│  LEFT (60% - 700px)      │  RIGHT (40% - 450px)               │
│  ─────────────────────   │  ──────────────────────────────     │
│                          │                                     │
│  📅 Dates Section        │  👤 Assignee Widget                │
│  • Start Date            │  [Select User ▼]                    │
│  • Due Date              │                                     │
│                          │  ⏱️ Time Tracking Widget            │
│  📝 Description          │  Estimated: [___] hours             │
│  [Rich text editor]      │  Actual: [___] hours                │
│                          │                                     │
│  ☑️ Subtasks Widget      │  🔗 Related Records                 │
│  Progress: 3/8 (37%)     │  Project: [Link]                    │
│  ━━━━━━━━━━━━━━━━        │  Category: [Badge]                  │
│                          │                                     │
│  📋 Design Phase         │  📎 Attachments (3)                 │
│  ☑ Create wireframes     │  [Upload] [Drag zone]               │
│  ☐ Design mockups        │  • design.pdf (2.3MB) [↓][X]       │
│  ☐ Get approval          │  • screenshot.png (0.5MB) [↓][X]    │
│  [+ Add subtask]         │  • spec.docx (1.2MB) [↓][X]         │
│                          │                                     │
│  📋 Development          │  📊 Activity Timeline               │
│  ☐ Frontend code         │  • John added attachment            │
│  [+ Add subtask]         │    5 mins ago                       │
│                          │  • Sarah changed status             │
│  [+ Add Section]         │    2 hours ago                      │
│                          │  • System: Task created             │
│  💬 Comments (5)         │    Yesterday                        │
│  [Write comment...]      │                                     │
│  ──────────────────      │                                     │
│  John Doe - 2h ago       │                                     │
│  "Looking good!"         │                                     │
│                          │                                     │
└──────────────────────────┴─────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Layout Refactor (2 hours)

**Goal**: Convert single-column dialog to two-column layout

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx`

**Changes:**
```tsx
// Current: Single column ScrollArea
<DialogContent className="max-w-2xl max-h-[90vh]">
  <ScrollArea className="h-full">
    {/* all content */}
  </ScrollArea>
</DialogContent>

// New: Two-column grid
<DialogContent className="max-w-6xl max-h-[90vh]">
  <div className="grid grid-cols-[1fr,450px] gap-6 h-[85vh]">
    {/* LEFT COLUMN */}
    <ScrollArea className="pr-4">
      {/* Primary content */}
    </ScrollArea>

    {/* RIGHT COLUMN */}
    <ScrollArea className="border-l pl-4">
      {/* Widgets */}
    </ScrollArea>
  </div>
</DialogContent>
```

**Testing:**
- [ ] Modal renders at 6xl width
- [ ] Columns scroll independently
- [ ] Responsive on 1920x1080 screens
- [ ] No horizontal overflow

---

### Phase 2: Priority & Status in Header (1 hour)

**Goal**: Make Priority/Status editable badges in dialog header

**Backend Verification:**
```sql
-- Verify columns exist in Tasks table
SELECT TOP 1
    Status,
    Priority
FROM Tasks;

-- Check UpdateTaskDto includes these fields
```

**Frontend Changes:**
```tsx
// Add to TaskDetailDialog header section
<div className="flex items-center gap-2 mb-4">
  {/* Status Badge with Dropdown */}
  <Select value={task.status} onValueChange={handleStatusChange}>
    <SelectTrigger className="w-[140px]">
      <Badge variant={getStatusVariant(task.status)}>
        {getStatusIcon(task.status)}
        {task.status}
      </Badge>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="To Do">To Do</SelectItem>
      <SelectItem value="In Progress">In Progress</SelectItem>
      <SelectItem value="Completed">Completed</SelectItem>
      <SelectItem value="Blocked">Blocked</SelectItem>
    </SelectContent>
  </Select>

  {/* Priority Badge with Dropdown */}
  <Select value={task.priority} onValueChange={handlePriorityChange}>
    <SelectTrigger className="w-[120px]">
      <Badge variant={getPriorityVariant(task.priority)}>
        {getPriorityIcon(task.priority)}
        {task.priority}
      </Badge>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Low">Low</SelectItem>
      <SelectItem value="Medium">Medium</SelectItem>
      <SelectItem value="High">High</SelectItem>
      <SelectItem value="Critical">🔥 Critical</SelectItem>
    </SelectContent>
  </Select>
</div>

// Handlers
const handleStatusChange = async (status: string) => {
  await tasksApi.update(task.id, { status });
  onTaskUpdate?.({ ...task, status });
  toast.success('Status updated');
};

const handlePriorityChange = async (priority: string) => {
  await tasksApi.update(task.id, { priority });
  onTaskUpdate?.({ ...task, priority });
  toast.success('Priority updated');
};
```

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 1-50, header section)

**Testing:**
- [ ] Click status badge → dropdown appears
- [ ] Select new status → API call fires
- [ ] Badge updates immediately
- [ ] Same for priority
- [ ] Toast confirmation appears

---

### Phase 3: Fix Assignee (Move to Right Sidebar) (2 hours)

**Goal**: Create assignee widget in right column with user dropdown

**Backend Verification:**
- ✅ Task.AssignedTo column exists (GUID)
- ✅ UpdateTaskDto includes AssignedTo
- ✅ `usersApi.getAll()` returns user list

**Frontend Changes:**
```tsx
// Right sidebar widget
<div className="border rounded-lg p-4">
  <Label className="text-xs text-gray-500 mb-2 block">Assignee</Label>

  {task.assignee ? (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={task.assignee.avatar} />
        <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{task.assignee.name}</p>
        <p className="text-xs text-gray-500">{task.assignee.email}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setShowAssigneeSelector(true)}>
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowAssigneeSelector(true)}
    >
      <Plus className="h-4 w-4 mr-1" />
      Assign
    </Button>
  )}

  {/* Assignee Selector Popover */}
  <Popover open={showAssigneeSelector} onOpenChange={setShowAssigneeSelector}>
    <PopoverContent className="w-[280px] p-0">
      <Command>
        <CommandInput placeholder="Search users..." />
        <CommandList>
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup>
            {users.map(user => (
              <CommandItem
                key={user.id}
                onSelect={() => handleAssignUser(user.id)}
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                {user.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>

// Handler
const handleAssignUser = async (userID: string) => {
  await tasksApi.update(task.id, { assignedTo: userID });
  const updatedUser = users.find(u => u.id === userID);
  onTaskUpdate?.({ ...task, assignee: updatedUser });
  setShowAssigneeSelector(false);
  toast.success(`Assigned to ${updatedUser.name}`);
};

// Load users on mount
useEffect(() => {
  const loadUsers = async () => {
    const { data } = await usersApi.getAll();
    setUsers(data);
  };
  loadUsers();
}, []);
```

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (right column section)

**Testing:**
- [ ] Click "Assign" button
- [ ] User list loads
- [ ] Search filters users
- [ ] Select user → API call
- [ ] Assignee displays with avatar
- [ ] Reload page → assignee persists

---

### Phase 4: Fix Date Pickers (1 hour)

**Goal**: Persist date changes to backend

**Changes:**
```tsx
// Replace existing setStartDate/setEndDate with handlers
const handleStartDateChange = async (date: Date | undefined) => {
  setStartDate(date);
  try {
    await tasksApi.update(task.id, {
      startDate: date?.toISOString()
    });
    onTaskUpdate?.({ ...task, startDate: date });
    toast.success('Start date updated');
  } catch (error) {
    toast.error('Failed to update start date');
    setStartDate(task.startDate); // Revert on error
  }
};

const handleDueDateChange = async (date: Date | undefined) => {
  setDueDate(date);
  try {
    await tasksApi.update(task.id, {
      dueDate: date?.toISOString()
    });
    onTaskUpdate?.({ ...task, dueDate: date });
    toast.success('Due date updated');
  } catch (error) {
    toast.error('Failed to update due date');
    setDueDate(task.dueDate);
  }
};

// Update DatePicker components
<DatePicker
  label="Start Date"
  date={startDate}
  onDateChange={handleStartDateChange}
/>
<DatePicker
  label="Due Date"
  date={dueDate}
  onDateChange={handleDueDateChange}
/>
```

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 590-625)

**Testing:**
- [ ] Select start date → Network tab shows PUT /api/tasks
- [ ] Success toast appears
- [ ] Reload page → date persists
- [ ] Same for due date
- [ ] Error handling works (test with API down)

---

### Phase 5: Description - Rich Text Editor (3 hours)

**Goal**: Replace plain textarea with TipTap rich text editor

**Install Dependencies:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

**Create Component:**
```tsx
// src/components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  content: string;
  onSave: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onSave, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || 'Add description...' })
    ],
    content,
    onBlur: ({ editor }) => {
      onSave(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none"
      />
    </div>
  );
}
```

**Integrate in TaskDetailDialog:**
```tsx
// Replace textarea section
<div className="mb-6">
  <Label className="mb-2 block">Description</Label>
  <RichTextEditor
    content={description}
    onSave={handleSaveDescription}
    placeholder="Add description..."
  />
</div>

const handleSaveDescription = async (html: string) => {
  setDescription(html);
  try {
    await tasksApi.update(task.id, { description: html });
    toast.success('Description saved');
  } catch (error) {
    toast.error('Failed to save description');
  }
};
```

**Backend Verification:**
- ✅ Task.Description column exists (NVARCHAR(MAX))
- ✅ UpdateTaskDto includes Description

**Files to Create:**
- `src/components/RichTextEditor.tsx`

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (lines 708-721)
- `package.json` (new dependencies)

**Testing:**
- [ ] Type text → formatting toolbar appears
- [ ] Bold/italic/lists work
- [ ] Click outside editor → auto-saves
- [ ] Reload page → formatted text persists
- [ ] HTML renders correctly

---

### Phase 6: Subtasks System (6 hours)

**Most Complex Phase - Backend + Frontend**

#### 6A. Backend Database Changes (2 hours)

**SQL Migration Script:**
```sql
-- Backend/Database/28_Subtasks_Feature.sql

-- Add columns to Tasks table
ALTER TABLE Tasks
ADD ParentTaskID UNIQUEIDENTIFIER NULL,
    SectionName NVARCHAR(100) NULL;

-- Add foreign key
ALTER TABLE Tasks
ADD CONSTRAINT FK_Tasks_ParentTask
    FOREIGN KEY (ParentTaskID) REFERENCES Tasks(TaskID);

-- Create index for performance
CREATE INDEX IX_Tasks_ParentTaskID ON Tasks(ParentTaskID)
WHERE ParentTaskID IS NOT NULL;

-- Stored Procedure: Get Subtasks
CREATE OR ALTER PROCEDURE sp_Task_GetSubtasks
    @ParentTaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50)
AS
BEGIN
    SELECT
        t.TaskID,
        t.Title,
        t.SectionName,
        t.Status,
        t.Priority,
        t.AssignedTo,
        t.DueDate,
        t.IsCompleted,
        u.FullName AS AssigneeName,
        u.Email AS AssigneeEmail
    FROM Tasks t
    LEFT JOIN Users u ON t.AssignedTo = u.UserID
    WHERE t.ParentTaskID = @ParentTaskID
      AND t.SiteID = @SiteID
      AND t.IsDeleted = 0
    ORDER BY t.SectionName, t.CreatedAt;
END;
GO

-- Update sp_Task_Create to accept ParentTaskID and SectionName
CREATE OR ALTER PROCEDURE sp_Task_Create
    @TaskID UNIQUEIDENTIFIER OUTPUT,
    @SiteID NVARCHAR(50),
    @Title NVARCHAR(200),
    @Description NVARCHAR(MAX) = NULL,
    @Status NVARCHAR(50) = 'To Do',
    @Priority NVARCHAR(50) = 'Medium',
    @AssignedTo UNIQUEIDENTIFIER = NULL,
    @ProjectID UNIQUEIDENTIFIER = NULL,
    @ParentTaskID UNIQUEIDENTIFIER = NULL,
    @SectionName NVARCHAR(100) = NULL,
    @StartDate DATETIME2 = NULL,
    @DueDate DATETIME2 = NULL,
    @CreatedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET @TaskID = NEWID();

    INSERT INTO Tasks (
        TaskID, SiteID, Title, Description, Status, Priority,
        AssignedTo, ProjectID, ParentTaskID, SectionName,
        StartDate, DueDate, CreatedBy, CreatedAt, IsDeleted
    )
    VALUES (
        @TaskID, @SiteID, @Title, @Description, @Status, @Priority,
        @AssignedTo, @ProjectID, @ParentTaskID, @SectionName,
        @StartDate, @DueDate, @CreatedBy, GETUTCDATE(), 0
    );

    SELECT @TaskID AS TaskID;
END;
GO

-- Business Rule: Prevent parent task completion if subtasks incomplete
CREATE OR ALTER TRIGGER trg_PreventParentTaskCompletion
ON Tasks
FOR UPDATE
AS
BEGIN
    IF UPDATE(Status) OR UPDATE(IsCompleted)
    BEGIN
        -- Check if trying to complete a task with incomplete subtasks
        IF EXISTS (
            SELECT 1
            FROM inserted i
            INNER JOIN Tasks subtasks ON subtasks.ParentTaskID = i.TaskID
            WHERE (i.Status = 'Completed' OR i.IsCompleted = 1)
              AND (subtasks.Status != 'Completed' AND subtasks.IsCompleted = 0)
              AND subtasks.IsDeleted = 0
        )
        BEGIN
            RAISERROR('Cannot complete task with incomplete subtasks', 16, 1);
            ROLLBACK TRANSACTION;
        END
    END
END;
GO
```

**Run Migration:**
```powershell
# PowerShell
$sql = Get-Content "Backend/Database/28_Subtasks_Feature.sql" -Raw
docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd `
  -S localhost -U sa -P 'TaskFlow@2025!Strong' -C `
  -d TaskFlowDB_Dev -Q $sql
```

#### 6B. Backend API Changes (1 hour)

**Update DTOs:**
```csharp
// Backend/TaskFlow.API/Models/DTOs/Task/CreateTaskDto.cs
public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "To Do";
    public string Priority { get; set; } = "Medium";
    public Guid? AssignedTo { get; set; }
    public Guid? ProjectID { get; set; }
    public Guid? ParentTaskID { get; set; }  // NEW
    public string? SectionName { get; set; }  // NEW
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
}

// Backend/TaskFlow.API/Models/DTOs/Task/TaskDto.cs
public class TaskDto
{
    public Guid TaskID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid? AssignedTo { get; set; }
    public string? AssigneeName { get; set; }
    public Guid? ProjectID { get; set; }
    public Guid? ParentTaskID { get; set; }  // NEW
    public string? SectionName { get; set; }  // NEW
    public bool IsCompleted { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Update Repository:**
```csharp
// Backend/TaskFlow.API/Repositories/Interfaces/ITaskRepository.cs
public interface ITaskRepository
{
    // Existing methods...
    Task<IEnumerable<TaskDto>> GetSubtasksAsync(Guid parentTaskID, string siteID);
}

// Backend/TaskFlow.API/Repositories/TaskRepository.cs
public async Task<IEnumerable<TaskDto>> GetSubtasksAsync(Guid parentTaskID, string siteID)
{
    var parameters = new DynamicParameters();
    parameters.Add("@ParentTaskID", parentTaskID);
    parameters.Add("@SiteID", siteID);

    using var connection = new SqlConnection(_connectionString);
    return await connection.QueryAsync<TaskDto>(
        "sp_Task_GetSubtasks",
        parameters,
        commandType: CommandType.StoredProcedure
    );
}
```

**Update Controller:**
```csharp
// Backend/TaskFlow.API/Controllers/TasksController.cs

[HttpGet("{taskID}/subtasks")]
public async Task<IActionResult> GetSubtasks(Guid taskID)
{
    var siteID = GetCurrentSiteID();
    var subtasks = await _taskRepository.GetSubtasksAsync(taskID, siteID);
    return Ok(new { success = true, data = subtasks });
}

[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
{
    var siteID = GetCurrentSiteID();
    var userID = GetCurrentUserID();

    // Validation: If ParentTaskID provided, verify it exists and belongs to same site
    if (dto.ParentTaskID.HasValue)
    {
        var parentTask = await _taskRepository.GetByIDAsync(dto.ParentTaskID.Value, siteID);
        if (parentTask == null)
        {
            return BadRequest(new { success = false, error = "Parent task not found" });
        }
    }

    var taskID = await _taskRepository.CreateAsync(dto, siteID, userID);
    var task = await _taskRepository.GetByIDAsync(taskID, siteID);

    return Ok(new { success = true, data = task });
}
```

**Files to Create:**
- `Backend/Database/28_Subtasks_Feature.sql`

**Files to Modify:**
- `Backend/TaskFlow.API/Models/DTOs/Task/CreateTaskDto.cs`
- `Backend/TaskFlow.API/Models/DTOs/Task/TaskDto.cs`
- `Backend/TaskFlow.API/Repositories/Interfaces/ITaskRepository.cs`
- `Backend/TaskFlow.API/Repositories/TaskRepository.cs`
- `Backend/TaskFlow.API/Controllers/TasksController.cs`

**Backend Testing:**
```bash
# Verify migration
dotnet build

# Test API endpoints
curl -X GET "http://localhost:5001/api/tasks/{taskID}/subtasks" \
  -H "Authorization: Bearer {token}"

curl -X POST "http://localhost:5001/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Subtask 1",
    "parentTaskID": "{parent-guid}",
    "sectionName": "Design Phase"
  }'
```

#### 6C. Frontend API Client (0.5 hours)

**Update api.ts:**
```typescript
// src/services/api.ts

export const tasksApi = {
  // Existing methods...

  getSubtasks: async (taskID: string) => {
    return client.get<Task[]>(`/tasks/${taskID}/subtasks`);
  },

  createSubtask: async (data: {
    title: string;
    parentTaskID: string;
    sectionName: string;
    assignedTo?: string;
    dueDate?: string;
  }) => {
    return client.post<Task>('/tasks', data);
  },
};
```

**Files to Modify:**
- `src/services/api.ts`

#### 6D. Frontend SubtasksWidget Component (2.5 hours)

**Create Component:**
```tsx
// src/components/SubtasksWidget.tsx
import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { tasksApi } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Task {
  taskID: string;
  title: string;
  sectionName: string;
  status: string;
  isCompleted: boolean;
  assignedTo?: string;
  assigneeName?: string;
  dueDate?: string;
}

interface SubtaskSection {
  sectionName: string;
  subtasks: Task[];
  isExpanded: boolean;
}

interface SubtasksWidgetProps {
  taskID: string;
  onSubtasksChange?: () => void;
}

export function SubtasksWidget({ taskID, onSubtasksChange }: SubtasksWidgetProps) {
  const [sections, setSections] = useState<SubtaskSection[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [addingSubtaskToSection, setAddingSubtaskToSection] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Load subtasks
  useEffect(() => {
    loadSubtasks();
  }, [taskID]);

  const loadSubtasks = async () => {
    try {
      const { data } = await tasksApi.getSubtasks(taskID);

      // Group by section
      const grouped = data.reduce((acc, task) => {
        const sectionName = task.sectionName || 'Uncategorized';
        if (!acc[sectionName]) {
          acc[sectionName] = [];
        }
        acc[sectionName].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      const sectionsArray = Object.entries(grouped).map(([name, subtasks]) => ({
        sectionName: name,
        subtasks,
        isExpanded: true,
      }));

      setSections(sectionsArray);
    } catch (error) {
      toast.error('Failed to load subtasks');
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress
  const totalSubtasks = sections.flatMap(s => s.subtasks).length;
  const completedSubtasks = sections.flatMap(s => s.subtasks)
    .filter(t => t.isCompleted).length;
  const progress = totalSubtasks > 0
    ? Math.round((completedSubtasks / totalSubtasks) * 100)
    : 0;

  // Handlers
  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      setIsAddingSection(false);
      return;
    }

    setSections(prev => [...prev, {
      sectionName: newSectionName,
      subtasks: [],
      isExpanded: true,
    }]);

    setNewSectionName('');
    setIsAddingSection(false);
    setAddingSubtaskToSection(newSectionName); // Auto-focus to add subtask
  };

  const handleCreateSubtask = async (sectionName: string) => {
    if (!newSubtaskTitle.trim()) {
      setAddingSubtaskToSection(null);
      return;
    }

    try {
      const { data } = await tasksApi.createSubtask({
        title: newSubtaskTitle,
        parentTaskID: taskID,
        sectionName,
      });

      // Update sections
      setSections(prev => prev.map(section => {
        if (section.sectionName === sectionName) {
          return {
            ...section,
            subtasks: [...section.subtasks, data],
          };
        }
        return section;
      }));

      setNewSubtaskTitle('');
      setAddingSubtaskToSection(null);
      toast.success('Subtask created');
      onSubtasksChange?.();
    } catch (error) {
      toast.error('Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (subtaskID: string) => {
    try {
      const subtask = sections.flatMap(s => s.subtasks)
        .find(t => t.taskID === subtaskID);

      if (!subtask) return;

      const newStatus = subtask.isCompleted ? 'To Do' : 'Completed';
      const newIsCompleted = !subtask.isCompleted;

      await tasksApi.update(subtaskID, {
        status: newStatus,
        isCompleted: newIsCompleted,
      });

      // Update local state
      setSections(prev => prev.map(section => ({
        ...section,
        subtasks: section.subtasks.map(t =>
          t.taskID === subtaskID
            ? { ...t, status: newStatus, isCompleted: newIsCompleted }
            : t
        ),
      })));

      onSubtasksChange?.();
    } catch (error) {
      toast.error('Failed to update subtask');
    }
  };

  const toggleSection = (sectionName: string) => {
    setSections(prev => prev.map(section =>
      section.sectionName === sectionName
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading subtasks...</div>;
  }

  return (
    <div className="border rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">Subtasks</h3>
        {totalSubtasks > 0 && (
          <Badge variant="secondary">
            {completedSubtasks}/{totalSubtasks}
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {totalSubtasks > 0 && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
        </div>
      )}

      {/* Sections */}
      {sections.map(section => (
        <div key={section.sectionName} className="mb-4">
          {/* Section Header */}
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            onClick={() => toggleSection(section.sectionName)}
          >
            {section.isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <h4 className="text-sm font-medium text-gray-700">
              {section.sectionName}
            </h4>
            <Badge variant="outline" className="text-xs">
              {section.subtasks.filter(t => t.isCompleted).length}/{section.subtasks.length}
            </Badge>
          </div>

          {/* Subtasks List */}
          {section.isExpanded && (
            <div className="ml-6 space-y-2">
              {section.subtasks.map(subtask => (
                <div
                  key={subtask.taskID}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                >
                  <Checkbox
                    checked={subtask.isCompleted}
                    onCheckedChange={() => handleToggleSubtask(subtask.taskID)}
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      subtask.isCompleted && 'line-through text-gray-400'
                    )}
                  >
                    {subtask.title}
                  </span>

                  {/* Metadata */}
                  <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {subtask.assigneeName && (
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {subtask.assigneeName[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {subtask.dueDate && (
                      <Badge variant="outline" className="text-xs h-5">
                        {format(new Date(subtask.dueDate), 'MMM d')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Subtask Input */}
              {addingSubtaskToSection === section.sectionName ? (
                <Input
                  autoFocus
                  placeholder="Subtask title..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateSubtask(section.sectionName);
                    if (e.key === 'Escape') setAddingSubtaskToSection(null);
                  }}
                  onBlur={() => handleCreateSubtask(section.sectionName)}
                  className="h-8 text-sm"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingSubtaskToSection(section.sectionName)}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add subtask
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Section */}
      {isAddingSection ? (
        <Input
          autoFocus
          placeholder="Section name (e.g., Design Phase)"
          value={newSectionName}
          onChange={e => setNewSectionName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreateSection();
            if (e.key === 'Escape') setIsAddingSection(false);
          }}
          onBlur={handleCreateSection}
          className="h-9"
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingSection(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Section
        </Button>
      )}
    </div>
  );
}
```

**Files to Create:**
- `src/components/SubtasksWidget.tsx`

**Files to Modify:**
- `src/components/TaskDetailDialog.tsx` (add `<SubtasksWidget taskID={task.id} />` in left column)

**Testing:**
- [ ] Click "Add Section" → input appears
- [ ] Type section name → section created
- [ ] Click "Add subtask" → input appears
- [ ] Create subtask → appears in list
- [ ] Check checkbox → subtask marked complete
- [ ] Progress bar updates
- [ ] Reload page → subtasks persist
- [ ] Try to complete parent task with incomplete subtasks → error message

---

### Phase 7: Time Tracking Widget (2 hours)

**Goal**: Add Estimated/Actual hours fields in right sidebar

**Backend Changes:**
```sql
-- Backend/Database/29_Time_Tracking.sql

-- Add columns to Tasks table
ALTER TABLE Tasks
ADD EstimatedHours DECIMAL(10,2) NULL,
    ActualHours DECIMAL(10,2) NULL;

-- Update sp_Task_Update to accept new fields
CREATE OR ALTER PROCEDURE sp_Task_Update
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    -- ... existing parameters
    @EstimatedHours DECIMAL(10,2) = NULL,
    @ActualHours DECIMAL(10,2) = NULL
AS
BEGIN
    UPDATE Tasks
    SET
        -- ... existing fields
        EstimatedHours = COALESCE(@EstimatedHours, EstimatedHours),
        ActualHours = COALESCE(@ActualHours, ActualHours),
        UpdatedAt = GETUTCDATE()
    WHERE TaskID = @TaskID AND SiteID = @SiteID;
END;
GO
```

**Backend DTO Updates:**
```csharp
// UpdateTaskDto.cs
public class UpdateTaskDto
{
    // ... existing properties
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
}

// TaskDto.cs
public class TaskDto
{
    // ... existing properties
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
}
```

**Frontend Component:**
```tsx
// In TaskDetailDialog.tsx - Right sidebar
<div className="border rounded-lg p-4">
  <h3 className="font-semibold text-sm mb-3">Time Tracking</h3>

  <div className="space-y-3">
    {/* Estimated Hours */}
    <div>
      <Label className="text-xs text-gray-500">Estimated (hours)</Label>
      <Input
        type="number"
        step="0.5"
        min="0"
        value={estimatedHours || ''}
        onChange={e => setEstimatedHours(parseFloat(e.target.value))}
        onBlur={handleSaveEstimatedHours}
        placeholder="0"
        className="h-8 mt-1"
      />
    </div>

    {/* Actual Hours */}
    <div>
      <Label className="text-xs text-gray-500">Actual (hours)</Label>
      <Input
        type="number"
        step="0.5"
        min="0"
        value={actualHours || ''}
        onChange={e => setActualHours(parseFloat(e.target.value))}
        onBlur={handleSaveActualHours}
        placeholder="0"
        className="h-8 mt-1"
      />
    </div>

    {/* Variance (if both set) */}
    {estimatedHours && actualHours && (
      <div className="pt-2 border-t">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Variance:</span>
          <span className={cn(
            'font-medium',
            actualHours > estimatedHours ? 'text-red-600' : 'text-green-600'
          )}>
            {actualHours > estimatedHours ? '+' : ''}
            {(actualHours - estimatedHours).toFixed(1)}h
          </span>
        </div>
      </div>
    )}
  </div>
</div>

// Handlers
const handleSaveEstimatedHours = async () => {
  try {
    await tasksApi.update(task.id, { estimatedHours });
    toast.success('Estimated hours updated');
  } catch (error) {
    toast.error('Failed to update');
  }
};

const handleSaveActualHours = async () => {
  try {
    await tasksApi.update(task.id, { actualHours });
    toast.success('Actual hours updated');
  } catch (error) {
    toast.error('Failed to update');
  }
};
```

**Files to Create:**
- `Backend/Database/29_Time_Tracking.sql`

**Files to Modify:**
- `Backend/TaskFlow.API/Models/DTOs/Task/UpdateTaskDto.cs`
- `Backend/TaskFlow.API/Models/DTOs/Task/TaskDto.cs`
- `src/components/TaskDetailDialog.tsx`

**Testing:**
- [ ] Enter estimated hours → saves on blur
- [ ] Enter actual hours → saves on blur
- [ ] Variance calculates correctly
- [ ] Red if over estimate, green if under
- [ ] Reload page → values persist

---

### Phase 8: Attachments System (5 hours)

**Most Critical for External Customers**

#### 8A. Backend Database & Storage (2 hours)

**SQL Migration:**
```sql
-- Backend/Database/30_Attachments.sql

CREATE TABLE TaskAttachments (
    AttachmentID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TaskID UNIQUEIDENTIFIER NOT NULL,
    SiteID NVARCHAR(50) NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileURL NVARCHAR(500) NOT NULL,
    FileSize BIGINT NOT NULL,
    MimeType NVARCHAR(100),
    UploadedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_TaskAttachments_Task FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID),
    CONSTRAINT FK_TaskAttachments_User FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
);

CREATE INDEX IX_TaskAttachments_TaskID ON TaskAttachments(TaskID)
WHERE IsDeleted = 0;

-- Stored Procedures
CREATE OR ALTER PROCEDURE sp_Attachment_Create
    @AttachmentID UNIQUEIDENTIFIER OUTPUT,
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50),
    @FileName NVARCHAR(255),
    @FileURL NVARCHAR(500),
    @FileSize BIGINT,
    @MimeType NVARCHAR(100),
    @UploadedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET @AttachmentID = NEWID();

    INSERT INTO TaskAttachments (
        AttachmentID, TaskID, SiteID, FileName, FileURL,
        FileSize, MimeType, UploadedBy, CreatedAt, IsDeleted
    )
    VALUES (
        @AttachmentID, @TaskID, @SiteID, @FileName, @FileURL,
        @FileSize, @MimeType, @UploadedBy, GETUTCDATE(), 0
    );

    SELECT * FROM TaskAttachments WHERE AttachmentID = @AttachmentID;
END;
GO

CREATE OR ALTER PROCEDURE sp_Attachment_GetByTask
    @TaskID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50)
AS
BEGIN
    SELECT
        a.AttachmentID,
        a.TaskID,
        a.FileName,
        a.FileURL,
        a.FileSize,
        a.MimeType,
        a.CreatedAt,
        u.FullName AS UploadedByName
    FROM TaskAttachments a
    LEFT JOIN Users u ON a.UploadedBy = u.UserID
    WHERE a.TaskID = @TaskID
      AND a.SiteID = @SiteID
      AND a.IsDeleted = 0
    ORDER BY a.CreatedAt DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_Attachment_Delete
    @AttachmentID UNIQUEIDENTIFIER,
    @SiteID NVARCHAR(50)
AS
BEGIN
    UPDATE TaskAttachments
    SET IsDeleted = 1
    WHERE AttachmentID = @AttachmentID
      AND SiteID = @SiteID;
END;
GO
```

**Backend Entity & DTOs:**
```csharp
// Backend/TaskFlow.API/Models/Entities/TaskAttachment.cs
namespace TaskFlow.API.Models.Entities;

public class TaskAttachment
{
    public Guid AttachmentID { get; set; }
    public Guid TaskID { get; set; }
    public string SiteID { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileURL { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public Guid UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
}

// Backend/TaskFlow.API/Models/DTOs/Attachment/AttachmentDto.cs
namespace TaskFlow.API.Models.DTOs.Attachment;

public class AttachmentDto
{
    public Guid AttachmentID { get; set; }
    public Guid TaskID { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileURL { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UploadedByName { get; set; }
}
```

**Repository:**
```csharp
// Backend/TaskFlow.API/Repositories/Interfaces/IAttachmentRepository.cs
namespace TaskFlow.API.Repositories.Interfaces;

public interface IAttachmentRepository
{
    Task<AttachmentDto> CreateAsync(Guid taskID, string siteID, string fileName,
        string fileURL, long fileSize, string? mimeType, Guid uploadedBy);
    Task<IEnumerable<AttachmentDto>> GetByTaskAsync(Guid taskID, string siteID);
    Task<bool> DeleteAsync(Guid attachmentID, string siteID);
}

// Backend/TaskFlow.API/Repositories/AttachmentRepository.cs
using Dapper;
using System.Data;
using Microsoft.Data.SqlClient;
using TaskFlow.API.Models.DTOs.Attachment;

namespace TaskFlow.API.Repositories;

public class AttachmentRepository : IAttachmentRepository
{
    private readonly string _connectionString;

    public AttachmentRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("Connection string not found");
    }

    public async Task<AttachmentDto> CreateAsync(Guid taskID, string siteID,
        string fileName, string fileURL, long fileSize, string? mimeType, Guid uploadedBy)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@AttachmentID", dbType: DbType.Guid, direction: ParameterDirection.Output);
        parameters.Add("@TaskID", taskID);
        parameters.Add("@SiteID", siteID);
        parameters.Add("@FileName", fileName);
        parameters.Add("@FileURL", fileURL);
        parameters.Add("@FileSize", fileSize);
        parameters.Add("@MimeType", mimeType);
        parameters.Add("@UploadedBy", uploadedBy);

        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryFirstAsync<AttachmentDto>(
            "sp_Attachment_Create",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<IEnumerable<AttachmentDto>> GetByTaskAsync(Guid taskID, string siteID)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@TaskID", taskID);
        parameters.Add("@SiteID", siteID);

        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<AttachmentDto>(
            "sp_Attachment_GetByTask",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<bool> DeleteAsync(Guid attachmentID, string siteID)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@AttachmentID", attachmentID);
        parameters.Add("@SiteID", siteID);

        using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(
            "sp_Attachment_Delete",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return true;
    }
}
```

**Controller:**
```csharp
// Backend/TaskFlow.API/Controllers/AttachmentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Repositories.Interfaces;

namespace TaskFlow.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttachmentsController : ApiControllerBase
{
    private readonly IAttachmentRepository _attachmentRepository;
    private readonly IWebHostEnvironment _environment;
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly string[] AllowedExtensions = {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx",
        ".png", ".jpg", ".jpeg", ".gif", ".txt", ".zip"
    };

    public AttachmentsController(
        IAttachmentRepository attachmentRepository,
        IWebHostEnvironment environment)
    {
        _attachmentRepository = attachmentRepository;
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] Guid taskID)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { success = false, error = "No file provided" });
        }

        // Validate file size
        if (file.Length > MaxFileSize)
        {
            return BadRequest(new {
                success = false,
                error = $"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB"
            });
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new {
                success = false,
                error = $"File type {extension} is not allowed"
            });
        }

        var siteID = GetCurrentSiteID();
        var userID = GetCurrentUserID();

        // Create uploads directory if not exists
        var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", taskID.ToString());
        Directory.CreateDirectory(uploadsPath);

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsPath, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create database record
        var fileURL = $"/uploads/{taskID}/{uniqueFileName}";
        var attachment = await _attachmentRepository.CreateAsync(
            taskID,
            siteID,
            file.FileName,
            fileURL,
            file.Length,
            file.ContentType,
            userID
        );

        return Ok(new { success = true, data = attachment });
    }

    [HttpGet("task/{taskID}")]
    public async Task<IActionResult> GetByTask(Guid taskID)
    {
        var siteID = GetCurrentSiteID();
        var attachments = await _attachmentRepository.GetByTaskAsync(taskID, siteID);
        return Ok(new { success = true, data = attachments });
    }

    [HttpDelete("{attachmentID}")]
    public async Task<IActionResult> Delete(Guid attachmentID)
    {
        var siteID = GetCurrentSiteID();

        // TODO: Also delete physical file from filesystem
        // For now, just soft delete from database

        await _attachmentRepository.DeleteAsync(attachmentID, siteID);
        return Ok(new { success = true, message = "Attachment deleted" });
    }
}
```

**Register in Program.cs:**
```csharp
// Backend/TaskFlow.API/Program.cs
builder.Services.AddScoped<IAttachmentRepository, AttachmentRepository>();
```

#### 8B. Frontend AttachmentsWidget (3 hours)

**Create Component:**
```tsx
// src/components/AttachmentsWidget.tsx
import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, File, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { attachmentsApi } from '../services/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface Attachment {
  attachmentID: string;
  taskID: string;
  fileName: string;
  fileURL: string;
  fileSize: number;
  mimeType?: string;
  createdAt: string;
  uploadedByName?: string;
}

interface AttachmentsWidgetProps {
  taskID: string;
}

export function AttachmentsWidget({ taskID }: AttachmentsWidgetProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [taskID]);

  const loadAttachments = async () => {
    try {
      const { data } = await attachmentsApi.getByTask(taskID);
      setAttachments(data);
    } catch (error) {
      toast.error('Failed to load attachments');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskID', taskID);

        const { data } = await attachmentsApi.upload(formData);
        setAttachments(prev => [data, ...prev]);
        toast.success(`${file.name} uploaded`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachmentID: string, fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      await attachmentsApi.delete(attachmentID);
      setAttachments(prev => prev.filter(a => a.attachmentID !== attachmentID));
      toast.success('Attachment deleted');
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleDownload = (fileURL: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5001${fileURL}`;
    link.download = fileName;
    link.click();
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }

    if (['pdf'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }

    if (['doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }

    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="border rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.zip"
      />

      {/* Drag & Drop Zone */}
      {attachments.length === 0 && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "hover:border-gray-400 transition-colors"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Click to upload files</p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOC, XLS, Images (Max 10MB)
          </p>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="text-center py-4 text-sm text-gray-500">
          Uploading...
        </div>
      )}

      {/* Attachment List */}
      <div className="space-y-2">
        {attachments.map(att => (
          <div
            key={att.attachmentID}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group"
          >
            {/* File Icon */}
            {getFileIcon(att.fileName, att.mimeType)}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{att.fileName}</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>{formatFileSize(att.fileSize)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(att.createdAt), { addSuffix: true })}</span>
                {att.uploadedByName && (
                  <>
                    <span>•</span>
                    <span>{att.uploadedByName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(att.fileURL, att.fileName)}
                className="h-7 w-7 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(att.attachmentID, att.fileName)}
                className="h-7 w-7 p-0 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Update api.ts:**
```typescript
// src/services/api.ts

export const attachmentsApi = {
  upload: (formData: FormData) =>
    client.post<Attachment>('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getByTask: (taskID: string) =>
    client.get<Attachment[]>(`/attachments/task/${taskID}`),

  delete: (attachmentID: string) =>
    client.delete(`/attachments/${attachmentID}`),
};
```

**Files to Create:**
- `Backend/Database/30_Attachments.sql`
- `Backend/TaskFlow.API/Models/Entities/TaskAttachment.cs`
- `Backend/TaskFlow.API/Models/DTOs/Attachment/AttachmentDto.cs`
- `Backend/TaskFlow.API/Repositories/Interfaces/IAttachmentRepository.cs`
- `Backend/TaskFlow.API/Repositories/AttachmentRepository.cs`
- `Backend/TaskFlow.API/Controllers/AttachmentsController.cs`
- `src/components/AttachmentsWidget.tsx`

**Files to Modify:**
- `Backend/TaskFlow.API/Program.cs`
- `src/services/api.ts`
- `src/components/TaskDetailDialog.tsx`

**Testing:**
- [ ] Click upload → file dialog opens
- [ ] Select file → uploads successfully
- [ ] File appears in list
- [ ] Click download → file downloads
- [ ] Click delete → confirmation, then deletes
- [ ] Verify file saved to `Backend/wwwroot/uploads/{taskID}/`
- [ ] Test file size validation (>10MB)
- [ ] Test file type validation (.exe should fail)
- [ ] Multiple file upload works

---

### Phase 9: Comments System (3 hours)

**Your original Phase 4 - implemented as-is**

**Backend:**
- Create Comment entity, DTOs, repository, controller
- Stored procedures: `sp_Comment_Create`, `sp_Comment_GetByTask`

**Frontend:**
- Add commentsApi to api.ts
- Update existing comments section to load from API
- Remove localStorage logic

**Reference:** See original plan lines 189-256

**Files to Create:**
- `Backend/Database/31_Comments.sql`
- `Backend/TaskFlow.API/Models/Entities/Comment.cs`
- `Backend/TaskFlow.API/Models/DTOs/Comment/CommentDto.cs`
- `Backend/TaskFlow.API/Models/DTOs/Comment/CreateCommentDto.cs`
- `Backend/TaskFlow.API/Repositories/Interfaces/ICommentRepository.cs`
- `Backend/TaskFlow.API/Repositories/CommentRepository.cs`
- `Backend/TaskFlow.API/Controllers/CommentsController.cs`

**Files to Modify:**
- `Backend/TaskFlow.API/Program.cs`
- `src/services/api.ts`
- `src/components/TaskDetailDialog.tsx` (lines 857-922)

---

### Phase 10: Polish & Testing (2 hours)

**Final Touches:**

1. **Add Project Link Widget** (15 min)
```tsx
// Right sidebar
<div className="border rounded-lg p-4">
  <Label className="text-xs text-gray-500 mb-2 block">Project</Label>
  {task.projectID && (
    <Link
      to={`/projects/${task.projectID}`}
      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
    >
      <Folder className="h-4 w-4" />
      {task.projectName || 'View Project'}
    </Link>
  )}
</div>
```

2. **Activity Timeline Enhancement** (30 min)
- Merge comments + system events
- Show "John added attachment design.pdf"
- Show "Sarah changed status to In Progress"

3. **Responsive Testing** (30 min)
- Test on 1920x1080, 1366x768
- Ensure modal doesn't overflow
- Test scrolling behavior

4. **Error Handling** (30 min)
- Network failures show error toasts
- Loading states for all widgets
- Retry logic for failed uploads

5. **Performance** (15 min)
- Debounce description autosave
- Lazy load attachments
- Optimize re-renders

---

## Testing Strategy

### Comprehensive Test Checklist

**Layout & Navigation:**
- [ ] Dialog opens at correct size (max-w-6xl)
- [ ] Two columns visible side-by-side
- [ ] Left/right columns scroll independently
- [ ] Close button works
- [ ] Dialog closes on Escape key

**Priority & Status:**
- [ ] Status badge shows current value
- [ ] Click status → dropdown appears
- [ ] Change status → API call, toast, badge updates
- [ ] Same for priority
- [ ] Badges use correct colors

**Assignee:**
- [ ] Shows current assignee with avatar
- [ ] Click edit → user list appears
- [ ] Search filters users
- [ ] Select user → API call, updates display
- [ ] Unassigned tasks show "Assign" button

**Dates:**
- [ ] Start date saves on change
- [ ] Due date saves on change
- [ ] Dates persist after reload
- [ ] Error handling if API fails

**Description:**
- [ ] Rich text editor renders
- [ ] Formatting buttons work (bold, italic, lists)
- [ ] Auto-saves on blur
- [ ] HTML persists after reload
- [ ] Character limit (optional)

**Subtasks:**
- [ ] Click "Add Section" → input appears
- [ ] Create section → appears in list
- [ ] Click "Add subtask" → input appears
- [ ] Create subtask → appears under section
- [ ] Check subtask → marks complete, updates progress
- [ ] Progress bar calculates correctly
- [ ] Cannot complete parent with incomplete subtasks
- [ ] Reload → subtasks persist

**Time Tracking:**
- [ ] Enter estimated hours → saves
- [ ] Enter actual hours → saves
- [ ] Variance calculates correctly
- [ ] Red/green color coding works

**Attachments:**
- [ ] Click upload → file dialog
- [ ] Upload file → appears in list
- [ ] Download file → downloads correctly
- [ ] Delete file → confirmation, removes from list
- [ ] File size validation (>10MB fails)
- [ ] File type validation (.exe fails)
- [ ] Multiple files upload

**Comments:**
- [ ] Load existing comments
- [ ] Type comment → Send button enabled
- [ ] Send comment → appears in list
- [ ] Comments ordered by date
- [ ] User name/avatar shows

**Performance:**
- [ ] No lag when typing in description
- [ ] Smooth scrolling
- [ ] No console errors
- [ ] API calls batched/debounced

---

## Database Migrations Checklist

Run in order:

1. `Backend/Database/28_Subtasks_Feature.sql`
2. `Backend/Database/29_Time_Tracking.sql`
3. `Backend/Database/30_Attachments.sql`
4. `Backend/Database/31_Comments.sql`

**Migration Command:**
```powershell
# PowerShell script to run all migrations
$files = @(
    "28_Subtasks_Feature.sql",
    "29_Time_Tracking.sql",
    "30_Attachments.sql",
    "31_Comments.sql"
)

foreach ($file in $files) {
    Write-Host "Running migration: $file" -ForegroundColor Cyan
    $sql = Get-Content "Backend/Database/$file" -Raw
    docker exec taskflow-sqlserver /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P 'TaskFlow@2025!Strong' -C `
        -d TaskFlowDB_Dev -Q $sql
    Write-Host "✓ $file completed" -ForegroundColor Green
}
```

---

## File Checklist

### Backend Files to Create (14 files):
- [ ] `Backend/Database/28_Subtasks_Feature.sql`
- [ ] `Backend/Database/29_Time_Tracking.sql`
- [ ] `Backend/Database/30_Attachments.sql`
- [ ] `Backend/Database/31_Comments.sql`
- [ ] `Backend/TaskFlow.API/Models/Entities/TaskAttachment.cs`
- [ ] `Backend/TaskFlow.API/Models/Entities/Comment.cs`
- [ ] `Backend/TaskFlow.API/Models/DTOs/Attachment/AttachmentDto.cs`
- [ ] `Backend/TaskFlow.API/Models/DTOs/Comment/CommentDto.cs`
- [ ] `Backend/TaskFlow.API/Models/DTOs/Comment/CreateCommentDto.cs`
- [ ] `Backend/TaskFlow.API/Repositories/Interfaces/IAttachmentRepository.cs`
- [ ] `Backend/TaskFlow.API/Repositories/Interfaces/ICommentRepository.cs`
- [ ] `Backend/TaskFlow.API/Repositories/AttachmentRepository.cs`
- [ ] `Backend/TaskFlow.API/Repositories/CommentRepository.cs`
- [ ] `Backend/TaskFlow.API/Controllers/AttachmentsController.cs`
- [ ] `Backend/TaskFlow.API/Controllers/CommentsController.cs`

### Backend Files to Modify (7 files):
- [ ] `Backend/TaskFlow.API/Models/DTOs/Task/CreateTaskDto.cs`
- [ ] `Backend/TaskFlow.API/Models/DTOs/Task/TaskDto.cs`
- [ ] `Backend/TaskFlow.API/Models/DTOs/Task/UpdateTaskDto.cs`
- [ ] `Backend/TaskFlow.API/Repositories/Interfaces/ITaskRepository.cs`
- [ ] `Backend/TaskFlow.API/Repositories/TaskRepository.cs`
- [ ] `Backend/TaskFlow.API/Controllers/TasksController.cs`
- [ ] `Backend/TaskFlow.API/Program.cs`

### Frontend Files to Create (3 files):
- [ ] `src/components/RichTextEditor.tsx`
- [ ] `src/components/SubtasksWidget.tsx`
- [ ] `src/components/AttachmentsWidget.tsx`

### Frontend Files to Modify (2 files):
- [ ] `src/services/api.ts`
- [ ] `src/components/TaskDetailDialog.tsx`

### Config Files to Modify (1 file):
- [ ] `package.json` (add TipTap dependencies)

---

## Rollout Plan

**Week 1 (16 hours):**
- Day 1: Phases 1-4 (Layout, Priority/Status, Assignee, Dates) - 6h
- Day 2: Phases 5-6 (Description, Subtasks Backend) - 6h
- Day 3: Phase 6 continued (Subtasks Frontend) - 4h

**Week 2 (6 hours):**
- Day 4: Phases 7-8 (Time Tracking, Attachments) - 7h
- Day 5: Phases 9-10 (Comments, Polish) - 5h

**Total: 22 hours**

---

## Success Criteria

- ✅ Modal opens with two-column layout
- ✅ All fields editable and persist to database
- ✅ Subtasks with sections fully functional
- ✅ File upload/download works
- ✅ Comments load from API
- ✅ Time tracking calculates variance
- ✅ No console errors
- ✅ Matches VTiger UX patterns
- ✅ Passes all test cases
- ✅ External customers can use for real work

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| File upload security | HIGH | Validate file types, size limits, sanitize filenames |
| Subtask business rule bugs | MEDIUM | Extensive testing, trigger validation |
| Rich text XSS vulnerabilities | MEDIUM | Sanitize HTML on backend |
| Performance with 100+ subtasks | MEDIUM | Pagination, lazy loading |
| Mobile responsiveness | LOW | Desktop-first, mobile v2 |

---

## Open Questions

1. **File Storage Migration:** When to move from local filesystem to Azure Blob?
   - Recommendation: When uploads folder > 5GB or multiple server instances needed

2. **Subtask Assignment:** Should subtasks inherit parent assignee by default?
   - Recommendation: Yes, with option to override

3. **Comment Editing:** Allow users to edit/delete their own comments?
   - Recommendation: Phase 2 feature (out of scope for now)

4. **Email Notifications:** Send email when assigned task or mentioned in comment?
   - Recommendation: Phase 2 feature

5. **Activity Timeline:** Show all system events or just important ones?
   - Recommendation: Filter to important events (status change, assignee change, attachments)

---

## Next Steps

1. ✅ Review plan with stakeholders
2. ✅ Confirm timeline acceptable (22 hours ~3 days)
3. ✅ Verify backend SQL Server version supports all features
4. Start Phase 1 implementation
5. Daily progress check-ins
6. Deploy to staging after Phase 6
7. User acceptance testing after Phase 10

---

**End of Implementation Plan**

*Ready to begin implementation. All decisions locked. Execute phases sequentially.*
