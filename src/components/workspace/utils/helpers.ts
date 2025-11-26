// General helper utilities
import { WorkspaceTask, Phase } from '../types';

/**
 * Generate unique ID for tasks
 */
export const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for phases
 */
export const generatePhaseId = (): string => {
  return `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for spaces
 */
export const generateSpaceId = (): string => {
  return `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate task progress percentage
 */
export const calculateProgress = (task: WorkspaceTask): number => {
  if (task.budget === 0) return 0;
  const spent = task.budget - task.budgetRemaining;
  return Math.round((spent / task.budget) * 100);
};

/**
 * Get status color
 */
export const getStatusColor = (status: WorkspaceTask['status']): string => {
  const statusColors: Record<WorkspaceTask['status'], string> = {
    'todo': '#838a9c',
    'in-progress': '#0ea5e9',
    'ready': '#a78bfa',
    'done': '#10b981',
    'in-review': '#f59e0b',
    'completed': '#22c55e',
    'new': '#6366f1',
  };
  
  return statusColors[status] || '#838a9c';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Filter tasks by search query
 */
export const filterTasks = (tasks: WorkspaceTask[], searchQuery: string): WorkspaceTask[] => {
  if (!searchQuery.trim()) return tasks;
  
  const query = searchQuery.toLowerCase();
  return tasks.filter(task => 
    task.name.toLowerCase().includes(query) ||
    task.phase?.toLowerCase().includes(query) ||
    task.assignee?.name.toLowerCase().includes(query)
  );
};

/**
 * Sort tasks by field
 */
export const sortTasks = (
  tasks: WorkspaceTask[], 
  field: keyof WorkspaceTask, 
  direction: 'asc' | 'desc' = 'asc'
): WorkspaceTask[] => {
  return [...tasks].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' 
        ? aVal - bVal
        : bVal - aVal;
    }
    
    return 0;
  });
};

/**
 * Group tasks by phase
 */
export const groupTasksByPhase = (tasks: WorkspaceTask[], phases: Phase[]): Record<string, WorkspaceTask[]> => {
  const grouped: Record<string, WorkspaceTask[]> = {};
  
  // Initialize with empty arrays for each phase
  phases.forEach(phase => {
    grouped[phase.name] = [];
  });
  
  // Group tasks
  tasks.forEach(task => {
    if (task.phase && grouped[task.phase]) {
      grouped[task.phase].push(task);
    }
  });
  
  return grouped;
};

/**
 * Group tasks by status
 */
export const groupTasksByStatus = (tasks: WorkspaceTask[]): Record<WorkspaceTask['status'], WorkspaceTask[]> => {
  const grouped: Record<string, WorkspaceTask[]> = {
    'todo': [],
    'in-progress': [],
    'ready': [],
    'done': [],
    'in-review': [],
    'completed': [],
    'new': [],
  };
  
  tasks.forEach(task => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  });
  
  return grouped as Record<WorkspaceTask['status'], WorkspaceTask[]>;
};

/**
 * Calculate total budget for tasks
 */
export const calculateTotalBudget = (tasks: WorkspaceTask[]): number => {
  return tasks.reduce((total, task) => total + (task.budget || 0), 0);
};

/**
 * Calculate total spent for tasks
 */
export const calculateTotalSpent = (tasks: WorkspaceTask[]): number => {
  return tasks.reduce((total, task) => {
    const spent = (task.budget || 0) - (task.budgetRemaining || 0);
    return total + spent;
  }, 0);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are equal
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
