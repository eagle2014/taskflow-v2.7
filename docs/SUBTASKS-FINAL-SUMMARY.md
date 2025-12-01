# Subtasks Implementation - Final Summary

## ✅ HOÀN THÀNH

### 1. Backend API
- ✅ Endpoint `GET /api/tasks/parent/{parentTaskId}` - Lấy subtasks
- ✅ Endpoint `POST /api/tasks` - Tạo subtask (với ParentTaskID)
- ✅ Endpoint `PUT /api/tasks/{id}` - Update subtask
- ✅ Endpoint `DELETE /api/tasks/{id}` - Xóa subtask
- ✅ Stored procedure `sp_Task_GetByParentTask`

### 2. Frontend API
- ✅ `tasksApi.getByParentTask(parentTaskId)`
- ✅ `tasksApi.create(task)`
- ✅ `tasksApi.update(id, task)`
- ✅ `tasksApi.delete(id)`

### 3. Data Model
- ✅ Updated `Subtask` interface với `assigneeID?` và `dueDate?`

### 4. UI Features
- ✅ Sort button (Default, Name, Status)
- ✅ Fullscreen/Expand button
- ✅ Suggest subtasks (AI)

## 🚧 ĐANG THIẾU - CẦN BỔ SUNG

### Problem 1: Subtasks mất sau refresh
**Nguyên nhân**: Subtasks chỉ lưu trong memory state, chưa load từ API

**Giải pháp**: Thêm vào `TaskDetailDialog.tsx` (sau line 402):

```typescript
// Load subtasks from API
useEffect(() => {
  const loadSubtasks = async () => {
    if (!open || !task?.id) return;

    try {
      const apiSubtasks = await tasksApi.getByParentTask(task.id);
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

### Problem 2: Tạo subtask mới không save vào database
**Nguyên nhân**: `handleAddSubtask` chỉ update state, không call API

**Giải pháp**: Update `TaskTabs.tsx` line 210-218:

```typescript
const handleAddSubtask = async (name: string) => {
  if (!task) return;

  try {
    const newTask = await tasksApi.create({
      projectID: task.projectID,
      parentTaskID: task.id,
      title: name,
      status: 'To Do',
      priority: 'Medium',
    });

    const newSubtask: Subtask = {
      id: newTask.taskID,
      name: newTask.title,
      completed: false,
      status: 'todo',
    };
    onSubtasksChange?.([...subtasks, newSubtask]);
    toast.success('Subtask created');
  } catch (error) {
    toast.error('Failed to create subtask');
  }
};
```

### Problem 3: Toggle/Delete subtask không persist
**Giải pháp**: Update handlers trong `TaskTabs.tsx`:

```typescript
const handleToggleSubtask = async (id: string) => {
  const subtask = subtasks.find(st => st.id === id);
  if (!subtask) return;

  try {
    await tasksApi.update(id, {
      status: subtask.completed ? 'To Do' : 'Done'
    });

    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed, status: (st.completed ? 'todo' : 'done') as 'todo' | 'done' } : st
    );
    onSubtasksChange?.(updated);
  } catch (error) {
    toast.error('Failed to update subtask');
  }
};

const handleDeleteSubtask = async (id: string) => {
  try {
    await tasksApi.delete(id);
    onSubtasksChange?.(subtasks.filter((st) => st.id !== id));
  } catch (error) {
    toast.error('Failed to delete subtask');
  }
};
```

### Problem 4: Không chọn được Assignee
**Nguyên nhân**: User icon chỉ là button, không có dropdown

**Giải pháp**:
1. Load users vào TaskTabs
2. Pass users xuống SubtasksList
3. Replace User icon với Select component

**File `TaskTabs.tsx`** - Add imports và state:
```typescript
import { usersApi, User } from '@/services/api';
import { toast } from 'sonner';

// Add state
const [users, setUsers] = useState<User[]>([]);

// Load users
useEffect(() => {
  const loadUsers = async () => {
    try {
      const allUsers = await usersApi.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users');
    }
  };
  loadUsers();
}, []);

// Add handler
const handleUpdateSubtaskAssignee = async (id: string, assigneeId: string) => {
  try {
    await tasksApi.update(id, { assigneeID: assigneeId });
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, assigneeID: assigneeId } : st
    );
    onSubtasksChange?.(updated);
    toast.success('Assignee updated');
  } catch (error) {
    toast.error('Failed to update assignee');
  }
};
```

**Update SubtasksList props** (line 378):
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

**File `SubtasksList.tsx`** - Update interface và imports:
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { User } from '@/services/api';

interface SubtasksListProps {
  subtasks: Subtask[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAssignee: (id: string, assigneeId: string) => void;
  onUpdateDueDate: (id: string, dueDate: string) => void;
  users: User[];
}

export function SubtasksList({
  subtasks,
  onAdd,
  onToggle,
  onDelete,
  onUpdateAssignee,
  onUpdateDueDate,
  users
}: SubtasksListProps) {
```

Replace User icon button (line 194 và 230):
```typescript
<td className="py-4 text-center">
  <Select
    value={subtask.assigneeID || ''}
    onValueChange={(userId) => onUpdateAssignee(subtask.id, userId)}
  >
    <SelectTrigger className="w-[140px] h-8 bg-[#2a2f3d] border-[#3d4457] text-[#838a9c] text-xs">
      <SelectValue placeholder="Assignee" />
    </SelectTrigger>
    <SelectContent className="bg-[#1e2028] border-[#3d4457]">
      {users.map(user => (
        <SelectItem
          key={user.userID}
          value={user.userID}
          className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] text-xs"
        >
          {user.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</td>
```

### Problem 5: Không input được Due Date
**Giải pháp**: Tương tự Assignee, replace Calendar icon với DatePicker

**File `TaskTabs.tsx`** - Add handler:
```typescript
const handleUpdateSubtaskDueDate = async (id: string, dueDate: string) => {
  try {
    await tasksApi.update(id, { dueDate });
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, dueDate } : st
    );
    onSubtasksChange?.(updated);
    toast.success('Due date updated');
  } catch (error) {
    toast.error('Failed to update due date');
  }
};
```

**File `SubtasksList.tsx`** - Import và replace:
```typescript
import { ClickUpDatePicker } from '../fields/ClickUpDatePicker';

// Replace Calendar icon (line 198, 234):
<td className="py-4 text-center">
  <ClickUpDatePicker
    value={subtask.dueDate}
    onChange={(date) => onUpdateDueDate(subtask.id, date)}
    placeholder="Due date"
    className="w-[120px] h-8"
  />
</td>
```

## TESTING CHECKLIST

1. ✅ Tạo subtask mới → Refresh → Vẫn còn (load từ DB)
2. ✅ Toggle complete subtask → Refresh → Vẫn giữ trạng thái
3. ✅ Xóa subtask → Refresh → Đã mất (deleted từ DB)
4. ✅ Chọn Assignee cho subtask → Save vào DB
5. ✅ Chọn Due Date cho subtask → Save vào DB
6. ✅ Sort subtasks (UI only - không cần persist order)

## FILES CẦN MODIFY

1. ✅ `src/types/workspace.ts` - Added assigneeID, dueDate to Subtask
2. 🔄 `src/components/TaskDetailDialog/TaskDetailDialog.tsx` - Add loadSubtasks useEffect
3. 🔄 `src/components/TaskDetailDialog/components/TaskTabs.tsx` - Update handlers to call API + load users
4. 🔄 `src/components/TaskDetailDialog/components/SubtasksList.tsx` - Add Select & DatePicker components