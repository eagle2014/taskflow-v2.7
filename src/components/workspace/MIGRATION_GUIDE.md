# Migration Guide: ProjectWorkspace Refactoring

This guide explains how to migrate from the monolithic `ProjectWorkspace.tsx` (5000+ lines) to the new modular architecture.

## Overview

The refactoring splits the large file into:
- **8 custom hooks** for state and business logic
- **2 utility modules** for calculations and helpers
- **Separate type definitions** for better type safety
- **Centralized constants** for configuration
- **Component folders** for UI components (to be created)

## Benefits

✅ **Better Performance**: Smaller components re-render less frequently
✅ **Easier Maintenance**: Find and fix bugs faster
✅ **Better Reusability**: Share hooks and utilities across components
✅ **Improved Testing**: Test individual modules in isolation
✅ **Type Safety**: Centralized types prevent inconsistencies
✅ **Team Collaboration**: Multiple developers can work on different modules

## Migration Steps

### Phase 1: Setup (✅ Completed)

Created the new folder structure:
```
components/workspace/
├── types.ts
├── constants.ts
├── hooks/
│   ├── useWorkspaceState.ts
│   ├── useWorkspaceData.ts
│   ├── useTaskManagement.ts
│   ├── usePhaseManagement.ts
│   └── useSpaceManagement.ts
├── utils/
│   ├── calculations.ts
│   └── helpers.ts
└── index.tsx
```

### Phase 2: Extract Components (Next Step)

Extract dialog components from ProjectWorkspace.tsx:

#### 2.1 Create Dialog Components

```bash
components/workspace/components/dialogs/
├── FormulasDialog.tsx
├── AddPhaseDialog.tsx
├── AddTaskDialog.tsx
├── EditTaskDialog.tsx
├── AddSpaceDialog.tsx
└── EditSpaceDialog.tsx
```

**Example: FormulasDialog.tsx**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { FormulaState } from '../../types';

interface FormulasDialogProps {
  open: boolean;
  onClose: () => void;
  formulaState: FormulaState;
  onFormulaStateChange: (state: FormulaState) => void;
  onSave: () => void;
}

export const FormulasDialog: React.FC<FormulasDialogProps> = ({
  open,
  onClose,
  formulaState,
  onFormulaStateChange,
  onSave
}) => {
  // Extract dialog logic from ProjectWorkspace.tsx
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Dialog content */}
    </Dialog>
  );
};
```

#### 2.2 Create Sidebar Components

```bash
components/workspace/components/sidebar/
├── WorkspaceSidebar.tsx
├── SpaceItem.tsx
├── ProjectItem.tsx
└── PhaseItem.tsx
```

#### 2.3 Create View Components

```bash
components/workspace/components/views/
├── ListView.tsx
├── BoardView.tsx
├── GanttView.tsx
├── MindMapView.tsx
└── WorkloadView.tsx
```

#### 2.4 Create Toolbar Components

```bash
components/workspace/components/toolbar/
├── ViewToolbar.tsx
└── ViewSwitcher.tsx
```

### Phase 3: Refactor Main Component

Update `ProjectWorkspace.tsx` to use the new hooks and components:

```typescript
import React from 'react';
import { 
  useWorkspaceState, 
  useWorkspaceData,
  useTaskManagement,
  usePhaseManagement,
  useSpaceManagement 
} from './hooks';

// Import sub-components
import { WorkspaceSidebar } from './components/sidebar/WorkspaceSidebar';
import { ViewToolbar } from './components/toolbar/ViewToolbar';
import { ListView } from './components/views/ListView';
import { BoardView } from './components/views/BoardView';
// ... other imports

export const ProjectWorkspace: React.FC = () => {
  // Use hooks instead of inline state
  const state = useWorkspaceState();
  const taskOps = useTaskManagement({
    activeProject: state.activeProject,
    projectTasks: state.projectTasks,
    setProjectTasks: state.setProjectTasks,
    setWorkspaceTasks: state.setWorkspaceTasks,
  });
  
  const phaseOps = usePhaseManagement({
    activeProject: state.activeProject,
    projectPhases: state.projectPhases,
    setProjectPhases: state.setProjectPhases,
  });
  
  const spaceOps = useSpaceManagement({
    spaces: state.spaces,
    setSpaces: state.setSpaces,
  });
  
  // Load and persist data
  useWorkspaceData({
    spaces: state.spaces,
    projectPhases: state.projectPhases,
    projectTasks: state.projectTasks,
    visibleViewIds: state.visibleViewIds,
    activeProject: state.activeProject,
    activePhase: state.activePhase,
    setSpaces: state.setSpaces,
    setProjectPhases: state.setProjectPhases,
    setProjectTasks: state.setProjectTasks,
    setVisibleViewIds: state.setVisibleViewIds,
    setWorkspaceTasks: state.setWorkspaceTasks,
  });
  
  // Render with sub-components
  return (
    <div className="flex h-screen">
      <WorkspaceSidebar 
        spaces={state.spaces}
        activeSpace={state.activeSpace}
        activeProject={state.activeProject}
        onSpaceSelect={state.setActiveSpace}
        onProjectSelect={state.setActiveProject}
        // ... other props
      />
      
      <div className="flex-1">
        <ViewToolbar 
          currentView={state.currentView}
          onViewChange={state.setCurrentView}
          // ... other props
        />
        
        {state.currentView === 'list' && (
          <ListView 
            tasks={state.workspaceTasks}
            onTaskUpdate={taskOps.updateTask}
            // ... other props
          />
        )}
        
        {state.currentView === 'board' && (
          <BoardView 
            tasks={state.workspaceTasks}
            onTaskUpdate={taskOps.updateTask}
            // ... other props
          />
        )}
        
        {/* Other views */}
      </div>
    </div>
  );
};
```

### Phase 4: Update Imports

Update all files that import ProjectWorkspace:

**Before:**
```typescript
import { ProjectWorkspace } from './components/ProjectWorkspace';
```

**After:**
```typescript
import { ProjectWorkspace } from './components/workspace';
```

### Phase 5: Testing

1. **Unit Tests**: Test individual hooks and utilities
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete workflows

```typescript
// Example hook test
import { renderHook, act } from '@testing-library/react-hooks';
import { useTaskManagement } from './hooks/useTaskManagement';

