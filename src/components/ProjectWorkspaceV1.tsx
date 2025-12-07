import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { WorkspaceSidebar } from './workspace/WorkspaceSidebar';
import { WorkspaceToolbar } from './workspace/WorkspaceToolbar';
import { GanttChart } from './GanttChart';
import { MindMapView } from './MindMapView';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { NewProjectForm } from './NewProjectForm';
import { NewTaskDialog } from './NewTaskDialog';
import { AddPhaseDialog } from './AddPhaseDialog';
import {
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  Network,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  Check,
  X
} from 'lucide-react';
import {
  workspaceUsers,
  type Space,
  type Phase,
  type WorkspaceTask,
  createDefaultPhases
} from '../types/workspace';
import { projectsApi, spacesApi, phasesApi, type Project, tasksApi, type Task, type User, type Space as ApiSpace, type Phase as ApiPhase } from '../services/api';

// Props interface
interface ProjectWorkspaceProps {
  currentUser?: User;
  onBack?: () => void;
}

// Drag & Drop types
const TASK_TYPE = 'TASK_ROW';

interface DragItem {
  id: string;
  index: number;
  groupName: string;
}

// Status options
const statusOptions = [
  { value: 'todo', label: 'TO DO', color: '#838a9c', bgColor: 'bg-[#838a9c]/10' },
  { value: 'in-progress', label: 'IN PROGRESS', color: '#0ea5e9', bgColor: 'bg-[#0ea5e9]/10' },
  { value: 'ready', label: 'READY', color: '#a78bfa', bgColor: 'bg-[#a78bfa]/10' },
  { value: 'done', label: 'COMPLETE', color: '#10b981', bgColor: 'bg-[#10b981]/10' },
];

