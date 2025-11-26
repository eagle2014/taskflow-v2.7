// API Constants - Static data and configuration
import type { ProjectCategory } from '../types/api-types';

export const STATIC_CATEGORIES: ProjectCategory[] = [
  { id: 'web-development', name: 'Web Development', description: 'Frontend and backend web projects', color: '#0394ff' },
  { id: 'mobile-development', name: 'Mobile Development', description: 'iOS and Android applications', color: '#51cf66' },
  { id: 'design', name: 'Design', description: 'UI/UX and graphic design projects', color: '#ff8cc8' },
  { id: 'marketing', name: 'Marketing', description: 'Marketing campaigns and strategies', color: '#ffd43b' },
  { id: 'research', name: 'Research', description: 'Research and analysis projects', color: '#ff6b6b' },
  { id: 'data-analysis', name: 'Data Analysis', description: 'Data science and analytics', color: '#845ef7' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'DevOps and system administration', color: '#20c997' },
  { id: 'content', name: 'Content', description: 'Content creation and documentation', color: '#fd7e14' },
];

export const DEFAULT_EVENT_COLOR = '#0394ff';
export const DEFAULT_REMINDER_MINUTES = 15;
export const DEFAULT_EVENT_START_TIME = '09:00';