describe('useTaskManagement', () => {
  it('should add a task', () => {
    const { result } = renderHook(() => useTaskManagement({
      activeProject: 'project-1',
      projectTasks: {},
      setProjectTasks: jest.fn(),
      setWorkspaceTasks: jest.fn(),
    }));
    
    act(() => {
      result.current.addTask({
        id: 'task-1',
        name: 'Test Task',
        // ... other fields
      });
    });
    
    // Assert task was added
  });
});
```

## Code Mapping

Here's where old code maps to new modules:

| Old Code (ProjectWorkspace.tsx) | New Location |
|--------------------------------|--------------|
| `interface WorkspaceTask` | `types.ts` |
| `interface Phase` | `types.ts` |
| `const statusOptions` | `constants.ts` → `STATUS_OPTIONS` |
| `const availableUsers` | `constants.ts` → `workspaceUsers` from mockData |
| `useState` declarations | `hooks/useWorkspaceState.ts` |
| localStorage loading | `hooks/useWorkspaceData.ts` |
| Task CRUD functions | `hooks/useTaskManagement.ts` |
| Phase CRUD functions | `hooks/usePhaseManagement.ts` |
| Space CRUD functions | `hooks/useSpaceManagement.ts` |
| Formula calculations | `utils/calculations.ts` → `FormulaCalculator` |
| Helper functions | `utils/helpers.ts` |
| FormulasDialog JSX | `components/dialogs/FormulasDialog.tsx` |
| Sidebar JSX | `components/sidebar/WorkspaceSidebar.tsx` |
| ListView JSX | `components/views/ListView.tsx` |

## Best Practices

### 1. Keep Components Small
- Maximum 300 lines per component
- Extract complex logic into hooks
- Use composition over large components

### 2. Type Everything
```typescript
// Good
interface TaskCardProps {
  task: WorkspaceTask;
  onUpdate: (id: string, updates: Partial<WorkspaceTask>) => void;
}

// Bad
interface TaskCardProps {
  task: any;
  onUpdate: Function;
}
```

### 3. Memoize Expensive Operations
```typescript
import { useMemo } from 'react';

const filteredTasks = useMemo(() => 
  filterTasks(tasks, searchQuery),
  [tasks, searchQuery]
);
```

### 4. Use Custom Hooks
```typescript
// Extract repeated logic into hooks
function useTaskSelection(tasks: WorkspaceTask[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const selectTask = (id: string) => {
    setSelectedIds(prev => [...prev, id]);
  };
  
  const deselectTask = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };
  
  return { selectedIds, selectTask, deselectTask };
}
```

## Rollback Plan

If issues arise, you can temporarily revert:

1. Keep old `ProjectWorkspace.tsx` as `ProjectWorkspace.old.tsx`
2. Update import in `App.tsx` to use old file
3. Fix issues in new modules
4. Switch back to new modules

## Timeline

- **Week 1**: ✅ Create hooks and utilities (Completed)
- **Week 2**: Extract dialog components
- **Week 3**: Extract view components
- **Week 4**: Refactor main component
- **Week 5**: Testing and bug fixes
- **Week 6**: Documentation and training

## Support

For questions or issues during migration:
1. Check this guide
2. Review `/components/workspace/README.md`
3. Look at example implementations in `hooks/`
4. Check type definitions in `types.ts`

## Next Steps

1. ✅ Create folder structure
2. ✅ Define types and constants
3. ✅ Create custom hooks
4. ✅ Create utility modules
5. ⏳ Extract dialog components
6. ⏳ Extract sidebar components
7. ⏳ Extract view components
8. ⏳ Refactor main component
9. ⏳ Update all imports
10. ⏳ Test thoroughly

---

**Note**: This is a living document. Update it as the migration progresses.