// Draggable Task Row Component
interface DraggableTaskRowProps {
  task: WorkspaceTask;
  groupName: string;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onReorder: (draggedId: string, targetId: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

function DraggableTaskRow({
  task,
  groupName,
  index,
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
    item: { id: task.id, index, groupName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: TASK_TYPE,
    canDrop: (item: DragItem) => item.id !== task.id,
    drop: (item: DragItem) => {
      if (item.id !== task.id) {
        onReorder(item.id, task.id);
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
      } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'bg-[#0394ff]/5 border-t-2 border-t-[#0394ff]' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Drag Handle */}
      <div className="w-8 shrink-0 flex items-center justify-center cursor-move">
        <GripVertical className={`w-4 h-4 text-[#838a9c] hover:text-[#0394ff] transition-all duration-200 ${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} />
      </div>
      {children}
    </div>
  );
}

export function ProjectWorkspace({ currentUser, onBack }: ProjectWorkspaceProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // View state
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt' | 'workload' | 'mindmap'>('list');
  const [visibleViewIds, setVisibleViewIds] = useState<Set<string>>(new Set(['list', 'board', 'gantt', 'mindmap']));

  // Workspace data
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  const [projectTasks, setProjectTasks] = useState<{ [projectId: string]: WorkspaceTask[] }>({});
  const [projectPhases, setProjectPhases] = useState<{ [projectId: string]: Phase[] }>({});

  // Active selections
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);

  // UI state
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('taskflow_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Filters and search
  const [groupBy, setGroupBy] = useState('phase');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showCreatePhaseDialog, setShowCreatePhaseDialog] = useState(false);
  const [selectedProjectForPhase, setSelectedProjectForPhase] = useState<string | null>(null);
  const [selectedSpaceForProject, setSelectedSpaceForProject] = useState<string | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<WorkspaceTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  // Inline editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState<string | null>(null);
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [budgetPopoverOpen, setBudgetPopoverOpen] = useState<string | null>(null);
  const [budgetInputValue, setBudgetInputValue] = useState('');

  // Add new task inline
  const [addingTaskToGroup, setAddingTaskToGroup] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  // New task dialog
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);

  // Delete phase confirmation dialog
  const [deletePhaseDialog, setDeletePhaseDialog] = useState<{ open: boolean; phaseId: string | null; phaseName: string }>({
    open: false,
    phaseId: null,
    phaseName: ''
  });

  // Column configuration
  const [columns] = useState([
    { id: 'status', name: 'Status', visible: true },
    { id: 'assignee', name: 'Assignee', visible: true },
    { id: 'dueDate', name: 'Due Date', visible: true },
    { id: 'budget', name: 'Budget', visible: true },
    { id: 'budgetRemaining', name: 'Budget Remaining', visible: true },
  ]);

  // Available users for assignment
  const availableUsers = workspaceUsers;

  // ============================================
  // AVAILABLE VIEWS
  // ============================================

  const availableViews = [
    { id: 'list', name: 'List', icon: <List className="h-4 w-4" /> },
    { id: 'board', name: 'Board', icon: <LayoutGrid className="h-4 w-4" /> },
    { id: 'calendar', name: 'Calendar', icon: <CalendarIcon className="h-4 w-4" /> },
    { id: 'gantt', name: 'Gantt', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'workload', name: 'Workload', icon: <Users className="h-4 w-4" /> },
    { id: 'mindmap', name: 'Mind Map', icon: <Network className="h-4 w-4" /> },
  ];

  // ============================================
  // DATA LOADING
  // ============================================

  // Load from localStorage on mount
  useEffect(() => {
    const savedPhases = localStorage.getItem('taskflow_project_phases');
    if (savedPhases) {
      setProjectPhases(JSON.parse(savedPhases));
    }

    const savedTasks = localStorage.getItem('taskflow_project_tasks');
    if (savedTasks) {
      setProjectTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (Object.keys(projectPhases).length > 0) {
      localStorage.setItem('taskflow_project_phases', JSON.stringify(projectPhases));
    }
  }, [projectPhases]);

  useEffect(() => {
    if (Object.keys(projectTasks).length > 0) {
      localStorage.setItem('taskflow_project_tasks', JSON.stringify(projectTasks));
    }
  }, [projectTasks]);

  // Load projects and spaces
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load projects from API
        const projectsData = await projectsApi.getAll();
        setProjects(projectsData);
        console.log(`✅ Loaded ${projectsData.length} projects from API`);

        // Load spaces from API (SQL Server)
        const apiSpaces = await spacesApi.getAll();
        console.log(`📡 API returned ${apiSpaces.length} spaces`);

        // Convert API Space format to local Space format
        const convertedSpaces: Space[] = apiSpaces.map((apiSpace: ApiSpace) => ({
          id: apiSpace.spaceID,
          name: apiSpace.name,
          color: apiSpace.color || '#3B82F6',
          projectIds: apiSpace.projectIDs
            ? apiSpace.projectIDs.split(',').map(id => id.trim().toLowerCase()).filter(Boolean)
            : [],
          phases: []
        }));

        setSpaces(convertedSpaces);
        setExpandedSpaces(new Set(convertedSpaces.map(s => s.id)));
        console.log(`✅ Loaded ${convertedSpaces.length} spaces from SQL Server`);

        // Set first project as active if none selected
        if (projectsData.length > 0) {
          const firstProject = projectsData[0];
          const projectId = ((firstProject as any).projectID || firstProject.id).toLowerCase();
          setActiveProject(projectId);

          // Find which space contains this project
          const spaceWithProject = convertedSpaces.find(s => s.projectIds.includes(projectId));
          if (spaceWithProject) {
            setActiveSpace(spaceWithProject.id);
          }

          // Load tasks for first project
          await loadTasksForProject(projectId);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load projects');
      }
    };
    loadData();
  }, []);

  // Load tasks for a project
  const loadTasksForProject = async (projectId: string) => {
    try {
      // Load phases from API first (always fresh from database)
      const apiPhases = await phasesApi.getByProject(projectId);
      if (apiPhases && apiPhases.length > 0) {
        // Convert API Phase to local Phase format
        const convertedPhases: Phase[] = apiPhases.map((apiPhase: ApiPhase) => ({
          id: apiPhase.phaseID,
          name: apiPhase.name,
          color: apiPhase.color || '#3B82F6',
          taskCount: 0,
          completedCount: 0,
        }));
        setProjectPhases(prev => ({ ...prev, [projectId]: convertedPhases }));
        console.log(`✅ Loaded ${convertedPhases.length} phases from API for project ${projectId}`);
      }

      // Load tasks from API
      const tasks = await tasksApi.getByProject(projectId);
      console.log(`📡 API returned ${tasks?.length || 0} tasks for project ${projectId}`);

      if (tasks && tasks.length > 0) {
        // Convert API tasks to WorkspaceTask format
        const workspaceTasksList: WorkspaceTask[] = tasks.map((task: Task) => ({
          id: task.taskID,
          name: task.title,
          description: task.description || '',
          assignee: null,
          dueDate: task.dueDate ? formatDateDisplay(new Date(task.dueDate)) : '',
          startDate: task.startDate,
          endDate: task.dueDate,
          status: mapApiStatusToLocal(task.status),
          budget: task.budget || 0,
          spent: task.spent || 0,
          sprint: '-',
          budgetRemaining: (task.budget || 0) - (task.spent || 0),
          estimatedHours: task.estimatedHours || 0,
          actualHours: task.actualHours || 0,
          progress: task.progress || 0,
          comments: 0,
          phase: 'No Phase',
          projectID: task.projectID || projectId,  // Map projectID from API task
          projectCode: task.projectCode || projectId,  // Human-readable code for phases API
          phaseID: task.phaseID,  // Map phaseID from API task
        }));

        setProjectTasks(prev => ({ ...prev, [projectId]: workspaceTasksList }));
        setWorkspaceTasks(workspaceTasksList);
        console.log(`✅ Loaded ${workspaceTasksList.length} tasks from API for project ${projectId}`);
      } else {
        // No tasks exist - start with empty list
        setProjectTasks(prev => ({ ...prev, [projectId]: [] }));
        setWorkspaceTasks([]);

        // Create default phases only if no phases were loaded from API
        if (!apiPhases || apiPhases.length === 0) {
          const defaultPhases = createDefaultPhases();
          setProjectPhases(prev => ({ ...prev, [projectId]: defaultPhases }));
        }

        console.log(`✅ No tasks found for project ${projectId}, starting with empty list`);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Start with empty list on error
      setProjectTasks(prev => ({ ...prev, [projectId]: [] }));
      setWorkspaceTasks([]);

      const defaultPhases = createDefaultPhases();
      setProjectPhases(prev => ({ ...prev, [projectId]: defaultPhases }));
    }
  };

  // Map API status to local status
  const mapApiStatusToLocal = (status: string): WorkspaceTask['status'] => {
    const statusMap: { [key: string]: WorkspaceTask['status'] } = {
      'To Do': 'todo',
      'In Progress': 'in-progress',
      'Ready': 'ready',
      'Done': 'done',
      'Completed': 'done',
      'In Review': 'in-review',
      'New': 'new'
    };
    return statusMap[status] || 'todo';
  };

  // Format date for display
  const formatDateDisplay = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  };

  // Load tasks when active project changes
  useEffect(() => {
    if (activeProject) {
      if (projectTasks[activeProject]) {
        const tasksForProject = projectTasks[activeProject];
        if (activePhase) {
          // Filter by phaseID (GUID) instead of phase name string
          const filtered = tasksForProject.filter(task => task.phaseID === activePhase);
          setWorkspaceTasks(filtered);
        } else {
          setWorkspaceTasks(tasksForProject);
        }
      } else {
        loadTasksForProject(activeProject);
      }
    } else {
      setWorkspaceTasks([]);
    }
  }, [activeProject, activePhase, projectTasks]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleSpaceClick = (spaceId: string) => {
    setActiveSpace(spaceId);
    setActiveProject(null);
    setActivePhase(null);
  };

  const handleProjectClick = async (projectId: string, spaceId?: string) => {
    setActiveProject(projectId);
    if (spaceId) setActiveSpace(spaceId);
    setActivePhase(null);

    // Load tasks for this project
    await loadTasksForProject(projectId);
  };

  const handlePhaseClick = (phaseName: string) => {
    setActivePhase(phaseName);
  };

  const toggleSpace = (spaceId: string) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('taskflow_sidebar_collapsed', JSON.stringify(newCollapsed));
  };

  // Handle status change
  const handleStatusChange = (taskId: string, newStatus: string) => {
    setWorkspaceTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus as WorkspaceTask['status'] } : task
      )
    );

    // Update in projectTasks as well
    if (activeProject) {
      setProjectTasks(prev => ({
        ...prev,
        [activeProject]: prev[activeProject]?.map(task =>
          task.id === taskId ? { ...task, status: newStatus as WorkspaceTask['status'] } : task
        ) || []
      }));
    }

    setStatusPopoverOpen(null);
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    toast.success(`Status updated to ${statusLabel}`);
  };

  // Handle assignee change
  const handleAssigneeChange = (taskId: string, user: typeof availableUsers[0] | null) => {
    const updateTask = (task: WorkspaceTask) => {
      if (task.id === taskId) {
        return { ...task, assignee: user };
      }
      return task;
    };

    setWorkspaceTasks(prev => prev.map(updateTask));

    if (activeProject) {
      setProjectTasks(prev => ({
        ...prev,
        [activeProject]: prev[activeProject]?.map(updateTask) || []
      }));
    }

    setAssigneePopoverOpen(null);
    toast.success(user ? `Assigned to ${user.name}` : 'Assignee removed');
  };

  // Handle due date change
  const handleDueDateChange = (taskId: string, date: Date | undefined) => {
    const dateStr = date ? formatDateDisplay(date) : '';

    const updateTask = (task: WorkspaceTask) => {
      if (task.id === taskId) {
        return { ...task, dueDate: dateStr };
      }
      return task;
    };

    setWorkspaceTasks(prev => prev.map(updateTask));

    if (activeProject) {
      setProjectTasks(prev => ({
        ...prev,
        [activeProject]: prev[activeProject]?.map(updateTask) || []
      }));
    }

    setDatePopoverOpen(null);
    toast.success(date ? `Due date updated to ${dateStr}` : 'Due date cleared');
  };

  // Handle budget change
  const handleBudgetChange = (taskId: string, budget: number) => {
    const updateTask = (task: WorkspaceTask) => {
      if (task.id === taskId) {
        const spent = parseFloat(task.sprint?.replace(/[$,]/g, '') || '0') || 0;
        return { ...task, budget, budgetRemaining: budget - spent };
      }
      return task;
    };

    setWorkspaceTasks(prev => prev.map(updateTask));

    if (activeProject) {
      setProjectTasks(prev => ({
        ...prev,
        [activeProject]: prev[activeProject]?.map(updateTask) || []
      }));
    }

    setBudgetPopoverOpen(null);
    setBudgetInputValue('');
    toast.success(`Budget updated to $${budget.toLocaleString()}`);
  };

  // Handle task reorder
  const handleReorderTasks = async (draggedId: string, targetId: string) => {
    let tasksToUpdate: Array<{ id: string; order: number }> = [];

    setWorkspaceTasks(prev => {
      const tasks = [...prev];
      const draggedIndex = tasks.findIndex(t => t.id === draggedId);
      const targetIndex = tasks.findIndex(t => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const [draggedTask] = tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, draggedTask);

      // Update order for affected tasks only
      const minIndex = Math.min(draggedIndex, targetIndex);
      const maxIndex = Math.max(draggedIndex, targetIndex);

      const reorderedTasks = tasks.map((task, index) => ({
        ...task,
        order: index + 1
      }));

      // Collect only affected tasks for backend update
      tasksToUpdate = reorderedTasks
        .slice(minIndex, maxIndex + 1)
        .map(task => ({ id: task.id, order: task.order }));

      return reorderedTasks;
    });

    // Save new order to backend for affected tasks only
    try {
      const updatePromises = tasksToUpdate.map(task =>
        tasksApi.update(task.id, { order: task.order })
      );
      await Promise.all(updatePromises);
      toast.success('Task order updated');
    } catch (error) {
      console.error('Error updating task order:', error);
      toast.error('Failed to save task order');
      // Revert to original state on error
      if (activeProject) {
        loadTasksForProject(activeProject);
      }
    }
  };

  // Handle task click (open detail)
  const handleTaskClick = (task: WorkspaceTask) => {
    console.log('🔵 handleTaskClick called:', task.name, task);
    setSelectedTaskForDetail(task);
    setTaskDetailOpen(true);
  };

  // Handle task update from TaskDetailDialog
  const handleTaskDetailUpdate = async (updatedTask: WorkspaceTask) => {
    try {
      // Update backend API - include phaseID
      await tasksApi.update(updatedTask.id, {
        title: updatedTask.name,
        description: updatedTask.description,
        status: updatedTask.status,
        budget: updatedTask.budget,
        spent: updatedTask.spent,
        estimatedHours: updatedTask.estimatedHours,
        actualHours: updatedTask.actualHours,
        progress: updatedTask.progress,
        phaseID: updatedTask.phaseID,  // Include phaseID in update
      });

      // Update local state
      setSelectedTaskForDetail(updatedTask);
      setWorkspaceTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (activeProject) {
        setProjectTasks(prev => ({
          ...prev,
          [activeProject]: prev[activeProject]?.map(t => t.id === updatedTask.id ? updatedTask : t) || []
        }));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Handle create project
  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await projectsApi.createProject(projectData);
      setProjects([...projects, newProject]);

      if (selectedSpaceForProject) {
        const newProjectId = (newProject as any).projectID || newProject.id;
        // Update local state to add project to space
        setSpaces(prev => prev.map(space =>
          space.id === selectedSpaceForProject
            ? { ...space, projectIds: [...space.projectIds, newProjectId] }
            : space
        ));
        setExpandedSpaces(prev => new Set(prev).add(selectedSpaceForProject));
        setActiveProject(newProjectId);
        setActiveSpace(selectedSpaceForProject);
        toast.success(`Project "${newProject.name}" created`);
      }

      setShowCreateProjectDialog(false);
      setSelectedSpaceForProject(null);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  // Handle add new task
  const handleAddTask = async (groupKey: string) => {
    if (!newTaskName.trim() || !activeProject) return;

    const newTask: WorkspaceTask = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      assignee: null,
      dueDate: '',
      status: 'todo',
      budget: 0,
      spent: 0,
      sprint: '-',
      budgetRemaining: 0,
      comments: 0,
      phase: groupBy === 'phase' ? groupKey : 'No Phase'
    };

    setWorkspaceTasks(prev => [...prev, newTask]);
    setProjectTasks(prev => ({
      ...prev,
      [activeProject]: [...(prev[activeProject] || []), newTask]
    }));

    setNewTaskName('');
    setAddingTaskToGroup(null);
    toast.success('Task created');
  };


  // Delete handlers
  const handleDeleteSpace = async (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;

    if (space.projectIds && space.projectIds.length > 0) {
      toast.error('Cannot delete space with projects');
      return;
    }

    try {
      await spacesApi.delete(spaceId);
      setSpaces(prev => prev.filter(s => s.id !== spaceId));
      if (activeSpace === spaceId) setActiveSpace(null);
      toast.success(`Space "${space.name}" deleted`);
    } catch (error) {
      console.error('Failed to delete space:', error);
      toast.error('Failed to delete space');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => ((p as any).projectID || p.id) === projectId);
    if (!project) return;

    try {
      await projectsApi.deleteProject(projectId);
      setProjects(projects.filter(p => ((p as any).projectID || p.id) !== projectId));

      // Remove project from spaces locally
      setSpaces(prev => prev.map(space =>
        space.projectIds.includes(projectId)
          ? { ...space, projectIds: space.projectIds.filter(id => id !== projectId) }
          : space
      ));

      if (activeProject === projectId) {
        setActiveProject(null);
        setActivePhase(null);
      }
      toast.success(`Project "${project.name}" deleted`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleDeletePhase = async (_spaceId: string, phaseId: string) => {
    // Find phase name for confirmation dialog
    let phaseName = 'this phase';
    Object.values(projectPhases).forEach(phases => {
      const phase = phases.find(p => p.id === phaseId);
      if (phase) phaseName = phase.name;
    });

    // Show confirmation dialog
    setDeletePhaseDialog({ open: true, phaseId, phaseName });
  };

  const confirmDeletePhase = async () => {
    const { phaseId, phaseName } = deletePhaseDialog;
    if (!phaseId) return;

    try {
      // Call API to delete phase
      await phasesApi.delete(phaseId);

      // Delete phase from local state
      setProjectPhases(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(projectId => {
          updated[projectId] = updated[projectId].filter(p => p.id !== phaseId);
        });
        return updated;
      });

      // Clear active phase if it was deleted
      if (activePhase === phaseId) {
        setActivePhase(null);
      }

      toast.success(`Phase "${phaseName}" deleted`);
    } catch (error) {
      console.error('Failed to delete phase:', error);
      toast.error('Failed to delete phase');
    } finally {
      setDeletePhaseDialog({ open: false, phaseId: null, phaseName: '' });
    }
  };

  const handleEditSpace = (spaceId: string) => toast.info('Edit space coming soon');
  const handleEditProject = (projectId: string) => toast.info('Edit project coming soon');
  const handleEditPhase = (spaceId: string, phaseId: string) => toast.info('Edit phase coming soon');

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

  // ============================================
  // GROUPING LOGIC
  // ============================================

  // Helper to get phase name from phaseID
  const getPhaseName = (phaseID: string | undefined): string => {
    if (!phaseID || !activeProject) return 'No Phase';
    const phases = projectPhases[activeProject] || [];
    const phase = phases.find(p => p.id === phaseID);
    return phase?.name || 'No Phase';
  };

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
          // Lookup phase name from phaseID instead of using task.phase string
          key = getPhaseName(task.phaseID);
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

  const groupedTasks = groupTasks();

  // ============================================
  // RENDER TASK ROW
  // ============================================

  const renderTaskRow = (task: WorkspaceTask, groupName: string, index: number) => {
    const isSelected = selectedTasks.has(task.id);
    const isHovered = hoveredTaskId === task.id;
    const statusOption = statusOptions.find(s => s.value === task.status);

    return (
      <DraggableTaskRow
        key={task.id}
        task={task}
        groupName={groupName}
        index={index}
        isSelected={isSelected}
        isHovered={isHovered}
        onReorder={handleReorderTasks}
        onMouseEnter={() => setHoveredTaskId(task.id)}
        onMouseLeave={() => setHoveredTaskId(null)}
      >
        {/* Checkbox */}
        <div className="w-8 shrink-0 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleTaskSelection(task.id)}
            className="w-4 h-4 rounded border-[#3d4457] bg-transparent text-[#0394ff] focus:ring-[#0394ff]"
          />
        </div>

        {/* Task Name */}
        <div
          className="flex-[2] min-w-[200px] cursor-pointer"
          onClick={() => handleTaskClick(task)}
        >
          {editingTaskId === task.id ? (
            <Input
              value={editingTaskName}
              onChange={(e) => setEditingTaskName(e.target.value)}
              onBlur={() => {
                // Save and exit edit mode
                setWorkspaceTasks(prev => prev.map(t =>
                  t.id === task.id ? { ...t, name: editingTaskName } : t
                ));
                setEditingTaskId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setWorkspaceTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, name: editingTaskName } : t
                  ));
                  setEditingTaskId(null);
                }
                if (e.key === 'Escape') {
                  setEditingTaskId(null);
                }
              }}
              className="h-7 bg-[#292d39] border-[#0394ff] text-white"
              autoFocus
            />
          ) : (
            <span
              className="text-white hover:text-[#0394ff] transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleTaskClick(task);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingTaskId(task.id);
                setEditingTaskName(task.name);
              }}
            >
              {task.name}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex-1 min-w-[100px]">
          <Popover open={statusPopoverOpen === task.id} onOpenChange={(open) => setStatusPopoverOpen(open ? task.id : null)}>
            <PopoverTrigger asChild>
              <button
                className={`px-2 py-1 rounded text-xs font-medium ${statusOption?.bgColor || 'bg-gray-500/10'}`}
                style={{ color: statusOption?.color }}
              >
                {statusOption?.label || task.status.toUpperCase()}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-2 bg-[#292d39] border-[#3d4457]">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(task.id, option.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#3d4457] transition-colors`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                  <span className="text-white text-sm">{option.label}</span>
                  {task.status === option.value && <Check className="w-4 h-4 text-[#0394ff] ml-auto" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Assignee */}
        <div className="flex-1 min-w-[120px]">
          <Popover open={assigneePopoverOpen === task.id} onOpenChange={(open) => setAssigneePopoverOpen(open ? task.id : null)}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-[#3d4457] px-2 py-1 rounded transition-colors">
                {task.assignee ? (
                  <>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: task.assignee.color }}
                    >
                      {task.assignee.initials}
                    </div>
                    <span className="text-[#838a9c] text-sm truncate">{task.assignee.name.split(' ')[0]}</span>
                  </>
                ) : (
                  <span className="text-[#838a9c] text-sm">Unassigned</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-2 bg-[#292d39] border-[#3d4457]">
              <button
                onClick={() => handleAssigneeChange(task.id, null)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#3d4457] transition-colors"
              >
                <X className="w-4 h-4 text-[#838a9c]" />
                <span className="text-[#838a9c] text-sm">Unassigned</span>
              </button>
              {availableUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleAssigneeChange(task.id, user)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#3d4457] transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.initials}
                  </div>
                  <span className="text-white text-sm">{user.name}</span>
                  {task.assignee?.id === user.id && <Check className="w-4 h-4 text-[#0394ff] ml-auto" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="flex-1 min-w-[90px]">
          <Popover open={datePopoverOpen === task.id} onOpenChange={(open) => setDatePopoverOpen(open ? task.id : null)}>
            <PopoverTrigger asChild>
              <button className="text-[#838a9c] text-sm hover:text-white transition-colors">
                {task.dueDate || 'No date'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]">
              <div className="p-2 border-b border-[#3d4457]">
                <div className="grid grid-cols-2 gap-1">
                  {['Today', 'Tomorrow', 'Next Week', '2 Weeks'].map(shortcut => (
                    <Button
                      key={shortcut}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
                      onClick={() => {
                        const date = new Date();
                        if (shortcut === 'Tomorrow') date.setDate(date.getDate() + 1);
                        if (shortcut === 'Next Week') date.setDate(date.getDate() + 7);
                        if (shortcut === '2 Weeks') date.setDate(date.getDate() + 14);
                        handleDueDateChange(task.id, date);
                      }}
                    >
                      {shortcut}
                    </Button>
                  ))}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={(date) => handleDueDateChange(task.id, date)}
                className="bg-[#292d39]"
              />
              {task.dueDate && (
                <div className="p-2 border-t border-[#3d4457]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => handleDueDateChange(task.id, undefined)}
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Budget */}
        <div className="flex-1 min-w-[80px]">
          <Popover open={budgetPopoverOpen === task.id} onOpenChange={(open) => {
            setBudgetPopoverOpen(open ? task.id : null);
            if (open) setBudgetInputValue(task.budget > 0 ? task.budget.toString() : '');
          }}>
            <PopoverTrigger asChild>
              <button className="text-[#838a9c] text-sm hover:text-white transition-colors">
                {task.budget > 0 ? `$${task.budget.toLocaleString()}` : '-'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-3 bg-[#292d39] border-[#3d4457]">
              <div className="space-y-2">
                <label className="text-xs text-[#838a9c]">Budget Amount</label>
                <Input
                  type="number"
                  value={budgetInputValue}
                  onChange={(e) => setBudgetInputValue(e.target.value)}
                  placeholder="Enter budget"
                  className="bg-[#1e222d] border-[#3d4457] text-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#0394ff] hover:bg-[#0284e8]"
                    onClick={() => handleBudgetChange(task.id, parseFloat(budgetInputValue) || 0)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#838a9c]"
                    onClick={() => setBudgetPopoverOpen(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Budget Remaining */}
        <div className="flex-1 min-w-[100px]">
          <span className={`text-sm ${task.budgetRemaining < 0 ? 'text-red-400' : 'text-[#838a9c]'}`}>
            {task.budget > 0 ? `$${task.budgetRemaining.toLocaleString()}` : '-'}
          </span>
        </div>
      </DraggableTaskRow>
    );
  };

  // ============================================
  // RENDER LIST VIEW
  // ============================================

  const renderListView = () => (
    <div className="h-full w-full overflow-auto taskflow-scrollbar min-w-0">
      {/* Header */}
      <div className="flex items-center py-2 px-4 border-b border-[#3d4457] bg-[#1e222d] sticky top-0 z-10 w-full min-w-fit">
        <div className="w-8 shrink-0" /> {/* Drag handle space */}
        <div className="w-8 shrink-0 flex items-center">
          <input
            type="checkbox"
            checked={selectedTasks.size === workspaceTasks.length && workspaceTasks.length > 0}
            onChange={toggleAllTasks}
            className="w-4 h-4 rounded border-[#3d4457] bg-transparent"
          />
        </div>
        <div className="flex-[2] min-w-[200px] text-[#838a9c] text-sm font-medium">Task Name</div>
        <div className="flex-1 min-w-[100px] text-[#838a9c] text-sm font-medium">Status</div>
        <div className="flex-1 min-w-[120px] text-[#838a9c] text-sm font-medium">Assignee</div>
        <div className="flex-1 min-w-[90px] text-[#838a9c] text-sm font-medium">Due Date</div>
        <div className="flex-1 min-w-[80px] text-[#838a9c] text-sm font-medium">Budget</div>
        <div className="flex-1 min-w-[100px] text-[#838a9c] text-sm font-medium">Remaining</div>
      </div>

      {/* Task Groups */}
      {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
        <div key={groupKey} className="border-b border-[#3d4457]/50">
          {/* Group Header */}
          {groupBy !== 'none' && (
            <div
              className="flex items-center gap-2 px-4 py-2 bg-[#1e222d]/50 cursor-pointer hover:bg-[#292d39] transition-colors"
              onClick={() => toggleGroupCollapse(groupKey)}
            >
              {collapsedGroups.has(groupKey) ? (
                <ChevronRight className="w-4 h-4 text-[#838a9c]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#838a9c]" />
              )}
              <span className="text-white font-medium">{groupKey}</span>
              <span className="text-[#838a9c] text-sm">({tasks.length})</span>
            </div>
          )}

          {/* Tasks */}
          {!collapsedGroups.has(groupKey) && (
            <>
              {tasks.map((task, index) => renderTaskRow(task, groupKey, index))}

              {/* Add Task Row */}
              {addingTaskToGroup === groupKey ? (
                <div className="flex items-center py-2 px-4 border-b border-[#3d4457]/30 bg-[#292d39]/50">
                  <div className="w-8" />
                  <div className="w-8" />
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Task name..."
                      className="h-7 bg-[#1e222d] border-[#3d4457] text-white flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(groupKey);
                        if (e.key === 'Escape') {
                          setAddingTaskToGroup(null);
                          setNewTaskName('');
                        }
                      }}
                    />
                    <Button size="sm" className="h-7 bg-[#0394ff]" onClick={() => handleAddTask(groupKey)}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[#838a9c]"
                      onClick={() => {
                        setAddingTaskToGroup(null);
                        setNewTaskName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTaskToGroup(groupKey)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-[#838a9c] hover:text-[#0394ff] hover:bg-[#292d39]/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add task</span>
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {/* Empty State */}
      {workspaceTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#838a9c]">
          <p className="text-lg mb-2">No tasks yet</p>
          <p className="text-sm">Select a project to view tasks</p>
        </div>
      )}
    </div>
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-screen flex flex-col bg-[#181c28]">
        {/* Sidebar + Main Content */}
        <div className="flex-1 w-full flex overflow-hidden min-w-0">
          {/* Left Sidebar */}
          <WorkspaceSidebar
            spaces={spaces}
            projects={projects}
            activeSpace={activeSpace}
            activeProject={activeProject}
            activePhase={activePhase}
            expandedSpaces={expandedSpaces}
            expandedProjects={expandedProjects}
            sidebarCollapsed={sidebarCollapsed}
            currentUser={currentUser}
            projectPhases={projectPhases}
            projectTasks={projectTasks}
            onSpaceClick={handleSpaceClick}
            onProjectClick={handleProjectClick}
            onPhaseClick={handlePhaseClick}
            onToggleSpace={toggleSpace}
            onToggleProject={toggleProject}
            onToggleSidebar={toggleSidebar}
            onNavigateHome={onBack}
            onCreateSpace={() => setShowCreateSpaceDialog(true)}
            onCreateProject={(spaceId) => {
              setSelectedSpaceForProject(spaceId);
              setShowCreateProjectDialog(true);
            }}
            onCreatePhase={(projectId) => {
              setSelectedProjectForPhase(projectId);
              setShowCreatePhaseDialog(true);
            }}
            onEditSpace={handleEditSpace}
            onDeleteSpace={handleDeleteSpace}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onEditPhase={handleEditPhase}
            onDeletePhase={handleDeletePhase}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
            {/* Toolbar */}
            <WorkspaceToolbar
              currentView={currentView}
              groupBy={groupBy}
              searchQuery={searchQuery}
              availableViews={availableViews}
              visibleViewIds={visibleViewIds}
              onViewChange={setCurrentView}
              onGroupByChange={setGroupBy}
              onSearchChange={setSearchQuery}
              onAddTask={() => setShowNewTaskDialog(true)}
              onManageViews={() => {}}
              onBack={onBack || (() => {})}
            />

            {/* Content Area - Different Views */}
            <div className="flex-1 overflow-hidden bg-[#181c28] w-full min-w-0">
              {currentView === 'list' && renderListView()}

              {currentView === 'board' && (
                <KanbanBoard
                  tasks={workspaceTasks}
                  onTaskClick={handleTaskClick}
                />
              )}

              {currentView === 'gantt' && (
                <GanttChart
                  tasks={workspaceTasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    startDate: task.startDate ? new Date(task.startDate) : new Date(),
                    endDate: task.endDate ? new Date(task.endDate) : new Date(),
                    progress: task.status === 'done' ? 100 : 50,
                    color: '#0394ff',
                    type: 'task' as const
                  }))}
                  onTaskReorder={() => {}}
                  onTaskDateChange={() => {}}
                />
              )}

              {currentView === 'mindmap' && (
                <MindMapView
                  tasks={workspaceTasks}
                  onTaskClick={handleTaskClick}
                />
              )}

              {(currentView === 'calendar' || currentView === 'workload') && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">
                    {currentView === 'calendar' ? 'Calendar' : 'Workload'} view coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
          <DialogContent className="bg-[#292d39] border-[#3a3f4f] text-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
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

        <TaskDetailDialog
          task={selectedTaskForDetail}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onTaskUpdate={handleTaskDetailUpdate}
        />

        {showNewTaskDialog && (
          <NewTaskDialog
            currentUser={currentUser}
            onTaskCreated={(newTask) => {
              // Reload tasks for the current project
              if (activeProject) {
                loadTasksForProject(activeProject);
              }
              setShowNewTaskDialog(false);
            }}
            onCancel={() => setShowNewTaskDialog(false)}
            projectId={activeProject || undefined}
            defaultPhase={activePhase || undefined}
          />
        )}

        {/* Add Phase Dialog */}
        <AddPhaseDialog
          open={showCreatePhaseDialog}
          onOpenChange={(open) => {
            setShowCreatePhaseDialog(open);
            if (!open) {
              setSelectedProjectForPhase(null);
            }
          }}
          projectId={selectedProjectForPhase || ''}
          onPhaseCreated={(newPhase) => {
            // Add new phase to local state
            if (selectedProjectForPhase) {
              const convertedPhase: Phase = {
                id: newPhase.phaseID || newPhase.id,
                name: newPhase.name,
                color: newPhase.color || '#3B82F6',
                taskCount: 0,
                completedCount: 0,
              };
              setProjectPhases(prev => ({
                ...prev,
                [selectedProjectForPhase]: [...(prev[selectedProjectForPhase] || []), convertedPhase]
              }));
            }
          }}
        />

        {/* Delete Phase Confirmation Dialog */}
        <AlertDialog open={deletePhaseDialog.open} onOpenChange={(open) => {
          if (!open) setDeletePhaseDialog({ open: false, phaseId: null, phaseName: '' });
        }}>
          <AlertDialogContent className="bg-[#292d39] border-[#3d4457]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Phase</AlertDialogTitle>
              <AlertDialogDescription className="text-[#838a9c]">
                Are you sure you want to delete "{deletePhaseDialog.phaseName}"? This action cannot be undone.
                Tasks in this phase will not be deleted but will no longer be assigned to any phase.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#3d4457] text-[#e1e4e8] hover:bg-[#3d4457] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePhase}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndProvider>
  );
}
