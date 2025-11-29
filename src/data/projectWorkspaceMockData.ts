// Mock data for Project Workspace
// This ensures the workspace always has sample data to work with

// Import mockData to get categories and projects
import { mockData } from './mockData';

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

export interface WorkspaceTask {
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
  comments: number;
  phase: string;
  subtasks?: WorkspaceTask[];
  description?: string;
  actionItems?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

export const workspaceUsers = [
  { id: 'user-1', name: 'John Doe', initials: 'JD', color: '#0ea5e9', avatar: '' },
  { id: 'user-2', name: 'Jane Smith', initials: 'JS', color: '#8b5cf6', avatar: '' },
  { id: 'user-3', name: 'Mike Johnson', initials: 'MJ', color: '#ec4899', avatar: '' },
  { id: 'user-4', name: 'Sarah Williams', initials: 'SW', color: '#f59e0b', avatar: '' },
  { id: 'user-5', name: 'David Brown', initials: 'DB', color: '#10b981', avatar: '' },
  { id: 'user-6', name: 'Emily Davis', initials: 'ED', color: '#ef4444', avatar: '' },
  { id: 'user-7', name: 'Chris Wilson', initials: 'CW', color: '#06b6d4', avatar: '' },
  { id: 'user-8', name: 'Lisa Anderson', initials: 'LA', color: '#6366f1', avatar: '' },
];

// ============================================
// DYNAMIC SPACES FROM CATEGORIES
// ============================================

// Convert categories to spaces dynamically
const convertCategoriesToSpaces = (): Space[] => {
  const categories = mockData.categories;
  
  // Get all projects from localStorage or fallback to mockData
  const projectsJson = localStorage.getItem('taskflow_projects');
  const projects = projectsJson ? JSON.parse(projectsJson) : mockData.projects;
  
  // Create a space for each category
  return categories.map(category => {
    // Find all projects belonging to this category
    const categoryProjects = projects.filter((p: any) => p.category === category.name);
    const projectIds = categoryProjects.map((p: any) => p.id);
    
    return {
      id: `space-cat-${category.id}`,
      name: category.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      color: category.color,
      projectIds: projectIds,
      phases: []
    };
  });
};

// Default spaces - dynamically generated from categories
export const defaultSpaces: Space[] = convertCategoriesToSpaces();

// Default project phases - will be created when a project is added
export const defaultProjectPhases: Record<string, Phase[]> = {
  'default': [
    { id: 'phase-1', name: 'Phase 1 - Strategy', color: '#0394ff', taskCount: 3 },
    { id: 'phase-2', name: 'Phase 2 - Design', color: '#7c66d9', taskCount: 5 },
    { id: 'phase-3', name: 'Phase 3 - Development', color: '#ff6b6b', taskCount: 5 },
    { id: 'phase-4', name: 'Phase 4 - Execution', color: '#51cf66', taskCount: 5 }
  ]
};

// Sample tasks for a project - Template to use when creating new projects
export const sampleProjectTasks: WorkspaceTask[] = [
  // Phase 1 - Strategy
  {
    id: 'task-sample-1',
    name: 'Win contract with an excellent proposal',
    assignee: null,
    dueDate: '2/16/20',
    startDate: new Date('2020-02-01').toISOString(),
    endDate: new Date('2020-02-16').toISOString(),
    status: 'ready',
    budget: 20000,
    sprint: '20000',
    budgetRemaining: 5000,
    comments: 4,
    phase: 'Phase 1 - Strategy',
    subtasks: []
  },
  {
    id: 'task-sample-2',
    name: 'Hire brilliant engineers',
    assignee: null,
    dueDate: '3/6/20',
    startDate: new Date('2020-02-17').toISOString(),
    endDate: new Date('2020-03-06').toISOString(),
    status: 'ready',
    budget: 200000,
    sprint: '200000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 1 - Strategy',
    subtasks: []
  },
  {
    id: 'task-sample-3',
    name: 'Research to crush the competition',
    assignee: null,
    dueDate: '2/5/20',
    startDate: new Date('2020-01-15').toISOString(),
    endDate: new Date('2020-02-05').toISOString(),
    status: 'ready',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 1000,
    comments: 0,
    phase: 'Phase 1 - Strategy',
    subtasks: []
  },
  // Phase 2 - Design
  {
    id: 'task-sample-4',
    name: 'Plan the build',
    assignee: null,
    dueDate: '2/24/20',
    startDate: new Date('2020-02-10').toISOString(),
    endDate: new Date('2020-02-24').toISOString(),
    status: 'ready',
    budget: 300,
    sprint: '300',
    budgetRemaining: 300,
    comments: 0,
    phase: 'Phase 2 - Design',
    subtasks: []
  },
  {
    id: 'task-sample-5',
    name: 'Brainstorming meetings',
    assignee: null,
    dueDate: '',
    startDate: new Date('2020-02-01').toISOString(),
    endDate: new Date('2020-02-28').toISOString(),
    status: 'ready',
    budget: 0,
    sprint: '0',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 2 - Design',
    subtasks: []
  },
  {
    id: 'task-sample-6',
    name: 'Write a knowledge base',
    assignee: null,
    dueDate: '3/25/20',
    startDate: new Date('2020-03-01').toISOString(),
    endDate: new Date('2020-03-25').toISOString(),
    status: 'in-progress',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 1000,
    comments: 0,
    phase: 'Phase 2 - Design',
    subtasks: []
  },
  {
    id: 'task-sample-7',
    name: 'Detail the product blueprint',
    assignee: null,
    dueDate: '4/16/20',
    startDate: new Date('2020-03-15').toISOString(),
    endDate: new Date('2020-04-16').toISOString(),
    status: 'in-progress',
    budget: 250000,
    sprint: '250000',
    budgetRemaining: 125000,
    comments: 0,
    phase: 'Phase 2 - Design',
    subtasks: []
  },
  {
    id: 'task-sample-8',
    name: 'Mockup',
    assignee: null,
    dueDate: '4/29/20',
    startDate: new Date('2020-04-10').toISOString(),
    endDate: new Date('2020-04-29').toISOString(),
    status: 'todo',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 2 - Design',
    subtasks: []
  },
  // Phase 3 - Development
  {
    id: 'task-sample-9',
    name: 'MVP',
    assignee: null,
    dueDate: '6/5/20',
    startDate: new Date('2020-05-01').toISOString(),
    endDate: new Date('2020-06-05').toISOString(),
    status: 'todo',
    budget: 25000,
    sprint: '25000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 3 - Development',
    subtasks: []
  },
  {
    id: 'task-sample-10',
    name: 'Organize teams and delegate tasks',
    assignee: null,
    dueDate: '5/6/20',
    startDate: new Date('2020-04-20').toISOString(),
    endDate: new Date('2020-05-06').toISOString(),
    status: 'todo',
    budget: 0,
    sprint: '0',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 3 - Development',
    subtasks: []
  },
  {
    id: 'task-sample-11',
    name: 'Product meetings',
    assignee: null,
    dueDate: '',
    startDate: new Date('2020-05-01').toISOString(),
    endDate: new Date('2020-07-31').toISOString(),
    status: 'todo',
    budget: 0,
    sprint: '0',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 3 - Development',
    subtasks: []
  },
  {
    id: 'task-sample-12',
    name: 'Build functioning prototype',
    assignee: null,
    dueDate: '7/7/20',
    startDate: new Date('2020-06-10').toISOString(),
    endDate: new Date('2020-07-07').toISOString(),
    status: 'todo',
    budget: 20000,
    sprint: '20000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 3 - Development',
    subtasks: []
  },
  {
    id: 'task-sample-13',
    name: 'Quality testing',
    assignee: null,
    dueDate: '7/10/20',
    startDate: new Date('2020-07-01').toISOString(),
    endDate: new Date('2020-07-10').toISOString(),
    status: 'todo',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 3 - Development',
    subtasks: []
  },
  // Phase 4 - Execution
  {
    id: 'task-sample-14',
    name: 'Showcase the product',
    assignee: null,
    dueDate: '7/22/20',
    startDate: new Date('2020-07-15').toISOString(),
    endDate: new Date('2020-07-22').toISOString(),
    status: 'todo',
    budget: 2000,
    sprint: '2000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  },
  {
    id: 'task-sample-15',
    name: 'Acquire funding for scaling',
    assignee: null,
    dueDate: '8/6/20',
    startDate: new Date('2020-07-25').toISOString(),
    endDate: new Date('2020-08-06').toISOString(),
    status: 'ready',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 0,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  },
  {
    id: 'task-sample-16',
    name: 'Hire a support team',
    assignee: null,
    dueDate: '8/25/20',
    startDate: new Date('2020-08-01').toISOString(),
    endDate: new Date('2020-08-25').toISOString(),
    status: 'todo',
    budget: 80000,
    sprint: '80000',
    budgetRemaining: 80000,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  },
  {
    id: 'task-sample-17',
    name: 'Scale marketing',
    assignee: null,
    dueDate: '10/5/20',
    startDate: new Date('2020-09-01').toISOString(),
    endDate: new Date('2020-10-05').toISOString(),
    status: 'todo',
    budget: 100000,
    sprint: '100000',
    budgetRemaining: 100000,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  },
  {
    id: 'task-sample-18',
    name: 'Build a sales team',
    assignee: null,
    dueDate: '9/26/20',
    startDate: new Date('2020-09-01').toISOString(),
    endDate: new Date('2020-09-26').toISOString(),
    status: 'todo',
    budget: 10000,
    sprint: '10000',
    budgetRemaining: 10000,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  },
  {
    id: 'task-sample-19',
    name: 'Reach $1 billion valuation',
    assignee: null,
    dueDate: '12/6/20',
    startDate: new Date('2020-10-01').toISOString(),
    endDate: new Date('2020-12-06').toISOString(),
    status: 'todo',
    budget: 1000,
    sprint: '1000',
    budgetRemaining: 1000,
    comments: 0,
    phase: 'Phase 4 - Execution',
    subtasks: []
  }
];

// Helper function to generate unique task IDs
export const generateTaskId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to generate unique phase IDs
export const generatePhaseId = () => `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to create sample tasks with unique IDs
export const createSampleTasks = (projectId: string): WorkspaceTask[] => {
  return sampleProjectTasks.map(task => ({
    ...task,
    id: generateTaskId()
  }));
};

// Helper function to create default phases with unique IDs
export const createDefaultPhases = (): Phase[] => {
  return defaultProjectPhases.default.map(phase => ({
    ...phase,
    id: generatePhaseId()
  }));
};

// Initialize workspace with default data if empty
export const initializeWorkspaceData = () => {
  const savedSpaces = localStorage.getItem('taskflow_spaces');
  const savedProjectPhases = localStorage.getItem('taskflow_project_phases');
  const savedProjectTasks = localStorage.getItem('taskflow_project_tasks');

  // Only initialize if completely missing
  if (!savedSpaces || !savedProjectPhases || !savedProjectTasks) {
    console.log('🚀 Initializing workspace with default data...');
    
    // NOTE: The actual project creation is handled in ProjectWorkspace.tsx
    // This just ensures localStorage keys exist
    
    if (!savedSpaces) {
      localStorage.setItem('taskflow_spaces', JSON.stringify(defaultSpaces));
    }
    
    if (!savedProjectPhases) {
      localStorage.setItem('taskflow_project_phases', JSON.stringify({}));
    }
    
    if (!savedProjectTasks) {
      localStorage.setItem('taskflow_project_tasks', JSON.stringify({}));
    }
  }
};

// Get or create sample project data
export const getOrCreateSampleProject = () => {
  const projectId = `project-mgmt-${Date.now()}`;
  const phases = createDefaultPhases();
  const tasks = createSampleTasks(projectId);

  return {
    projectId,
    phases,
    tasks
  };
};

// ============================================
// Space Management System with localStorage
// ============================================

const SPACES_STORAGE_KEY = 'taskflow_spaces';

// Initialize spaces from localStorage or use defaults
const initializeSpacesStore = (): Space[] => {
  const savedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
  if (savedSpaces) {
    try {
      const parsed = JSON.parse(savedSpaces);
      
      // Check if spaces are old hardcoded ones (don't have space-cat- prefix)
      const hasOldSpaces = parsed.some((s: Space) => !s.id.startsWith('space-cat-'));
      
      if (hasOldSpaces) {
        console.log('🔄 Detected old space structure, migrating to category-based spaces...');
        // Clear and regenerate from categories
        const dynamicSpaces = convertCategoriesToSpaces();
        localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(dynamicSpaces));
        return dynamicSpaces;
      }
      
      // Spaces are already category-based, return them
      return parsed;
    } catch (e) {
      console.error('Failed to parse saved spaces:', e);
    }
  }
  
  // If no saved spaces, generate from categories
  const dynamicSpaces = convertCategoriesToSpaces();
  console.log('🚀 Initialized spaces from categories:', dynamicSpaces);
  return dynamicSpaces;
};

// In-memory storage for spaces (synced with localStorage)
let spacesStore: Space[] = initializeSpacesStore();

// Helper to persist spaces to localStorage
const persistSpaces = (): void => {
  try {
    localStorage.setItem(SPACES_STORAGE_KEY, JSON.stringify(spacesStore));
  } catch (e) {
    console.error('Failed to save spaces to localStorage:', e);
  }
};

// Space Management API
export const spacesApi = {
  // Get all spaces
  getSpaces: (): Space[] => {
    return [...spacesStore];
  },

  // Get a single space by ID
  getSpace: (spaceId: string): Space | undefined => {
    return spacesStore.find(s => s.id === spaceId);
  },

  // Create a new space
  createSpace: (space: Omit<Space, 'id'>): Space => {
    const newSpace: Space = {
      ...space,
      id: `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    spacesStore.push(newSpace);
    persistSpaces();
    return newSpace;
  },

