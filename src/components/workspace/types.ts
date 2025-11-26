// Type definitions for Project Workspace

export interface WorkspaceTask {
  id: string;
  name: string;
  parentTaskID?: string;
  order?: number;
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
  sprint: string;
  budgetRemaining: number;
  comments: number;
  phase: string;
  subtasks?: WorkspaceTask[];
}

export interface Phase {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

export interface Space {
  id: string;
  name: string;
  color: string;
  projectIds: string[];
  phases?: Phase[];
}

export interface CustomColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'calculated';
  formula?: string;
  isVisible: boolean;
  width?: number;
  isCalculated?: boolean;
}

export interface StatusOption {
  value: 'todo' | 'in-progress' | 'ready' | 'done';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface AvailableColumn {
  value: string;
  label: string;
  type: string;
}

export interface Operator {
  value: string;
  label: string;
}

export interface FormulaFunction {
  name: string;
  syntax: string;
  description: string;
}

export interface FunctionCategory {
  name: string;
  functions: FormulaFunction[];
}

export interface ViewConfig {
  id: string;
  name: string;
  icon: any; // Lucide icon component
  isVisible: boolean;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatar: string;
}

export type ViewType = 'list' | 'board' | 'gantt' | 'mind-map' | 'workload';

export interface WorkspaceState {
  // Active selections
  activeSpace: string | null;
  activeProject: string | null;
  activePhase: string | null;
  
  // View state
  currentView: ViewType;
  isSidebarCollapsed: boolean;
  
  // Data
  spaces: Space[];
  projectPhases: Record<string, Phase[]>;
  projectTasks: Record<string, WorkspaceTask[]>;
  workspaceTasks: WorkspaceTask[];
  
  // UI state
  visibleViewIds: string[];
  customColumns: CustomColumn[];
  selectedTaskId: string | null;
}

export interface DialogState {
  showFormulas: boolean;
  showAddPhase: boolean;
  showEditSpace: boolean;
  showAddSpace: boolean;
  showAddTask: boolean;
  showEditTask: boolean;
  showTaskDetail: boolean;
}

export interface FormulaState {
  selectedColumn: string | null;
  formulaMode: 'basic' | 'advanced';
  basicFormula: {
    left: string;
    operator: string;
    right: string;
  };
  advancedFormula: string;
  searchQuery: string;
}
