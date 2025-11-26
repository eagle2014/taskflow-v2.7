// Calendar Events API - Mock version using localStorage
import { DEFAULT_EVENT_COLOR, DEFAULT_REMINDER_MINUTES, DEFAULT_EVENT_START_TIME } from '../api-constants';
import type { CalendarEvent, CreateEventRequest, UserSession } from '../../types/api-types';

const EVENTS_STORAGE_KEY = 'taskflow_events';
const TASKS_STORAGE_KEY = 'taskflow_tasks';

// Helper to get events from localStorage
const getEventsFromStorage = (): CalendarEvent[] => {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading events from storage:', error);
    return [];
  }
};

// Helper to save events to localStorage
const saveEventsToStorage = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to storage:', error);
  }
};

// Helper to get tasks from localStorage
const getTasksFromStorage = () => {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading tasks from storage:', error);
    return [];
  }
};

export const fetchCalendarEvents = async (session: UserSession): Promise<CalendarEvent[]> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📅 Fetching calendar events for user:', session.user.id);

    const allEvents = getEventsFromStorage();
    
    // Get standalone events
    const standaloneEvents = allEvents.filter(e => 
      e.user_id === session.user.id && !e.task_id
    );

    // Get task-related events
    const allTasks = getTasksFromStorage();
    const userTasks = allTasks.filter(t => t.user_id === session.user.id);
    const taskIds = userTasks.map(t => t.id);

    const taskEvents = allEvents
      .filter(e => e.task_id && taskIds.includes(e.task_id))
      .map(event => ({
        ...event,
        task: userTasks.find(task => task.id === event.task_id) || null
      }));

    const combinedEvents = [...standaloneEvents, ...taskEvents];
    console.log(`✅ Fetched ${combinedEvents.length} events (${standaloneEvents.length} standalone, ${taskEvents.length} task-related)`);
    
    return combinedEvents;
  } catch (error) {
    console.error('❌ Calendar events fetch error:', error);
    throw error;
  }
};

export const createCalendarEvent = async (eventData: CreateEventRequest, session: UserSession): Promise<CalendarEvent> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📅 Creating calendar event:', eventData);

    // If task_id is provided, verify user owns the task
    if (eventData.task_id) {
      const allTasks = getTasksFromStorage();
      const task = allTasks.find(t => t.id === eventData.task_id && t.user_id === session.user.id);

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }
    }

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: eventData.title,
      description: eventData.description || null,
      task_id: eventData.task_id || null,
      type: eventData.type || 'event',
      date: eventData.date,
      start_time: eventData.startTime || DEFAULT_EVENT_START_TIME,
      end_time: eventData.endTime || null,
      location: eventData.location || null,
      attendees: eventData.attendees || null,
      color: eventData.color || DEFAULT_EVENT_COLOR,
      reminder_minutes: eventData.reminder_minutes || DEFAULT_REMINDER_MINUTES,
      user_id: eventData.task_id ? null : session.user.id,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allEvents = getEventsFromStorage();
    allEvents.push(newEvent);
    saveEventsToStorage(allEvents);

    console.log('✅ Calendar event created:', newEvent);
    return newEvent;
  } catch (error) {
    console.error('❌ Calendar event creation error:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (eventId: string, eventData: any, session: UserSession): Promise<CalendarEvent> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📅 Updating calendar event:', eventId);

    const allEvents = getEventsFromStorage();
    const eventIndex = allEvents.findIndex(e => 
      e.id === eventId && (e.user_id === session.user.id || e.created_by === session.user.id)
    );

    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    const updatedEvent = {
      ...allEvents[eventIndex],
      ...eventData,
      updated_at: new Date().toISOString(),
    };

    allEvents[eventIndex] = updatedEvent;
    saveEventsToStorage(allEvents);

    console.log('✅ Calendar event updated:', updatedEvent);
    return updatedEvent;
  } catch (error) {
    console.error('❌ Calendar event update error:', error);
    throw error;
  }
};

export const deleteCalendarEvent = async (eventId: string, session: UserSession): Promise<{ success: boolean }> => {
  try {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    console.log('📅 Deleting calendar event:', eventId);

    const allEvents = getEventsFromStorage();
    const filteredEvents = allEvents.filter(e => 
      !(e.id === eventId && (e.user_id === session.user.id || e.created_by === session.user.id))
    );

    if (filteredEvents.length === allEvents.length) {
      throw new Error('Event not found');
    }

    saveEventsToStorage(filteredEvents);

    console.log('✅ Calendar event deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Calendar event deletion error:', error);
    throw error;
  }
};
