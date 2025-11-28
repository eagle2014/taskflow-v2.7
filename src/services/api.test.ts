import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  authApi,
  projectsApi,
  tasksApi,
  eventsApi,
  usersApi,
  categoriesApi,
  commentsApi,
  spacesApi,
  phasesApi,
  type User,
  type Project,
  type Task,
  type CalendarEvent,
  type Category,
  type Comment,
  type Space,
  type Phase,
  type AuthResponse,
} from './api';

// Mock data
const mockUser: User = {
  userID: 'user-123',
  siteID: 'site-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  status: 'active',
  siteCode: 'TEST',
  siteName: 'Test Site',
  createdAt: '2025-01-01T00:00:00Z',
  lastActive: '2025-01-26T00:00:00Z',
};

const mockProject: Project = {
  projectID: 'proj-123',
  siteID: 'site-123',
  name: 'Test Project',
  description: 'Test Description',
  status: 'active',
  priority: 'high',
  createdBy: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockTask: Task = {
  taskID: 'task-123',
  siteID: 'site-123',
  projectID: 'proj-123',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'medium',
  createdBy: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockEvent: CalendarEvent = {
  eventID: 'event-123',
  siteID: 'site-123',
  title: 'Test Event',
  type: 'meeting',
  date: '2025-01-26',
  startTime: '09:00:00',
  endTime: '10:00:00',
  createdBy: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockCategory: Category = {
  categoryID: 'cat-123',
  siteID: 'site-123',
  name: 'Test Category',
  color: '#0394ff',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockComment: Comment = {
  commentID: 'comment-123',
  siteID: 'site-123',
  taskID: 'task-123',
  userID: 'user-123',
  content: 'Test comment',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockSpace: Space = {
  spaceID: 'space-123',
  siteID: 'site-123',
  name: 'Test Space',
  order: 1,
  createdBy: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockPhase: Phase = {
  phaseID: 'phase-123',
  siteID: 'site-123',
  projectID: 'proj-123',
  name: 'Test Phase',
  order: 1,
  createdBy: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-26T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-123',
  expiresIn: 3600,
};

// Helper to mock fetch
const mockFetch = (responseData: any, success = true, status = 200, errorMessage?: string) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve({
      success,
      data: responseData,
      error: success ? undefined : (errorMessage || 'Request failed'),
    }),
  });
};

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // AUTH API TESTS
  // ============================================================================
  describe('authApi', () => {
    describe('login', () => {
      it('should login successfully and store tokens', async () => {
        global.fetch = mockFetch(mockAuthResponse);

        const result = await authApi.login('test@example.com', 'password123', 'TEST');

        expect(result).toEqual(mockAuthResponse);
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_access_token', 'access-token-123');
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_refresh_token', 'refresh-token-123');
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_user', JSON.stringify(mockUser));
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_site_code', 'TEST');
      });

      it('should throw error on login failure', async () => {
        global.fetch = mockFetch(null, false, 400, 'Login failed');

        await expect(authApi.login('test@example.com', 'wrong', 'TEST')).rejects.toThrow('Login failed');
      });
    });

    describe('register', () => {
      it('should register successfully and store tokens', async () => {
        global.fetch = mockFetch(mockAuthResponse);

        const result = await authApi.register('test@example.com', 'password123', 'Test User', 'site-123');

        expect(result).toEqual(mockAuthResponse);
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_access_token', 'access-token-123');
      });

      it('should throw error on registration failure', async () => {
        global.fetch = mockFetch(null, false, 400, 'Registration failed');

        await expect(authApi.register('test@example.com', 'weak', 'User', 'site-123')).rejects.toThrow('Registration failed');
      });
    });

    describe('getCurrentUser', () => {
      it('should get current user successfully', async () => {
        (localStorage.getItem as any).mockReturnValue('access-token-123');
        global.fetch = mockFetch(mockUser);

        const result = await authApi.getCurrentUser();

        expect(result).toEqual(mockUser);
        expect(localStorage.setItem).toHaveBeenCalledWith('taskflow_user', JSON.stringify(mockUser));
      });
    });

    describe('logout', () => {
      it('should clear all tokens', () => {
        authApi.logout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('taskflow_access_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('taskflow_refresh_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('taskflow_user');
        expect(localStorage.removeItem).toHaveBeenCalledWith('taskflow_site_code');
      });
    });

    describe('getStoredUser', () => {
      it('should return stored user', () => {
        (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockUser));

        const result = authApi.getStoredUser();

        expect(result).toEqual(mockUser);
      });

      it('should return null if no user stored', () => {
        (localStorage.getItem as any).mockReturnValue(null);

        const result = authApi.getStoredUser();

        expect(result).toBeNull();
      });
    });

    describe('isAuthenticated', () => {
      it('should return true if token exists', () => {
        (localStorage.getItem as any).mockReturnValue('access-token-123');

        expect(authApi.isAuthenticated()).toBe(true);
      });

      it('should return false if no token', () => {
        (localStorage.getItem as any).mockReturnValue(null);

        expect(authApi.isAuthenticated()).toBe(false);
      });
    });
  });

  // ============================================================================
  // API CLIENT EDGE CASES
  // ============================================================================
  describe('ApiClient Edge Cases', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    it('should handle timeout error', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      global.fetch = vi.fn().mockRejectedValue(abortError);

      await expect(projectsApi.getAll()).rejects.toThrow('Request timeout');
    });

    it('should handle unknown error type', async () => {
      global.fetch = vi.fn().mockRejectedValue('string error');

      await expect(projectsApi.getAll()).rejects.toThrow('Unknown error occurred');
    });

    it('should handle 401 with successful token refresh', async () => {
      const refreshToken = 'refresh-token-123';
      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'taskflow_access_token') return 'old-token';
        if (key === 'taskflow_refresh_token') return refreshToken;
        return null;
      });

      // First call returns 401, refresh succeeds, retry succeeds
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        callCount++;
        if (url.includes('/auth/refresh')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              success: true,
              data: { accessToken: 'new-token', refreshToken: 'new-refresh', user: mockUser },
            }),
          });
        }
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [mockProject] }),
        });
      });

      const result = await projectsApi.getAll();
      expect(result).toEqual([mockProject]);
    });

    it('should handle 401 with failed token refresh', async () => {
      const originalHref = window.location.href;
      delete (window as any).location;
      (window as any).location = { href: '' };

      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'taskflow_access_token') return 'old-token';
        if (key === 'taskflow_refresh_token') return 'refresh-token';
        return null;
      });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/auth/refresh')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ success: false, error: 'Invalid refresh token' }),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
        });
      });

      await expect(projectsApi.getAll()).rejects.toThrow('Session expired. Please login again.');
      expect(window.location.href).toBe('/login');

      (window as any).location = { href: originalHref };
    });

    it('should handle 401 without refresh token', async () => {
      (localStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'taskflow_access_token') return 'access-token';
        if (key === 'taskflow_refresh_token') return null;
        return null;
      });

      const originalHref = window.location.href;
      delete (window as any).location;
      (window as any).location = { href: '' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
      });

      await expect(projectsApi.getAll()).rejects.toThrow('Session expired. Please login again.');

      (window as any).location = { href: originalHref };
    });

    it('should use message if error is not provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ success: false, message: 'Bad request message' }),
      });

      await expect(projectsApi.getAll()).rejects.toThrow('Bad request message');
    });

    it('should use default error if no error or message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false }),
      });

      await expect(projectsApi.getAll()).rejects.toThrow('Request failed');
    });
  });

  // ============================================================================
  // PROJECTS API TESTS
  // ============================================================================
  describe('projectsApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all projects', async () => {
        global.fetch = mockFetch([mockProject]);

        const result = await projectsApi.getAll();

        expect(result).toEqual([mockProject]);
      });

      it('should return empty array if no data', async () => {
        global.fetch = mockFetch(null);

        const result = await projectsApi.getAll();

        expect(result).toEqual([]);
      });
    });

    describe('getById', () => {
      it('should fetch project by id', async () => {
        global.fetch = mockFetch(mockProject);

        const result = await projectsApi.getById('proj-123');

        expect(result).toEqual(mockProject);
      });

      it('should throw error if project not found', async () => {
        global.fetch = mockFetch(null, false, 404, 'Project not found');

        await expect(projectsApi.getById('invalid')).rejects.toThrow('Project not found');
      });
    });

    describe('create', () => {
      it('should create project', async () => {
        global.fetch = mockFetch(mockProject);

        const result = await projectsApi.create({ name: 'New Project', status: 'active', priority: 'high' });

        expect(result).toEqual(mockProject);
      });
    });

    describe('update', () => {
      it('should update project', async () => {
        global.fetch = mockFetch({ ...mockProject, name: 'Updated' });

        const result = await projectsApi.update('proj-123', { name: 'Updated' });

        expect(result.name).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete project', async () => {
        global.fetch = mockFetch(null, true);

        await expect(projectsApi.delete('proj-123')).resolves.toBeUndefined();
      });
    });

    describe('getByCategory', () => {
      it('should fetch projects by category', async () => {
        global.fetch = mockFetch([mockProject]);

        const result = await projectsApi.getByCategory('cat-123');

        expect(result).toEqual([mockProject]);
      });
    });

    describe('getByStatus', () => {
      it('should fetch projects by status', async () => {
        global.fetch = mockFetch([mockProject]);

        const result = await projectsApi.getByStatus('active');

        expect(result).toEqual([mockProject]);
      });
    });
  });

  // ============================================================================
  // TASKS API TESTS
  // ============================================================================
  describe('tasksApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all tasks', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getAll();

        expect(result).toEqual([mockTask]);
      });
    });

    describe('getById', () => {
      it('should fetch task by id', async () => {
        global.fetch = mockFetch(mockTask);

        const result = await tasksApi.getById('task-123');

        expect(result).toEqual(mockTask);
      });
    });

    describe('create', () => {
      it('should create task', async () => {
        global.fetch = mockFetch(mockTask);

        const result = await tasksApi.create({ title: 'New Task', projectID: 'proj-123', status: 'pending', priority: 'medium' });

        expect(result).toEqual(mockTask);
      });
    });

    describe('update', () => {
      it('should update task', async () => {
        global.fetch = mockFetch({ ...mockTask, title: 'Updated' });

        const result = await tasksApi.update('task-123', { title: 'Updated' });

        expect(result.title).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete task', async () => {
        global.fetch = mockFetch(null, true);

        await expect(tasksApi.delete('task-123')).resolves.toBeUndefined();
      });
    });

    describe('getByProject', () => {
      it('should fetch tasks by project', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getByProject('proj-123');

        expect(result).toEqual([mockTask]);
      });
    });

    describe('getByAssignee', () => {
      it('should fetch tasks by assignee', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getByAssignee('user-123');

        expect(result).toEqual([mockTask]);
      });
    });

    describe('getByStatus', () => {
      it('should fetch tasks by status', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getByStatus('pending');

        expect(result).toEqual([mockTask]);
      });
    });

    describe('getOverdue', () => {
      it('should fetch overdue tasks', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getOverdue();

        expect(result).toEqual([mockTask]);
      });
    });

    describe('getDueSoon', () => {
      it('should fetch tasks due soon', async () => {
        global.fetch = mockFetch([mockTask]);

        const result = await tasksApi.getDueSoon(7);

        expect(result).toEqual([mockTask]);
      });
    });
  });

  // ============================================================================
  // EVENTS API TESTS
  // ============================================================================
  describe('eventsApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all events', async () => {
        global.fetch = mockFetch([mockEvent]);

        const result = await eventsApi.getAll();

        expect(result).toEqual([mockEvent]);
      });
    });

    describe('getById', () => {
      it('should fetch event by id', async () => {
        global.fetch = mockFetch(mockEvent);

        const result = await eventsApi.getById('event-123');

        expect(result).toEqual(mockEvent);
      });
    });

    describe('create', () => {
      it('should create event', async () => {
        global.fetch = mockFetch(mockEvent);

        const result = await eventsApi.create({ title: 'New Event', date: '2025-01-26' });

        expect(result).toEqual(mockEvent);
      });
    });

    describe('update', () => {
      it('should update event', async () => {
        global.fetch = mockFetch({ ...mockEvent, title: 'Updated' });

        const result = await eventsApi.update('event-123', { title: 'Updated' });

        expect(result.title).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete event', async () => {
        global.fetch = mockFetch(null, true);

        await expect(eventsApi.delete('event-123')).resolves.toBeUndefined();
      });
    });

    describe('getByDateRange', () => {
      it('should fetch events by date range', async () => {
        global.fetch = mockFetch([mockEvent]);

        const result = await eventsApi.getByDateRange('2025-01-01', '2025-01-31');

        expect(result).toEqual([mockEvent]);
      });
    });

    describe('getByTask', () => {
      it('should fetch events by task', async () => {
        global.fetch = mockFetch([mockEvent]);

        const result = await eventsApi.getByTask('task-123');

        expect(result).toEqual([mockEvent]);
      });
    });

    describe('getByType', () => {
      it('should fetch events by type', async () => {
        global.fetch = mockFetch([mockEvent]);

        const result = await eventsApi.getByType('meeting');

        expect(result).toEqual([mockEvent]);
      });
    });
  });

  // ============================================================================
  // USERS API TESTS
  // ============================================================================
  describe('usersApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all users', async () => {
        global.fetch = mockFetch([mockUser]);

        const result = await usersApi.getAll();

        expect(result).toEqual([mockUser]);
      });
    });

    describe('getById', () => {
      it('should fetch user by id', async () => {
        global.fetch = mockFetch(mockUser);

        const result = await usersApi.getById('user-123');

        expect(result).toEqual(mockUser);
      });
    });

    describe('update', () => {
      it('should update user', async () => {
        global.fetch = mockFetch({ ...mockUser, name: 'Updated' });

        const result = await usersApi.update('user-123', { name: 'Updated' });

        expect(result.name).toBe('Updated');
      });
    });

    describe('updatePassword', () => {
      it('should update password', async () => {
        global.fetch = mockFetch(null, true);

        await expect(usersApi.updatePassword('user-123', 'oldpass', 'newpass')).resolves.toBeUndefined();
      });
    });

    describe('getByRole', () => {
      it('should fetch users by role', async () => {
        global.fetch = mockFetch([mockUser]);

        const result = await usersApi.getByRole('admin');

        expect(result).toEqual([mockUser]);
      });
    });
  });

  // ============================================================================
  // CATEGORIES API TESTS
  // ============================================================================
  describe('categoriesApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all categories', async () => {
        global.fetch = mockFetch([mockCategory]);

        const result = await categoriesApi.getAll();

        expect(result).toEqual([mockCategory]);
      });
    });

    describe('getById', () => {
      it('should fetch category by id', async () => {
        global.fetch = mockFetch(mockCategory);

        const result = await categoriesApi.getById('cat-123');

        expect(result).toEqual(mockCategory);
      });
    });

    describe('create', () => {
      it('should create category', async () => {
        global.fetch = mockFetch(mockCategory);

        const result = await categoriesApi.create({ name: 'New Category' });

        expect(result).toEqual(mockCategory);
      });
    });

    describe('update', () => {
      it('should update category', async () => {
        global.fetch = mockFetch({ ...mockCategory, name: 'Updated' });

        const result = await categoriesApi.update('cat-123', { name: 'Updated' });

        expect(result.name).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete category', async () => {
        global.fetch = mockFetch(null, true);

        await expect(categoriesApi.delete('cat-123')).resolves.toBeUndefined();
      });
    });
  });

  // ============================================================================
  // COMMENTS API TESTS
  // ============================================================================
  describe('commentsApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getByTask', () => {
      it('should fetch comments by task', async () => {
        global.fetch = mockFetch([mockComment]);

        const result = await commentsApi.getByTask('task-123');

        expect(result).toEqual([mockComment]);
      });
    });

    describe('getById', () => {
      it('should fetch comment by id', async () => {
        global.fetch = mockFetch(mockComment);

        const result = await commentsApi.getById('comment-123');

        expect(result).toEqual(mockComment);
      });
    });

    describe('create', () => {
      it('should create comment', async () => {
        global.fetch = mockFetch(mockComment);

        const result = await commentsApi.create({ taskID: 'task-123', content: 'New comment' });

        expect(result).toEqual(mockComment);
      });
    });

    describe('update', () => {
      it('should update comment', async () => {
        global.fetch = mockFetch({ ...mockComment, content: 'Updated' });

        const result = await commentsApi.update('comment-123', { content: 'Updated' });

        expect(result.content).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete comment', async () => {
        global.fetch = mockFetch(null, true);

        await expect(commentsApi.delete('comment-123')).resolves.toBeUndefined();
      });
    });
  });

  // ============================================================================
  // SPACES API TESTS
  // ============================================================================
  describe('spacesApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all spaces', async () => {
        global.fetch = mockFetch([mockSpace]);

        const result = await spacesApi.getAll();

        expect(result).toEqual([mockSpace]);
      });
    });

    describe('getById', () => {
      it('should fetch space by id', async () => {
        global.fetch = mockFetch(mockSpace);

        const result = await spacesApi.getById('space-123');

        expect(result).toEqual(mockSpace);
      });
    });

    describe('getByProject', () => {
      it('should fetch spaces by project', async () => {
        global.fetch = mockFetch([mockSpace]);

        const result = await spacesApi.getByProject('proj-123');

        expect(result).toEqual([mockSpace]);
      });
    });

    describe('create', () => {
      it('should create space', async () => {
        global.fetch = mockFetch(mockSpace);

        const result = await spacesApi.create({ name: 'New Space' });

        expect(result).toEqual(mockSpace);
      });
    });

    describe('update', () => {
      it('should update space', async () => {
        global.fetch = mockFetch({ ...mockSpace, name: 'Updated' });

        const result = await spacesApi.update('space-123', { name: 'Updated' });

        expect(result.name).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete space', async () => {
        global.fetch = mockFetch(null, true);

        await expect(spacesApi.delete('space-123')).resolves.toBeUndefined();
      });
    });

    describe('reorder', () => {
      it('should reorder spaces', async () => {
        global.fetch = mockFetch(null, true);

        await expect(spacesApi.reorder(['space-1', 'space-2'])).resolves.toBeUndefined();
      });
    });
  });

  // ============================================================================
  // PHASES API TESTS
  // ============================================================================
  describe('phasesApi', () => {
    beforeEach(() => {
      (localStorage.getItem as any).mockReturnValue('access-token-123');
    });

    describe('getAll', () => {
      it('should fetch all phases', async () => {
        global.fetch = mockFetch([mockPhase]);

        const result = await phasesApi.getAll();

        expect(result).toEqual([mockPhase]);
      });
    });

    describe('getById', () => {
      it('should fetch phase by id', async () => {
        global.fetch = mockFetch(mockPhase);

        const result = await phasesApi.getById('phase-123');

        expect(result).toEqual(mockPhase);
      });
    });

    describe('getByProject', () => {
      it('should fetch phases by project', async () => {
        global.fetch = mockFetch([mockPhase]);

        const result = await phasesApi.getByProject('proj-123');

        expect(result).toEqual([mockPhase]);
      });
    });

    describe('create', () => {
      it('should create phase', async () => {
        global.fetch = mockFetch(mockPhase);

        const result = await phasesApi.create({ projectID: 'proj-123', name: 'New Phase' });

        expect(result).toEqual(mockPhase);
      });
    });

    describe('update', () => {
      it('should update phase', async () => {
        global.fetch = mockFetch({ ...mockPhase, name: 'Updated' });

        const result = await phasesApi.update('phase-123', { name: 'Updated' });

        expect(result.name).toBe('Updated');
      });
    });

    describe('delete', () => {
      it('should delete phase', async () => {
        global.fetch = mockFetch(null, true);

        await expect(phasesApi.delete('phase-123')).resolves.toBeUndefined();
      });
    });

    describe('reorder', () => {
      it('should reorder phases', async () => {
        global.fetch = mockFetch(null, true);

        await expect(phasesApi.reorder('proj-123', ['phase-1', 'phase-2'])).resolves.toBeUndefined();
      });
    });
  });
});
