/**
 * API Client for TaskFlow Backend
 * Replaces mockApi with real HTTP calls to .NET backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

// Types matching backend DTOs
export interface LoginRequest {
  email: string;
  password: string;
  siteID: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  siteID: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  userID: string;
  siteID: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  status: string;
  siteCode: string;
  siteName: string;
  createdAt: string;
  lastActive: string;
}

export interface Project {
  projectID: string;
  siteID: string;
  name: string;
  description?: string;
  categoryID?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  taskID: string;
  siteID: string;
  projectID: string;
  phaseID?: string;
  parentTaskID?: string;
  order?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeID?: string;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'taskflow_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'taskflow_refresh_token';
  private static readonly USER_KEY = 'taskflow_user';
  private static readonly SITE_CODE_KEY = 'taskflow_site_code';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getSiteCode(): string | null {
    return localStorage.getItem(this.SITE_CODE_KEY);
  }

  static setSiteCode(siteCode: string): void {
    localStorage.setItem(this.SITE_CODE_KEY, siteCode);
  }

  static clearAll(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SITE_CODE_KEY);
  }
}

// HTTP Client with auto token refresh
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = TokenManager.getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 - try to refresh token
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          return this.request<T>(endpoint, options);
        } else {
          // Refresh failed, logout
          TokenManager.clearAll();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.success && data.data) {
        TokenManager.setAccessToken(data.data.accessToken);
        TokenManager.setRefreshToken(data.data.refreshToken);
        TokenManager.setUser(data.data.user);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

// Create client instance
const client = new ApiClient(API_BASE_URL, API_TIMEOUT);

// Auth API
export const authApi = {
  async login(email: string, password: string, siteCodeOrID: string): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login', {
      email,
      password,
      SiteCode: siteCodeOrID, // Use SiteCode for multi-tenant identification
    });

    if (response.success && response.data) {
      TokenManager.setAccessToken(response.data.accessToken);
      TokenManager.setRefreshToken(response.data.refreshToken);
      TokenManager.setUser(response.data.user);
      TokenManager.setSiteCode(siteCodeOrID); // Store siteCode
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  },

  async register(
    email: string,
    password: string,
    name: string,
    siteID: string
  ): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      SiteID: siteID, // Backend expects capital 'SiteID'
    });

    if (response.success && response.data) {
      TokenManager.setAccessToken(response.data.accessToken);
      TokenManager.setRefreshToken(response.data.refreshToken);
      TokenManager.setUser(response.data.user);
      TokenManager.setSiteCode(siteID); // Store siteID for now (kept for compatibility)
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await client.get<User>('/auth/me');
    if (response.success && response.data) {
      TokenManager.setUser(response.data);
      return response.data;
    }
    throw new Error(response.error || 'Failed to get current user');
  },

  logout(): void {
    TokenManager.clearAll();
  },

  getStoredUser(): User | null {
    return TokenManager.getUser();
  },

  isAuthenticated(): boolean {
    return !!TokenManager.getAccessToken();
  },
};

// Projects API
export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const response = await client.get<Project[]>('/projects');
    return response.data || [];
  },

  async getById(id: string): Promise<Project> {
    const response = await client.get<Project>(`/projects/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Project not found');
  },

  async create(project: Partial<Project>): Promise<Project> {
    const response = await client.post<Project>('/projects', project);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create project');
  },

  async update(id: string, project: Partial<Project>): Promise<Project> {
    const response = await client.put<Project>(`/projects/${id}`, project);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update project');
  },

  async delete(id: string): Promise<void> {
    const response = await client.delete(`/projects/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete project');
    }
  },

  async getByCategory(categoryId: string): Promise<Project[]> {
    const response = await client.get<Project[]>(`/projects/category/${categoryId}`);
    return response.data || [];
  },

  async getByStatus(status: string): Promise<Project[]> {
    const response = await client.get<Project[]>(`/projects/status/${status}`);
    return response.data || [];
  },
};

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const response = await client.get<Task[]>('/tasks');
    return response.data || [];
  },

  async getById(id: string): Promise<Task> {
    const response = await client.get<Task>(`/tasks/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Task not found');
  },

  async create(task: Partial<Task>): Promise<Task> {
    const response = await client.post<Task>('/tasks', task);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create task');
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const response = await client.put<Task>(`/tasks/${id}`, task);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update task');
  },

  async delete(id: string): Promise<void> {
    const response = await client.delete(`/tasks/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete task');
    }
  },

  async getByProject(projectId: string): Promise<Task[]> {
    const response = await client.get<Task[]>(`/tasks/project/${projectId}`);
    return response.data || [];
  },

  async getByAssignee(assigneeId: string): Promise<Task[]> {
    const response = await client.get<Task[]>(`/tasks/assignee/${assigneeId}`);
    return response.data || [];
  },

  async getByStatus(status: string): Promise<Task[]> {
    const response = await client.get<Task[]>(`/tasks/status/${status}`);
    return response.data || [];
  },

  async getOverdue(): Promise<Task[]> {
    const response = await client.get<Task[]>('/tasks/overdue');
    return response.data || [];
  },

  async getDueSoon(days: number): Promise<Task[]> {
    const response = await client.get<Task[]>(`/tasks/due-soon/${days}`);
    return response.data || [];
  },
};

// Event types matching backend DTOs
export interface CalendarEvent {
  eventID: string;
  siteID: string;
  title: string;
  description?: string;
  taskID?: string;
  type: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string;
  color?: string;
  reminderMinutes?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  taskID?: string;
  type?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string;
  color?: string;
  reminderMinutes?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  taskID?: string;
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string;
  color?: string;
  reminderMinutes?: number;
}

// Events API
export const eventsApi = {
  async getAll(): Promise<CalendarEvent[]> {
    const response = await client.get<CalendarEvent[]>('/events');
    return response.data || [];
  },

  async getById(id: string): Promise<CalendarEvent> {
    const response = await client.get<CalendarEvent>(`/events/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Event not found');
  },

  async create(event: CreateEventRequest): Promise<CalendarEvent> {
    const response = await client.post<CalendarEvent>('/events', event);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create event');
  },

  async update(id: string, event: UpdateEventRequest): Promise<CalendarEvent> {
    const response = await client.put<CalendarEvent>(`/events/${id}`, event);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update event');
  },

  async delete(id: string): Promise<void> {
    const response = await client.delete(`/events/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete event');
    }
  },

  async getByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await client.get<CalendarEvent[]>(
      `/events/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data || [];
  },

  async getByTask(taskId: string): Promise<CalendarEvent[]> {
    const response = await client.get<CalendarEvent[]>(`/events/task/${taskId}`);
    return response.data || [];
  },

  async getByType(type: string): Promise<CalendarEvent[]> {
    const response = await client.get<CalendarEvent[]>(`/events/type/${type}`);
    return response.data || [];
  },
};

// Export all
export default {
  auth: authApi,
  projects: projectsApi,
  tasks: tasksApi,
  events: eventsApi,
};
