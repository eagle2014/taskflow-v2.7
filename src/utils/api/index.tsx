// Clean API Index - Exports all API functions
// This is the main entry point for the clean API layer

// Connectivity
export { testConnectivity } from './connectivity';

// Backward compatibility aliases
export { testConnectivity as debugApiConnectivity } from './connectivity';

// Categories  
export { fetchProjectCategories } from './categories';

// Projects
export { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from './projects';

// Tasks
export { 
  fetchTasks, 
  fetchProjectTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from './tasks';

// Events
export { 
  fetchCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from './events';

// Combined helpers
import { fetchCalendarEvents } from './events';
import { fetchTasks } from './tasks';
import type { UserSession } from '../../types/api-types';

export const fetchCalendarData = async (session: UserSession) => {
  try {
    const [events, tasks] = await Promise.all([
      fetchCalendarEvents(session),
      fetchTasks(session)
    ]);

    return {
      events: events || [],
      tasks: tasks || []
    };
  } catch (error) {
    console.error('❌ Calendar data fetch error:', error);
    return {
      events: [],
      tasks: []
    };
  }
};