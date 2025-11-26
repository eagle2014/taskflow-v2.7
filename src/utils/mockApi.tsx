import { mockData } from '../data/mockData';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  status: 'active' | 'busy' | 'away' | 'offline';
  created_at: string;
  last_active: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progress: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  due_date: string;
  members: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id: string;
  reporter_id: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  created_at: string;
  updated_at: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  project_id: string;
  creator_id: string;
  start_date: string;
  end_date: string;
  attendees: string[];
  location: string;
  type: 'meeting' | 'review' | 'planning' | 'presentation' | 'deadline';
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'taskflow_users',
  PROJECTS: 'taskflow_projects',
  TASKS: 'taskflow_tasks',
  EVENTS: 'taskflow_events',
  COMMENTS: 'taskflow_comments',
  CURRENT_USER: 'taskflow_current_user'
};

// Initialize local storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockData.users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockData.projects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(mockData.tasks));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockData.events));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(mockData.comments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockData.users[0]));
  }
};

// Helper functions to get/set data from localStorage
function getData(key: string): any[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData(key: string, data: any[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Current user management
export const getCurrentUser = (): User | null => {
  initializeStorage();
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

// Authentication API
export const authApi = {
  async signIn(email: string, password: string): Promise<{ user: User; success: boolean }> {
    await delay(500);
    initializeStorage();
    
    const users = getData(STORAGE_KEYS.USERS) as User[];
    const user = users.find(u => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      return { user, success: true };
    }
    
    throw new Error('Invalid credentials');
  },
  
  async signUp(email: string, password: string, name: string): Promise<{ user: User; success: boolean }> {
    await delay(500);
    initializeStorage();
    
    const users = getData(STORAGE_KEYS.USERS) as User[];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Generate unique ID using timestamp + random string
    const uniqueId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User = {
      id: uniqueId,
      email,
      name,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
      role: 'member',
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };
    
    users.push(newUser);
    setData(STORAGE_KEYS.USERS, users);
    setCurrentUser(newUser);
    
    return { user: newUser, success: true };
  },
  
  async signOut(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Users API
export const usersApi = {
  async getUsers(): Promise<User[]> {
    await delay(300);
    initializeStorage();
    return getData(STORAGE_KEYS.USERS) as User[];
  },
  
  async getUserById(id: string): Promise<User | null> {
    await delay(200);
    initializeStorage();
    const users = getData(STORAGE_KEYS.USERS) as User[];
    return users.find(user => user.id === id) || null;
  },
  
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    initializeStorage();
    const users = getData(STORAGE_KEYS.USERS) as User[];
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    users[index] = { ...users[index], ...updates };
    setData(STORAGE_KEYS.USERS, users);
    
    return users[index];
  }
};

// Categories API
export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    await delay(200);
    return mockData.categories as Category[];
  },
  
  async getCategoryById(id: string): Promise<Category | null> {
    await delay(100);
    const category = mockData.categories.find(cat => cat.id === id);
    return category || null;
  }
};

// Projects API
export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    await delay(300);
    initializeStorage();
    return getData(STORAGE_KEYS.PROJECTS) as Project[];
  },
  
  async getProjectById(id: string): Promise<Project | null> {
    await delay(200);
    initializeStorage();
    const projects = getData(STORAGE_KEYS.PROJECTS) as Project[];
    return projects.find(project => project.id === id) || null;
  },
  
  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    await delay(400);
    initializeStorage();
    const projects = getData(STORAGE_KEYS.PROJECTS) as Project[];
    
    // Generate unique ID using timestamp + random string
    const uniqueId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newProject: Project = {
      ...projectData,
      id: uniqueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    projects.push(newProject);
    setData(STORAGE_KEYS.PROJECTS, projects);
    
    return newProject;
  },
  
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await delay(300);
    initializeStorage();
    const projects = getData(STORAGE_KEYS.PROJECTS) as Project[];
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    projects[index] = { 
      ...projects[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    setData(STORAGE_KEYS.PROJECTS, projects);
    
    return projects[index];
  },
  
  async deleteProject(id: string): Promise<void> {
    await delay(300);
    initializeStorage();
    const projects = getData(STORAGE_KEYS.PROJECTS) as Project[];
    const filteredProjects = projects.filter(project => project.id !== id);
    setData(STORAGE_KEYS.PROJECTS, filteredProjects);
    
    // Also delete related tasks
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    const filteredTasks = tasks.filter(task => task.project_id !== id);
    setData(STORAGE_KEYS.TASKS, filteredTasks);
  }
};

// Tasks API
export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    await delay(300);
    initializeStorage();
    return getData(STORAGE_KEYS.TASKS) as Task[];
  },
  
  async getTaskById(id: string): Promise<Task | null> {
    await delay(200);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    return tasks.find(task => task.id === id) || null;
  },
  
  async getTasksByProject(projectId: string): Promise<Task[]> {
    await delay(300);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    return tasks.filter(task => task.project_id === projectId);
  },
  
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    await delay(300);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    return tasks.filter(task => task.assignee_id === assigneeId);
  },
  
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    await delay(400);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    
    // Generate unique ID using timestamp + random string
    const uniqueId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask: Task = {
      ...taskData,
      id: uniqueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    setData(STORAGE_KEYS.TASKS, tasks);
    
    return newTask;
  },
  
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await delay(300);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    tasks[index] = { 
      ...tasks[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    setData(STORAGE_KEYS.TASKS, tasks);
    
    return tasks[index];
  },
  
  async deleteTask(id: string): Promise<void> {
    await delay(300);
    initializeStorage();
    const tasks = getData(STORAGE_KEYS.TASKS) as Task[];
    const filteredTasks = tasks.filter(task => task.id !== id);
    setData(STORAGE_KEYS.TASKS, filteredTasks);
    
    // Also delete related comments
    const comments = getData(STORAGE_KEYS.COMMENTS) as Comment[];
    const filteredComments = comments.filter(comment => comment.task_id !== id);
    setData(STORAGE_KEYS.COMMENTS, filteredComments);
  }
};

