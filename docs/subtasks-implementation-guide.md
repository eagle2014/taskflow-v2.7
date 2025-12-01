# Subtasks Implementation Guide

## Status: 🚧 In Progress

### ✅ Completed Tasks

1. **Backend API**
   - ✅ Created `GET /api/tasks/parent/{parentTaskId}` endpoint
   - ✅ Added `GetByParentTaskAsync` in ITaskRepository & TaskRepository
   - ✅ Created & executed stored procedure `sp_Task_GetByParentTask`
   - ✅ Backend ready to serve subtasks

2. **Frontend API Client**
   - ✅ Added `tasksApi.getByParentTask(parentTaskId)` method in api.ts

3. **UI Features (Already Exist)**
   - ✅ Sort button with dropdown (Default Order, Sort by Name, Sort by Status)
   - ✅ Expand/Fullscreen button using absolute positioning
   - ✅ Suggest subtasks button with AI simulation

### 🚧 Remaining Tasks

#### 1. Load Subtasks from API
**File**: `src/components/TaskDetailDialog/TaskDetailDialog.tsx`

Add useEffect to load subtasks when dialog opens:

```typescript
// Add after line 402 (after loadComments useEffect)
useEffect(() => {
  const loadSubtasks = async () => {
    if (!open || !task?.id || loadedTaskIdRef.current === task.id) return;

    try {
      // Load subtasks from API
      const apiSubtasks = await tasksApi.getByParentTask(task.id);

      // Convert API Task[] to Subtask[] format
      const subtasksList: Subtask[] = apiSubtasks.map(apiTask => ({
        id: apiTask.taskID,
        name: apiTask.title,
        completed: apiTask.status === 'Done',
        status: apiTask.status === 'Done' ? 'done' : 'todo',
        assigneeID: apiTask.assigneeID,
        dueDate: apiTask.dueDate,
      }));

      setSubtasks(subtasksList);
    } catch (error) {
      console.error('Failed to load subtasks:', error);
    }
  };

  loadSubtasks();
}, [open, task?.id]);
```

#### 2. Save New Subtasks to Database
**File**: `src/components/TaskDetailDialog/components/TaskTabs.tsx`

Update `handleAddSubtask` to call API (line 210-218):

```typescript
const handleAddSubtask = async (name: string) => {
  try {
    // Create subtask via API
    const newTask = await tasksApi.create({
      projectID: task.projectID,
      parentTaskID: task.id,
      title: name,
      status: 'To Do',
      priority: 'Medium',
    });

    // Convert to Subtask format
    const newSubtask: Subtask = {
      id: newTask.taskID,
      name: newTask.title,
      completed: false,
      status: 'todo',
    };

    onSubtasksChange?.([...subtasks, newSubtask]);
    toast.success('Subtask created');
  } catch (error) {
    console.error('Failed to create subtask:', error);
    toast.error('Failed to create subtask');
  }
};
```

#### 3. Toggle Subtask Complete Status
**File**: `src/components/TaskDetailDialog/components/TaskTabs.tsx`

Update `handleToggleSubtask` (line 220-227):

```typescript
const handleToggleSubtask = async (id: string) => {
  try {
    const subtask = subtasks.find(st => st.id === id);
    if (!subtask) return;

    const newStatus = subtask.completed ? 'To Do' : 'Done';

    // Update via API
    await tasksApi.update(id, {
      status: newStatus
    });

    // Update local state
    const updated = subtasks.map((st) =>
      st.id === id
        ? { ...st, completed: !st.completed, status: (st.completed ? 'todo' : 'done') as 'todo' | 'done' }
        : st
    );
    onSubtasksChange?.(updated);
    toast.success('Subtask updated');
  } catch (error) {
    console.error('Failed to update subtask:', error);
    toast.error('Failed to update subtask');
  }
};
```

#### 4. Delete Subtask
**File**: `src/components/TaskDetailDialog/components/TaskTabs.tsx`

Update `handleDeleteSubtask` (line 229-231):

```typescript
const handleDeleteSubtask = async (id: string) => {
  try {
    await tasksApi.delete(id);
    onSubtasksChange?.(subtasks.filter((st) => st.id !== id));
    toast.success('Subtask deleted');
  } catch (error) {
    console.error('Failed to delete subtask:', error);
    toast.error('Failed to delete subtask');
  }
};
```

