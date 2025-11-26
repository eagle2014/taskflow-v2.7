# Project Workspace Module

A modular, well-organized workspace component for managing projects, tasks, and phases with multiple view options.

## Architecture

This module follows a **modular architecture** with clear separation of concerns:

```
workspace/
├── index.tsx                 # Main component (re-exports ProjectWorkspace)
├── ProjectWorkspace.tsx      # Main workspace container
├── types.ts                  # TypeScript interfaces and types
├── constants.ts              # Constants and configuration
├── hooks/                    # Custom React hooks
│   ├── index.ts
│   ├── useWorkspaceState.ts  # State management
│   ├── useWorkspaceData.ts   # Data loading/persistence
│   ├── useTaskManagement.ts  # Task CRUD operations
│   ├── usePhaseManagement.ts # Phase CRUD operations
│   └── useSpaceManagement.ts # Space CRUD operations
├── components/               # Sub-components
│   ├── dialogs/             # Dialog components
│   ├── sidebar/             # Sidebar components
│   ├── views/               # View components (List, Board, Gantt, etc.)
│   └── toolbar/             # Toolbar components
└── utils/                   # Utility functions
    ├── index.ts
    ├── calculations.ts      # Formula calculations
    └── helpers.ts           # General helpers
```

## Design Principles

### 1. Single Responsibility Principle (SRP)
Each module has one clear responsibility:
- **Hooks**: Manage specific aspects of state (tasks, phases, spaces)
- **Utils**: Provide reusable utility functions
- **Components**: Render specific UI elements
- **Types**: Define data structures

### 2. Separation of Concerns
- **Business Logic**: In hooks and utils
- **UI Logic**: In components
- **Data Structures**: In types
- **Configuration**: In constants

### 3. Composition over Inheritance
- Small, reusable hooks that can be composed
- Components that accept props for flexibility
- Utility functions that can be chained

### 4. DRY (Don't Repeat Yourself)
- Shared utilities in utils folder
- Reusable hooks for common patterns
- Centralized constants

## Usage

### Basic Import
```typescript
import { ProjectWorkspace } from './components/workspace';
```

### Using Individual Hooks
```typescript
import { 
  useWorkspaceState, 
  useTaskManagement,
  usePhaseManagement 
} from './components/workspace/hooks';

function MyComponent() {
  const state = useWorkspaceState();
  const taskOps = useTaskManagement({
    activeProject: state.activeProject,
    projectTasks: state.projectTasks,
    setProjectTasks: state.setProjectTasks,
    setWorkspaceTasks: state.setWorkspaceTasks,
  });
  
  // Use taskOps.addTask, taskOps.updateTask, etc.
}
```

### Using Utilities
```typescript
import { 
  formatCurrency, 
  calculateProgress,
  FormulaCalculator 
} from './components/workspace/utils';

const formattedBudget = formatCurrency(1000);
const progress = calculateProgress(task);
const result = FormulaCalculator.calculate('budget - spent', task);
```

## Custom Hooks

### useWorkspaceState
Manages all workspace state including active selections, view state, and data.

**Returns:**
- State values (activeSpace, activeProject, etc.)
- State setters
- Dialog helpers (openDialog, closeDialog)
- Task selection helper

### useWorkspaceData
Handles data loading from localStorage and persistence.

**Features:**
- Auto-initialization with default data
- localStorage sync for all data
- Reactive updates when selections change

### useTaskManagement
Task CRUD operations and management.

**Methods:**
- `addTask(task)`
- `updateTask(taskId, updates)`
- `deleteTask(taskId)`
- `duplicateTask(taskId)`
- `changeTaskStatus(taskId, status)`
- `addSubtask(parentTaskId, subtask)`
- `moveTaskToPhase(taskId, phaseId)`

### usePhaseManagement
Phase CRUD operations.

**Methods:**
- `addPhase(phase)`
- `updatePhase(phaseId, updates)`
- `deletePhase(phaseId)`
- `reorderPhases(startIndex, endIndex)`
- `getCurrentPhases()`

### useSpaceManagement
Space management operations.

**Methods:**
- `addSpace(space)`
- `updateSpace(spaceId, updates)`
- `deleteSpace(spaceId)`
- `addProjectToSpace(spaceId, projectId)`
- `removeProjectFromSpace(spaceId, projectId)`
- `getSpaceById(spaceId)`
- `getSpacesForProject(projectId)`

## Utilities

### FormulaCalculator
Class for calculating formulas on tasks.

**Methods:**
- `calculate(formula, task)` - Calculate formula result
- `validateFormula(formula)` - Validate formula syntax

**Supported Formulas:**
- Basic arithmetic: `+`, `-`, `*`, `/`
- Functions: `SUM()`, `AVG()`, `IF()`
- Field references: `budget`, `spent`, `budgetRemaining`

### Helper Functions
- `generateTaskId()`, `generatePhaseId()`, `generateSpaceId()`
- `formatDate(dateString)`
- `formatCurrency(amount)`
- `calculateProgress(task)`
- `getStatusColor(status)`
- `filterTasks(tasks, query)`
- `sortTasks(tasks, field, direction)`
- `groupTasksByPhase(tasks, phases)`
- `groupTasksByStatus(tasks)`
- `calculateTotalBudget(tasks)`
- `calculateTotalSpent(tasks)`
- `debounce(func, wait)`

## Types

All TypeScript interfaces are defined in `types.ts`:
- `WorkspaceTask` - Task structure
- `Phase` - Phase structure
- `Space` - Space structure
- `CustomColumn` - Column configuration
- `StatusOption` - Status configuration
- `ViewType` - Available view types
- `WorkspaceState` - Complete state structure
- `DialogState` - Dialog visibility state
- `FormulaState` - Formula editor state

## Constants

Centralized configuration in `constants.ts`:
- `STATUS_OPTIONS` - Task status configurations
- `AVAILABLE_COLUMNS` - Columns available for formulas
- `OPERATORS` - Arithmetic operators
- `FUNCTION_CATEGORIES` - Formula functions grouped by category
- `DEFAULT_VIEWS` - Default view configurations
- `COLOR_PALETTE` - Colors for UI elements
- `STORAGE_KEYS` - localStorage keys
- `COLUMN_WIDTHS` - Default column widths

## Performance Optimizations

1. **Memoization**: Use React.memo for expensive components
2. **Lazy Loading**: Views loaded only when needed
3. **Virtual Scrolling**: For large task lists
4. **Debouncing**: For search and filter operations
5. **Selective Updates**: Only update affected components

## Future Enhancements

- [ ] Add more view types (Timeline, Calendar)
- [ ] Advanced filtering and sorting
- [ ] Bulk operations on tasks
- [ ] Export/Import functionality
- [ ] Real-time collaboration features
- [ ] Custom field types
- [ ] Task dependencies and relationships
- [ ] Advanced formula builder UI
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts

## Contributing

When adding new features:
1. Create new hooks in `hooks/` folder
2. Add utilities in `utils/` folder
3. Define types in `types.ts`
4. Add constants to `constants.ts`
5. Update this README

## Testing

```bash
# Run tests (when implemented)
npm test workspace

# Type check
npx tsc --noEmit
```
