// Workspace Types - Extracted from mock data for clean separation

export interface Phase {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  completedCount?: number;
}

export interface Space {
  id: string;
  name: string;
  color: string;
  projectIds: string[];
  phases?: Phase[];
}

// Subtask type for simple checklist items
export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'done';
  assigneeID?: string;
  dueDate?: string;
}

// Action Item type
export interface ActionItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface WorkspaceTask {
  id: string;
  name: string;
  description?: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
    color: string;
  } | null;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  status: 'todo' | 'in-progress' | 'ready' | 'done' | 'in-review' | 'completed' | 'new';
  budget: number;
  spent: number;
  sprint: string;
  budgetRemaining: number;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  comments: number;
  phase: string;
  subtasks?: WorkspaceTask[] | Subtask[];
  actionItems?: ActionItem[] | Array<{ id: string; title: string; completed: boolean }>;
  parentId?: string;
  phaseID?: string;
  projectID?: string;
  projectCode?: string;  // Human-readable code like "PRJ-0001"
  impact?: 'low' | 'medium' | 'high';
  files?: number;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatar: string;
}

// Default workspace users
export const workspaceUsers: WorkspaceUser[] = [
  { id: 'user-1', name: 'John Doe', initials: 'JD', color: '#0ea5e9', avatar: '' },
  { id: 'user-2', name: 'Jane Smith', initials: 'JS', color: '#8b5cf6', avatar: '' },
  { id: 'user-3', name: 'Mike Johnson', initials: 'MJ', color: '#ec4899', avatar: '' },
  { id: 'user-4', name: 'Sarah Williams', initials: 'SW', color: '#f59e0b', avatar: '' },
  { id: 'user-5', name: 'David Brown', initials: 'DB', color: '#10b981', avatar: '' },
  { id: 'user-6', name: 'Emily Davis', initials: 'ED', color: '#ef4444', avatar: '' },
  { id: 'user-7', name: 'Chris Wilson', initials: 'CW', color: '#06b6d4', avatar: '' },
  { id: 'user-8', name: 'Lisa Anderson', initials: 'LA', color: '#6366f1', avatar: '' },
];

// Helper function to generate unique task IDs
export const generateTaskId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to generate unique phase IDs
export const generatePhaseId = () => `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default project phases template
export const defaultProjectPhases: Phase[] = [
  { id: 'phase-1', name: 'Phase 1 - Strategy', color: '#0394ff', taskCount: 0 },
  { id: 'phase-2', name: 'Phase 2 - Design', color: '#7c66d9', taskCount: 0 },
  { id: 'phase-3', name: 'Phase 3 - Development', color: '#ff6b6b', taskCount: 0 },
  { id: 'phase-4', name: 'Phase 4 - Execution', color: '#51cf66', taskCount: 0 }
];

// Helper function to create default phases with unique IDs
export const createDefaultPhases = (): Phase[] => {
  return defaultProjectPhases.map(phase => ({
    ...phase,
    id: generatePhaseId()
  }));
};
