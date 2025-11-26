// Custom hook for workspace state management
import { useState, useCallback } from 'react';
import { WorkspaceTask, Phase, Space, CustomColumn, ViewType, DialogState, FormulaState } from '../types';
import { DEFAULT_VIEWS } from '../constants';

export const useWorkspaceState = () => {
  // Active selections
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [projectPhases, setProjectPhases] = useState<Record<string, Phase[]>>({});
  const [projectTasks, setProjectTasks] = useState<Record<string, WorkspaceTask[]>>({});
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  
  // UI state
  const [visibleViewIds, setVisibleViewIds] = useState<string[]>(
    DEFAULT_VIEWS.filter(v => v.isVisible).map(v => v.id)
  );
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Dialog states
  const [dialogs, setDialogs] = useState<DialogState>({
    showFormulas: false,
    showAddPhase: false,
    showEditSpace: false,
    showAddSpace: false,
    showAddTask: false,
    showEditTask: false,
    showTaskDetail: false,
  });
  
  // Formula state
  const [formulaState, setFormulaState] = useState<FormulaState>({
    selectedColumn: null,
    formulaMode: 'basic',
    basicFormula: {
      left: '',
      operator: '+',
      right: ''
    },
    advancedFormula: '',
    searchQuery: ''
  });
  
  // Edit state
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  
  // Dialog helpers
  const openDialog = useCallback((dialogName: keyof DialogState) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
  }, []);
  
  const closeDialog = useCallback((dialogName: keyof DialogState) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  }, []);
  
  const closeAllDialogs = useCallback(() => {
    setDialogs({
      showFormulas: false,
      showAddPhase: false,
      showEditSpace: false,
      showAddSpace: false,
      showAddTask: false,
      showEditTask: false,
      showTaskDetail: false,
    });
  }, []);
  
  // Task selection
  const selectTask = useCallback((taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      openDialog('showTaskDetail');
    }
  }, [openDialog]);
  
  return {
    // State
    activeSpace,
    activeProject,
    activePhase,
    currentView,
    isSidebarCollapsed,
    spaces,
    projectPhases,
    projectTasks,
    workspaceTasks,
    visibleViewIds,
    customColumns,
    selectedTaskId,
    dialogs,
    formulaState,
    editingSpace,
    editingTask,
    
    // Setters
    setActiveSpace,
    setActiveProject,
    setActivePhase,
    setCurrentView,
    setIsSidebarCollapsed,
    setSpaces,
    setProjectPhases,
    setProjectTasks,
    setWorkspaceTasks,
    setVisibleViewIds,
    setCustomColumns,
    setSelectedTaskId,
    setFormulaState,
    setEditingSpace,
    setEditingTask,
    
    // Dialog helpers
    openDialog,
    closeDialog,
    closeAllDialogs,
    selectTask,
  };
};