  // Update a space
  updateSpace: (spaceId: string, updates: Partial<Space>): Space | null => {
    const index = spacesStore.findIndex(s => s.id === spaceId);
    if (index === -1) return null;
    
    spacesStore[index] = { ...spacesStore[index], ...updates };
    persistSpaces();
    return spacesStore[index];
  },

  // Delete a space
  deleteSpace: (spaceId: string): boolean => {
    const initialLength = spacesStore.length;
    spacesStore = spacesStore.filter(s => s.id !== spaceId);
    if (spacesStore.length < initialLength) {
      persistSpaces();
      return true;
    }
    return false;
  },

  // Add project to space
  addProjectToSpace: (spaceId: string, projectId: string): Space | null => {
    const space = spacesStore.find(s => s.id === spaceId);
    if (!space) return null;
    
    if (!space.projectIds.includes(projectId)) {
      space.projectIds.push(projectId);
      persistSpaces();
    }
    return space;
  },

  // Remove project from space
  removeProjectFromSpace: (spaceId: string, projectId: string): Space | null => {
    const space = spacesStore.find(s => s.id === spaceId);
    if (!space) return null;
    
    space.projectIds = space.projectIds.filter(id => id !== projectId);
    persistSpaces();
    return space;
  },

  // Add phase to space
  addPhaseToSpace: (spaceId: string, phase: Phase): Space | null => {
    const space = spacesStore.find(s => s.id === spaceId);
    if (!space) return null;
    
    if (!space.phases) {
      space.phases = [];
    }
    space.phases.push(phase);
    persistSpaces();
    return space;
  },

