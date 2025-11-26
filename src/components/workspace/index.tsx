/**
 * Project Workspace Module
 * 
 * A comprehensive workspace for managing projects, tasks, and phases
 * with multiple view options and advanced features.
 * 
 * @module workspace
 */

// Main component - will be created next
// For now, we re-export the old ProjectWorkspace
// This will be refactored into the new modular structure
export { default as ProjectWorkspace } from '../ProjectWorkspace';

// Export types for external use
export type {
  WorkspaceTask,
  Phase,
  Space,
  CustomColumn,
  StatusOption,
  ViewType,
  WorkspaceState,
} from './types';

// Export hooks for advanced use cases
export {
  useWorkspaceState,
  useWorkspaceData,
  useTaskManagement,
  usePhaseManagement,
  useSpaceManagement,
} from './hooks';

// Export utilities
export {
  FormulaCalculator,
  formatCalculatedValue,
  generateTaskId,
  generatePhaseId,
  generateSpaceId,
  formatDate,
  formatCurrency,
  calculateProgress,
  getStatusColor,
  filterTasks,
  sortTasks,
  groupTasksByPhase,
  groupTasksByStatus,
  calculateTotalBudget,
  calculateTotalSpent,
} from './utils';

// Export constants
export {
  STATUS_OPTIONS,
  AVAILABLE_COLUMNS,
  OPERATORS,
  FUNCTION_CATEGORIES,
  DEFAULT_VIEWS,
  COLOR_PALETTE,
  STORAGE_KEYS,
  COLUMN_WIDTHS,
} from './constants';
