// Spaces Service - Manages spaces with localStorage persistence
import type { Space, Phase } from '../types/workspace';

const SPACES_STORAGE_KEY = 'taskflow_spaces';

// Get default spaces (empty array - spaces will be created when projects are added)
const getDefaultSpaces = (): Space[] => [];

// Initialize spaces from localStorage
const initializeSpacesStore = (): Space[] => {
  const savedSpaces = localStorage.getItem(SPACES_STORAGE_KEY);
  if (savedSpaces) {
    try {
      return JSON.parse(savedSpaces);
    } catch (e) {
      console.error('Failed to parse saved spaces:', e);
    }
  }
  return getDefaultSpaces();
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

  // Reset spaces to empty
  resetSpaces: (): void => {
    spacesStore = [];
    persistSpaces();
  },

  // Reload spaces from localStorage
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
  }
};

// Initialize workspace data
export const initializeWorkspaceData = () => {
  const savedSpaces = localStorage.getItem('taskflow_spaces');
  const savedProjectPhases = localStorage.getItem('taskflow_project_phases');
  const savedProjectTasks = localStorage.getItem('taskflow_project_tasks');

  if (!savedSpaces) {
    localStorage.setItem('taskflow_spaces', JSON.stringify([]));
  }

  if (!savedProjectPhases) {
    localStorage.setItem('taskflow_project_phases', JSON.stringify({}));
  }

  if (!savedProjectTasks) {
    localStorage.setItem('taskflow_project_tasks', JSON.stringify({}));
  }
};
