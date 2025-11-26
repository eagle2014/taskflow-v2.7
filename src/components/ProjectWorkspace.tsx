import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from './ui/card';
import { useTaskManagement } from './workspace/hooks/useTaskManagement';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent
} from './ui/context-menu';
import { GanttChart } from './GanttChart';
import { MindMapView } from './MindMapView';
import { TaskDetailDialog } from './TaskDetailDialog';
import { NewProjectForm } from './NewProjectForm';
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Eye,
  List,
  LayoutGrid,
  Columns,
  Settings,
  Share2,
  Target,
  ArrowLeft,
  Inbox,
  FileText,
  BarChart3,
  Image as ImageIcon,
  Video,
  Activity,
  Crosshair,
  Clock,
  MoreVertical,
  Star,
  Home,
  ChevronRight,
  Users,
  HelpCircle,
  Folder,
  Rocket,
  FolderPlus,
  Table,
  GanttChart as GanttChartIcon,
  Workflow,
  MapPin,
  CheckSquare,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
  Palette,
  Zap,
  SlidersHorizontal,
  CircleDot,
  StarOff,
  Move,
  Copy,
  Archive,
  Trash2,
  Lock,
  Pencil,
  GripVertical,
  Check
} from 'lucide-react';
import { User, projectsApi, Project, tasksApi, Task, usersApi } from '../utils/mockApi';
import { toast } from 'sonner';
import { 
  workspaceUsers, 
  defaultSpaces, 
  initializeWorkspaceData, 
  createDefaultPhases, 
  createSampleTasks,
  spacesApi 
} from '../data/projectWorkspaceMockData';

interface WorkspaceTask {
  id: string;
  name: string;
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
  comments?: number;
  subtasks?: WorkspaceTask[];
  parentId?: string;
  phase?: string;
  impact?: 'low' | 'medium' | 'high';
  files?: number;
}

interface Phase {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

interface Space {
  id: string;
  name: string;
  icon: string;
  phases: Phase[];
  projectIds: string[]; // Projects assigned to this space
}

interface ProjectWorkspaceProps {
  currentUser: User;
  onBack?: () => void;
}

// Drag & drop types
const TASK_TYPE = 'TASK_ROW';

interface DragItem {
  id: string;
  index: number;
  groupName: string;
}

// Draggable Task Row Component
interface DraggableTaskRowProps {
  task: WorkspaceTask;
  groupName: string;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasSubtasks: boolean;
  isHovered: boolean;
  onReorder: (draggedId: string, targetId: string, groupName: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleExpand: () => void;
  onToggleSelection: () => void;
  children: React.ReactNode;
}

function DraggableTaskRow({
  task,
  groupName,
  depth,
  isSelected,
  isHovered,
  onReorder,
  onMouseEnter,
  onMouseLeave,
  children
}: DraggableTaskRowProps) {
  const taskRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: TASK_TYPE,
    item: { id: task.id, index: 0, groupName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: TASK_TYPE,
    canDrop: (item: DragItem) => item.id !== task.id,
    drop: (item: DragItem) => {
      if (item.id !== task.id) {
        onReorder(item.id, task.id, groupName);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(taskRef));

  return (
    <div
      ref={taskRef}
      className={`flex items-center py-2 px-4 border-b border-[#3d4457]/30 hover:bg-[#292d39] transition-colors relative ${
        isSelected ? 'bg-[#0394ff]/10' : ''
      } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'bg-[#0394ff]/5' : ''}`}
      style={{ paddingLeft: `${16 + depth * 32}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Drag Handle */}
      <div className="w-8 flex items-center justify-center cursor-move">
        <GripVertical className={`w-4 h-4 text-[#838a9c] hover:text-[#0394ff] transition-all duration-200 ${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} />
      </div>
      {children}
    </div>
  );
}

export function ProjectWorkspace({ currentUser, onBack }: ProjectWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [activeSpace, setActiveSpace] = useState('');
  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'sprint' | 'assignee' | 'phase'>('phase');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  
  // Projects management
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameProjectValue, setRenameProjectValue] = useState('');
  
  // Space rename management
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const [renameSpaceValue, setRenameSpaceValue] = useState('');
  
  // Space and Phase management
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);
  const [showCreatePhaseDialog, setShowCreatePhaseDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseColor, setNewPhaseColor] = useState('#0394ff');
  const [selectedSpaceForPhase, setSelectedSpaceForPhase] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  
  // Create Project in Space
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [selectedSpaceForProject, setSelectedSpaceForProject] = useState<string | null>(null);
  
  // Project Phase management
  const [showCreateProjectPhaseDialog, setShowCreateProjectPhaseDialog] = useState(false);
  const [selectedProjectForPhase, setSelectedProjectForPhase] = useState<string | null>(null);
  const [newProjectPhaseName, setNewProjectPhaseName] = useState('');
  const [newProjectPhaseColor, setNewProjectPhaseColor] = useState('#0394ff');
  
  // Assign projects to space
  const [showAssignProjectDialog, setShowAssignProjectDialog] = useState(false);
  const [selectedSpaceForAssign, setSelectedSpaceForAssign] = useState<string | null>(null);
  const [selectedProjectsToAssign, setSelectedProjectsToAssign] = useState<Set<string>>(new Set());
  
  // Move project between spaces
  const [showMoveProjectDialog, setShowMoveProjectDialog] = useState(false);
  const [projectToMove, setProjectToMove] = useState<string | null>(null);
  const [targetSpaceForMove, setTargetSpaceForMove] = useState<string | null>(null);

  // View selector states
  const [viewSelectorOpen, setViewSelectorOpen] = useState(false);
  const [visibleViewIds, setVisibleViewIds] = useState<string[]>(['list', 'board', 'gantt']);

  // Project phases and tasks storage
  const [projectPhases, setProjectPhases] = useState<Record<string, Phase[]>>(() => {
    const saved = localStorage.getItem('taskflow_project_phases');
    const data = saved ? JSON.parse(saved) : {};
    console.log('🔍 Loading projectPhases from localStorage:', Object.keys(data).length, 'projects');
    return data;
  });
  const [projectTasks, setProjectTasks] = useState<Record<string, WorkspaceTask[]>>(() => {
    const saved = localStorage.getItem('taskflow_project_tasks');
    const data = saved ? JSON.parse(saved) : {};
    console.log('🔍 Loading projectTasks from localStorage:', {
      projectCount: Object.keys(data).length,
      projects: Object.keys(data),
      totalTasks: Object.values(data).reduce((sum: number, tasks: any) => sum + (tasks?.length || 0), 0)
    });
    return data;
  });
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);

  // Task management hook with API persistence
  const { updateTaskOrders, addSubtask } = useTaskManagement({
    activeProject,
    projectTasks,
    setProjectTasks,
    setWorkspaceTasks,
  });

  // Sidebar collapse states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('taskflow_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuScrollContainerRef = useRef<HTMLDivElement>(null);
  const projectRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const savedScrollPosition = useRef<number>(0);

  // Edit task inline state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');

  // Assignee selection state
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState<string | null>(null);

  // Date picker state
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);

  // Status picker state
  
  // Context menu hover state
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [openContextMenuId, setOpenContextMenuId] = useState<string | null>(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [statusSearchQuery, setStatusSearchQuery] = useState('');

  // Budget and Spent input states
  const [budgetPopoverOpen, setBudgetPopoverOpen] = useState<string | null>(null);
  const [spentPopoverOpen, setSpentPopoverOpen] = useState<string | null>(null);
  const [budgetInputValue, setBudgetInputValue] = useState('');
  
  // Add new task inline state
  const [addingTaskToGroup, setAddingTaskToGroup] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [spentInputValue, setSpentInputValue] = useState('');

  // Formula configuration state
  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [formulaMode, setFormulaMode] = useState<'basic' | 'advanced'>('basic');
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string>('budgetRemaining');
  const [basicFormulaLeft, setBasicFormulaLeft] = useState<string>('budget');
  const [basicFormulaOperator, setBasicFormulaOperator] = useState<string>('-');
  const [basicFormulaRight, setBasicFormulaRight] = useState<string>('spent');
  const [advancedFormula, setAdvancedFormula] = useState<string>('field("Budget") - field("Spent")');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');

  // Task detail dialog state
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<WorkspaceTask | null>(null);

  // Mock users list - imported from mock data
  const availableUsers = workspaceUsers;

  // Status options
  const statusOptions = [
    { 
      value: 'todo' as const, 
      label: 'TO DO', 
      color: '#838a9c',
      bgColor: 'bg-[#838a9c]/10',
      borderColor: 'border-[#838a9c]'
    },
    { 
      value: 'in-progress' as const, 
      label: 'IN PROGRESS', 
      color: '#0ea5e9',
      bgColor: 'bg-[#0ea5e9]/10',
      borderColor: 'border-[#0ea5e9]'
    },
    { 
      value: 'ready' as const, 
      label: 'READY', 
      color: '#a78bfa',
      bgColor: 'bg-[#a78bfa]/10',
      borderColor: 'border-[#a78bfa]'
    },
    { 
      value: 'done' as const, 
      label: 'COMPLETE', 
      color: '#10b981',
      bgColor: 'bg-[#10b981]/10',
      borderColor: 'border-[#10b981]'
    },
  ];

  // Available columns for formulas
  const availableColumns = [
    { value: 'budget', label: 'Budget', type: 'number' },
    { value: 'spent', label: 'Spent', type: 'number' },
    { value: 'budgetRemaining', label: 'Budget Remaining', type: 'number' },
    { value: 'progress', label: 'Progress', type: 'number' },
  ];

  // Operators for basic mode
  const operators = [
    { value: '+', label: '+' },
    { value: '-', label: '-' },
    { value: '*', label: '×' },
    { value: '/', label: '÷' },
  ];

  // Function categories for advanced mode
  const functionCategories = [
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

  // Initialize workspace with default data on first load
  useEffect(() => {
    initializeWorkspaceData();
  }, []);

  // Load project phases from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskflow_project_phases');
    if (saved) {
      setProjectPhases(JSON.parse(saved));
    }
  }, []);

  // Save project phases to localStorage
  useEffect(() => {
    if (Object.keys(projectPhases).length > 0) {
      localStorage.setItem('taskflow_project_phases', JSON.stringify(projectPhases));
    }
  }, [projectPhases]);

  // Load project tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskflow_project_tasks');
    if (saved) {
      setProjectTasks(JSON.parse(saved));
    }
  }, []);

  // Save project tasks to localStorage
  useEffect(() => {
    if (Object.keys(projectTasks).length > 0) {
      localStorage.setItem('taskflow_project_tasks', JSON.stringify(projectTasks));
    }
  }, [projectTasks]);

