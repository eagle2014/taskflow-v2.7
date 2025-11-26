// Constants for Project Workspace
import { 
  List, 
  LayoutGrid, 
  GanttChart as GanttChartIcon, 
  Workflow, 
  Users 
} from 'lucide-react';
import { StatusOption, AvailableColumn, Operator, FunctionCategory, ViewConfig } from './types';

// Status options for tasks
export const STATUS_OPTIONS: StatusOption[] = [
  { 
    value: 'todo', 
    label: 'TO DO', 
    color: '#838a9c',
    bgColor: 'bg-[#838a9c]/10',
    borderColor: 'border-[#838a9c]'
  },
  { 
    value: 'in-progress', 
    label: 'IN PROGRESS', 
    color: '#0ea5e9',
    bgColor: 'bg-[#0ea5e9]/10',
    borderColor: 'border-[#0ea5e9]'
  },
  { 
    value: 'ready', 
    label: 'READY', 
    color: '#a78bfa',
    bgColor: 'bg-[#a78bfa]/10',
    borderColor: 'border-[#a78bfa]'
  },
  { 
    value: 'done', 
    label: 'COMPLETE', 
    color: '#10b981',
    bgColor: 'bg-[#10b981]/10',
    borderColor: 'border-[#10b981]'
  },
];

// Available columns for formulas
export const AVAILABLE_COLUMNS: AvailableColumn[] = [
  { value: 'budget', label: 'Budget', type: 'number' },
  { value: 'spent', label: 'Spent', type: 'number' },
  { value: 'budgetRemaining', label: 'Budget Remaining', type: 'number' },
  { value: 'progress', label: 'Progress', type: 'number' },
];

// Operators for basic formula mode
export const OPERATORS: Operator[] = [
  { value: '+', label: '+' },
  { value: '-', label: '-' },
  { value: '*', label: '×' },
  { value: '/', label: '÷' },
];

// Function categories for advanced formula mode
export const FUNCTION_CATEGORIES: FunctionCategory[] = [
  {
    name: 'Variables',
    functions: [
      { name: 'field', syntax: 'field("ColumnName")', description: 'Reference a column value' },
    ]
  },
  {
    name: 'Popular',
    functions: [
      { name: 'SUM', syntax: 'SUM(field1, field2, ...)', description: 'Add multiple values' },
      { name: 'IF', syntax: 'IF(condition, true_value, false_value)', description: 'Conditional logic' },
    ]
  },
  {
    name: 'Date & Time',
    functions: [
      { name: 'NOW', syntax: 'NOW()', description: 'Current date and time' },
      { name: 'TODAY', syntax: 'TODAY()', description: 'Current date' },
      { name: 'DATEDIFF', syntax: 'DATEDIFF(date1, date2, unit)', description: 'Difference between dates' },
    ]
  },
  {
    name: 'Logic',
    functions: [
      { name: 'IF', syntax: 'IF(condition, true_value, false_value)', description: 'Conditional logic' },
      { name: 'AND', syntax: 'AND(condition1, condition2, ...)', description: 'All conditions must be true' },
      { name: 'OR', syntax: 'OR(condition1, condition2, ...)', description: 'At least one condition must be true' },
    ]
  },
  {
    name: 'Mathematical',
    functions: [
      { name: 'SUM', syntax: 'SUM(value1, value2, ...)', description: 'Add values' },
      { name: 'AVG', syntax: 'AVG(value1, value2, ...)', description: 'Average of values' },
      { name: 'MIN', syntax: 'MIN(value1, value2, ...)', description: 'Minimum value' },
      { name: 'MAX', syntax: 'MAX(value1, value2, ...)', description: 'Maximum value' },
      { name: 'ROUND', syntax: 'ROUND(number, decimals)', description: 'Round number' },
    ]
  },
  {
    name: 'Strings',
    functions: [
      { name: 'CONCAT', syntax: 'CONCAT(text1, text2, ...)', description: 'Combine text' },
      { name: 'UPPER', syntax: 'UPPER(text)', description: 'Convert to uppercase' },
      { name: 'LOWER', syntax: 'LOWER(text)', description: 'Convert to lowercase' },
    ]
  },
];

// Default view configurations
export const DEFAULT_VIEWS: ViewConfig[] = [
  { id: 'list', name: 'List', icon: List, isVisible: true },
  { id: 'board', name: 'Board', icon: LayoutGrid, isVisible: true },
  { id: 'gantt', name: 'Gantt', icon: GanttChartIcon, isVisible: true },
  { id: 'mind-map', name: 'Mind Map', icon: Workflow, isVisible: true },
  { id: 'workload', name: 'Workload', icon: Users, isVisible: true },
];

// Color palette for spaces and phases
export const COLOR_PALETTE = [
  '#0394ff', // Blue
  '#7c66d9', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Orange
  '#10b981', // Green
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Dark orange
  '#14b8a6', // Teal
];

// LocalStorage keys
export const STORAGE_KEYS = {
  SPACES: 'taskflow_spaces',
  PROJECT_PHASES: 'taskflow_project_phases',
  PROJECT_TASKS: 'taskflow_project_tasks',
  VISIBLE_VIEWS: 'taskflow_visible_views',
  SIDEBAR_COLLAPSED: 'taskflow_sidebar_collapsed',
  ACTIVE_VIEW: 'taskflow_active_view',
};

// Default column widths
export const COLUMN_WIDTHS = {
  TASK_NAME: 300,
  ASSIGNEE: 150,
  DUE_DATE: 120,
  STATUS: 130,
  PRIORITY: 100,
  BUDGET: 120,
  PHASE: 180,
};
