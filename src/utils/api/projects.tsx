// Projects API - Mock version using localStorage
import { fetchProjectCategories } from './categories';
import type { Project, CreateProjectRequest, UserSession } from '../../types/api-types';

const STORAGE_KEY = 'taskflow_projects';

// Helper to get projects from localStorage
const getProjectsFromStorage = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading projects from storage:', error);
    return [];
  }
};

// Helper to save projects to localStorage
const saveProjectsToStorage = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to storage:', error);
  }
};

export const fetchProjects = async (session: UserSession): Promise<Project[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📁 Fetching projects for user:', session.user.id);

    const allProjects = getProjectsFromStorage();
    const userProjects = allProjects.filter(p => p.user_id === session.user.id);

    // Populate categories
    if (userProjects.length > 0) {
      const categories = await fetchProjectCategories();
      
      const projectsWithCategories: Project[] = userProjects.map(project => ({
        ...project,
        category: categories.find(cat => cat.id === project.category_id) || null
      }));

      console.log('✅ Projects fetched with categories:', projectsWithCategories.length);
      return projectsWithCategories;
    }

    console.log('✅ Projects fetched:', userProjects.length);
    return userProjects;
  } catch (error) {
    console.error('❌ Projects fetch error:', error);
    throw error;
  }
};

export const createProject = async (projectData: CreateProjectRequest, session: UserSession): Promise<Project> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📁 Creating project:', projectData);

    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      user_id: session.user.id,
      owner_id: session.user.id,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allProjects = getProjectsFromStorage();
    allProjects.push(newProject);
    saveProjectsToStorage(allProjects);

    // Populate category
    const categories = await fetchProjectCategories();
    const enrichedProject: Project = {
      ...newProject,
      category: categories.find(cat => cat.id === newProject.category_id) || null
    };

    console.log('✅ Project created:', enrichedProject);
    return enrichedProject;
  } catch (error) {
    console.error('❌ Project creation error:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, projectData: any, session: UserSession): Promise<Project> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📁 Updating project:', projectId);

    const allProjects = getProjectsFromStorage();
    const projectIndex = allProjects.findIndex(p => p.id === projectId && p.user_id === session.user.id);

    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...allProjects[projectIndex],
      ...projectData,
      updated_at: new Date().toISOString(),
    };

    allProjects[projectIndex] = updatedProject;
    saveProjectsToStorage(allProjects);

    // Populate category
    const categories = await fetchProjectCategories();
    const enrichedProject: Project = {
      ...updatedProject,
      category: categories.find(cat => cat.id === updatedProject.category_id) || null
    };

    console.log('✅ Project updated:', enrichedProject);
    return enrichedProject;
  } catch (error) {
    console.error('❌ Project update error:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string, session: UserSession): Promise<{ success: boolean }> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📁 Deleting project:', projectId);

    const allProjects = getProjectsFromStorage();
    const filteredProjects = allProjects.filter(p => !(p.id === projectId && p.user_id === session.user.id));

    if (filteredProjects.length === allProjects.length) {
      throw new Error('Project not found');
    }

    saveProjectsToStorage(filteredProjects);

    console.log('✅ Project deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Project deletion error:', error);
    throw error;
  }
};
