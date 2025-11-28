import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  backendToFrontend,
  frontendToBackend,
  eventsApi,
  type FrontendEvent,
} from './eventsAdapter';
import { eventsApi as realEventsApi, type CalendarEvent } from './api';

// Mock the real events API
vi.mock('./api', () => ({
  eventsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Events Adapter', () => {
  const mockBackendEvent: CalendarEvent = {
    eventID: 'event-123',
    siteID: 'site-123',
    title: 'Team Meeting',
    description: 'Weekly standup',
    type: 'meeting',
    date: '2025-01-26T00:00:00',
    startTime: '09:00:00',
    endTime: '10:30:00',
    location: 'Room A',
    attendees: 'user1@example.com, user2@example.com',
    createdBy: 'user-123',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-26T00:00:00Z',
  };

  const mockFrontendEvent: FrontendEvent = {
    id: 'event-123',
    title: 'Team Meeting',
    description: 'Weekly standup',
    start_date: '2025-01-26T09:00:00',
    end_date: '2025-01-26T10:30:00',
    location: 'Room A',
    type: 'meeting',
    attendees: ['user1@example.com', 'user2@example.com'],
    creator_id: 'user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('backendToFrontend', () => {
    it('should convert backend event to frontend format', () => {
      const result = backendToFrontend(mockBackendEvent);

      expect(result.id).toBe('event-123');
      expect(result.title).toBe('Team Meeting');
      expect(result.description).toBe('Weekly standup');
      expect(result.start_date).toBe('2025-01-26T09:00:00');
      expect(result.end_date).toBe('2025-01-26T10:30:00');
      expect(result.location).toBe('Room A');
      expect(result.type).toBe('meeting');
      expect(result.attendees).toEqual(['user1@example.com', 'user2@example.com']);
      expect(result.creator_id).toBe('user-123');
    });

    it('should handle missing optional fields', () => {
      const minimalEvent: CalendarEvent = {
        eventID: 'event-456',
        siteID: 'site-123',
        title: 'Simple Event',
        type: 'task',
        date: '2025-02-01T00:00:00',
        createdBy: 'user-456',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-26T00:00:00Z',
      };

      const result = backendToFrontend(minimalEvent);

      expect(result.id).toBe('event-456');
      expect(result.title).toBe('Simple Event');
      expect(result.description).toBeUndefined();
      expect(result.start_date).toBe('2025-02-01T00:00:00');
      expect(result.end_date).toBe('2025-02-01T00:00:00');
      expect(result.location).toBeUndefined();
      expect(result.attendees).toEqual([]);
    });

    it('should handle time with milliseconds', () => {
      const eventWithMs: CalendarEvent = {
        ...mockBackendEvent,
        startTime: '14:30:00.1234567',
        endTime: '15:45:00.9876543',
      };

      const result = backendToFrontend(eventWithMs);

      expect(result.start_date).toBe('2025-01-26T14:30:00');
      expect(result.end_date).toBe('2025-01-26T15:45:00');
    });

    it('should handle single digit hours', () => {
      const eventWithSingleDigit: CalendarEvent = {
        ...mockBackendEvent,
        startTime: '8:30:00',
        endTime: '9:00:00',
      };

      const result = backendToFrontend(eventWithSingleDigit);

      expect(result.start_date).toBe('2025-01-26T08:30:00');
      expect(result.end_date).toBe('2025-01-26T09:00:00');
    });
  });

  describe('frontendToBackend', () => {
    it('should convert frontend data to backend format', () => {
      const frontendData = {
        title: 'New Meeting',
        description: 'Planning session',
        start_date: '2025-02-01',
        start_time: '10:00',
        end_time: '11:30',
        location: 'Room B',
        type: 'meeting',
        attendees: ['user1@example.com', 'user2@example.com'],
        color: '#ff6b6b',
      };

      const result = frontendToBackend(frontendData);

      expect(result.title).toBe('New Meeting');
      expect(result.description).toBe('Planning session');
      expect(result.date).toBe('2025-02-01T00:00:00');
      expect(result.startTime).toBe('10:00:00');
      expect(result.endTime).toBe('11:30:00');
      expect(result.location).toBe('Room B');
      expect(result.type).toBe('meeting');
      expect(result.attendees).toBe('user1@example.com, user2@example.com');
      expect(result.color).toBe('#ff6b6b');
    });

    it('should use default values for missing fields', () => {
      const minimalData = {
        title: 'Quick Event',
        start_date: '2025-03-15',
      };

      const result = frontendToBackend(minimalData);

      expect(result.title).toBe('Quick Event');
      expect(result.description).toBe('');
      expect(result.date).toBe('2025-03-15T00:00:00');
      expect(result.startTime).toBe('09:00:00');
      expect(result.endTime).toBe('10:00:00');
      expect(result.location).toBe('');
      expect(result.type).toBe('meeting');
      expect(result.attendees).toBe('');
      expect(result.color).toBe('#0394ff');
    });

    it('should handle empty attendees array', () => {
      const dataWithEmptyAttendees = {
        title: 'Solo Event',
        start_date: '2025-04-01',
        attendees: [],
      };

      const result = frontendToBackend(dataWithEmptyAttendees);

      expect(result.attendees).toBe('');
    });
  });

  describe('eventsApi adapter', () => {
    describe('getEvents', () => {
      it('should fetch and convert events to frontend format', async () => {
        vi.mocked(realEventsApi.getAll).mockResolvedValue([mockBackendEvent]);

        const result = await eventsApi.getEvents();

        expect(realEventsApi.getAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('event-123');
        expect(result[0].start_date).toBe('2025-01-26T09:00:00');
      });

      it('should return empty array if no events', async () => {
        vi.mocked(realEventsApi.getAll).mockResolvedValue([]);

        const result = await eventsApi.getEvents();

        expect(result).toEqual([]);
      });
    });

    describe('createEvent', () => {
      it('should create event with converted data', async () => {
        const frontendData = {
          title: 'New Event',
          start_date: '2025-02-01',
          start_time: '14:00',
          end_time: '15:00',
        };

        vi.mocked(realEventsApi.create).mockResolvedValue(mockBackendEvent);

        const result = await eventsApi.createEvent(frontendData);

        expect(realEventsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Event',
            date: '2025-02-01T00:00:00',
            startTime: '14:00:00',
            endTime: '15:00:00',
          })
        );
        expect(result.id).toBe('event-123');
      });
    });

    describe('updateEvent', () => {
      it('should update event with converted data', async () => {
        const frontendData = {
          title: 'Updated Event',
          start_date: '2025-02-01',
          start_time: '16:00',
          end_time: '17:00',
        };

        vi.mocked(realEventsApi.update).mockResolvedValue({
          ...mockBackendEvent,
          title: 'Updated Event',
        });

        const result = await eventsApi.updateEvent('event-123', frontendData);

        expect(realEventsApi.update).toHaveBeenCalledWith(
          'event-123',
          expect.objectContaining({
            title: 'Updated Event',
            startTime: '16:00:00',
            endTime: '17:00:00',
          })
        );
        expect(result.title).toBe('Updated Event');
      });
    });

    describe('deleteEvent', () => {
      it('should delete event', async () => {
        vi.mocked(realEventsApi.delete).mockResolvedValue(undefined);

        await eventsApi.deleteEvent('event-123');

        expect(realEventsApi.delete).toHaveBeenCalledWith('event-123');
      });
    });
  });
});
