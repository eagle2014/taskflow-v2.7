import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { WorkspaceSidebar } from './workspace/WorkspaceSidebar';
import { WorkspaceToolbar } from './workspace/WorkspaceToolbar';
import { WorkspaceListView } from './workspace/WorkspaceListView';
import { GanttChart } from './GanttChart';
import { MindMapView } from './MindMapView';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { NewProjectForm } from './NewProjectForm';
import { 
  List, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Users, 
  Network 
} from 'lucide-react';
import { 
  spacesApi,
  type Space, 
  type Phase, 
  type WorkspaceTask 
} from '../data/projectWorkspaceMockData';
import { projectsApi, type Project, tasksApi } from '../utils/mockApi';
import { mockData } from '../data/mockData';

export function ProjectWorkspace() {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Filters and search
  const [groupBy, setGroupBy] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showCreatePhaseDialog, setShowCreatePhaseDialog] = useState(false);
  const [selectedSpaceForProject, setSelectedSpaceForProject] = useState<string | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<WorkspaceTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  
  // Column configuration
  const [columns, setColumns] = useState([
    { id: 'status', name: 'Status', visible: true, formula: null },
    { id: 'assignee', name: 'Assignee', visible: true, formula: null },
    { id: 'dueDate', name: 'Due Date', visible: true, formula: null },
    { id: 'budget', name: 'Budget', visible: true, formula: null },
    { id: 'budgetRemaining', name: 'Budget Remaining', visible: true, formula: 'field("budget") - field("spent")' },
  ]);

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
  
  useEffect(() => {
    // Load projects first
    const loadProjects = async () => {
      try {
        const projectsData = await projectsApi.getProjects();
        setProjects(projectsData);
        
        // Sync projects with spaces based on categories
        console.log('🔄 Syncing projects with category-based spaces...');
        spacesApi.syncProjectsWithSpaces();
        
        // Load spaces after sync
        const loadedSpaces = spacesApi.getSpaces();
        setSpaces(loadedSpaces);
        
        console.log(`✅ Loaded ${loadedSpaces.length} spaces from categories`);
        console.log(`✅ Loaded ${projectsData.length} projects`);
        
        // Set first project as active if none selected
        if (!activeProject && projectsData.length > 0) {
          setActiveProject(projectsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
      }
    };
    loadProjects();
  }, []);

  // Load tasks when active project changes
  useEffect(() => {
    if (activeProject && projectTasks[activeProject]) {
      const tasksForProject = projectTasks[activeProject];
      
      if (activePhase) {
        const filtered = tasksForProject.filter(task => task.phase === activePhase);
        setWorkspaceTasks(filtered);
      } else {
        setWorkspaceTasks(tasksForProject);
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

  const handleProjectClick = (projectId: string, spaceId?: string) => {
    setActiveProject(projectId);
    if (spaceId) setActiveSpace(spaceId);
    setActivePhase(null);
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

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await projectsApi.createProject(projectData);
      setProjects([...projects, newProject]);
      
      if (selectedSpaceForProject) {
        const updatedSpace = spacesApi.addProjectToSpace(selectedSpaceForProject, newProject.id);
        if (updatedSpace) {
          setSpaces(spacesApi.getSpaces());
          // Auto-expand the space to show the new project
          setExpandedSpaces(prev => new Set(prev).add(selectedSpaceForProject));
          // Set the new project as active
          setActiveProject(newProject.id);
          setActiveSpace(selectedSpaceForProject);
          toast.success(`Project "${newProject.name}" created and added to space`);
        }
      } else {
        // Add to first space if no space selected
        const firstSpace = spaces[0];
        if (firstSpace) {
          spacesApi.addProjectToSpace(firstSpace.id, newProject.id);
          setSpaces(spacesApi.getSpaces());
          setExpandedSpaces(prev => new Set(prev).add(firstSpace.id));
          setActiveProject(newProject.id);
          setActiveSpace(firstSpace.id);
        }
        toast.success(`Project "${newProject.name}" created successfully`);
      }
      
      setShowCreateProjectDialog(false);
      setSelectedSpaceForProject(null);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleTaskClick = (task: WorkspaceTask) => {
    setSelectedTaskForDetail(task);
    setTaskDetailOpen(true);
  };

  const handleStatusChange = (taskId: string, status: string) => {
    setWorkspaceTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: status as any } : task
      )
    );
    toast.success('Status updated');
  };

  const handleAssigneeChange = (taskId: string, userId: string | null) => {
    // Implementation for assignee change
    toast.success('Assignee updated');
  };

  const handleDueDateChange = (taskId: string, date: Date | undefined) => {
    // Implementation for due date change
    toast.success('Due date updated');
  };

  const handleReorderTasks = async (reorderedTasks: WorkspaceTask[]) => {
    if (!activeProject) return;

    try {
      // Update local state immediately
      setWorkspaceTasks(reorderedTasks);
      setProjectTasks(prev => ({
        ...prev,
        [activeProject]: reorderedTasks
      }));

      // Persist to backend via API
      const updates = reorderedTasks.map((task, index) => ({
        taskId: task.id,
        order: index
      }));

      await Promise.all(
        updates.map(({ taskId, order }) =>
          tasksApi.update(taskId, { order })
        )
      );

      toast.success('Task order updated');
    } catch (error) {
      console.error('Failed to update task order:', error);
      toast.error('Failed to update task order');
    }
  };

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

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      const space = spaces.find(s => s.id === spaceId);
      if (!space) return;
      
      // Check if space has projects
      if (space.projectIds && space.projectIds.length > 0) {
        toast.error('Cannot delete space with projects. Please remove all projects first.');
        return;
      }
      
      const success = spacesApi.deleteSpace(spaceId);
      if (success) {
        setSpaces(spacesApi.getSpaces());
        toast.success(`Space "${space.name}" deleted successfully`);
        
        // Clear active selections if they match
        if (activeSpace === spaceId) {
          setActiveSpace(null);
        }
      } else {
        toast.error('Failed to delete space');
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Delete the project
      await projectsApi.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      
      // Remove project from all spaces
      spaces.forEach(space => {
        if (space.projectIds.includes(projectId)) {
          spacesApi.removeProjectFromSpace(space.id, projectId);
        }
      });
      
      // Refresh spaces
      setSpaces(spacesApi.getSpaces());
      
      toast.success(`Project "${project.name}" deleted successfully`);
      
      // Clear active selections if they match
      if (activeProject === projectId) {
        setActiveProject(null);
        setActivePhase(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleDeletePhase = async (spaceId: string, phaseId: string) => {
    try {
      const space = spaces.find(s => s.id === spaceId);
      if (!space) return;
      
      const phase = space.phases?.find(p => p.id === phaseId);
      if (!phase) return;
      
      const updatedSpace = spacesApi.deletePhaseFromSpace(spaceId, phaseId);
      if (updatedSpace) {
        setSpaces(spacesApi.getSpaces());
        toast.success(`Phase "${phase.name}" deleted successfully`);
        
        // Clear active phase if it matches
        if (activePhase === phase.name) {
          setActivePhase(null);
        }
      } else {
        toast.error('Failed to delete phase');
      }
    } catch (error) {
      console.error('Error deleting phase:', error);
      toast.error('Failed to delete phase');
    }
  };

  const handleEditSpace = (spaceId: string) => {
    // TODO: Implement edit space dialog
    toast.info('Edit space feature coming soon');
  };

  const handleEditProject = (projectId: string) => {
    // TODO: Implement edit project dialog
    toast.info('Edit project feature coming soon');
  };

  const handleEditPhase = (spaceId: string, phaseId: string) => {
    // TODO: Implement edit phase dialog
    toast.info('Edit phase feature coming soon');
  };

  // ============================================
  // GROUPING LOGIC
  // ============================================
  
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

  const groupedTasks = groupTasks();

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-[#181c28]">
        {/* Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
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
            onSpaceClick={handleSpaceClick}
            onProjectClick={handleProjectClick}
            onPhaseClick={handlePhaseClick}
            onToggleSpace={toggleSpace}
            onToggleProject={toggleProject}
            onToggleSidebar={toggleSidebar}
            onCreateSpace={() => setShowCreateSpaceDialog(true)}
            onCreateProject={(spaceId) => {
              setSelectedSpaceForProject(spaceId);
              setShowCreateProjectDialog(true);
            }}
            onCreatePhase={(spaceId) => {
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
          <div className="flex-1 flex flex-col overflow-hidden">
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
              onAddTask={() => {}}
              onManageViews={() => {}}
            />

            {/* Content Area - Different Views */}
            <div className="flex-1 overflow-hidden bg-[#181c28]">
              {currentView === 'list' && (
                <WorkspaceListView
                  tasks={workspaceTasks}
                  groupedTasks={groupedTasks}
                  groupBy={groupBy}
                  selectedTasks={selectedTasks}
                  collapsedGroups={collapsedGroups}
                  columns={columns}
                  onToggleTask={toggleTaskSelection}
                  onToggleAll={toggleAllTasks}
                  onToggleGroup={toggleGroupCollapse}
                  onTaskClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                  onAssigneeChange={handleAssigneeChange}
                  onDueDateChange={handleDueDateChange}
                  onSubtaskToggle={(taskId) => {}}
                  onReorderTasks={handleReorderTasks}
                />
              )}

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
        />
      </div>
    </DndProvider>
  );
}
