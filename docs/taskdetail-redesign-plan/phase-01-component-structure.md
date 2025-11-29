# Phase 1: Component Structure & Layout

**Duration**: 3 hours
**Priority**: Critical
**Dependencies**: None

## Goal

Create new modular component architecture with clean ClickUp-style layout

## Component Breakdown

### 1. TaskHeader Component (60 min)

**File**: `TaskDetailDialog/components/TaskHeader.tsx`

**Structure**:
```tsx
<div className="border-b border-gray-200 px-6 py-4">
  {/* Breadcrumb */}
  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
    <span>Space</span>
    <ChevronRight size={16} />
    <span>Project Management</span>
    <ChevronRight size={16} />
    <span className="text-gray-900">Phase 1 - Strategy</span>
  </div>

  {/* Task Title Row */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 flex-1">
      <Badge variant="outline">9c214y</Badge>
      <h1 className="text-2xl font-semibold" contentEditable>
        {task.title}
      </h1>
    </div>

    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Sparkles className="w-4 h-4 mr-2" />
        Ask AI
      </Button>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>
</div>
```

**Props**:
```typescript
interface TaskHeaderProps {
  task: WorkspaceTask;
  onTitleChange: (title: string) => void;
  onClose: () => void;
}
```

**Features**:
- Inline editable title (contentEditable)
- Breadcrumb navigation
- Task ID badge
- AI button
- Close button

### 2. TaskMetadata Component (90 min)

**File**: `TaskDetailDialog/components/TaskMetadata.tsx`

**Structure**:
```tsx
<div className="grid grid-cols-2 gap-x-12 gap-y-4 px-6 py-4">
  {/* Left Column */}
  <MetadataField
    icon={<Circle />}
    label="Status"
    value={<StatusPill status={task.status} onChange={handleStatusChange} />}
  />

  <MetadataField
    icon={<Calendar />}
    label="Dates"
    value={<DateRange start={task.startDate} end={task.dueDate} />}
  />

  <MetadataField
    icon={<Clock />}
    label="Track Time"
    value={<AddTimeButton />}
  />

  {/* Right Column */}
  <MetadataField
    icon={<Users />}
    label="Assignees"
    value={<AssigneeList assignees={task.assignees} />}
  />

  <MetadataField
    icon={<Zap />}
    label="Time Estimate"
    value={<Badge>448h</Badge>}
  />

  <MetadataField
    icon={<Link2 />}
    label="Relationships"
    value={<EmptyState />}
  />
</div>
```

**Sub-components**:
- `StatusPill.tsx` - Green pill button with dropdown
- `AssigneeList.tsx` - Avatar bubbles
- `DateRange.tsx` - "2/5/20 → 2/5/20" display
- `MetadataField.tsx` - Reusable field wrapper

**Props**:
```typescript
interface TaskMetadataProps {
  task: WorkspaceTask;
  users: User[];
  onUpdate: (field: string, value: any) => void;
}
```

### 3. Main Layout Container (30 min)

**File**: `TaskDetailDialog/TaskDetailDialog.tsx`

**Structure**:
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white">
    <TaskHeader task={task} onClose={() => onOpenChange(false)} />

    <div className="flex flex-1 overflow-hidden">
      {/* Left Content Area */}
      <div className="flex-1 overflow-y-auto">
        <AIPromptBar />
        <TaskMetadata task={task} users={users} onUpdate={handleUpdate} />
        <TaskDescription task={task} onSave={handleDescriptionSave} />
        <TaskTabs task={task} />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-gray-50">
        <TaskActivity taskId={task.id} />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**Layout Specs**:
- Max width: 1152px (6xl)
- Height: 90vh
- Left content: flex-1 (grows)
- Right sidebar: 320px fixed
- Scroll: Left content only

## CSS/Tailwind Classes

### Key Styles

```typescript
const styles = {
  dialog: "max-w-6xl h-[90vh] p-0 bg-white rounded-lg shadow-2xl",
  header: "border-b border-gray-200 px-6 py-4",
  layout: "flex flex-1 overflow-hidden",
  leftContent: "flex-1 overflow-y-auto",
  rightSidebar: "w-80 border-l border-gray-200 bg-gray-50",
  metadataGrid: "grid grid-cols-2 gap-x-12 gap-y-4 px-6 py-4",
  field: "flex items-start gap-3",
  label: "text-sm font-medium text-gray-700 min-w-[100px]",
  value: "flex-1",
};
```

## Implementation Steps

### Step 1: Create Folder Structure (5 min)

```bash
mkdir -p src/components/TaskDetailDialog/components
mkdir -p src/components/TaskDetailDialog/fields
mkdir -p src/components/TaskDetailDialog/hooks
```

### Step 2: Build TaskHeader (60 min)

1. Create component file
2. Add breadcrumb navigation
3. Implement inline title editing
4. Add task ID badge
5. Add AI + Close buttons
6. Style with Tailwind

### Step 3: Build Metadata Fields (60 min)

1. Create `MetadataField.tsx` wrapper
2. Build `StatusPill.tsx`
3. Build `AssigneeList.tsx`
4. Build `DateRange.tsx`
5. Create `TaskMetadata.tsx` grid layout
6. Wire up onChange handlers

### Step 4: Create Main Layout (30 min)

1. Set up Dialog container
2. Create left/right split
3. Add scroll behavior
4. Import header + metadata
5. Test responsive behavior

### Step 5: Add Empty States (15 min)

```tsx
const EmptyState = () => (
  <span className="text-sm text-gray-400">Empty</span>
);
```

## Testing Checklist

- [ ] Dialog opens at correct size (1152px × 90vh)
- [ ] Header shows task title
- [ ] Task ID badge displays
- [ ] Breadcrumb renders correctly
- [ ] Close button works
- [ ] Metadata grid is 2 columns
- [ ] Fields aligned properly
- [ ] Scroll works in left panel only
- [ ] Right sidebar fixed width
- [ ] Responsive on smaller screens

## Code Snippets

### Inline Editable Title

```tsx
const [title, setTitle] = useState(task.title);
const [isEditing, setIsEditing] = useState(false);

<h1
  className="text-2xl font-semibold outline-none"
  contentEditable
  suppressContentEditableWarning
  onBlur={(e) => onTitleChange(e.currentTarget.textContent || '')}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }}
>
  {title}
</h1>
```

### Metadata Field Wrapper

```tsx
interface MetadataFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const MetadataField: React.FC<MetadataFieldProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div>{value}</div>
    </div>
  </div>
);
```

## Acceptance Criteria

✅ Clean white background (no dark gray)
✅ Header with breadcrumb + title + buttons
✅ 2-column metadata grid
✅ Left/right split layout
✅ Fixed width sidebar (320px)
✅ Scrollable left content
✅ All spacing matches design (16px/24px)
✅ No console errors
✅ TypeScript compiles
✅ Components <150 lines each