#### 5. Implement Assignee Picker
**File**: `src/components/TaskDetailDialog/components/SubtasksList.tsx`

Replace User icon button with a Select component:

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

// In the table cell (line 194, 230):
<td className="py-4 text-center">
  <Select
    value={subtask.assigneeID || ''}
    onValueChange={(userId) => onUpdateAssignee(subtask.id, userId)}
  >
    <SelectTrigger className="w-[140px] h-8 bg-[#2a2f3d] border-[#3d4457] text-[#838a9c]">
      <SelectValue placeholder="Assignee" />
    </SelectTrigger>
    <SelectContent className="bg-[#1e2028] border-[#3d4457]">
      {users.map(user => (
        <SelectItem
          key={user.userID}
          value={user.userID}
          className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
        >
          {user.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</td>
```

Add props to SubtasksList:
```typescript
interface SubtasksListProps {
  subtasks: Subtask[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAssignee: (id: string, assigneeId: string) => void; // NEW
  onUpdateDueDate: (id: string, dueDate: string) => void;      // NEW
  users: User[];  // NEW - list of users for assignee dropdown
}
```

#### 6. Implement Due Date Picker
**File**: `src/components/TaskDetailDialog/components/SubtasksList.tsx`

Import Date Picker component and replace Calendar icon button:

```typescript
import { ClickUpDatePicker } from '../fields/ClickUpDatePicker';

// In the table cell (line 198, 234):
<td className="py-4 text-center">
  <ClickUpDatePicker
    value={subtask.dueDate}
    onChange={(date) => onUpdateDueDate(subtask.id, date)}
    placeholder="Due date"
    className="w-[120px] h-8"
  />
</td>
```

#### 7. Update Handlers in TaskTabs.tsx

Add new handlers for assignee and due date updates:

```typescript
const handleUpdateSubtaskAssignee = async (id: string, assigneeId: string) => {
  try {
    await tasksApi.update(id, { assigneeID: assigneeId });

    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, assigneeID: assigneeId } : st
    );
    onSubtasksChange?.(updated);
    toast.success('Assignee updated');
  } catch (error) {
    console.error('Failed to update assignee:', error);
    toast.error('Failed to update assignee');
  }
};

const handleUpdateSubtaskDueDate = async (id: string, dueDate: string) => {
  try {
    await tasksApi.update(id, { dueDate });

    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, dueDate } : st
    );
    onSubtasksChange?.(updated);
    toast.success('Due date updated');
  } catch (error) {
    console.error('Failed to update due date:', error);
    toast.error('Failed to update due date');
  }
};
```

Then pass these handlers to SubtasksList:
```typescript
<SubtasksList
  subtasks={subtasks}
  onAdd={handleAddSubtask}
  onToggle={handleToggleSubtask}
  onDelete={handleDeleteSubtask}
  onUpdateAssignee={handleUpdateSubtaskAssignee}
  onUpdateDueDate={handleUpdateSubtaskDueDate}
  users={users}
/>
```

#### 8. Add Users List to TaskTabs
**File**: `src/components/TaskDetailDialog/components/TaskTabs.tsx`

Add users state and load users:

```typescript
import { usersApi, User } from '@/services/api';

// Add state
const [users, setUsers] = useState<User[]>([]);

// Load users
useEffect(() => {
  const loadUsers = async () => {
    try {
      const allUsers = await usersApi.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };
  loadUsers();
}, []);
```

### Implementation Order

1. ✅ Backend API ready
2. ✅ Frontend API client ready
3. 🔄 Implement Step 1: Load subtasks from API
4. 🔄 Implement Step 2-4: Save/update/delete via API
5. ⏳ Implement Step 5-6: Assignee & Due Date pickers
6. ⏳ Implement Step 7-8: Wire up handlers

### Notes

- All subtasks are stored as Tasks with `ParentTaskID` pointing to parent task
- Subtask type in frontend has: `{ id, name, completed, status, assigneeID?, dueDate? }`
- Need to import `toast` from 'sonner' for notifications
- Need to import `User` type from '@/services/api'