  // Update phase in space
  updatePhaseInSpace: (spaceId: string, phaseId: string, updates: Partial<Phase>): Space | null => {
    const space = spacesStore.find(s => s.id === spaceId);
    if (!space || !space.phases) return null;
    
    const phaseIndex = space.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) return null;
    
    space.phases[phaseIndex] = { ...space.phases[phaseIndex], ...updates };
    persistSpaces();
    return space;
  },

  // Delete phase from space
  deletePhaseFromSpace: (spaceId: string, phaseId: string): Space | null => {
    const space = spacesStore.find(s => s.id === spaceId);
    if (!space || !space.phases) return null;
    
    space.phases = space.phases.filter(p => p.id !== phaseId);
    persistSpaces();
    return space;
  },

  // Reset spaces to default (useful for testing)
  resetSpaces: (): void => {
    spacesStore = [...defaultSpaces];
    persistSpaces();
  },

  // Reload spaces from localStorage (useful after external updates)
  reloadSpaces: (): void => {
    spacesStore = initializeSpacesStore();
  },

  // Get all project IDs across all spaces
  getAllProjectIds: (): string[] => {
    const projectIds = new Set<string>();
    spacesStore.forEach(space => {
      space.projectIds.forEach(id => projectIds.add(id));
    });
    return Array.from(projectIds);
  },

  // Reset and reload spaces from categories
  reloadFromCategories: (): Space[] => {
    console.log('🔄 Reloading spaces from categories...');
    spacesStore = convertCategoriesToSpaces();
    persistSpaces();
    return [...spacesStore];
  },

  // Sync projects with spaces based on category
  syncProjectsWithSpaces: (): void => {
    const projectsJson = localStorage.getItem('taskflow_projects');
    if (!projectsJson) return;
    
    const projects = JSON.parse(projectsJson);
    const categories = mockData.categories;
    
    // For each category, ensure we have a space
    categories.forEach(category => {
      const spaceId = `space-cat-${category.id}`;
      let space = spacesStore.find(s => s.id === spaceId);
      
      if (!space) {
        // Create space for this category
        space = {
          id: spaceId,
          name: category.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          color: category.color,
          projectIds: [],
          phases: []
        };
        spacesStore.push(space);
      }
      
      // Find all projects for this category
      const categoryProjects = projects.filter((p: any) => p.category === category.name);
      const projectIds = categoryProjects.map((p: any) => p.id);
      
      // Update space with project IDs (avoid duplicates)
      const existingIds = new Set(space.projectIds);
      projectIds.forEach((id: string) => existingIds.add(id));
      space.projectIds = Array.from(existingIds);
    });
    
    persistSpaces();
    console.log('✅ Projects synced with spaces by category');
  }
};