  // Handle task status change via drag and drop
  const handleTaskStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'ready' | 'done') => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast.success('Task status updated');
  };

  // Handle assign user to task
  const handleAssignUser = (taskId: string, user: typeof availableUsers[0] | null) => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, assignee: user };
        }
        // Also check subtasks
        if (task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === taskId ? { ...subtask, assignee: user } : subtask
            )
          };
        }
        return task;
      })
    );
    setAssigneePopoverOpen(null);
    if (user) {
      toast.success(`Assigned to ${user.name}`);
    } else {
      toast.success('Assignee removed');
    }
  };

  // Handle update due date
  const handleUpdateDueDate = (taskId: string, date: Date | undefined) => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, dueDate: date ? formatDate(date) : '' };
        }
        // Also check subtasks
        if (task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === taskId ? { ...subtask, dueDate: date ? formatDate(date) : '' } : subtask
            )
          };
        }
        return task;
      })
    );
    setDatePopoverOpen(null);
    if (date) {
      toast.success(`Due date updated to ${formatDate(date)}`);
    } else {
      toast.success('Due date cleared');
    }
  };

  // Format date helper
  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  };

  // Date shortcut helpers
  const getDateFromShortcut = (shortcut: string): Date => {
    const today = new Date();
    const result = new Date(today);
    
    switch (shortcut) {
      case 'today':
        return result;
      case 'tomorrow':
        result.setDate(today.getDate() + 1);
        return result;
      case 'next-week':
        result.setDate(today.getDate() + 7);
        return result;
      case 'next-weekend':
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
        result.setDate(today.getDate() + daysUntilSaturday);
        return result;
      case '2-weeks':
        result.setDate(today.getDate() + 14);
        return result;
      case '4-weeks':
        result.setDate(today.getDate() + 28);
        return result;
      case '8-weeks':
        result.setDate(today.getDate() + 56);
        return result;
      default:
        return result;
    }
  };

  // Handle update status
  const handleUpdateStatus = (taskId: string, newStatus: 'todo' | 'in-progress' | 'ready' | 'done') => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        // Also check subtasks
        if (task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === taskId ? { ...subtask, status: newStatus } : subtask
            )
          };
        }
        return task;
      })
    );
    setStatusPopoverOpen(null);
    setStatusSearchQuery('');
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    toast.success(`Status updated to ${statusLabel}`);
  };

  // Handle update budget
  const handleUpdateBudget = (taskId: string, budget: number) => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newBudgetRemaining = budget - (parseSpentValue(task.sprint || '$0'));
          return { ...task, budget, budgetRemaining: newBudgetRemaining };
        }
        // Also check subtasks
        if (task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask => {
              if (subtask.id === taskId) {
                const newBudgetRemaining = budget - (parseSpentValue(subtask.sprint || '$0'));
                return { ...subtask, budget, budgetRemaining: newBudgetRemaining };
              }
              return subtask;
            })
          };
        }
        return task;
      })
    );
    setBudgetPopoverOpen(null);
    setBudgetInputValue('');
    toast.success(`Budget updated to ${budget.toLocaleString()}`);
  };

  // Handle update spent
  const handleUpdateSpent = (taskId: string, spent: number) => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newBudgetRemaining = task.budget - spent;
          return { ...task, sprint: `${spent.toLocaleString()}`, budgetRemaining: newBudgetRemaining };
        }
        // Also check subtasks
        if (task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask => {
              if (subtask.id === taskId) {
                const newBudgetRemaining = subtask.budget - spent;
                return { ...subtask, sprint: `${spent.toLocaleString()}`, budgetRemaining: newBudgetRemaining };
              }
              return subtask;
            })
          };
        }
        return task;
      })
    );
    setSpentPopoverOpen(null);
    setSpentInputValue('');
    toast.success(`Spent updated to ${spent.toLocaleString()}`);
  };

  // Parse spent value from string like "$1,000" to number
  const parseSpentValue = (spentStr: string): number => {
    if (!spentStr || spentStr === '-') return 0;
    return parseInt(spentStr.replace(/[$,]/g, '')) || 0;
  };

  // Open budget popover with current value
  const openBudgetPopover = (taskId: string, currentBudget: number) => {
    setBudgetInputValue(currentBudget > 0 ? currentBudget.toString() : '');
    setBudgetPopoverOpen(taskId);
  };

  // Open spent popover with current value
  const openSpentPopover = (taskId: string, currentSpent: string) => {
    const spentNum = parseSpentValue(currentSpent);
    setSpentInputValue(spentNum > 0 ? spentNum.toString() : '');
    setSpentPopoverOpen(taskId);
  };

  // Calculate formula
  const calculateFormula = (task: any): number => {
    if (formulaMode === 'basic') {
      const leftValue = task[basicFormulaLeft] || 0;
      const rightValue = basicFormulaRight === 'spent' ? parseSpentValue(task.sprint || '$0') : (task[basicFormulaRight] || 0);
      
      switch (basicFormulaOperator) {
        case '+':
          return leftValue + rightValue;
        case '-':
          return leftValue - rightValue;
        case '*':
          return leftValue * rightValue;
        case '/':
          return rightValue !== 0 ? leftValue / rightValue : 0;
        default:
          return 0;
      }
    } else {
      // Advanced mode - parse formula safely
      try {
        let formula = advancedFormula;
        // Replace field references with actual values
        const fieldRegex = /field\("(\w+)"\)/g;
        formula = formula.replace(fieldRegex, (match, fieldName) => {
          const fieldNameLower = fieldName.toLowerCase();
          if (fieldNameLower === 'budget') return String(task.budget || 0);
          if (fieldNameLower === 'spent') return String(parseSpentValue(task.sprint || '$0'));
          if (fieldNameLower === 'budgetremaining') return String(task.budgetRemaining || 0);
          if (fieldNameLower === 'progress') return String(task.progress || 0);
          return '0';
        });

        // Safe formula evaluation - only allow numbers and basic operators
        // Remove any potentially dangerous characters
        const sanitized = formula.replace(/[^0-9+\-*/().\s]/g, '');
        if (!sanitized || sanitized !== formula) {
          console.warn('Formula contains invalid characters:', formula);
          return 0;
        }

        // Use Function constructor (safer than eval) with restricted scope
        const safeEval = new Function('return (' + sanitized + ')');
        return safeEval() || 0;
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return 0;
      }
    }
  };

  // Apply formula to all tasks
  const applyFormula = () => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        budgetRemaining: calculateFormula(task),
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          budgetRemaining: calculateFormula(subtask)
        }))
      }))
    );
    setFormulaDialogOpen(false);
    toast.success('Formula applied successfully');
  };

  // Insert function into advanced formula
  const insertFunction = (syntax: string) => {
    setAdvancedFormula(prev => prev + ' ' + syntax);
    setFormulaSearchQuery('');
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('taskflow_sidebar_collapsed', JSON.stringify(newCollapsed));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug activeProject and activeSpace changes
  useEffect(() => {
    console.log('🔍 State changed:', {
      activeProject,
      activeSpace,
      activePhase
    });
  }, [activeProject, activeSpace, activePhase]);

  // Preserve scroll position in menu sidebar
  useLayoutEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer) return;

    // Restore saved scroll position
    scrollContainer.scrollTop = savedScrollPosition.current;
  });

  // Save scroll position before state changes
  useEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      savedScrollPosition.current = scrollContainer.scrollTop;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Load tasks for active project
  useEffect(() => {
    console.log('📊 Loading tasks for active project:', {
      activeProject,
      activePhase,
      hasProjectTasks: activeProject ? !!projectTasks[activeProject] : false,
      taskCount: activeProject && projectTasks[activeProject] ? projectTasks[activeProject].length : 0
    });
    
    if (activeProject && projectTasks[activeProject]) {
      const tasksForProject = projectTasks[activeProject];
      
      // Filter by phase if activePhase is set
      if (activePhase) {
        const filtered = tasksForProject.filter(task => task.phase === activePhase);
        console.log(`✅ Setting ${filtered.length} tasks for phase "${activePhase}"`);
        setWorkspaceTasks(filtered);
      } else {
        console.log(`✅ Setting ${tasksForProject.length} tasks for project`);
        setWorkspaceTasks(tasksForProject);
      }
    } else if (!activeProject) {
      // If no project selected, show empty or all tasks
      console.log('⚠️ No active project, clearing tasks');
      setWorkspaceTasks([]);
    } else {
      console.log('⚠️ No tasks found for active project:', activeProject);
    }
  }, [activeProject, activePhase, projectTasks]);

  // Load visible views from localStorage
  useEffect(() => {
    const savedViews = localStorage.getItem('taskflow_visible_views');
    if (savedViews) {
      setVisibleViewIds(JSON.parse(savedViews));
    }
  }, []);

  // Load spaces from spacesApi (in-memory mock data store)
  useEffect(() => {
    // Get spaces from spacesApi instead of localStorage
    const loadedSpaces = spacesApi.getSpaces();
    if (loadedSpaces && loadedSpaces.length > 0) {
      // Migrate old spaces to add projectIds if missing
      // Also convert "Project Management" or "Project Mgmt" space to a project if it exists
      let projectMgmtSpaceFound = false;
      let projectMgmtProjectId: string | null = null;
      let oldSpacePhases: Phase[] = [];
      
      const migratedSpaces = loadedSpaces
        .filter((s: any) => {
          // Check for various variations of Project Management/Mgmt
          if (s.name === 'Project Management' || s.name === 'Project Mgmt' || s.id === 'project-management') {
            projectMgmtSpaceFound = true;
            // Save phases from old space
            oldSpacePhases = s.phases || [];
            return false; // Remove Project Mgmt space
          }
          return true;
        })
        .map((s: any) => ({
          ...s,
          projectIds: s.projectIds || [] // Ensure projectIds exists
        }));
      
      // If Project Mgmt space was found, create it as a project
      if (projectMgmtSpaceFound) {
        // Create Project Mgmt project
        const projectMgmtProject: Project = {
          id: `project-mgmt-${Date.now()}`,
          name: 'Project Mgmt',
          description: 'Project management system',
          status: 'active',
          owner_id: '',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        projectMgmtProjectId = projectMgmtProject.id;
        
        // Add to projects list
        projectsApi.createProject({
          name: projectMgmtProject.name,
          description: projectMgmtProject.description || '',
          status: projectMgmtProject.status,
          owner_id: projectMgmtProject.owner_id,
          start_date: projectMgmtProject.start_date,
          end_date: projectMgmtProject.end_date
        }).then(createdProject => {
          projectMgmtProjectId = createdProject.id;
          
          // Create sample phases if no old phases exist
          const phasesToUse = oldSpacePhases.length > 0 ? oldSpacePhases : createDefaultPhases();
          
          // Save phases to project
          setProjectPhases(prev => ({
            ...prev,
            [projectMgmtProjectId!]: phasesToUse
          }));
          
          // Get current workspace tasks and migrate those belonging to old space
          const currentTasks = [...workspaceTasks];
          const phaseNames = oldSpacePhases.map(p => p.name);
          const tasksToMigrate = currentTasks.filter(task => 
            task.phase && phaseNames.includes(task.phase)
          );
          
          // If no tasks to migrate, create sample tasks
          const tasksToSave = tasksToMigrate.length > 0 ? tasksToMigrate : createSampleTasks(projectMgmtProjectId!);
          
          // Save tasks to project
          if (tasksToSave.length > 0) {
            setProjectTasks(prev => ({
              ...prev,
              [projectMgmtProjectId!]: tasksToSave
            }));
            
            // Remove migrated tasks from workspace tasks only if they were migrated
            if (tasksToMigrate.length > 0) {
              setWorkspaceTasks(currentTasks.filter(task => 
                !tasksToMigrate.some(t => t.id === task.id)
              ));
            }
          }
          
          // Find or create Test01 space and add Project Mgmt project to it
          setSpaces(prevSpaces => {
            let test01Space = prevSpaces.find(s => s.name === 'Test01');
            
            if (test01Space) {
              // Add Project Mgmt project to Test01
              return prevSpaces.map(s => {
                if (s.name === 'Test01') {
                  const currentProjectIds = s.projectIds || [];
                  return { ...s, projectIds: [...currentProjectIds, projectMgmtProjectId!] };
                }
                return s;
              });
            } else {
              // Create Test01 space with Project Mgmt project
              const newTest01Space: Space = {
                id: `space-test01-${Date.now()}`,
                name: 'Test01',
                icon: 'folder',
                projectIds: [projectMgmtProjectId!],
                phases: []
              };
              return [...prevSpaces, newTest01Space];
            }
          });
          
          toast.success(`Space "Project Mgmt" converted to Project (${oldSpacePhases.length} phases, ${tasksToMigrate.length} tasks migrated)`);
        }).catch(error => {
          console.error('Failed to create Project Mgmt project:', error);
          toast.error('Failed to create Project Mgmt project');
        });
      }
      
      setSpaces(migratedSpaces);
      // Expand all spaces by default
      setExpandedSpaces(new Set(migratedSpaces.map((s: Space) => s.id)));
    } else {
      // Initialize with default space
      const defaultSpaces: Space[] = [
        {
          id: 'project-management',
          name: 'Project Management',
          icon: 'folder',
          projectIds: [], // Empty initially
          phases: [
            { id: 'phase-1', name: 'Planning', color: '#0394ff', taskCount: 5 },
            { id: 'phase-2', name: 'Development', color: '#7c66d9', taskCount: 8 },
            { id: 'phase-3', name: 'Testing', color: '#ff6b6b', taskCount: 3 },
            { id: 'phase-4', name: 'Deployment', color: '#51cf66', taskCount: 2 }
          ]
        }
      ];
      setSpaces(defaultSpaces);
      setExpandedSpaces(new Set(['project-management']));
      localStorage.setItem('taskflow_spaces', JSON.stringify(defaultSpaces));
    }
  }, []);

  // Save spaces to localStorage
  useEffect(() => {
    if (spaces.length > 0) {
      localStorage.setItem('taskflow_spaces', JSON.stringify(spaces));
    }
  }, [spaces]);

  // Save project phases to localStorage
  useEffect(() => {
    if (Object.keys(projectPhases).length > 0) {
      localStorage.setItem('taskflow_project_phases', JSON.stringify(projectPhases));
    }
  }, [projectPhases]);

  // Save project tasks to localStorage
  useEffect(() => {
    if (Object.keys(projectTasks).length > 0) {
      console.log('💾 Saving projectTasks to localStorage:', {
        projectCount: Object.keys(projectTasks).length,
        totalTasks: Object.values(projectTasks).reduce((sum, tasks) => sum + tasks.length, 0)
      });
      localStorage.setItem('taskflow_project_tasks', JSON.stringify(projectTasks));
    } else {
      console.log('⚠️ projectTasks is empty, not saving to localStorage');
    }
  }, [projectTasks]);

  // Debug projectTasks state changes
  useEffect(() => {
    console.log('🔄 projectTasks state changed:', {
      projectCount: Object.keys(projectTasks).length,
      projects: Object.keys(projectTasks),
      tasksByProject: Object.fromEntries(
        Object.entries(projectTasks).map(([id, tasks]) => [id, tasks.length])
      )
    });
  }, [projectTasks]);

  // Check localStorage on mount
  useEffect(() => {
    const checkStorage = () => {
      const savedTasks = localStorage.getItem('taskflow_project_tasks');
      console.log('🔍 Checking localStorage on mount:', {
        hasData: !!savedTasks,
        raw: savedTasks ? savedTasks.substring(0, 200) : 'null',
        parsed: savedTasks ? Object.keys(JSON.parse(savedTasks)) : []
      });
      
      // If localStorage has tasks but state doesn't, reload from localStorage
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Object.keys(parsedTasks).length > 0 && Object.keys(projectTasks).length === 0) {
          console.log('⚠️ Found tasks in localStorage but not in state! Reloading...');
          setProjectTasks(parsedTasks);
        }
      }
    };
    
    checkStorage();
  }, []);

  // Load projects from API
  useEffect(() => {
    let isInitialLoad = true;
    
    const loadProjects = async () => {
      try {
        const projectsData = await projectsApi.getProjects();
        
        // Check if "Mobile App Development" project exists
        let mobileAppProject = projectsData.find(p => p.name === 'Mobile App Development');
        
        // Check if we need to create sample tasks
        const needsSampleTasks = !mobileAppProject || 
          !localStorage.getItem('taskflow_project_tasks') ||
          !JSON.parse(localStorage.getItem('taskflow_project_tasks') || '{}')[mobileAppProject?.id];
        
        // If not exists, create it
        if (!mobileAppProject) {
          const newProject = await projectsApi.createProject({
            name: 'Mobile App Development',
            description: 'Mobile application development project',
            status: 'active',
            owner_id: currentUser.id,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
          });
          
          mobileAppProject = newProject;
          
          // Create phases for Mobile App Development
          const phases: Phase[] = [
            { id: 'strategy', name: 'Strategy', color: '#7c66d9', taskCount: 3 },
            { id: 'design', name: 'Design', color: '#0ea5e9', taskCount: 5 },
            { id: 'development', name: 'Development', color: '#10b981', taskCount: 6 },
            { id: 'execution', name: 'Execution', color: '#f59e0b', taskCount: 5 }
          ];
          
          setProjectPhases(prev => ({
            ...prev,
            [mobileAppProject!.id]: phases
          }));
          
          // Create sample tasks for Mobile App Development
          const sampleTasks: WorkspaceTask[] = [
            {
              id: '1',
              name: 'Win contract with an excellent proposal',
              assignee: null,
              dueDate: '2/16/20',
              startDate: '2024-12-01',
              endDate: '2025-02-16',
              status: 'ready' as const,
              budget: 20000,
              sprint: '$15,000',
              budgetRemaining: 5000,
              comments: 4,
              phase: 'Strategy',
              impact: 'high' as const,
              files: 3
            },
            {
              id: '2',
              name: 'Hire brilliant engineers',
              assignee: null,
              dueDate: '3/8/20',
              startDate: '2024-11-15',
              endDate: '2024-12-15',
              status: 'ready' as const,
              budget: 200000,
              sprint: '$200,000',
              budgetRemaining: 0,
              phase: 'Strategy',
              impact: 'high' as const
            },
            {
              id: '3',
              name: 'Research how to crush the competition',
              assignee: null,
              dueDate: '2/5/20',
              startDate: '2024-12-10',
              endDate: '2025-01-20',
              status: 'in-progress' as const,
              budget: 1000,
              sprint: '$0',
              budgetRemaining: 1000,
              phase: 'Strategy',
              impact: 'medium' as const
            },
            {
              id: '4',
              name: 'Plan the build',
              assignee: null,
              dueDate: '2/24/20',
              startDate: '2025-01-05',
              endDate: '2025-01-25',
              status: 'ready' as const,
              budget: 300,
              sprint: '$0',
              budgetRemaining: 300,
              phase: 'Design',
              impact: 'low' as const
            },
            {
              id: '5',
              name: 'Brainstorming meetings',
              assignee: null,
              dueDate: '',
              startDate: '2025-01-10',
              endDate: '2025-02-05',
              status: 'ready' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Design'
            },
            {
              id: '6',
              name: 'Write a knowledge base',
              assignee: null,
              dueDate: '3/25/20',
              startDate: '2025-01-20',
              endDate: '2025-02-20',
              status: 'in-progress' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Design',
              impact: 'medium' as const
            },
            {
              id: '7',
              name: 'Detail the product blueprint',
              assignee: null,
              dueDate: '4/16/20',
              startDate: '2025-02-01',
              endDate: '2025-03-10',
              status: 'in-progress' as const,
              budget: 250000,
              sprint: '$125,000',
              budgetRemaining: 125000,
              comments: 1,
              phase: 'Design',
              impact: 'high' as const
            },
            {
              id: '8',
              name: 'Mockup',
              assignee: null,
              dueDate: '4/28/20',
              startDate: '2025-02-15',
              endDate: '2025-03-15',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Design'
            },
            {
              id: '9',
              name: 'MVP',
              assignee: null,
              dueDate: '6/5/20',
              startDate: '2025-03-01',
              endDate: '2025-04-10',
              status: 'todo' as const,
              budget: 25000,
              sprint: '$25,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Development'
            },
            {
              id: '10',
              name: 'Organize teams and delegate tasks',
              assignee: null,
              dueDate: '6/8/20',
              startDate: '2025-01-15',
              endDate: '2025-02-10',
              status: 'todo' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '11',
              name: 'Product meetings',
              assignee: null,
              dueDate: '',
              startDate: '2025-01-05',
              endDate: '2025-03-25',
              status: 'todo' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '12',
              name: 'Build functioning prototype',
              assignee: null,
              dueDate: '7/7/20',
              startDate: '2025-03-15',
              endDate: '2025-04-20',
              status: 'todo' as const,
              budget: 20000,
              sprint: '$20,000',
              budgetRemaining: 0,
              phase: 'Development',
              impact: 'high' as const
            },
            {
              id: '13',
              name: 'Quality check',
              assignee: null,
              dueDate: '7/10/20',
              startDate: '2025-04-01',
              endDate: '2025-04-25',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '14',
              name: 'Showcase the product',
              assignee: null,
              dueDate: '7/22/20',
              startDate: '2025-04-15',
              endDate: '2025-05-05',
              status: 'todo' as const,
              budget: 2000,
              sprint: '$2,000',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '15',
              name: 'Acquire funding for scaling',
              assignee: null,
              dueDate: '8/9/20',
              startDate: '2025-05-01',
              endDate: '2025-05-20',
              status: 'ready' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Execution'
            },
            {
              id: '16',
              name: 'Hire a support team',
              assignee: null,
              dueDate: '8/29/20',
              startDate: '2025-05-10',
              endDate: '2025-06-10',
              status: 'todo' as const,
              budget: 80000,
              sprint: '$0',
              budgetRemaining: 80000,
              phase: 'Execution'
            },
            {
              id: '17',
              name: 'Scale marketing',
              assignee: null,
              dueDate: '10/5/20',
              startDate: '2025-06-01',
              endDate: '2025-07-15',
              status: 'todo' as const,
              budget: 100000,
              sprint: '$0',
              budgetRemaining: 100000,
              phase: 'Execution'
            },
            {
              id: '18',
              name: 'Build a sales team',
              assignee: null,
              dueDate: '9/26/20',
              startDate: '2025-06-15',
              endDate: '2025-07-30',
              status: 'todo' as const,
              budget: 10000,
              sprint: '$0',
              budgetRemaining: 10000,
              phase: 'Execution'
            },
            {
              id: '19',
              name: 'Reach $1 billion valuation',
              assignee: null,
              dueDate: '12/6/20',
              startDate: '2025-08-01',
              endDate: '2025-12-31',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Execution'
            }
          ];
          
          // Save tasks to project
          setProjectTasks(prev => ({
            ...prev,
            [mobileAppProject!.id]: sampleTasks
          }));
          
          // Save to localStorage
          const existingProjectTasks = localStorage.getItem('taskflow_project_tasks');
          const projectTasksData = existingProjectTasks ? JSON.parse(existingProjectTasks) : {};
          projectTasksData[mobileAppProject!.id] = sampleTasks;
          localStorage.setItem('taskflow_project_tasks', JSON.stringify(projectTasksData));
          
          // Reload projects to get the new project
          const updatedProjects = await projectsApi.getProjects();
          setProjects(updatedProjects);
        } else if (needsSampleTasks) {
          // Project exists but no tasks - create sample tasks
          const sampleTasks: WorkspaceTask[] = [
            {
              id: '1',
              name: 'Win contract with an excellent proposal',
              assignee: null,
              dueDate: '2/16/20',
              startDate: '2024-12-01',
              endDate: '2025-02-16',
              status: 'ready' as const,
              budget: 20000,
              sprint: '$15,000',
              budgetRemaining: 5000,
              comments: 4,
              phase: 'Strategy',
              impact: 'high' as const,
              files: 3
            },
            {
              id: '2',
              name: 'Hire brilliant engineers',
              assignee: null,
              dueDate: '3/8/20',
              startDate: '2024-11-15',
              endDate: '2024-12-15',
              status: 'ready' as const,
              budget: 200000,
              sprint: '$200,000',
              budgetRemaining: 0,
              phase: 'Strategy',
              impact: 'high' as const
            },
            {
              id: '3',
              name: 'Research how to crush the competition',
              assignee: null,
              dueDate: '2/5/20',
              startDate: '2024-12-10',
              endDate: '2025-01-20',
              status: 'in-progress' as const,
              budget: 1000,
              sprint: '$0',
              budgetRemaining: 1000,
              phase: 'Strategy',
              impact: 'medium' as const
            },
            {
              id: '4',
              name: 'Plan the build',
              assignee: null,
              dueDate: '2/24/20',
              startDate: '2025-01-05',
              endDate: '2025-01-25',
              status: 'ready' as const,
              budget: 300,
              sprint: '$0',
              budgetRemaining: 300,
              phase: 'Design',
              impact: 'low' as const
            },
            {
              id: '5',
              name: 'Brainstorming meetings',
              assignee: null,
              dueDate: '',
              startDate: '2025-01-10',
              endDate: '2025-02-05',
              status: 'ready' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Design'
            },
            {
              id: '6',
              name: 'Write a knowledge base',
              assignee: null,
              dueDate: '3/25/20',
              startDate: '2025-01-20',
              endDate: '2025-02-20',
              status: 'in-progress' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Design',
              impact: 'medium' as const
            },
            {
              id: '7',
              name: 'Detail the product blueprint',
              assignee: null,
              dueDate: '4/16/20',
              startDate: '2025-02-01',
              endDate: '2025-03-10',
              status: 'in-progress' as const,
              budget: 250000,
              sprint: '$125,000',
              budgetRemaining: 125000,
              comments: 1,
              phase: 'Design',
              impact: 'high' as const
            },
            {
              id: '8',
              name: 'Mockup',
              assignee: null,
              dueDate: '4/28/20',
              startDate: '2025-02-15',
              endDate: '2025-03-15',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Design'
            },
            {
              id: '9',
              name: 'MVP',
              assignee: null,
              dueDate: '6/5/20',
              startDate: '2025-03-01',
              endDate: '2025-04-10',
              status: 'todo' as const,
              budget: 25000,
              sprint: '$25,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Development'
            },
            {
              id: '10',
              name: 'Organize teams and delegate tasks',
              assignee: null,
              dueDate: '6/8/20',
              startDate: '2025-01-15',
              endDate: '2025-02-10',
              status: 'todo' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '11',
              name: 'Product meetings',
              assignee: null,
              dueDate: '',
              startDate: '2025-01-05',
              endDate: '2025-03-25',
              status: 'todo' as const,
              budget: 0,
              sprint: '-',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '12',
              name: 'Build functioning prototype',
              assignee: null,
              dueDate: '7/7/20',
              startDate: '2025-03-15',
              endDate: '2025-04-20',
              status: 'todo' as const,
              budget: 20000,
              sprint: '$20,000',
              budgetRemaining: 0,
              phase: 'Development',
              impact: 'high' as const
            },
            {
              id: '13',
              name: 'Quality check',
              assignee: null,
              dueDate: '7/10/20',
              startDate: '2025-04-01',
              endDate: '2025-04-25',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '14',
              name: 'Showcase the product',
              assignee: null,
              dueDate: '7/22/20',
              startDate: '2025-04-15',
              endDate: '2025-05-05',
              status: 'todo' as const,
              budget: 2000,
              sprint: '$2,000',
              budgetRemaining: 0,
              phase: 'Development'
            },
            {
              id: '15',
              name: 'Acquire funding for scaling',
              assignee: null,
              dueDate: '8/9/20',
              startDate: '2025-05-01',
              endDate: '2025-05-20',
              status: 'ready' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              comments: 1,
              phase: 'Execution'
            },
            {
              id: '16',
              name: 'Hire a support team',
              assignee: null,
              dueDate: '8/29/20',
              startDate: '2025-05-10',
              endDate: '2025-06-10',
              status: 'todo' as const,
              budget: 80000,
              sprint: '$0',
              budgetRemaining: 80000,
              phase: 'Execution'
            },
            {
              id: '17',
              name: 'Scale marketing',
              assignee: null,
              dueDate: '10/5/20',
              startDate: '2025-06-01',
              endDate: '2025-07-15',
              status: 'todo' as const,
              budget: 100000,
              sprint: '$0',
              budgetRemaining: 100000,
              phase: 'Execution'
            },
            {
              id: '18',
              name: 'Build a sales team',
              assignee: null,
              dueDate: '9/26/20',
              startDate: '2025-06-15',
              endDate: '2025-07-30',
              status: 'todo' as const,
              budget: 10000,
              sprint: '$0',
              budgetRemaining: 10000,
              phase: 'Execution'
            },
            {
              id: '19',
              name: 'Reach $1 billion valuation',
              assignee: null,
              dueDate: '12/6/20',
              startDate: '2025-08-01',
              endDate: '2025-12-31',
              status: 'todo' as const,
              budget: 1000,
              sprint: '$1,000',
              budgetRemaining: 0,
              phase: 'Execution'
            }
          ];
          
          // Save tasks to project
          setProjectTasks(prev => ({
            ...prev,
            [mobileAppProject!.id]: sampleTasks
          }));
          
          // Save to localStorage
          const existingProjectTasks = localStorage.getItem('taskflow_project_tasks');
          const projectTasksData = existingProjectTasks ? JSON.parse(existingProjectTasks) : {};
          projectTasksData[mobileAppProject!.id] = sampleTasks;
          localStorage.setItem('taskflow_project_tasks', JSON.stringify(projectTasksData));
          
          // Create phases if not exist
          if (!projectPhases[mobileAppProject!.id]) {
            const phases: Phase[] = [
              { id: 'strategy', name: 'Strategy', color: '#7c66d9', taskCount: 3 },
              { id: 'design', name: 'Design', color: '#0ea5e9', taskCount: 5 },
              { id: 'development', name: 'Development', color: '#10b981', taskCount: 6 },
              { id: 'execution', name: 'Execution', color: '#f59e0b', taskCount: 5 }
            ];
            
            setProjectPhases(prev => ({
              ...prev,
              [mobileAppProject!.id]: phases
            }));
          }
          
          setProjects(projectsData);
        } else {
          setProjects(projectsData);
        }
        
        // ONLY set first project as active on initial load AND if no project is selected
        if (isInitialLoad && !activeProject && projectsData.length > 0) {
          console.log('🚀 Initial load: Setting first project as active', projectsData[0].id);
          setActiveProject(projectsData[0].id);
        }
        isInitialLoad = false;
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
      }
    };
    loadProjects();
    
    // Reload projects every 2 seconds to catch newly created Node project
    const interval = setInterval(loadProjects, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load tasks when active project changes
  useEffect(() => {
    const loadTasksForProject = async () => {
      if (!activeProject) return;
      
      // Check if project has migrated tasks in local storage
      if (projectTasks[activeProject] && projectTasks[activeProject].length > 0) {
        setWorkspaceTasks(projectTasks[activeProject]);
        return;
      }
      
      try {
        const tasks = await tasksApi.getTasksByProject(activeProject);
        const users = await usersApi.getUsers();
        
        // Convert Task[] to WorkspaceTask[]
        const workspaceTasks: WorkspaceTask[] = tasks.map(task => {
          const assignee = users.find(u => u.id === task.assignee_id);
          
          // Map status from Task to WorkspaceTask
          let workspaceStatus: 'todo' | 'in-progress' | 'ready' | 'done' = 'todo';
          if (task.status === 'in_progress') workspaceStatus = 'in-progress';
          else if (task.status === 'review') workspaceStatus = 'ready';
          else if (task.status === 'completed') workspaceStatus = 'done';
          else workspaceStatus = task.status as 'todo';
          
          return {
            id: task.id,
            name: task.title,
            assignee: assignee ? {
              name: assignee.name,
              avatar: assignee.avatar,
              initials: assignee.name.split(' ').map(n => n[0]).join('').toUpperCase(),
              color: '#0394ff'
            } : null,
            dueDate: new Date(task.due_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }),
            startDate: task.created_at,
            endDate: task.due_date,
            status: workspaceStatus,
            budget: task.estimated_hours * 100, // Mock budget based on estimated hours
            sprint: `${task.estimated_hours * 100}`,
            budgetRemaining: Math.max(0, (task.estimated_hours - task.actual_hours) * 100),
            comments: 0,
            phase: 'General',
            subtasks: []
          };
        });
        
        setWorkspaceTasks(workspaceTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast.error('Failed to load tasks');
      }
    };
    
    loadTasksForProject();
  }, [activeProject, projectTasks]);

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleAllTasks = () => {
    if (selectedTasks.size === workspaceTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(workspaceTasks.map(t => t.id)));
    }
  };

  const toggleGroupCollapse = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Convert tasks to Gantt format
  const convertToGanttTasks = () => {
    const ganttTasks: any[] = [];
    const today = new Date();
    
    // Group tasks by phase
    const phaseGroups: { [key: string]: WorkspaceTask[] } = {};
    workspaceTasks.forEach(task => {
      const phaseName = task.phase || 'No Phase';
      if (!phaseGroups[phaseName]) {
        phaseGroups[phaseName] = [];
      }
      phaseGroups[phaseName].push(task);
    });

    // Convert each phase to Gantt format
    Object.entries(phaseGroups).forEach(([phaseName, tasks]) => {
      const phase = spaces.find(s => s.id === activeSpace)?.phases?.find(p => p.name === phaseName);
      
      ganttTasks.push({
        id: `phase-${phaseName}`,
        name: phaseName,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(today.getFullYear(), today.getMonth() + 2, 0),
        progress: 30,
        color: phase?.color || '#0394ff',
        type: 'phase',
        children: tasks.map((task, idx) => ({
          id: task.id,
          name: task.name,
          startDate: task.startDate ? new Date(task.startDate) : new Date(today.getFullYear(), today.getMonth(), idx * 3 + 1),
          endDate: task.endDate ? new Date(task.endDate) : new Date(today.getFullYear(), today.getMonth(), idx * 3 + 7),
          progress: task.status === 'done' ? 100 : task.status === 'ready' ? 75 : task.status === 'in-progress' ? 50 : 0,
          color: phase?.color || '#0394ff',
          type: 'task'
        }))
      });
    });

    return ganttTasks;
  };

  // Handle task reorder in Gantt view
  const handleGanttTaskReorder = (taskId: string, newIndex: number, parentId?: string) => {
    // Implementation for reordering tasks
    console.log('Reorder task:', taskId, 'to index:', newIndex, 'parent:', parentId);
  };

  // Handle task date change in Gantt view
  const handleGanttTaskDateChange = (taskId: string, newStartDate: Date, newEndDate: Date) => {
    setWorkspaceTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0]
        };
      }
      return task;
    }));
  };

  // Group tasks based on selected criteria
  const groupTasks = () => {
    if (groupBy === 'none') {
      return { 'All Tasks': workspaceTasks };
    }

    const grouped: { [key: string]: WorkspaceTask[] } = {};

    workspaceTasks.forEach(task => {
      let key = '';
      
      switch (groupBy) {
        case 'status':
          key = task.status.toUpperCase();
          break;
        case 'sprint':
          key = task.sprint || 'No Sprint';
          break;
        case 'assignee':
          key = task.assignee ? task.assignee.name : 'Unassigned';
          break;
        case 'phase':
          key = task.phase || 'No Phase';
          break;
        default:
          key = 'All Tasks';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(task);
    });

    return grouped;
  };

  // Create new space
  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) {
      toast.error('Please enter a space name');
      return;
    }

    const newSpace: Space = {
      id: `space-${Date.now()}`,
      name: newSpaceName,
      icon: 'folder',
      projectIds: [], // Initialize with empty project list
      phases: []
    };

    setSpaces([...spaces, newSpace]);
    setNewSpaceName('');
    setShowCreateSpaceDialog(false);
    toast.success(`Space "${newSpaceName}" created successfully`);
  };

  // Create new phase
  const handleCreatePhase = () => {
    if (!newPhaseName.trim()) {
      toast.error('Please enter a phase name');
      return;
    }

    if (!selectedSpaceForPhase) {
      toast.error('Please select a space');
      return;
    }

    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: newPhaseName,
      color: newPhaseColor,
      taskCount: 0
    };

    setSpaces(spaces.map(space => {
      if (space.id === selectedSpaceForPhase) {
        return {
          ...space,
          phases: [...space.phases, newPhase]
        };
      }
      return space;
    }));

    setNewPhaseName('');
    setNewPhaseColor('#0394ff');
    setShowCreatePhaseDialog(false);
    toast.success(`Phase "${newPhaseName}" created successfully`);
  };

  const groupedTasks = groupTasks();

  // Create new project and assign to space
  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Create the project via API
      const newProject = await projectsApi.createProject({
        ...projectData,
        owner_id: currentUser?.id || '1',
        members: [currentUser?.id || '1']
      });
      
      // Update projects list
      setProjects([...projects, newProject]);
      
      // If a space was selected, add project to that space using spacesApi
      if (selectedSpaceForProject) {
        const updatedSpace = spacesApi.addProjectToSpace(selectedSpaceForProject, newProject.id);
        
        if (updatedSpace) {
          // Update local state to reflect the change
          setSpaces(spacesApi.getSpaces());
          toast.success(`Project "${newProject.name}" created and added to space`);
        } else {
          toast.error('Failed to add project to space');
        }
      } else {
        toast.success(`Project "${newProject.name}" created successfully`);
      }
      
      // Close dialog and reset state
      setShowCreateProjectDialog(false);
      setSelectedSpaceForProject(null);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  // Handle project rename
  const handleStartRenameProject = (project: Project) => {
    setRenamingProjectId(project.id);
    setRenameProjectValue(project.name);
  };

  const handleRenameProject = async () => {
    if (!renamingProjectId || !renameProjectValue.trim()) return;

    try {
      await projectsApi.updateProject(renamingProjectId, { name: renameProjectValue.trim() });
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === renamingProjectId ? { ...p, name: renameProjectValue.trim() } : p
      ));
      
      toast.success('Project renamed successfully');
      setRenamingProjectId(null);
      setRenameProjectValue('');
    } catch (error) {
      console.error('Failed to rename project:', error);
      toast.error('Failed to rename project');
    }
  };

  const handleCancelRenameProject = () => {
    setRenamingProjectId(null);
    setRenameProjectValue('');
  };

  // Handle space rename
  const handleStartRenameSpace = (space: Space) => {
    setRenamingSpaceId(space.id);
    setRenameSpaceValue(space.name);
  };

  const handleRenameSpace = () => {
    if (!renamingSpaceId || !renameSpaceValue.trim()) return;

    // Update local state
    setSpaces(spaces.map(s => 
      s.id === renamingSpaceId ? { ...s, name: renameSpaceValue.trim() } : s
    ));
    
    toast.success('Space renamed successfully');
    setRenamingSpaceId(null);
    setRenameSpaceValue('');
  };

  const handleCancelRenameSpace = () => {
    setRenamingSpaceId(null);
    setRenameSpaceValue('');
  };

  // Handle assign projects to space
  const handleOpenAssignProjectDialog = (spaceId: string) => {
    setSelectedSpaceForAssign(spaceId);
    setShowAssignProjectDialog(true);
    // Get projects already in this space
    const space = spaces.find(s => s.id === spaceId);
    setSelectedProjectsToAssign(new Set(space?.projectIds || []));
  };

  const handleToggleProjectSelection = (projectId: string) => {
    const newSelected = new Set(selectedProjectsToAssign);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjectsToAssign(newSelected);
  };

  const handleSaveAssignProjects = () => {
    if (!selectedSpaceForAssign) return;

    setSpaces(prevSpaces =>
      prevSpaces.map(space => {
        if (space.id === selectedSpaceForAssign) {
          return { ...space, projectIds: Array.from(selectedProjectsToAssign) };
        }
        // Ensure all spaces have projectIds
        return { ...space, projectIds: space.projectIds || [] };
      })
    );

    toast.success('Projects assigned successfully');
    setShowAssignProjectDialog(false);
    setSelectedSpaceForAssign(null);
    setSelectedProjectsToAssign(new Set());
  };

  // Handle move project between spaces
  const handleOpenMoveProjectDialog = (projectId: string) => {
    setProjectToMove(projectId);
    setShowMoveProjectDialog(true);
    setTargetSpaceForMove(null);
  };

  const handleMoveProject = () => {
    if (!projectToMove || !targetSpaceForMove) return;

    setSpaces(prevSpaces =>
      prevSpaces.map(space => {
        // Remove project from all spaces
        const currentProjectIds = space.projectIds || [];
        const updatedProjectIds = currentProjectIds.filter(id => id !== projectToMove);
        
        // Add project to target space
        if (space.id === targetSpaceForMove) {
          return { ...space, projectIds: [...updatedProjectIds, projectToMove] };
        }
        
        return { ...space, projectIds: updatedProjectIds };
      })
    );

    toast.success('Project moved successfully');
    setShowMoveProjectDialog(false);
    setProjectToMove(null);
    setTargetSpaceForMove(null);
  };

  // Get unassigned projects (not in any space)
  const getUnassignedProjects = () => {
    const assignedProjectIds = new Set(spaces.flatMap(s => s.projectIds || []));
    return projects.filter(p => !assignedProjectIds.has(p.id));
  };

  // Get projects for a specific space
  const getProjectsForSpace = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return [];
    // Ensure projectIds exists and is an array
    const projectIds = space.projectIds || [];
    return projects.filter(p => projectIds.includes(p.id));
  };

  // Handle create phase for project
  const handleOpenCreateProjectPhaseDialog = (projectId: string) => {
    setSelectedProjectForPhase(projectId);
    setNewProjectPhaseName('');
    setNewProjectPhaseColor('#0394ff');
    setShowCreateProjectPhaseDialog(true);
  };

  const handleCreateProjectPhase = () => {
    if (!selectedProjectForPhase || !newProjectPhaseName.trim()) {
      toast.error('Please enter a phase name');
      return;
    }

    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: newProjectPhaseName.trim(),
      color: newProjectPhaseColor,
      taskCount: 0
    };

    setProjectPhases(prev => ({
      ...prev,
      [selectedProjectForPhase]: [...(prev[selectedProjectForPhase] || []), newPhase]
    }));

    toast.success(`Phase "${newPhase.name}" created successfully`);
    setShowCreateProjectPhaseDialog(false);
    setSelectedProjectForPhase(null);
    setNewProjectPhaseName('');
    setNewProjectPhaseColor('#0394ff');
  };

  // Handle drop project to space
  const handleDropProjectToSpace = (projectId: string, spaceId: string) => {
    setSpaces(prevSpaces =>
      prevSpaces.map(space => {
        // Remove project from all spaces
        const currentProjectIds = space.projectIds || [];
        const updatedProjectIds = currentProjectIds.filter(id => id !== projectId);
        
        // Add project to target space
        if (space.id === spaceId) {
          return { ...space, projectIds: [...updatedProjectIds, projectId] };
        }
        
        return { ...space, projectIds: updatedProjectIds };
      })
    );

    toast.success('Project moved to space');
  };

  const toggleTaskExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddSubtask = async (parentTaskId: string, groupName: string) => {
    if (!newSubtaskName.trim()) return;

    const newSubtask: WorkspaceTask = {
      id: `${parentTaskId}-${Date.now()}`, // Temporary ID
      name: newSubtaskName,
      assignee: null,
      dueDate: '',
      status: 'todo',
      budget: 0,
      sprint: '-',
      budgetRemaining: 0,
      comments: 0,
      phase: groupName || 'Default',
      parentTaskID: parentTaskId
    };

    // Persist to database via API
    await addSubtask(parentTaskId, newSubtask);

    setNewSubtaskName('');
    setAddingSubtaskTo(null);
    setExpandedTasks(prev => new Set([...prev, parentTaskId]));
  };

  // Handle double-click on task to open detail dialog
  const handleTaskDoubleClick = (task: WorkspaceTask) => {
    setSelectedTaskForDetail(task);
    setTaskDetailOpen(true);
  };

  // Handle task update from detail dialog
  const handleTaskUpdate = (updatedTask: WorkspaceTask) => {
    setWorkspaceTasks(prevTasks => {
      const updateTaskInArray = (tasks: WorkspaceTask[]): WorkspaceTask[] => {
        return tasks.map(t => {
          if (t.id === updatedTask.id) {
            return updatedTask;
          }
          if (t.subtasks) {
            return { ...t, subtasks: updateTaskInArray(t.subtasks) };
          }
          return t;
        });
      };
      return updateTaskInArray(prevTasks);
    });
  };

  const renderTaskRow = (task: WorkspaceTask, index: number, isSubtask = false, level = 0) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isAddingSubtask = addingSubtaskTo === task.id;
    const isHovered = hoveredTaskId === task.id;

    return (
      <>
        <div
          key={task.id}
          className={`flex items-center border-b border-[#3d4457] hover:bg-[#292d39] px-4 py-2 transition-colors group ${
            index === 0 && !isSubtask ? 'bg-[#0394ff]/10' : ''
          }`}
          onMouseEnter={() => setHoveredTaskId(task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
        >
          <div className="w-8 flex items-center justify-center">
            <Checkbox 
              checked={selectedTasks.has(task.id)}
              onCheckedChange={() => toggleTaskSelection(task.id)}
            />
          </div>
          <div className="w-6 flex items-center justify-center">
            {hasSubtasks ? (
              <button
                onClick={() => toggleTaskExpand(task.id)}
                className="hover:bg-[#3d4457] rounded transition-colors p-0.5"
              >
                <ChevronRight 
                  className={`w-3 h-3 text-[#838a9c] transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            ) : task.status === 'done' ? (
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : task.status === 'ready' ? (
              <div className="w-4 h-4 rounded-full border-2 border-[#7c66d9]" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-[#3d4457]" />
            )}
          </div>
          <div 
            className="flex-1 min-w-[300px] px-2 cursor-pointer" 
            style={{ paddingLeft: `${level * 24 + 8}px` }}
            onDoubleClick={() => handleTaskDoubleClick(task)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{task.name}</span>
              {task.comments && (
                <span className="flex items-center gap-1 text-xs text-[#838a9c]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {task.comments}
                </span>
              )}
              {/* Add Subtask Button - appears on hover */}
              {isHovered && !isSubtask && (
                <button
                  onClick={() => {
                    setAddingSubtaskTo(task.id);
                    setExpandedTasks(prev => new Set([...prev, task.id]));
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#292d39] hover:bg-[#3d4457] text-[#e1e4e8] rounded border border-[#3d4457] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-3 h-3" />
                  Add subtask
                </button>
              )}
            </div>
          </div>
          <div className="w-40 px-2 flex justify-center">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: task.assignee.color }}
                >
                  {task.assignee.initials}
                </div>
              </div>
            ) : (
              <button className="w-6 h-6 rounded-full border border-[#3d4457] flex items-center justify-center hover:bg-[#3d4457] transition-colors">
                <Plus className="w-3 h-3 text-[#838a9c]" />
              </button>
            )}
          </div>
          <div className="w-32 px-2 flex justify-center">
            {getStatusBadge(task.status)}
          </div>
          <div className="w-36 px-2 flex justify-center">
            {task.dueDate ? (
              <button className="flex items-center gap-1 text-sm text-[#e1e4e8] hover:bg-[#3d4457] px-2 py-1 rounded transition-colors">
                <CalendarIcon className="w-3 h-3" />
                {task.dueDate}
              </button>
            ) : (
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#3d4457] transition-colors">
                <CalendarIcon className="w-3 h-3 text-[#838a9c]" />
              </button>
            )}
          </div>
          <div className="w-28 px-2 text-center text-sm text-[#e1e4e8]">
            {task.budget > 0 ? `${task.budget.toLocaleString()}` : '-'}
          </div>
          <div className="w-28 px-2 text-center text-sm text-[#e1e4e8]">
            {task.sprint}
          </div>
          <div className="w-32 px-2 text-center text-sm text-[#e1e4e8]">
            {task.budgetRemaining > 0 ? `${task.budgetRemaining.toLocaleString()}` : task.budget > 0 ? '$0' : '-'}
          </div>
          <div className="w-12 px-2">
            <button className="w-6 h-6 rounded hover:bg-[#3d4457] flex items-center justify-center transition-colors">
              <MoreHorizontal className="w-4 h-4 text-[#838a9c]" />
            </button>
          </div>
        </div>

        {/* Render subtasks if expanded */}
        {isExpanded && hasSubtasks && task.subtasks!.map((subtask, subIndex) => 
          renderTaskRow(subtask, subIndex, true, level + 1)
        )}

        {/* Quick add subtask input */}
        {isAddingSubtask && isExpanded && (
          <div className="flex items-center border-b border-[#3d4457] bg-[#1f2330] px-4 py-2">
            <div className="w-8"></div>
            <div className="w-6"></div>
            <div className="flex-1 min-w-[300px] px-2" style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}>
              <Input
                type="text"
                placeholder="Subtask name"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask(task.id, '');
                  } else if (e.key === 'Escape') {
                    setAddingSubtaskTo(null);
                    setNewSubtaskName('');
                  }
                }}
                className="bg-[#292d39] border-[#3d4457] text-white text-sm h-8"
                autoFocus
              />
            </div>
            <div className="w-32 px-2"></div>
            <div className="w-28 px-2"></div>
            <div className="w-32 px-2"></div>
            <div className="w-28 px-2"></div>
            <div className="w-28 px-2"></div>
            <div className="w-32 px-2"></div>
            <div className="w-12 px-2 flex gap-1">
              <button
                onClick={() => handleAddSubtask(task.id, '')}
                className="w-6 h-6 rounded bg-[#0394ff] hover:bg-[#0570cd] flex items-center justify-center transition-colors"
                title="Add subtask"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setAddingSubtaskTo(null);
                  setNewSubtaskName('');
                }}
                className="w-6 h-6 rounded hover:bg-[#3d4457] flex items-center justify-center transition-colors"
                title="Cancel"
              >
                <svg className="w-3 h-3 text-[#838a9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  const getStatusBadge = (status: 'todo' | 'in-progress' | 'ready' | 'done') => {
    const statusConfig = {
      todo: { label: 'TO DO', color: 'bg-[#838a9c]/20 text-[#838a9c] border-[#838a9c]/30' },
      'in-progress': { label: 'IN PROGRESS', color: 'bg-[#ffd43b]/20 text-[#ffd43b] border-[#ffd43b]/30' },
      ready: { label: 'READY', color: 'bg-[#7c66d9]/20 text-[#7c66d9] border-[#7c66d9]/30' },
      done: { label: 'DONE', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} border text-xs px-2 py-0.5`}>
        {config.label}
      </Badge>
    );
  };

  // Draggable Task Card Component
  const DraggableTaskCard = ({ task }: { task: WorkspaceTask }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'TASK',
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Card 
          className="bg-[#292d39] border-[#3d4457] p-3 hover:border-[#0394ff] transition-colors cursor-move"
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleTaskDoubleClick(task);
          }}
        >
          <div className="space-y-2">
            <p className="text-sm text-white">{task.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: task.assignee.color }}
                  >
                    {task.assignee.initials}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[#3d4457] flex items-center justify-center">
                    <Plus className="w-3 h-3 text-[#838a9c]" />
                  </div>
                )}
                {task.dueDate && (
                  <span className="text-xs text-[#838a9c] flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {task.dueDate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {task.subtasks && task.subtasks.length > 0 && (
                  <span className="text-xs text-[#838a9c]">{task.subtasks.length} subtasks</span>
                )}
                {task.comments && (
                  <span className="flex items-center gap-1 text-xs text-[#838a9c]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {task.comments}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Droppable Column Component
  const DroppableColumn = ({ 
    status, 
    title, 
    titleColor, 
    tasks 
  }: { 
    status: 'todo' | 'in-progress' | 'ready' | 'done'; 
    title: string; 
    titleColor: string;
    tasks: WorkspaceTask[];
  }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'TASK',
      drop: (item: { id: string; status: string }) => {
        if (item.status !== status) {
          handleTaskStatusChange(item.id, status);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div 
        ref={drop}
        className={`flex-1 bg-[#1f2330] rounded-lg border flex flex-col min-w-[280px] transition-colors ${
          isOver ? 'border-[#0394ff] bg-[#0394ff]/5' : 'border-[#3d4457]'
        }`}
      >
        <div className="px-4 py-3 border-b border-[#3d4457]">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm uppercase`} style={{ color: titleColor }}>{title}</h3>
            <span className="text-xs text-[#838a9c]">{tasks.length}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 taskflow-scrollbar">
          {tasks.map(task => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  // Draggable Project Component
  const DraggableProject = ({ project, children }: { project: Project; children: React.ReactNode }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'PROJECT',
      item: { id: project.id, type: 'PROJECT' },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
        {children}
      </div>
    );
  };

  // Droppable Space Component
  const DroppableSpace = ({ 
    spaceId, 
    children 
  }: { 
    spaceId: string; 
    children: React.ReactNode;
  }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'PROJECT',
      drop: (item: { id: string; type: string }) => {
        if (item.type === 'PROJECT') {
          handleDropProjectToSpace(item.id, spaceId);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <div 
        ref={drop}
        className={`transition-all ${
          isOver && canDrop ? 'bg-[#0394ff]/10 ring-1 ring-[#0394ff] rounded' : ''
        }`}
      >
        {children}
      </div>
    );
  };

  // Handle task reorder in list view
  const handleTaskReorder = (draggedTaskId: string, targetTaskId: string, targetGroupName: string) => {
    setWorkspaceTasks(prevTasks => {
      const draggedIndex = prevTasks.findIndex(t => t.id === draggedTaskId);
      const targetIndex = prevTasks.findIndex(t => t.id === targetTaskId);

      if (draggedIndex === -1 || targetIndex === -1) return prevTasks;

      const newTasks = [...prevTasks];
      const [draggedTask] = newTasks.splice(draggedIndex, 1);

      // Update the phase of dragged task to match target group (if grouping by phase)
      if (groupBy === 'phase') {
        draggedTask.phase = targetGroupName;
      } else if (groupBy === 'status') {
        draggedTask.status = targetGroupName as WorkspaceTask['status'];
      }

      newTasks.splice(targetIndex, 0, draggedTask);

      // Persist the new order to database
      const orderUpdates = newTasks.map((task, index) => ({
        taskId: task.id,
        order: index + 1
      }));

      // Call API to persist order changes
      updateTaskOrders(orderUpdates);

      return newTasks;
    });
  };

  // All available views
  const allAvailableViews = [
    { id: 'list', label: 'List', icon: List, description: 'View tasks in a list format' },
    { id: 'board', label: 'Board', icon: LayoutGrid, description: 'Kanban board view' },
    { id: 'gantt', label: 'Gantt', icon: Target, description: 'Timeline view' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, description: 'Calendar view' },
    { id: 'table', label: 'Table', icon: Table, description: 'Table view with advanced filtering' },
    { id: 'timeline', label: 'Timeline', icon: GanttChartIcon, description: 'Timeline view with milestones' },
    { id: 'workload', label: 'Workload', icon: Activity, description: 'Team workload view' },
    { id: 'map', label: 'Map', icon: MapPin, description: 'Map view for location-based tasks' },
    { id: 'mind-map', label: 'Mind Map', icon: Workflow, description: 'Mind map view' },
    { id: 'overview', label: 'Overview', icon: Eye, description: 'Project overview' },
    { id: 'revision', label: 'Revision Status', icon: Settings, description: 'Revision tracking' },
  ];

  // Get visible view tabs
  const viewTabs = visibleViewIds
    .map(id => allAvailableViews.find(view => view.id === id))
    .filter(Boolean) as typeof allAvailableViews;

  // Handle adding a view to the bar
  const handleAddView = (viewId: string) => {
    if (!visibleViewIds.includes(viewId)) {
      const newVisibleViews = [...visibleViewIds, viewId];
      setVisibleViewIds(newVisibleViews);
      setActiveView(viewId);
      localStorage.setItem('taskflow_visible_views', JSON.stringify(newVisibleViews));
      toast.success(`${allAvailableViews.find(v => v.id === viewId)?.label} view added`);
    } else {
      setActiveView(viewId);
    }
    setViewSelectorOpen(false);
  };

  // Handle removing a view from the bar
  const handleRemoveView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (visibleViewIds.length <= 1) {
      toast.error('You must have at least one view visible');
      return;
    }
    const newVisibleViews = visibleViewIds.filter(id => id !== viewId);
    setVisibleViewIds(newVisibleViews);
    if (activeView === viewId) {
      setActiveView(newVisibleViews[0]);
    }
    localStorage.setItem('taskflow_visible_views', JSON.stringify(newVisibleViews));
    toast.success('View removed');
  };

  const sidebarMenuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
    { id: 'whiteboards', label: 'Whiteboards', icon: ImageIcon },
    { id: 'clips', label: 'Clips', icon: Video },
    { id: 'pulse', label: 'Pulse', icon: Activity },
    { id: 'goals', label: 'Goals', icon: Crosshair },
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'more', label: 'More', icon: MoreVertical }
  ];

  const spaceItems = [
    { id: 'everything', label: 'Everything', icon: Home, hasDropdown: false },
    { id: 'space', label: 'Space', icon: null, hasDropdown: true, indent: 1 },
    { id: 'project-management', label: 'Project Management', icon: null, hasDropdown: true, indent: 2, color: '#7c66d9' },
    { id: 'phase-1', label: 'Phase 1 - Strategy', icon: null, hasDropdown: false, indent: 3, count: 3 },
    { id: 'phase-2', label: 'Phase 2 - Design', icon: null, hasDropdown: false, indent: 3, count: 1 },
    { id: 'phase-3', label: 'Phase 3 - Development', icon: null, hasDropdown: false, indent: 3, count: 1 },
    { id: 'phase-4', label: 'Phase 4 - Execution', icon: null, hasDropdown: false, indent: 3, count: 3 },
    { id: 'dpt', label: 'dpt', icon: null, hasDropdown: false, indent: 2 },
    { id: 'crm', label: 'CRM', icon: null, hasDropdown: false, indent: 1 },
    { id: 'kettle', label: 'Kettle Projects', icon: null, hasDropdown: false, indent: 1 }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="h-full flex bg-[#181c28]">
      {/* Left Sidebar */}
      <div 
        ref={sidebarRef}
        onMouseEnter={() => sidebarCollapsed && setSidebarHovered(true)}
        onMouseLeave={() => sidebarCollapsed && setSidebarHovered(false)}
        className={`bg-[#1f2330] border-r border-[#3d4457] flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed && !sidebarHovered ? 'w-14' : 'w-60'
        } ${sidebarCollapsed && sidebarHovered ? 'absolute left-0 top-0 bottom-0 z-50 shadow-2xl' : ''}`}
      >
        {/* User Profile */}
        <div className="p-3 border-b border-[#3d4457]">
          <div className="flex items-center gap-2">
            {(!sidebarCollapsed || sidebarHovered) && (
              <button className="flex items-center gap-2 flex-1 hover:bg-[#292d39] rounded p-2 transition-colors">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
                  T
                </div>
                <span className="text-sm text-[#e1e4e8] flex-1 text-left truncate">trung nguyen...</span>
                <ChevronDown className="w-4 h-4 text-[#838a9c]" />
              </button>
            )}
            {sidebarCollapsed && !sidebarHovered && (
              <div className="w-full flex justify-center">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
                  T
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#292d39] rounded transition-colors shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#838a9c]" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-[#838a9c]" />
              )}
            </button>
          </div>
        </div>

        {/* Main Menu */}
        <div ref={menuScrollContainerRef} className="flex-1 overflow-y-auto p-2 taskflow-scrollbar">
          <nav className="space-y-0.5">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors ${
                    sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''
                  }`}
                  title={sidebarCollapsed && !sidebarHovered ? item.label : ''}
                >
                  <Icon className="w-4 h-4 text-[#838a9c]" />
                  {(!sidebarCollapsed || sidebarHovered) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Favorites Section */}
          {sidebarCollapsed && !sidebarHovered ? (
            <div className="mt-4">
              <button 
                className="flex items-center justify-center w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors"
                title="Favorites"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors">
                <Star className="w-3 h-3" />
                <span>Favorites</span>
                <ChevronRight className="w-3 h-3 ml-auto" />
              </button>
            </div>
          )}

          {/* Spaces Section */}
          {sidebarCollapsed && !sidebarHovered ? (
            <div className="mt-4">
              <button 
                className="flex items-center justify-center w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors"
                title="Spaces"
              >
                <Folder className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors">
                <button 
                  onClick={() => setSpacesExpanded(!spacesExpanded)}
                  className="flex items-center gap-2 flex-1"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${!spacesExpanded ? '-rotate-90' : ''}`} />
                  <span>Spaces</span>
                </button>
                <button 
                  onClick={() => setShowCreateSpaceDialog(true)}
                  className="hover:bg-[#3d4457] rounded p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

            {spacesExpanded && (
              <div className="mt-1 space-y-0.5">
                {/* Projects Section */}
                {projects.length === 0 && spaces.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-[#838a9c]">
                      No projects found
                    </div>
                )}

                {/* Spaces with Phases */}
                {spaces.map((space) => {
                  const isSpaceExpanded = expandedSpaces.has(space.id);
                  const isActiveSpace = space.id === activeSpace;

                  const toggleSpaceExpand = () => {
                    const newExpanded = new Set(expandedSpaces);
                    if (newExpanded.has(space.id)) {
                      newExpanded.delete(space.id);
                    } else {
                      newExpanded.add(space.id);
                    }
                    setExpandedSpaces(newExpanded);
                  };

                  return (
                    <DroppableSpace key={space.id} spaceId={space.id}>
                      <ContextMenu 
                        modal={false}
                        onOpenChange={(open) => {
                          setOpenContextMenuId(open ? `space-${space.id}` : null);
                          if (!open) setHoveredProjectId(null);
                        }}
                      >
                        <ContextMenuTrigger asChild>
                          <div
                            ref={(el) => {
                              if (el) {
                                projectRefsMap.current.set(`space-${space.id}`, el);
                              }
                            }}
                            className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm transition-colors rounded ${
                              isActiveSpace && !activePhase
                                ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                : 'text-[#e1e4e8] hover:bg-[#292d39]'
                            }`}
                            onMouseEnter={() => setHoveredProjectId(`space-${space.id}`)}
                            onContextMenu={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (renamingSpaceId !== space.id) {
                                  console.log('📁 CLICKED Space Header:', {
                                    spaceId: space.id,
                                    spaceName: space.name,
                                    aboutToSet: {
                                      activeSpace: space.id,
                                      activeProject: null,
                                      activePhase: null
                                    }
                                  });
                                  setActiveSpace(space.id);
                                  setActiveProject(null);
                                  setActivePhase(null);
                                  toggleSpaceExpand();
                                }
                              }}
                              className="flex items-center gap-2 flex-1"
                            >
                              <ChevronDown className={`w-3 h-3 text-[#838a9c] transition-transform ${!isSpaceExpanded ? '-rotate-90' : ''}`} />
                              <Folder className="w-4 h-4 text-[#7c66d9]" />
                              {renamingSpaceId === space.id ? (
                                <Input
                                  value={renameSpaceValue}
                                  onChange={(e) => setRenameSpaceValue(e.target.value)}
                                  onBlur={handleRenameSpace}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRenameSpace();
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCancelRenameSpace();
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 h-6 px-1 py-0 text-sm bg-[#181c28] border-[#0394ff]"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="flex-1 text-left">{space.name}</span>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSpaceForProject(space.id);
                                setShowCreateProjectDialog(true);
                              }}
                              className="hover:bg-[#3d4457] rounded p-0.5"
                              title="Create new project"
                            >
                              <Plus className="w-3 h-3 text-[#838a9c]" />
                            </button>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent 
                          className="w-56 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]"
                          onCloseAutoFocus={(e) => {
                            e.preventDefault();
                            setHoveredProjectId(null);
                          }}
                        >
                          <ContextMenuItem
                            onClick={() => handleStartRenameSpace(space)}
                            className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/space/${space.id}`);
                              toast.success('Link copied to clipboard');
                            }}
                            className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                          >
                            <Link2 className="w-4 h-4" />
                            Copy link
                          </ContextMenuItem>
                          
                          <ContextMenuSeparator className="bg-[#3d4457]" />
                          
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                              <Plus className="w-4 h-4" />
                              Create new
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <CheckSquare className="w-4 h-4" />
                                Task
                              </ContextMenuItem>
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Rocket className="w-4 h-4" />
                                Project
                              </ContextMenuItem>
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <FileText className="w-4 h-4" />
                                Doc
                              </ContextMenuItem>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                              <Palette className="w-4 h-4" />
                              Folder color
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <div className="grid grid-cols-5 gap-2 p-2">
                                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(color => (
                                  <button
                                    key={color}
                                    className="w-6 h-6 rounded hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => toast.success(`Color changed to ${color}`)}
                                  />
                                ))}
                              </div>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                              <Rocket className="w-4 h-4" />
                              Templates
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                Browse templates
                              </ContextMenuItem>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <Zap className="w-4 h-4" />
                            Automations
                          </ContextMenuItem>
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <SlidersHorizontal className="w-4 h-4" />
                            Custom Fields
                          </ContextMenuItem>
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <CircleDot className="w-4 h-4" />
                            Task statuses
                          </ContextMenuItem>
                          
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                              <MoreHorizontal className="w-4 h-4" />
                              More
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Settings className="w-4 h-4" />
                                Settings
                              </ContextMenuItem>
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Activity className="w-4 h-4" />
                                Activity
                              </ContextMenuItem>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          
                          <ContextMenuSeparator className="bg-[#3d4457]" />
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <Star className="w-4 h-4" />
                            Add to Favorites
                          </ContextMenuItem>
                          
                          <ContextMenuSeparator className="bg-[#3d4457]" />
                          
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                              <Move className="w-4 h-4" />
                              Move
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                Move to...
                              </ContextMenuItem>
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </ContextMenuItem>
                          
                          <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                            <Archive className="w-4 h-4" />
                            Archive
                          </ContextMenuItem>
                          
                          <ContextMenuItem
                            variant="destructive"
                            className="text-[#ef4444] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </ContextMenuItem>
                          
                          <ContextMenuSeparator className="bg-[#3d4457]" />
                          
                          <div className="px-1 py-1">
                            <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded py-2 px-3 text-sm transition-colors">
                              <Lock className="w-4 h-4 inline mr-2" />
                              Sharing & Permissions
                            </button>
                          </div>
                        </ContextMenuContent>
                      </ContextMenu>

                      {/* Phases under Space */}
                      {isSpaceExpanded && space.phases?.map((phase) => {
                        const isActivePhase = activePhase === phase.id;
                        return (
                          <button
                            key={phase.id}
                            ref={(el) => {
                              if (el) {
                                projectRefsMap.current.set(`space-phase-${space.id}-${phase.id}`, el);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('📊 CLICKED Space Phase:', {
                                phaseId: phase.id,
                                phaseName: phase.name,
                                spaceId: space.id,
                                spaceName: space.name,
                                aboutToSet: {
                                  activeSpace: space.id,
                                  activePhase: phase.id
                                }
                              });
                              setActiveSpace(space.id);
                              setActivePhase(phase.id);
                            }}
                            className={`flex items-center gap-2 w-full pl-8 pr-2 py-1.5 text-sm transition-colors rounded ${
                              isActivePhase
                                ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                : 'text-[#e1e4e8] hover:bg-[#292d39]'
                            }`}
                          >
                            <div 
                              className="w-2 h-2 rounded-sm" 
                              style={{ backgroundColor: phase.color }} 
                            />
                            <span className="flex-1 text-left">{phase.name}</span>
                            <span className="text-xs text-[#838a9c]">{phase.taskCount}</span>
                          </button>
                        );
                      })}

                      {/* Projects under Space */}
                      {isSpaceExpanded && getProjectsForSpace(space.id).map((project) => {
                        const isProjectExpanded = expandedProjects.has(project.id);
                        const projectPhasesData = projectPhases[project.id] || [];
                        const projectTasksData = projectTasks[project.id] || [];
                        
                        const toggleProjectExpand = () => {
                          const newExpanded = new Set(expandedProjects);
                          if (newExpanded.has(project.id)) {
                            newExpanded.delete(project.id);
                          } else {
                            newExpanded.add(project.id);
                          }
                          setExpandedProjects(newExpanded);
                        };

                        const isActiveInSpace = activeProject === project.id && activeSpace === space.id && !activePhase;

                        return (
                        <div key={`space-project-${project.id}`} className="pl-4">
                          <ContextMenu 
                            modal={false}
                            open={openContextMenuId === `space-project-${space.id}-${project.id}`}
                            onOpenChange={(open) => {
                              if (!open || hoveredProjectId === `space-project-${space.id}-${project.id}`) {
                                setOpenContextMenuId(open ? `space-project-${space.id}-${project.id}` : null);
                              }
                            }}
                          >
                            <ContextMenuTrigger asChild>
                              <div
                                ref={(el) => {
                                  if (el) {
                                    projectRefsMap.current.set(`space-project-${space.id}-${project.id}`, el);
                                  }
                                }}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm transition-colors rounded ${
                                  isActiveInSpace
                                    ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                    : 'text-[#e1e4e8] hover:bg-[#292d39]'
                                }`}
                                onMouseEnter={() => setHoveredProjectId(`space-project-${space.id}-${project.id}`)}
                                onContextMenu={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (renamingProjectId !== project.id) {
                                      console.log('🎯 CLICKED Space Project:', {
                                        projectId: project.id,
                                        projectName: project.name,
                                        spaceId: space.id,
                                        spaceName: space.name,
                                        aboutToSet: {
                                          activeProject: project.id,
                                          activeSpace: space.id,
                                          activePhase: null
                                        }
                                      });
                                      setActiveProject(project.id);
                                      setActiveSpace(space.id);
                                      setActivePhase(null);
                                      toggleProjectExpand();
                                    }
                                  }}
                                  className="flex items-center gap-2 flex-1"
                                >
                                  {projectPhasesData.length > 0 && (
                                    <ChevronDown className={`w-3 h-3 text-[#838a9c] transition-transform ${!isProjectExpanded ? '-rotate-90' : ''}`} />
                                  )}
                                  <Rocket className="w-4 h-4 text-[#0394ff]" />
                                  <span className="flex-1 text-left text-xs">{project.name}</span>
                                </button>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent 
                              className="w-56 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]"
                              onCloseAutoFocus={(e) => {
                                e.preventDefault();
                                setHoveredProjectId(null);
                              }}
                            >
                              <ContextMenuItem
                                onClick={() => handleStartRenameProject(project)}
                                className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                                Rename
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/project/${project.id}`);
                                  toast.success('Link copied to clipboard');
                                }}
                                className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <Link2 className="w-4 h-4" />
                                Copy link
                              </ContextMenuItem>
                              
                              <ContextMenuSeparator className="bg-[#3d4457]" />
                              
                              <ContextMenuSub>
                                <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                  <Plus className="w-4 h-4" />
                                  Create new
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <CheckSquare className="w-4 h-4" />
                                    Task
                                  </ContextMenuItem>
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Rocket className="w-4 h-4" />
                                    Project
                                  </ContextMenuItem>
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <FileText className="w-4 h-4" />
                                    Doc
                                  </ContextMenuItem>
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              
                              <ContextMenuSub>
                                <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                  <Palette className="w-4 h-4" />
                                  Folder color
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  <div className="grid grid-cols-5 gap-2 p-2">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(color => (
                                      <button
                                        key={color}
                                        className="w-6 h-6 rounded hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => toast.success(`Color changed to ${color}`)}
                                      />
                                    ))}
                                  </div>
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              
                              <ContextMenuSub>
                                <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                  <Rocket className="w-4 h-4" />
                                  Templates
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    Browse templates
                                  </ContextMenuItem>
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Zap className="w-4 h-4" />
                                Automations
                              </ContextMenuItem>
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <SlidersHorizontal className="w-4 h-4" />
                                Custom Fields
                              </ContextMenuItem>
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <CircleDot className="w-4 h-4" />
                                Task statuses
                              </ContextMenuItem>
                              
                              <ContextMenuSub>
                                <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                  <MoreHorizontal className="w-4 h-4" />
                                  More
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                  </ContextMenuItem>
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Activity className="w-4 h-4" />
                                    Activity
                                  </ContextMenuItem>
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              
                              <ContextMenuSeparator className="bg-[#3d4457]" />
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Star className="w-4 h-4" />
                                Add to Favorites
                              </ContextMenuItem>
                              
                              <ContextMenuSeparator className="bg-[#3d4457]" />
                              
                              <ContextMenuSub>
                                <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                  <Move className="w-4 h-4" />
                                  Move to Space
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  {spaces.filter(s => s.id !== space.id).map(targetSpace => (
                                    <ContextMenuItem 
                                      key={targetSpace.id}
                                      onClick={() => {
                                        handleDropProjectToSpace(project.id, targetSpace.id);
                                      }}
                                      className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                                    >
                                      <Folder className="w-4 h-4" />
                                      {targetSpace.name}
                                    </ContextMenuItem>
                                  ))}
                                  {spaces.length === 1 && (
                                    <div className="px-2 py-1.5 text-xs text-[#838a9c]">No other spaces</div>
                                  )}
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </ContextMenuItem>
                              
                              <ContextMenuItem
                                onClick={() => {
                                  // Remove from this space
                                  setSpaces(prevSpaces =>
                                    prevSpaces.map(s => {
                                      if (s.id === space.id) {
                                        const currentProjectIds = s.projectIds || [];
                                        return { ...s, projectIds: currentProjectIds.filter(id => id !== project.id) };
                                      }
                                      return s;
                                    })
                                  );
                                  toast.success('Project removed from space');
                                }}
                                className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                                Remove from Space
                              </ContextMenuItem>
                              
                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Archive className="w-4 h-4" />
                                Archive
                              </ContextMenuItem>
                              
                              <ContextMenuItem
                                variant="destructive"
                                className="text-[#ef4444] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </ContextMenuItem>
                              
                              <ContextMenuSeparator className="bg-[#3d4457]" />
                              
                              <div className="px-1 py-1">
                                <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded py-2 px-3 text-sm transition-colors">
                                  <Lock className="w-4 h-4 inline mr-2" />
                                  Sharing & Permissions
                                </button>
                              </div>
                            </ContextMenuContent>
                          </ContextMenu>

                          {/* Phases under Project in Space */}
                          {isProjectExpanded && (
                            <>
                              {projectPhasesData.map((phase) => {
                                const phaseTaskCount = projectTasksData.filter(task => task.phase === phase.name).length;
                                return (
                                  <button
                                    key={`space-project-phase-${phase.id}`}
                                    ref={(el) => {
                                      if (el) {
                                        projectRefsMap.current.set(`space-project-phase-${space.id}-${project.id}-${phase.id}`, el);
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('📊 CLICKED Space Project Phase:', {
                                        phaseId: phase.id,
                                        phaseName: phase.name,
                                        projectId: project.id,
                                        projectName: project.name,
                                        spaceId: space.id,
                                        spaceName: space.name,
                                        aboutToSet: {
                                          activeProject: project.id,
                                          activePhase: phase.name,
                                          activeSpace: space.id
                                        }
                                      });
                                      setActiveProject(project.id);
                                      setActivePhase(phase.name);
                                      setActiveSpace(space.id);
                                    }}
                                    className={`flex items-center justify-between gap-2 w-full pl-12 pr-2 py-1 text-sm transition-colors rounded ${
                                      activePhase === phase.name && activeProject === project.id && activeSpace === space.id
                                        ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                        : 'text-[#e1e4e8] hover:bg-[#292d39]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: phase.color }}
                                      />
                                      <span className="text-xs truncate">{phase.name}</span>
                                    </div>
                                    <span className="text-xs text-[#838a9c]">{phaseTaskCount}</span>
                                  </button>
                                );
                              })}
                              
                              {/* Add Phase Button for Space Project */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreateProjectPhaseDialog(project.id);
                                }}
                                className="flex items-center gap-2 w-full pl-12 pr-2 py-1 text-sm text-[#838a9c] hover:text-[#0394ff] hover:bg-[#292d39] transition-colors rounded"
                              >
                                <Plus className="w-3 h-3" />
                                <span className="text-xs">Add Phase</span>
                              </button>
                            </>
                          )}
                        </div>
                        );
                      })}
                    </DroppableSpace>
                  );
                })}

                <button 
                  onClick={() => setShowCreateSpaceDialog(true)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-sm transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Space</span>
                </button>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-[#3d4457] space-y-1">
          {sidebarCollapsed && !sidebarHovered ? (
            <>
              <button 
                className="flex items-center justify-center w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors"
                title="Invite"
              >
                <Users className="w-4 h-4 text-[#838a9c]" />
              </button>
              <button 
                className="flex items-center justify-center w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors"
                title="Help"
              >
                <HelpCircle className="w-4 h-4 text-[#838a9c]" />
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors">
                <Users className="w-4 h-4 text-[#838a9c]" />
                <span>Invite</span>
              </button>
              <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors">
                <HelpCircle className="w-4 h-4 text-[#838a9c]" />
                <span>Help</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#181c28]">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-4 pb-3 border-b border-[#3d4457]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-[#838a9c]">
                <span className="flex items-center gap-1">
                  <LayoutGrid className="w-4 h-4 text-[#7c66d9]" />
                  Space
                </span>
                <span>/</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-[#7c66d9]" />
                  Project Management
                </span>
              </div>
              <button className="text-[#838a9c] hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[#e1e4e8] hover:text-white hover:bg-[#3d4457]">
                <Search className="w-4 h-4 mr-1" />
                Agents
              </Button>
              <Button variant="ghost" size="sm" className="text-[#e1e4e8] hover:text-white hover:bg-[#3d4457]">
                Ask AI
              </Button>
              <Button variant="ghost" size="sm" className="text-[#e1e4e8] hover:text-white hover:bg-[#3d4457]">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-[#e1e4e8] hover:text-white hover:bg-[#3d4457]">
                Automations
              </Button>
              <ChevronDown className="w-4 h-4 text-[#838a9c]" />
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-1 mb-3">
            <Popover open={viewSelectorOpen} onOpenChange={setViewSelectorOpen}>
              <div className="flex items-center gap-1">
                {viewTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <PopoverTrigger key={tab.id} asChild>
                      <button
                        onClick={() => {
                          if (activeView === tab.id) {
                            setViewSelectorOpen(true);
                          } else {
                            setActiveView(tab.id);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors group relative ${
                          activeView === tab.id
                            ? 'bg-[#292d39] text-white border-b-2 border-[#0394ff]'
                            : 'text-[#838a9c] hover:text-white hover:bg-[#292d39]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {visibleViewIds.length > 1 && (
                          <span
                            onClick={(e) => handleRemoveView(tab.id, e)}
                            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-[#3d4457] rounded p-0.5 transition-opacity cursor-pointer inline-flex"
                            title="Remove view"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                  );
                })}

                {/* Add View Button */}
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors text-[#838a9c] hover:text-white hover:bg-[#292d39] border border-dashed border-[#3d4457]"
                  >
                    <Plus className="w-4 h-4" />
                    Add View
                  </button>
                </PopoverTrigger>
              </div>

              <PopoverContent 
                className="w-80 p-0 bg-[#292d39] border-[#3d4457]" 
                align="start"
                sideOffset={5}
              >
                <div className="p-3 border-b border-[#3d4457]">
                  <h3 className="text-sm text-white">Add View</h3>
                  <p className="text-xs text-[#838a9c] mt-1">Choose a view to add to your workspace</p>
                </div>
                <div className="max-h-96 overflow-y-auto taskflow-scrollbar">
                  {allAvailableViews.map((view) => {
                    const Icon = view.icon;
                    const isVisible = visibleViewIds.includes(view.id);
                    return (
                      <button
                        key={view.id}
                        onClick={() => handleAddView(view.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#3d4457] transition-colors text-left ${
                          isVisible ? 'bg-[#3d4457]/50' : ''
                        }`}
                      >
                        <div className={`mt-0.5 ${isVisible ? 'text-[#0394ff]' : 'text-[#838a9c]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isVisible ? 'text-[#0394ff]' : 'text-white'}`}>
                              {view.label}
                            </span>
                            {isVisible && (
                              <CheckSquare className="w-4 h-4 text-[#0394ff]" />
                            )}
                          </div>
                          <p className="text-xs text-[#838a9c] mt-0.5">{view.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative" ref={groupDropdownRef}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457] text-sm"
                  onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                >
                  <LayoutGrid className="w-4 h-4 mr-1" />
                  Group: {groupBy === 'none' ? 'None' : groupBy === 'status' ? 'Status' : groupBy === 'sprint' ? 'Sprint' : groupBy === 'assignee' ? 'Assignee' : 'Phase'}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                {showGroupDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#292d39] border border-[#3d4457] rounded-lg shadow-lg z-50 min-w-[160px]">
                    <button
                      onClick={() => {
                        setGroupBy('none');
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d4457] first:rounded-t-lg transition-colors ${
                        groupBy === 'none' ? 'text-[#0394ff]' : 'text-[#e1e4e8]'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => {
                        setGroupBy('phase');
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d4457] transition-colors ${
                        groupBy === 'phase' ? 'text-[#0394ff]' : 'text-[#e1e4e8]'
                      }`}
                    >
                      Phase
                    </button>
                    <button
                      onClick={() => {
                        setGroupBy('status');
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d4457] transition-colors ${
                        groupBy === 'status' ? 'text-[#0394ff]' : 'text-[#e1e4e8]'
                      }`}
                    >
                      Status
                    </button>
                    <button
                      onClick={() => {
                        setGroupBy('sprint');
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d4457] transition-colors ${
                        groupBy === 'sprint' ? 'text-[#0394ff]' : 'text-[#e1e4e8]'
                      }`}
                    >
                      Sprint
                    </button>
                    <button
                      onClick={() => {
                        setGroupBy('assignee');
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3d4457] last:rounded-b-lg transition-colors ${
                        groupBy === 'assignee' ? 'text-[#0394ff]' : 'text-[#e1e4e8]'
                      }`}
                    >
                      Assignee
                    </button>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457] text-sm">
                Subtasks
              </Button>
              <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457] text-sm">
                <Columns className="w-4 h-4 mr-1" />
                Columns
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#838a9c]" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c] text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]">
                Hide: 1
              </Button>
              <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]">
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </Button>
            </div>
          </div>
        </div>

        {/* Task List/Board View */}
        <div className="flex-1 overflow-auto taskflow-scrollbar">
          {activeView === 'board' ? (
            // Board View
            <div className="h-full p-6">
              <div className="flex gap-4 h-full">
                <DroppableColumn 
                  status="todo" 
                  title="To Do" 
                  titleColor="#838a9c"
                  tasks={workspaceTasks.filter(t => t.status === 'todo')}
                />
                <DroppableColumn 
                  status="in-progress" 
                  title="In Progress" 
                  titleColor="#ffd43b"
                  tasks={workspaceTasks.filter(t => t.status === 'in-progress')}
                />
                <DroppableColumn 
                  status="ready" 
                  title="Ready" 
                  titleColor="#7c66d9"
                  tasks={workspaceTasks.filter(t => t.status === 'ready')}
                />
                <DroppableColumn 
                  status="done" 
                  title="Complete" 
                  titleColor="#51cf66"
                  tasks={workspaceTasks.filter(t => t.status === 'done')}
                />
              </div>
            </div>
          ) : activeView === 'gantt' ? (
            // Gantt View
            <div className="h-full">
              <GanttChart 
                tasks={convertToGanttTasks()}
                startDate={new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)}
                endDate={new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0)}
                onTaskReorder={handleGanttTaskReorder}
                onTaskDateChange={handleGanttTaskDateChange}
              />
            </div>
          ) : activeView === 'mind-map' ? (
            // Mind Map View - Dynamically loads data based on selected project
            // When you select a project, it automatically displays:
            // - Project name in center node
            // - Project phases as phase nodes
            // - Tasks filtered by phase
            <div className="h-full">
              <MindMapView
                projectName={projects.find(p => p.id === activeProject)?.name || 'Mobile App Development'}
                phases={(projectPhases[activeProject || ''] || []).map(phase => ({
                    id: phase.id,
                    name: phase.name,
                    color: phase.color,
                    tasks: workspaceTasks
                      .filter(task => task.phase === phase.name)
                      .map(task => ({
                        id: task.id,
                        name: task.name,
                        status: task.status,
                        dueDate: task.dueDate,
                        assignee: task.assignee,
                        subtasks: task.subtasks
                      }))
                  })) || []}
                onTaskClick={(taskId) => {
                  toast.info(`Task ${taskId} clicked`);
                }}
                onTaskDoubleClick={(mindMapTask) => {
                  // Find the full task from workspaceTasks
                  const fullTask = workspaceTasks.find(t => t.id === mindMapTask.id);
                  if (fullTask) {
                    handleTaskDoubleClick(fullTask);
                  }
                }}
              />
            </div>
          ) : (
            // List View
            <div className="min-w-[1200px] h-full overflow-auto">
              {/* Table Header */}
              <div className="sticky top-0 bg-[#1f2330] border-b border-[#3d4457] px-4 z-10">
                <div className="flex items-center text-xs text-[#838a9c] py-3">
                  <div className="w-8 flex items-center justify-center">
                    {/* Space for drag handle */}
                  </div>
                  <div className="w-8 flex items-center justify-center">
                    <Checkbox 
                      checked={selectedTasks.size === workspaceTasks.length && workspaceTasks.length > 0}
                      onCheckedChange={toggleAllTasks}
                      className="border-[#3d4457]"
                    />
                  </div>
                  <div className="w-6 flex items-center justify-center">
                    {/* Space for expand icon */}
                  </div>
                  <div className="flex-1 min-w-[300px] px-2 flex items-center gap-3">
                    <span>Task Name</span>
                  </div>
                  <div className="w-40 px-2 text-center">Assignee</div>
                  <div className="w-32 px-2 flex items-center justify-center gap-1">
                    Status
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="w-36 px-2 flex items-center justify-center gap-1">
                    Due date
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="w-28 px-2 text-center">Budget</div>
                  <div className="w-28 px-2 text-center">Spent</div>
                  <button
                    onClick={() => setFormulaDialogOpen(true)}
                    className="w-32 px-2 flex items-center justify-center gap-1.5 hover:bg-[#3d4457]/30 rounded transition-colors group cursor-pointer"
                    title="🔒 Calculated field - Click to configure formula"
                  >
                    <Lock className="w-3 h-3 text-[#838a9c] group-hover:text-[#0394ff] transition-colors flex-shrink-0" />
                    <span className="text-xs text-center group-hover:text-[#0394ff] transition-colors">Budget remaining</span>
                  </button>
                  <div className="w-12"></div>
                </div>
              </div>

              {/* Task Rows */}
              <div className="bg-[#181c28]">
                {/* Add Task Form at Header Level */}
                {addingTaskToGroup === 'header' && (
                  <div className="flex items-center py-2 px-4 border-b border-[#3d4457]/30">
                    <div className="w-8"></div>
                    <div className="w-8"></div>
                    <div className="w-8"></div>
                    <div className="flex-1 min-w-[250px] px-2">
                      <Input
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Task Name or type / for commands"
                        className="bg-[#181c28] border-[#3d4457] focus:border-[#0394ff] text-[#e1e4e8] text-sm h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTaskName.trim()) {
                            const newTask: WorkspaceTask = {
                              id: `task-${Date.now()}`,
                              name: newTaskName.trim(),
                              status: 'todo',
                              assignee: null,
                              dueDate: '',
                              phase: '',
                              sprint: '',
                              priority: 'medium',
                              description: '',
                              budget: 0,
                              budgetRemaining: 0,
                              progress: 0,
                              startDate: '',
                              endDate: '',
                              subtasks: []
                            };
                            
                            setWorkspaceTasks([newTask, ...workspaceTasks]);
                            setNewTaskName('');
                            setAddingTaskToGroup(null);
                            toast.success(`Task "${newTaskName.trim()}" created`);
                          } else if (e.key === 'Escape') {
                            setNewTaskName('');
                            setAddingTaskToGroup(null);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewTaskName('');
                          setAddingTaskToGroup(null);
                        }}
                        className="h-8 px-3 text-[#838a9c] hover:text-[#e1e4e8] hover:bg-[#3d4457]"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newTaskName.trim()) {
                            const newTask: WorkspaceTask = {
                              id: `task-${Date.now()}`,
                              name: newTaskName.trim(),
                              status: 'todo',
                              assignee: null,
                              dueDate: '',
                              phase: '',
                              sprint: '',
                              priority: 'medium',
                              description: '',
                              budget: 0,
                              budgetRemaining: 0,
                              progress: 0,
                              startDate: '',
                              endDate: '',
                              subtasks: []
                            };
                            
                            setWorkspaceTasks([newTask, ...workspaceTasks]);
                            setNewTaskName('');
                            setAddingTaskToGroup(null);
                            toast.success(`Task "${newTaskName.trim()}" created`);
                          }
                        }}
                        className="h-8 px-4 bg-[#0394ff] hover:bg-[#0284d9] text-white"
                      >
                        Save
                      </Button>
                    </div>
                    <div className="w-40"></div>
                    <div className="w-32"></div>
                    <div className="w-36"></div>
                    <div className="w-28"></div>
                    <div className="w-28"></div>
                    <div className="w-32"></div>
                    <div className="w-12"></div>
                  </div>
                )}
                
                {Object.entries(groupedTasks).map(([groupName, tasks]) => {
                  const isCollapsed = collapsedGroups.has(groupName);
                  const groupKey = groupName;
                  
                  const renderTaskRow = (task: WorkspaceTask, depth: number = 0) => {
                    const isExpanded = expandedTasks.has(task.id);
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                    const isSelected = selectedTasks.has(task.id);
                    const isHovered = hoveredTaskId === task.id;

                    // Status color mapping
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'ready': return 'bg-[#7c66d9]/20 text-[#a78bfa] border-[#7c66d9]/30';
                        case 'in-progress': return 'bg-[#0ea5e9]/20 text-[#38bdf8] border-[#0ea5e9]/30';
                        case 'in-review': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                        case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
                        case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                        case 'todo': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                        case 'done': return 'bg-green-500/20 text-green-300 border-green-500/30';
                        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                      }
                    };

                    const getImpactColor = (impact?: string) => {
                      switch (impact) {
                        case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
                        case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                        case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
                        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                      }
                    };

                    const getStatusLabel = (status: string) => {
                      switch (status) {
                        case 'ready': return 'READY';
                        case 'in-progress': return 'IN PR.';
                        case 'in-review': return 'In review';
                        case 'completed': return 'Completed';
                        case 'new': return 'New';
                        case 'todo': return 'TO DO';
                        case 'done': return 'Done';
                        default: return status;
                      }
                    };

                    return (
                      <div key={task.id}>
                        <DraggableTaskRow
                          task={task}
                          groupName={groupName}
                          depth={depth}
                          isSelected={isSelected}
                          isExpanded={isExpanded}
                          hasSubtasks={hasSubtasks}
                          isHovered={isHovered}
                          onReorder={handleTaskReorder}
                          onMouseEnter={() => {
                            setHoveredTaskId(task.id);
                            console.log('Hovering task:', task.id, task.name);
                          }}
                          onMouseLeave={() => {
                            setHoveredTaskId(null);
                            console.log('Left task:', task.id);
                          }}
                          onToggleExpand={() => {
                            const newExpanded = new Set(expandedTasks);
                            if (isExpanded) {
                              newExpanded.delete(task.id);
                            } else {
                              newExpanded.add(task.id);
                            }
                            setExpandedTasks(newExpanded);
                          }}
                          onToggleSelection={() => toggleTaskSelection(task.id)}
                        >

                          {/* Checkbox */}
                          <div className="w-8 flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleTaskSelection(task.id)}
                              className="border-[#3d4457]"
                            />
                          </div>

                          {/* Expand/Collapse Icon */}
                          <div className="w-8 flex items-center justify-center">
                            {hasSubtasks ? (
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedTasks);
                                  if (isExpanded) {
                                    newExpanded.delete(task.id);
                                  } else {
                                    newExpanded.add(task.id);
                                  }
                                  setExpandedTasks(newExpanded);
                                }}
                                className="hover:bg-[#3d4457] rounded p-0.5 transition-colors"
                              >
                                <ChevronDown
                                  className={`w-3 h-3 text-[#838a9c] transition-transform ${
                                    !isExpanded ? '-rotate-90' : ''
                                  }`}
                                />
                              </button>
                            ) : (
                              <div className="w-3 h-3"></div>
                            )}
                          </div>

                          {/* Task Name */}
                          <div className="flex-1 min-w-[250px] px-2 flex items-center gap-2 group/taskname">
                            {editingTaskId === task.id ? (
                              <Input
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                                className="bg-[#181c28] border-[#0394ff] text-[#e1e4e8] text-sm h-8 flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && editingTaskName.trim()) {
                                    // Save task name
                                    const updatedTasks = workspaceTasks.map(t =>
                                      t.id === task.id ? { ...t, name: editingTaskName.trim() } : t
                                    );
                                    setWorkspaceTasks(updatedTasks);
                                    setEditingTaskId(null);
                                    setEditingTaskName('');
                                    toast.success(`Task renamed to: ${editingTaskName.trim()}`);
                                  } else if (e.key === 'Escape') {
                                    setEditingTaskId(null);
                                    setEditingTaskName('');
                                  }
                                }}
                                onBlur={() => {
                                  if (editingTaskName.trim() && editingTaskName !== task.name) {
                                    // Save on blur
                                    const updatedTasks = workspaceTasks.map(t =>
                                      t.id === task.id ? { ...t, name: editingTaskName.trim() } : t
                                    );
                                    setWorkspaceTasks(updatedTasks);
                                    toast.success(`Task renamed to: ${editingTaskName.trim()}`);
                                  }
                                  setEditingTaskId(null);
                                  setEditingTaskName('');
                                }}
                              />
                            ) : (
                              <>
                                <span 
                                  className="text-sm text-[#e1e4e8] cursor-pointer hover:text-[#0394ff] transition-colors"
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskDoubleClick(task);
                                  }}
                                >
                                  {task.name}
                                </span>
                                {/* Add Subtask Button (only show for parent tasks, not subtasks) */}
                                {!task.parentId && (
                                  <button
                                    className={`hover:bg-[#3d4457]/50 rounded p-1 transition-all duration-200 ${
                                      isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAddingSubtaskTo(task.id);
                                      setNewSubtaskName('');
                                      console.log('Add subtask clicked for:', task.name);
                                    }}
                                    title="Add subtask"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-[#0394ff] hover:text-[#4db8ff]" />
                                  </button>
                                )}
                                
                                {/* Edit Task Button */}
                                <button
                                  className={`hover:bg-[#3d4457]/50 rounded p-1 transition-all duration-200 ${
                                    isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTaskId(task.id);
                                    setEditingTaskName(task.name);
                                    console.log('Edit clicked for:', task.name);
                                  }}
                                  title="Edit task name"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#10b981] hover:text-[#34d399]" />
                                </button>
                                
                                {/* More Options */}
                                <button
                                  className={`hover:bg-[#3d4457]/50 rounded p-1 transition-all duration-200 ${
                                    isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('More options clicked for:', task.name);
                                    toast.info(`More options: ${task.name}`);
                                  }}
                                  title="More options"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#a78bfa] hover:text-[#c4b5fd]" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Assignee */}
                          <div className="w-40 px-2">
                            <Popover open={assigneePopoverOpen === task.id} onOpenChange={(open) => setAssigneePopoverOpen(open ? task.id : null)}>
                              <PopoverTrigger asChild>
                                <button className="flex items-center gap-2 hover:bg-[#3d4457]/30 px-2 py-1 rounded transition-colors">
                                  {task.assignee ? (
                                    <>
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                                        style={{ backgroundColor: task.assignee.color }}
                                      >
                                        {task.assignee.initials}
                                      </div>
                                      <span className="text-sm text-[#e1e4e8] truncate">{task.assignee.name}</span>
                                    </>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full border border-dashed border-[#3d4457] flex items-center justify-center hover:border-[#0394ff] transition-colors">
                                      <Plus className="w-3 h-3 text-[#838a9c]" />
                                    </div>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2 bg-[#292d39] border-[#3d4457]" align="start">
                                <div className="space-y-1">
                                  <div className="px-2 py-1.5 text-xs text-[#838a9c] uppercase tracking-wide">Assign to</div>
                                  {task.assignee && (
                                    <>
                                      <button
                                        onClick={() => handleAssignUser(task.id, null)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left"
                                      >
                                        <div className="w-6 h-6 rounded-full border border-dashed border-[#3d4457] flex items-center justify-center">
                                          <Plus className="w-3 h-3 text-[#838a9c]" />
                                        </div>
                                        <span className="text-sm text-[#e1e4e8]">Unassign</span>
                                      </button>
                                      <div className="h-px bg-[#3d4457] my-1" />
                                    </>
                                  )}
                                  {availableUsers.map((user) => (
                                    <button
                                      key={user.id}
                                      onClick={() => handleAssignUser(task.id, user)}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left ${
                                        task.assignee?.id === user.id ? 'bg-[#0394ff]/10' : ''
                                      }`}
                                    >
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                                        style={{ backgroundColor: user.color }}
                                      >
                                        {user.initials}
                                      </div>
                                      <span className="text-sm text-[#e1e4e8]">{user.name}</span>
                                      {task.assignee?.id === user.id && (
                                        <svg className="w-4 h-4 text-[#0394ff] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Status */}
                          <div className="w-32 px-2">
                            <Popover open={statusPopoverOpen === task.id} onOpenChange={(open) => {
                              setStatusPopoverOpen(open ? task.id : null);
                              if (!open) setStatusSearchQuery('');
                            }}>
                              <PopoverTrigger asChild>
                                <button className="w-full">
                                  <Badge className={`${getStatusColor(task.status)} border text-xs capitalize cursor-pointer hover:opacity-80 transition-opacity`}>
                                    {getStatusLabel(task.status)}
                                  </Badge>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[360px] p-0 bg-[#292d39] border-[#3d4457]" align="start">
                                {/* Tabs */}
                                <div className="flex border-b border-[#3d4457]">
                                  <button className="flex-1 px-4 py-2 text-sm text-[#e1e4e8] bg-[#3d4457]/30 border-b-2 border-[#0394ff]">
                                    Status
                                  </button>
                                  <button className="flex-1 px-4 py-2 text-sm text-[#838a9c] hover:bg-[#3d4457]/20 transition-colors">
                                    Task Type
                                  </button>
                                </div>

                                {/* Search */}
                                <div className="p-3 border-b border-[#3d4457]">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#838a9c]" />
                                    <Input
                                      placeholder="Search..."
                                      value={statusSearchQuery}
                                      onChange={(e) => setStatusSearchQuery(e.target.value)}
                                      className="pl-9 bg-[#181c28] border-[#3d4457] text-[#e1e4e8] h-9"
                                    />
                                  </div>
                                </div>

                                {/* Status List */}
                                <div className="p-2">
                                  <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                                    <span className="text-xs text-[#838a9c] uppercase tracking-wide">Statuses</span>
                                    <button className="text-[#838a9c] hover:text-[#e1e4e8] transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-0.5">
                                    {statusOptions
                                      .filter(status => 
                                        statusSearchQuery === '' || 
                                        status.label.toLowerCase().includes(statusSearchQuery.toLowerCase())
                                      )
                                      .map((status) => (
                                        <button
                                          key={status.value}
                                          onClick={() => handleUpdateStatus(task.id, status.value)}
                                          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-[#3d4457]/50 rounded transition-colors group"
                                        >
                                          <CircleDot 
                                            className="w-4 h-4 flex-shrink-0" 
                                            style={{ color: status.color }}
                                          />
                                          <span className="text-sm text-[#e1e4e8] flex-1 text-left">
                                            {status.label}
                                          </span>
                                          {task.status === status.value && (
                                            <>
                                              <Check className="w-4 h-4 text-[#0394ff] flex-shrink-0" />
                                              <button className="w-5 h-5 flex items-center justify-center hover:bg-[#3d4457] rounded transition-colors opacity-0 group-hover:opacity-100">
                                                <X className="w-3 h-3 text-[#838a9c]" />
                                              </button>
                                            </>
                                          )}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Due Date */}
                          <div className="w-36 px-2">
                            <Popover open={datePopoverOpen === task.id} onOpenChange={(open) => setDatePopoverOpen(open ? task.id : null)}>
                              <PopoverTrigger asChild>
                                <button className="flex items-center gap-1.5 text-sm text-[#e1e4e8] hover:bg-[#3d4457]/30 px-2 py-1 rounded transition-colors">
                                  <CalendarIcon className="w-3.5 h-3.5 text-[#838a9c]" />
                                  <span>{task.dueDate || 'Due date'}</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]" align="start">
                                <div className="flex">
                                  {/* Shortcuts */}
                                  <div className="border-r border-[#3d4457] p-2 space-y-1 min-w-[140px]">
                                    <div className="px-2 py-1.5 text-xs text-[#838a9c] uppercase tracking-wide">Quick Select</div>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('today'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>Today</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('tomorrow'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>Tomorrow</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short' })}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('next-week'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>Next week</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date(Date.now() + 604800000).toLocaleDateString('en-US', { weekday: 'short' })}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('next-weekend'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>Next weekend</span>
                                      <span className="text-xs text-[#838a9c]">Sat</span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('2-weeks'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>2 weeks</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date(Date.now() + 1209600000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('4-weeks'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>4 weeks</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date(Date.now() + 2419200000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, getDateFromShortcut('8-weeks'))}
                                      className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-[#e1e4e8]"
                                    >
                                      <span>8 weeks</span>
                                      <span className="text-xs text-[#838a9c]">
                                        {new Date(Date.now() + 4838400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </button>
                                    <div className="h-px bg-[#3d4457] my-1" />
                                    <button
                                      onClick={() => handleUpdateDueDate(task.id, undefined)}
                                      className="w-full px-2 py-1.5 hover:bg-[#3d4457] rounded transition-colors text-left text-sm text-red-400"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                  {/* Calendar */}
                                  <div>
                                    <Calendar
                                      mode="single"
                                      selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                      onSelect={(date) => handleUpdateDueDate(task.id, date)}
                                      className="rounded-md"
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Budget */}
                          <div className="w-28 px-2">
                            <Popover open={budgetPopoverOpen === task.id} onOpenChange={(open) => {
                              if (open) {
                                openBudgetPopover(task.id, task.budget);
                              } else {
                                setBudgetPopoverOpen(null);
                                setBudgetInputValue('');
                              }
                            }}>
                              <PopoverTrigger asChild>
                                <button className="text-sm text-[#e1e4e8] hover:bg-[#3d4457]/30 px-2 py-1 rounded transition-colors">
                                  {task.budget > 0 ? `${task.budget.toLocaleString()}` : '-'}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3 bg-[#292d39] border-[#3d4457]" align="start">
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                                      Budget Amount
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#838a9c]">$</span>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={budgetInputValue}
                                        onChange={(e) => setBudgetInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const value = parseInt(budgetInputValue) || 0;
                                            handleUpdateBudget(task.id, value);
                                          } else if (e.key === 'Escape') {
                                            setBudgetPopoverOpen(null);
                                            setBudgetInputValue('');
                                          }
                                        }}
                                        className="pl-7 bg-[#181c28] border-[#3d4457] text-[#e1e4e8]"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const value = parseInt(budgetInputValue) || 0;
                                        handleUpdateBudget(task.id, value);
                                      }}
                                      className="flex-1 bg-[#0394ff] hover:bg-[#0284e0] text-white"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setBudgetPopoverOpen(null);
                                        setBudgetInputValue('');
                                      }}
                                      className="flex-1 border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]/30"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Spent */}
                          <div className="w-28 px-2">
                            <Popover open={spentPopoverOpen === task.id} onOpenChange={(open) => {
                              if (open) {
                                openSpentPopover(task.id, task.sprint || '$0');
                              } else {
                                setSpentPopoverOpen(null);
                                setSpentInputValue('');
                              }
                            }}>
                              <PopoverTrigger asChild>
                                <button className="text-sm text-[#e1e4e8] hover:bg-[#3d4457]/30 px-2 py-1 rounded transition-colors">
                                  {task.sprint && task.sprint !== '-' ? task.sprint : '$0'}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3 bg-[#292d39] border-[#3d4457]" align="start">
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                                      Spent Amount
                                    </Label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#838a9c]">$</span>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={spentInputValue}
                                        onChange={(e) => setSpentInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const value = parseInt(spentInputValue) || 0;
                                            handleUpdateSpent(task.id, value);
                                          } else if (e.key === 'Escape') {
                                            setSpentPopoverOpen(null);
                                            setSpentInputValue('');
                                          }
                                        }}
                                        className="pl-7 bg-[#181c28] border-[#3d4457] text-[#e1e4e8]"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const value = parseInt(spentInputValue) || 0;
                                        handleUpdateSpent(task.id, value);
                                      }}
                                      className="flex-1 bg-[#0394ff] hover:bg-[#0284e0] text-white"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSpentPopoverOpen(null);
                                        setSpentInputValue('');
                                      }}
                                      className="flex-1 border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]/30"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Budget Remaining - Locked/Calculated Field */}
                          <div 
                            className="w-32 px-2 flex items-center gap-2 group/budget cursor-not-allowed"
                            title="🔒 Calculated field (click column header to edit formula)"
                          >
                            <Lock className="w-3 h-3 text-[#838a9c] flex-shrink-0 group-hover/budget:text-[#0394ff] transition-colors" />
                            <span className="text-sm text-[#838a9c] italic group-hover/budget:text-[#e1e4e8] transition-colors">
                              ${task.budgetRemaining > 0 ? task.budgetRemaining.toLocaleString() : '0'}
                            </span>
                          </div>
                        </DraggableTaskRow>

                        {/* Inline Add Subtask Form */}
                        {addingSubtaskTo === task.id && (
                          <div 
                            className="flex items-center py-2 px-4 border-b border-[#3d4457]/30 bg-[#292d39]/30"
                            style={{ paddingLeft: `${16 + (depth + 1) * 32}px` }}
                          >
                            <div className="w-8"></div>
                            <div className="w-8"></div>
                            <div className="w-8"></div>
                            <div className="flex-1 min-w-[250px] px-2 flex items-center gap-2">
                              <Input
                                value={newSubtaskName}
                                onChange={(e) => setNewSubtaskName(e.target.value)}
                                placeholder="Enter subtask name..."
                                className="bg-[#181c28] border-[#0394ff] text-[#e1e4e8] text-sm h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newSubtaskName.trim()) {
                                    // Add subtask logic here
                                    const newSubtask: WorkspaceTask = {
                                      id: `subtask-${Date.now()}`,
                                      name: newSubtaskName.trim(),
                                      status: 'todo',
                                      assignee: null,
                                      dueDate: '',
                                      phase: task.phase,
                                      sprint: task.sprint,
                                      priority: 'medium',
                                      description: '',
                                      budget: 0,
                                      budgetRemaining: 0,
                                      progress: 0,
                                      startDate: '',
                                      endDate: '',
                                      subtasks: []
                                    };
                                    
                                    // Update tasks to add subtask
                                    const updateTasksWithSubtask = (tasks: WorkspaceTask[]): WorkspaceTask[] => {
                                      return tasks.map(t => {
                                        if (t.id === task.id) {
                                          return {
                                            ...t,
                                            subtasks: [...(t.subtasks || []), newSubtask]
                                          };
                                        }
                                        if (t.subtasks) {
                                          return {
                                            ...t,
                                            subtasks: updateTasksWithSubtask(t.subtasks)
                                          };
                                        }
                                        return t;
                                      });
                                    };
                                    
                                    setWorkspaceTasks(updateTasksWithSubtask(workspaceTasks));
                                    
                                    // Expand parent task to show new subtask
                                    const newExpanded = new Set(expandedTasks);
                                    newExpanded.add(task.id);
                                    setExpandedTasks(newExpanded);
                                    
                                    // Reset form
                                    setNewSubtaskName('');
                                    setAddingSubtaskTo(null);
                                    
                                    toast.success(`Subtask "${newSubtaskName.trim()}" added to "${task.name}"`);
                                  } else if (e.key === 'Escape') {
                                    setNewSubtaskName('');
                                    setAddingSubtaskTo(null);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setNewSubtaskName('');
                                  setAddingSubtaskTo(null);
                                }}
                                className="h-8 px-2 text-[#838a9c] hover:text-[#e1e4e8]"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="w-40"></div>
                            <div className="w-32"></div>
                            <div className="w-36"></div>
                            <div className="w-28"></div>
                            <div className="w-28"></div>
                            <div className="w-32"></div>
                            <div className="w-20"></div>
                          </div>
                        )}

                        {/* Subtasks */}
                        {hasSubtasks && isExpanded && task.subtasks!.map(subtask => 
                          renderTaskRow(subtask, depth + 1)
                        )}
                      </div>
                    );
                  };
                  
                  return (
                    <div key={groupKey}>
                      {/* Group Header */}
                      <div 
                        className="flex items-center gap-2 px-4 py-2 bg-[#1f2330] border-b border-[#3d4457] sticky top-[48px]"
                      >
                        <ChevronDown 
                          className={`w-4 h-4 text-[#838a9c] transition-transform cursor-pointer hover:text-[#e1e4e8] ${isCollapsed ? '-rotate-90' : ''}`}
                          onClick={() => toggleGroupCollapse(groupKey)}
                        />
                        <span 
                          className="text-sm text-[#e1e4e8] cursor-pointer hover:text-white"
                          onClick={() => toggleGroupCollapse(groupKey)}
                        >
                          {groupName}
                        </span>
                        <span 
                          className="text-xs text-[#838a9c] cursor-pointer"
                          onClick={() => toggleGroupCollapse(groupKey)}
                        >
                          ({tasks.length})
                        </span>
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs text-[#838a9c] hover:text-[#0394ff] hover:bg-[#3d4457]/30 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTaskToGroup(groupKey);
                            setNewTaskName('');
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      {/* Group Tasks */}
                      {!isCollapsed && (
                        <>
                          {/* Add New Task Inline Form */}
                          {addingTaskToGroup === groupKey && (
                            <div className="flex items-center py-2 px-4 bg-[#1a1d29] border-b border-[#3d4457]/30">
                              <div className="w-8 flex items-center justify-center">
                                <GripVertical className="w-4 h-4 text-[#3d4457]" />
                              </div>
                              <div className="w-8 flex items-center justify-center">
                                <Checkbox 
                                  disabled
                                  className="border-[#3d4457] opacity-50"
                                />
                              </div>
                              <div className="w-6"></div>
                              <div className="flex-1 min-w-[300px] px-2 flex items-center gap-2">
                                <Input
                                  value={newTaskName}
                                  onChange={(e) => setNewTaskName(e.target.value)}
                                  placeholder="Task name"
                                  className="bg-[#181c28] border-[#3d4457] focus:border-[#0394ff] text-[#e1e4e8] text-sm h-8 flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTaskName.trim()) {
                                      // Determine assignee based on groupBy
                                      let taskAssignee = null;
                                      if (groupBy === 'assignee' && groupName !== 'Unassigned') {
                                        const user = availableUsers.find(u => u.name === groupName);
                                        if (user) {
                                          taskAssignee = {
                                            name: user.name,
                                            avatar: user.avatar,
                                            initials: user.initials,
                                            color: user.color
                                          };
                                        }
                                      }
                                      
                                      // Determine status based on groupBy
                                      let taskStatus: WorkspaceTask['status'] = 'todo';
                                      if (groupBy === 'status') {
                                        const status = statusOptions.find(s => s.label === groupName);
                                        if (status) {
                                          taskStatus = status.value;
                                        }
                                      }
                                      
                                      const newTask: WorkspaceTask = {
                                        id: `task-${Date.now()}`,
                                        name: newTaskName.trim(),
                                        status: taskStatus,
                                        assignee: taskAssignee,
                                        dueDate: '',
                                        phase: groupBy === 'phase' ? groupName : '',
                                        sprint: groupBy === 'sprint' ? groupName : '',
                                        priority: 'medium',
                                        description: '',
                                        budget: 0,
                                        budgetRemaining: 0,
                                        progress: 0,
                                        startDate: '',
                                        endDate: '',
                                        subtasks: []
                                      };
                                      
                                      setWorkspaceTasks([newTask, ...workspaceTasks]);
                                      
                                      // Also update projectTasks if we have an active project
                                      if (activeProject) {
                                        setProjectTasks(prev => ({
                                          ...prev,
                                          [activeProject]: [newTask, ...(prev[activeProject] || [])]
                                        }));
                                      }
                                      
                                      setNewTaskName('');
                                      setAddingTaskToGroup(null);
                                      toast.success(`Task "${newTaskName.trim()}" created`);
                                    } else if (e.key === 'Escape') {
                                      setNewTaskName('');
                                      setAddingTaskToGroup(null);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setNewTaskName('');
                                    setAddingTaskToGroup(null);
                                  }}
                                  className="h-8 w-8 p-0 text-[#838a9c] hover:text-[#e1e4e8] hover:bg-[#3d4457]"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="w-40"></div>
                              <div className="w-32"></div>
                              <div className="w-36"></div>
                              <div className="w-28"></div>
                              <div className="w-28"></div>
                              <div className="w-32"></div>
                              <div className="w-12"></div>
                            </div>
                          )}
                          
                          {tasks.map(task => renderTaskRow(task, 0))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Space Dialog */}
      <Dialog open={showCreateSpaceDialog} onOpenChange={setShowCreateSpaceDialog}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white">
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              Create a new space to organize your projects and tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="spaceName">Space Name</Label>
              <Input
                id="spaceName"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Enter space name..."
                className="bg-[#1f2330] border-[#3d4457] text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSpace();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateSpaceDialog(false)}
              className="bg-transparent border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSpace}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              Create Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Phase Dialog */}
      <Dialog open={showCreateProjectPhaseDialog} onOpenChange={setShowCreateProjectPhaseDialog}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white">
          <DialogHeader>
            <DialogTitle>Create New Phase</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              Add a new phase to organize tasks within this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectPhaseName">Phase Name</Label>
              <Input
                id="projectPhaseName"
                value={newProjectPhaseName}
                onChange={(e) => setNewProjectPhaseName(e.target.value)}
                placeholder="Enter phase name..."
                className="bg-[#1f2330] border-[#3d4457] text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateProjectPhase();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectPhaseColor">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="projectPhaseColor"
                  type="color"
                  value={newProjectPhaseColor}
                  onChange={(e) => setNewProjectPhaseColor(e.target.value)}
                  className="w-20 h-10 bg-[#1f2330] border-[#3d4457] cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 flex-1">
                  {['#0394ff', '#7c66d9', '#ff6b6b', '#51cf66', '#ffd43b', '#ff6b9d'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewProjectPhaseColor(color)}
                      className="w-8 h-8 rounded hover:scale-110 transition-transform border-2"
                      style={{ 
                        backgroundColor: color,
                        borderColor: newProjectPhaseColor === color ? '#fff' : 'transparent'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateProjectPhaseDialog(false)}
              className="bg-transparent border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProjectPhase}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              Create Phase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Phase Dialog */}
      <Dialog open={showCreatePhaseDialog} onOpenChange={setShowCreatePhaseDialog}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white">
          <DialogHeader>
            <DialogTitle>Create New Phase</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              Add a new phase to organize tasks within this space
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phaseName">Phase Name</Label>
              <Input
                id="phaseName"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                placeholder="Enter phase name..."
                className="bg-[#1f2330] border-[#3d4457] text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePhase();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phaseColor">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="phaseColor"
                  type="color"
                  value={newPhaseColor}
                  onChange={(e) => setNewPhaseColor(e.target.value)}
                  className="w-20 h-10 bg-[#1f2330] border-[#3d4457] cursor-pointer"
                />
                <Input
                  type="text"
                  value={newPhaseColor}
                  onChange={(e) => setNewPhaseColor(e.target.value)}
                  placeholder="#0394ff"
                  className="flex-1 bg-[#1f2330] border-[#3d4457] text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Predefined Colors</Label>
              <div className="flex gap-2 flex-wrap">
                {['#0394ff', '#7c66d9', '#ff6b6b', '#51cf66', '#ffd43b', '#ff8cc8'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewPhaseColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      newPhaseColor === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreatePhaseDialog(false)}
              className="bg-transparent border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePhase}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              Create Phase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#0394ff]" />
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              {selectedSpaceForProject 
                ? `Create a new project in "${spaces.find(s => s.id === selectedSpaceForProject)?.name}" space`
                : 'Create a new project'}
            </DialogDescription>
          </DialogHeader>
          <NewProjectForm
            onSave={handleCreateProject}
            onCancel={() => {
              setShowCreateProjectDialog(false);
              setSelectedSpaceForProject(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Formula Configuration Dialog */}
      <Dialog open={formulaDialogOpen} onOpenChange={setFormulaDialogOpen}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#838a9c]" />
              <DialogTitle>Configure Column Formula</DialogTitle>
            </div>
            <DialogDescription className="text-[#838a9c]">
              Budget Remaining is a calculated field. Set up a formula to automatically compute values for all tasks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Formula Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#1f2330] rounded-lg border border-[#3d4457]">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formulaMode === 'advanced'}
                  onCheckedChange={(checked) => setFormulaMode(checked ? 'advanced' : 'basic')}
                  className="data-[state=checked]:bg-[#0394ff]"
                />
                <div>
                  <Label className="text-sm text-[#e1e4e8]">Advanced Editor</Label>
                  <p className="text-xs text-[#838a9c]">
                    {formulaMode === 'advanced' 
                      ? 'Use custom formulas with functions' 
                      : 'Simple column calculations'}
                  </p>
                </div>
              </div>
            </div>

            {formulaMode === 'basic' ? (
              /* Basic Mode */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                      First Column
                    </Label>
                    <Select value={basicFormulaLeft} onValueChange={setBasicFormulaLeft}>
                      <SelectTrigger className="bg-[#1f2330] border-[#3d4457] text-[#e1e4e8]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#838a9c]">$</span>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#292d39] border-[#3d4457]">
                        {availableColumns.map(col => (
                          <SelectItem 
                            key={col.value} 
                            value={col.value}
                            className="text-[#e1e4e8] focus:bg-[#3d4457] focus:text-[#e1e4e8]"
                          >
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 pt-6">
                    <Select value={basicFormulaOperator} onValueChange={setBasicFormulaOperator}>
                      <SelectTrigger className="bg-[#1f2330] border-[#3d4457] text-[#e1e4e8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#292d39] border-[#3d4457]">
                        {operators.map(op => (
                          <SelectItem 
                            key={op.value} 
                            value={op.value}
                            className="text-[#e1e4e8] focus:bg-[#3d4457] focus:text-[#e1e4e8]"
                          >
                            <span className="flex items-center justify-center w-full">
                              {op.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                      Second Column
                    </Label>
                    <Select value={basicFormulaRight} onValueChange={setBasicFormulaRight}>
                      <SelectTrigger className="bg-[#1f2330] border-[#3d4457] text-[#e1e4e8]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#838a9c]">$</span>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#292d39] border-[#3d4457]">
                        {availableColumns.map(col => (
                          <SelectItem 
                            key={col.value} 
                            value={col.value}
                            className="text-[#e1e4e8] focus:bg-[#3d4457] focus:text-[#e1e4e8]"
                          >
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Formula Preview */}
                <div className="p-3 bg-[#1f2330] rounded-lg border border-[#3d4457]">
                  <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                    Formula Preview
                  </Label>
                  <code className="text-sm text-[#e1e4e8] font-mono">
                    {availableColumns.find(c => c.value === basicFormulaLeft)?.label || 'Column'} 
                    {' '}{operators.find(o => o.value === basicFormulaOperator)?.label || '-'}{' '}
                    {availableColumns.find(c => c.value === basicFormulaRight)?.label || 'Column'}
                  </code>
                </div>
              </div>
            ) : (
              /* Advanced Mode */
              <div className="space-y-4">
                {/* Formula Input */}
                <div>
                  <Label className="text-xs text-[#838a9c] uppercase tracking-wide mb-2 block">
                    Formula
                  </Label>
                  <textarea
                    value={advancedFormula}
                    onChange={(e) => setAdvancedFormula(e.target.value)}
                    placeholder='field("Budget") - field("Spent")'
                    className="w-full h-24 px-3 py-2 bg-[#1f2330] border border-[#3d4457] rounded-md text-[#e1e4e8] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                  />
                </div>

                {/* Search Functions */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#838a9c]" />
                  <Input
                    placeholder="Search functions..."
                    value={formulaSearchQuery}
                    onChange={(e) => setFormulaSearchQuery(e.target.value)}
                    className="pl-9 bg-[#1f2330] border-[#3d4457] text-[#e1e4e8]"
                  />
                </div>

                {/* Function Categories */}
                <div className="max-h-64 overflow-y-auto bg-[#1f2330] rounded-lg border border-[#3d4457] p-2">
                  {functionCategories
                    .filter(category => 
                      formulaSearchQuery === '' ||
                      category.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                      category.functions.some(fn => 
                        fn.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                        fn.description.toLowerCase().includes(formulaSearchQuery.toLowerCase())
                      )
                    )
                    .map((category, idx) => (
                      <div key={idx} className="mb-3 last:mb-0">
                        <button
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#838a9c] uppercase tracking-wide hover:text-[#e1e4e8] transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                          {category.name}
                        </button>
                        <div className="space-y-0.5 mt-1">
                          {category.functions
                            .filter(fn => 
                              formulaSearchQuery === '' ||
                              fn.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                              fn.description.toLowerCase().includes(formulaSearchQuery.toLowerCase())
                            )
                            .map((fn, fnIdx) => (
                              <button
                                key={fnIdx}
                                onClick={() => insertFunction(fn.syntax)}
                                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-[#3d4457]/50 rounded transition-colors group text-left"
                              >
                                <div className="flex-1">
                                  <div className="text-sm text-[#e1e4e8] font-mono">{fn.name}</div>
                                  <div className="text-xs text-[#838a9c] mt-0.5">{fn.description}</div>
                                </div>
                                <Plus className="w-4 h-4 text-[#838a9c] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFormulaDialogOpen(false)}
              className="bg-transparent border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button 
              onClick={applyFormula}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
            >
              Calculate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={selectedTaskForDetail}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
    </DndProvider>
  );
}
