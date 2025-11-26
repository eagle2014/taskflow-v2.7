// Clean API Types - No Foreign Key Dependencies
// These types match our no-foreign-key database schema

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category_id: string; // Just a string reference, no relationship
  user_id: string;     // Just a string reference, no relationship
  owner_id?: string;   // Just a string reference, no relationship
  created_by?: string; // Just a string reference, no relationship
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  // Optional populated category data (manually joined in app layer)
  category?: ProjectCategory;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  project_id: string;  // Just a string reference, no relationship
  user_id: string;     // Just a string reference, no relationship
  assignee?: string;   // Just a string reference, no relationship
  created_by?: string; // Just a string reference, no relationship
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  // Optional populated project data (manually joined in app layer)
  project?: Project;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  task_id?: string;    // Just a string reference, no relationship
  type: 'event' | 'appointment' | 'meeting' | 'deadline' | 'reminder';
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendees?: any;
  color?: string;
  reminder_minutes?: number;
  user_id?: string;    // Just a string reference, no relationship
  created_by: string;  // Just a string reference, no relationship
  created_at?: string;
  updated_at?: string;
  // Optional populated task data (manually joined in app layer)
  task?: Task;
}

export interface Comment {
  id: string;
  content: string;
  task_id: string;     // Just a string reference, no relationship
  user_id: string;     // Just a string reference, no relationship
  created_at?: string;
  updated_at?: string;
  // Optional populated task data (manually joined in app layer)
  task?: Task;
}

// Request DTOs for creating/updating
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  category_id: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  project_id: string;
  assignee?: string;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  task_id?: string;
  type?: 'event' | 'appointment' | 'meeting' | 'deadline' | 'reminder';
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendees?: any;
  color?: string;
  reminder_minutes?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  task_id?: string;
  type?: 'event' | 'appointment' | 'meeting' | 'deadline' | 'reminder';
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendees?: any;
  color?: string;
  reminder_minutes?: number;
}

// Response DTOs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// User session type (simplified)
export interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
  access_token: string;
}

// Filter types for queries
export interface TaskFilters {
  project_id?: string;
  assignee_id?: string;
  status?: string;
  priority?: string;
}

export interface EventFilters {
  date_from?: string;
  date_to?: string;
  type?: string;
  task_id?: string;
}