// Events API
export const eventsApi = {
  async getEvents(): Promise<Event[]> {
    await delay(300);
    initializeStorage();
    return getData(STORAGE_KEYS.EVENTS) as Event[];
  },
  
  async getEventById(id: string): Promise<Event | null> {
    await delay(200);
    initializeStorage();
    const events = getData(STORAGE_KEYS.EVENTS) as Event[];
    return events.find(event => event.id === id) || null;
  },
  
  async createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    await delay(400);
    initializeStorage();
    const events = getData(STORAGE_KEYS.EVENTS) as Event[];
    
    // Generate unique ID using timestamp + random string
    const uniqueId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newEvent: Event = {
      ...eventData,
      id: uniqueId,
      created_at: new Date().toISOString()
    };
    
    events.push(newEvent);
    setData(STORAGE_KEYS.EVENTS, events);
    
    return newEvent;
  },
  
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    await delay(300);
    initializeStorage();
    const events = getData(STORAGE_KEYS.EVENTS) as Event[];
    const index = events.findIndex(event => event.id === id);
    
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    events[index] = { ...events[index], ...updates };
    setData(STORAGE_KEYS.EVENTS, events);
    
    return events[index];
  },
  
  async deleteEvent(id: string): Promise<void> {
    await delay(300);
    initializeStorage();
    const events = getData(STORAGE_KEYS.EVENTS) as Event[];
    const filteredEvents = events.filter(event => event.id !== id);
    setData(STORAGE_KEYS.EVENTS, filteredEvents);
  }
};

// Comments API
export const commentsApi = {
  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    await delay(300);
    initializeStorage();
    const comments = getData(STORAGE_KEYS.COMMENTS) as Comment[];
    return comments.filter(comment => comment.task_id === taskId);
  },
  
  async createComment(commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment> {
    await delay(400);
    initializeStorage();
    const comments = getData(STORAGE_KEYS.COMMENTS) as Comment[];
    
    // Generate unique ID using timestamp + random string
    const uniqueId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newComment: Comment = {
      ...commentData,
      id: uniqueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    comments.push(newComment);
    setData(STORAGE_KEYS.COMMENTS, comments);
    
    return newComment;
  },
  
  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    await delay(300);
    initializeStorage();
    const comments = getData(STORAGE_KEYS.COMMENTS) as Comment[];
    const index = comments.findIndex(comment => comment.id === id);
    
    if (index === -1) {
      throw new Error('Comment not found');
    }
    
    comments[index] = { 
      ...comments[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    setData(STORAGE_KEYS.COMMENTS, comments);
    
    return comments[index];
  },
  
  async deleteComment(id: string): Promise<void> {
    await delay(300);
    initializeStorage();
    const comments = getData(STORAGE_KEYS.COMMENTS) as Comment[];
    const filteredComments = comments.filter(comment => comment.id !== id);
    setData(STORAGE_KEYS.COMMENTS, filteredComments);
  }
};

// Initialize storage on module load
initializeStorage();