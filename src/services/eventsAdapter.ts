/**
 * Adapter to convert between backend Events API format and frontend Calendar format
 * Backend uses: date (DateTime) + startTime (TimeSpan) + endTime (TimeSpan)
 * Frontend expects: start_date (ISO string) + end_date (ISO string)
 */

import {
  eventsApi as realEventsApi,
  CalendarEvent as BackendEvent
} from './api';

// Frontend Calendar event format
export interface FrontendEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO datetime string
  end_date: string;   // ISO datetime string
  location?: string;
  type: string;
  attendees?: string[];
  project_id?: string;
  creator_id?: string;
}

// Convert backend TimeSpan format (HH:mm:ss or HH:mm:ss.fffffff) to HH:mm
function timeSpanToTime(timeSpan?: string): string {
  if (!timeSpan) return '00:00';
  const parts = timeSpan.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return '00:00';
}

// Convert backend event to frontend format
export function backendToFrontend(backendEvent: BackendEvent): FrontendEvent {
  // Backend has: date (DateTime), startTime (TimeSpan), endTime (TimeSpan)
  // Frontend needs: start_date (ISO), end_date (ISO)

  const dateOnly = backendEvent.date.split('T')[0]; // Get YYYY-MM-DD
  const startTime = timeSpanToTime(backendEvent.startTime);
  const endTime = timeSpanToTime(backendEvent.endTime);

  return {
    id: backendEvent.eventID,
    title: backendEvent.title,
    description: backendEvent.description,
    start_date: `${dateOnly}T${startTime}:00`,
    end_date: `${dateOnly}T${endTime}:00`,
    location: backendEvent.location,
    type: backendEvent.type,
    attendees: backendEvent.attendees ? backendEvent.attendees.split(',').map(a => a.trim()) : [],
    creator_id: backendEvent.createdBy
  };
}

// Convert frontend event data to backend format for create/update
export function frontendToBackend(frontendData: any): any {
  // Frontend has: start_date (ISO), end_date (ISO), start_time, end_time
  // Backend needs: date (DateTime), startTime (TimeSpan), endTime (TimeSpan)

  const startDate = frontendData.start_date || '';
  const startTime = frontendData.start_time || '09:00';
  const endTime = frontendData.end_time || '10:00';

  return {
    title: frontendData.title,
    description: frontendData.description || '',
    date: `${startDate}T00:00:00`, // Just the date part
    startTime: `${startTime}:00`,  // HH:mm:ss format
    endTime: `${endTime}:00`,      // HH:mm:ss format
    location: frontendData.location || '',
    type: frontendData.type || 'meeting',
    attendees: Array.isArray(frontendData.attendees)
      ? frontendData.attendees.join(', ')
      : '',
    color: frontendData.color || '#0394ff'
  };
}

// Adapted Events API that works with frontend Calendar format
export const eventsApi = {
  async getEvents(): Promise<FrontendEvent[]> {
    const backendEvents = await realEventsApi.getAll();
    return backendEvents.map(backendToFrontend);
  },

  async createEvent(frontendData: any): Promise<FrontendEvent> {
    const backendData = frontendToBackend(frontendData);
    const createdEvent = await realEventsApi.create(backendData);
    return backendToFrontend(createdEvent);
  },

  async updateEvent(id: string, frontendData: any): Promise<FrontendEvent> {
    const backendData = frontendToBackend(frontendData);
    const updatedEvent = await realEventsApi.update(id, backendData);
    return backendToFrontend(updatedEvent);
  },

  async deleteEvent(id: string): Promise<void> {
    await realEventsApi.delete(id);
  }
};