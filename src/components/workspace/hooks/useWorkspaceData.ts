// Custom hook for loading and saving workspace data
import { useEffect } from 'react';
import { Space, Phase, WorkspaceTask } from '../types';
import { STORAGE_KEYS } from '../constants';
import { initializeWorkspaceData } from '../../../data/projectWorkspaceMockData';

interface UseWorkspaceDataProps {
  spaces: Space[];
  projectPhases: Record<string, Phase[]>;
  projectTasks: Record<string, WorkspaceTask[]>;
  visibleViewIds: string[];
  activeProject: string | null;
  activePhase: string | null;
  setSpaces: (spaces: Space[]) => void;
  setProjectPhases: (phases: Record<string, Phase[]>) => void;
  setProjectTasks: (tasks: Record<string, WorkspaceTask[]>) => void;
  setVisibleViewIds: (ids: string[]) => void;
  setWorkspaceTasks: (tasks: WorkspaceTask[]) => void;
}

export const useWorkspaceData = ({
  spaces,
  projectPhases,
  projectTasks,
  visibleViewIds,
  activeProject,
  activePhase,
  setSpaces,
  setProjectPhases,
  setProjectTasks,
  setVisibleViewIds,
  setWorkspaceTasks,
}: UseWorkspaceDataProps) => {
  
  // Initialize workspace with default data on first load
  useEffect(() => {
    initializeWorkspaceData();
  }, []);

  // Load project phases from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_PHASES);
    if (saved) {
      setProjectPhases(JSON.parse(saved));
    }
  }, [setProjectPhases]);

  // Save project phases to localStorage
  useEffect(() => {
    if (Object.keys(projectPhases).length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_PHASES, JSON.stringify(projectPhases));
    }
  }, [projectPhases]);

  // Load project tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECT_TASKS);
    if (saved) {
      setProjectTasks(JSON.parse(saved));
    }
  }, [setProjectTasks]);

  // Save project tasks to localStorage
  useEffect(() => {
    if (Object.keys(projectTasks).length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_TASKS, JSON.stringify(projectTasks));
    }
  }, [projectTasks]);

  // Update workspace tasks when activeProject or activePhase changes
  useEffect(() => {
    if (activeProject && projectTasks[activeProject]) {
      const tasksForProject = projectTasks[activeProject];
      if (activePhase) {
        setWorkspaceTasks(tasksForProject.filter(task => task.phase === activePhase));
      } else {
        setWorkspaceTasks(tasksForProject);
      }
    } else if (!activeProject) {
      setWorkspaceTasks([]);
    }
  }, [activeProject, activePhase, projectTasks, setWorkspaceTasks]);

  // Load visible views from localStorage
  useEffect(() => {
    const savedViews = localStorage.getItem(STORAGE_KEYS.VISIBLE_VIEWS);
    if (savedViews) {
      setVisibleViewIds(JSON.parse(savedViews));
    }
  }, [setVisibleViewIds]);

  // Load spaces from localStorage
  useEffect(() => {
    const savedSpaces = localStorage.getItem(STORAGE_KEYS.SPACES);
    if (savedSpaces) {
      const loadedSpaces = JSON.parse(savedSpaces);
      setSpaces(loadedSpaces.map((s: any) => ({
        ...s,
        projectIds: s.projectIds || []
      })));
    }
  }, [setSpaces]);

  // Save spaces to localStorage
  useEffect(() => {
    if (spaces.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));
    }
  }, [spaces]);

  // Save visible views to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISIBLE_VIEWS, JSON.stringify(visibleViewIds));
  }, [visibleViewIds]);
};
