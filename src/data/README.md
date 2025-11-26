# Mock Data Documentation

This directory contains mock data files used throughout the TaskFlow application to provide sample data and ensure a consistent user experience.

## Files

### `mockData.ts`
Main mock data file containing:
- **Users**: Sample user profiles with avatars and roles
- **Projects**: Pre-configured projects with various statuses
- **Tasks**: Sample tasks assigned to different projects and users
- **Categories**: Project categories with color coding
- **Spaces**: Workspace organization structures
- **Project Phases**: Phase definitions for projects
- **Workload Data**: Sample workload allocation data

### `projectWorkspaceMockData.ts`
Dedicated mock data for the Project Workspace component:
- **Workspace Users**: List of available users for task assignment
- **Default Spaces**: Initial space configurations
- **Default Project Phases**: Standard project phase templates
- **Sample Project Tasks**: Template tasks for new projects

## Usage

### In ProjectWorkspace Component

```typescript
import { 
  workspaceUsers, 
  defaultSpaces, 
  initializeWorkspaceData, 
  createDefaultPhases, 
  createSampleTasks 
} from '../data/projectWorkspaceMockData';

// Initialize on component mount
useEffect(() => {
  initializeWorkspaceData();
}, []);

// Use workspace users
const availableUsers = workspaceUsers;

// Create new project with sample data
const phases = createDefaultPhases();
const tasks = createSampleTasks(projectId);
```

### Helper Functions

#### `initializeWorkspaceData()`
Initializes localStorage with default data if not already present. Safe to call on every component mount.

#### `createDefaultPhases()`
Generates a new set of default phases with unique IDs:
- Phase 1 - Strategy
- Phase 2 - Design  
- Phase 3 - Development
- Phase 4 - Execution

#### `createSampleTasks(projectId: string)`
Creates a full set of sample tasks (19 tasks) for a project, distributed across all phases with:
- Unique task IDs
- Various statuses (todo, in-progress, ready)
- Budget and spent data
- Due dates and date ranges
- Realistic task names and descriptions

#### `generateTaskId()` / `generatePhaseId()`
Generate unique IDs for tasks and phases to avoid conflicts.

## Data Persistence

All workspace data is persisted to localStorage:
- `taskflow_spaces` - Space configurations
- `taskflow_project_phases` - Project phase definitions
- `taskflow_project_tasks` - Tasks for each project
- `taskflow_visible_views` - User's view preferences
- `taskflow_sidebar_collapsed` - Sidebar state

## Customization

To add new sample data:

1. Add new items to the appropriate array in `projectWorkspaceMockData.ts`
2. Ensure all required fields are populated
3. Use the helper functions to generate unique IDs
4. Update this README with any new data structures

## Data Structure Examples

### WorkspaceTask
```typescript
{
  id: string;
  name: string;
  assignee: { name, avatar, initials, color } | null;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  status: 'todo' | 'in-progress' | 'ready' | 'done' | 'in-review' | 'completed' | 'new';
  budget: number;
  sprint: string;
  budgetRemaining: number;
  comments: number;
  phase: string;
  subtasks?: WorkspaceTask[];
}
```

### Phase
```typescript
{
  id: string;
  name: string;
  color: string;
  taskCount: number;
}
```

### Space
```typescript
{
  id: string;
  name: string;
  color: string;
  projectIds: string[];
  phases?: Phase[];
}
```

## Notes

- All sample tasks use dates from 2020 for consistency
- Budget values range from $0 to $250,000 for realistic variety
- Tasks are distributed across phases to demonstrate different workflows
- Icons are standardized: 📁 for Spaces (purple #7c66d9), 🚀 for Projects (blue #0394ff)
