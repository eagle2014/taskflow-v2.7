// Tasks API - Mock version using localStorage
import type { Task, CreateTaskRequest, UserSession } from '../../types/api-types';

const TASKS_STORAGE_KEY = 'taskflow_tasks';
const PROJECTS_STORAGE_KEY = 'taskflow_projects';

// Helper to get tasks from localStorage
const getTasksFromStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading tasks from storage:', error);
    return [];
  }
};

// Helper to save tasks to localStorage
const saveTasksToStorage = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
};

// Helper to get projects from localStorage
const getProjectsFromStorage = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading projects from storage:', error);
    return [];
  }
};

export const fetchTasks = async (session: UserSession): Promise<Task[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📋 Fetching all tasks for user:', session.user.id);

    const allTasks = getTasksFromStorage();
    const userTasks = allTasks.filter(t => t.user_id === session.user.id);

    // Populate project data
    if (userTasks.length > 0) {
      const allProjects = getProjectsFromStorage();
      const projectIds = [...new Set(userTasks.map(task => task.project_id).filter(Boolean))];
      
      if (projectIds.length > 0) {
        const projects = allProjects.filter(p => 
          projectIds.includes(p.id) && p.user_id === session.user.id
        );

        const tasksWithProjects: Task[] = userTasks.map(task => ({
          ...task,
          project: projects.find(project => project.id === task.project_id) || null
        }));

        console.log('✅ Tasks fetched with projects:', tasksWithProjects.length);
        return tasksWithProjects;
      }
    }

    console.log('✅ Tasks fetched:', userTasks.length);
    return userTasks;
  } catch (error) {
    console.error('❌ Tasks fetch error:', error);
    throw error;
  }
};

export const fetchProjectTasks = async (projectId: string, session: UserSession): Promise<Task[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📋 Fetching tasks for project:', projectId);

    // Verify user owns the project
    const allProjects = getProjectsFromStorage();
    const project = allProjects.find(p => p.id === projectId && p.user_id === session.user.id);

    if (!project) {
      throw new Error('Project not found or unauthorized');
    }

    // Fetch tasks for this project
    const allTasks = getTasksFromStorage();
    const projectTasks = allTasks.filter(t => t.project_id === projectId);

    // Populate project data
    const tasksWithProject: Task[] = projectTasks.map(task => ({
      ...task,
      project: { id: project.id, name: project.name }
    }));

    console.log('✅ Project tasks fetched:', tasksWithProject.length);
    return tasksWithProject;
  } catch (error) {
    console.error('❌ Project tasks fetch error:', error);
    throw error;
  }
};

export const createTask = async (taskData: CreateTaskRequest, session: UserSession): Promise<Task> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📋 Creating task:', taskData);

    // Verify user owns the project
    const allProjects = getProjectsFromStorage();
    const project = allProjects.find(p => p.id === taskData.project_id && p.user_id === session.user.id);

    if (!project) {
      throw new Error('Project not found or unauthorized');
    }

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...taskData,
      user_id: session.user.id,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allTasks = getTasksFromStorage();
    allTasks.push(newTask);
    saveTasksToStorage(allTasks);

    // Populate project data
    const enrichedTask: Task = {
      ...newTask,
      project: { id: project.id, name: project.name }
    };

    console.log('✅ Task created:', enrichedTask);
    return enrichedTask;
  } catch (error) {
    console.error('❌ Task creation error:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskData: any, session: UserSession): Promise<Task> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📋 Updating task:', taskId);

    const allTasks = getTasksFromStorage();
    const taskIndex = allTasks.findIndex(t => t.id === taskId && t.user_id === session.user.id);

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...allTasks[taskIndex],
      ...taskData,
      updated_at: new Date().toISOString(),
    };

    allTasks[taskIndex] = updatedTask;
    saveTasksToStorage(allTasks);

    console.log('✅ Task updated:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('❌ Task update error:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string, session: UserSession): Promise<{ success: boolean }> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📋 Deleting task:', taskId);

    const allTasks = getTasksFromStorage();
    const filteredTasks = allTasks.filter(t => !(t.id === taskId && t.user_id === session.user.id));

    if (filteredTasks.length === allTasks.length) {
      throw new Error('Task not found');
    }

    saveTasksToStorage(filteredTasks);

    console.log('✅ Task deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Task deletion error:', error);
    throw error;
  }
};
