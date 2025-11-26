import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  X, 
  MoreHorizontal,
  ChevronDown,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useI18n } from '../utils/i18n/context';
import { eventsApi } from '../services/eventsAdapter';
import { tasksApi } from '../utils/mockApi';
import { toast } from 'sonner';

interface EventType {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  type: string;
  attendees?: string[];
}

// Event type definitions with colors
const EVENT_TYPES = {
  meeting: { label: 'Meeting', color: '#0394ff', icon: '👥' },
  review: { label: 'Review', color: '#ff6b6b', icon: '📝' },
  planning: { label: 'Planning', color: '#51cf66', icon: '📋' },
  presentation: { label: 'Presentation', color: '#ffd43b', icon: '🎯' },
  deadline: { label: 'Deadline', color: '#ff8cc8', icon: '⏰' },
  training: { label: 'Training', color: '#845ef7', icon: '📚' },
  workshop: { label: 'Workshop', color: '#20c997', icon: '🛠️' },
  social: { label: 'Social', color: '#fab005', icon: '🎉' }
} as const;

interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  count: number;
  type: keyof typeof EVENT_TYPES;
}

interface CalendarEvent extends EventType {
  color: string;
  displayTime: string;
}

interface CalendarProps {
  currentUser?: any;
}

export function Calendar({ currentUser }: CalendarProps) {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Calendar categories state
  const [categories, setCategories] = useState<CalendarCategory[]>([
    { id: '1', name: 'Meetings', color: EVENT_TYPES.meeting.color, enabled: true, count: 0, type: 'meeting' },
    { id: '2', name: 'Reviews', color: EVENT_TYPES.review.color, enabled: true, count: 0, type: 'review' },
    { id: '3', name: 'Planning', color: EVENT_TYPES.planning.color, enabled: true, count: 0, type: 'planning' },
    { id: '4', name: 'Presentations', color: EVENT_TYPES.presentation.color, enabled: true, count: 0, type: 'presentation' },
    { id: '5', name: 'Deadlines', color: EVENT_TYPES.deadline.color, enabled: true, count: 0, type: 'deadline' },
    { id: '6', name: 'Training', color: EVENT_TYPES.training.color, enabled: true, count: 0, type: 'training' },
    { id: '7', name: 'Workshops', color: EVENT_TYPES.workshop.color, enabled: true, count: 0, type: 'workshop' },
    { id: '8', name: 'Social', color: EVENT_TYPES.social.color, enabled: true, count: 0, type: 'social' }
  ]);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '10:00',
    location: '',
    type: 'meeting' as keyof typeof EVENT_TYPES,
    attendees: [] as string[]
  });

  useEffect(() => {
    loadCalendarData();
  }, [currentUser]);

  const loadCalendarData = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [eventsData, tasksData] = await Promise.all([
        eventsApi.getEvents(),
        tasksApi.getTasks()
      ]);
      
      // Transform events with colors based on type
      const transformedEvents: CalendarEvent[] = eventsData.map((event: EventType) => {
        const eventType = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES] || EVENT_TYPES.meeting;
        
        // Parse time from ISO string without timezone conversion
        const startTime = event.start_date.split('T')[1]?.slice(0, 5) || '09:00';
        const endTime = event.end_date.split('T')[1]?.slice(0, 5) || '10:00';
        
        return {
          ...event,
          color: eventType.color,
          displayTime: `${startTime} - ${endTime}`
        };
      });
      
      setEvents(transformedEvents);
      setTasks(tasksData);
      
      // Update category counts
      const updatedCategories = categories.map(cat => ({
        ...cat,
        count: transformedEvents.filter(e => e.type === cat.type).length
      }));
      setCategories(updatedCategories);
      
      toast.success('Calendar data loaded');
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date, hour?: number) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Filter by enabled categories
    const enabledTypes = categories.filter(c => c.enabled).map(c => c.type);
    
    let filteredEvents = events.filter(event => {
      const eventDate = event.start_date.split('T')[0];
      return eventDate === dateString && enabledTypes.includes(event.type);
    });

    // If hour is specified, filter by that hour
    if (hour !== undefined) {
      filteredEvents = filteredEvents.filter(event => {
        const eventTime = event.start_date.split('T')[1];
        const eventHour = eventTime ? parseInt(eventTime.slice(0, 2)) : 0;
        return eventHour === hour;
      });
    }

    return filteredEvents;
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start_date) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setLoading(true);
    try {
      // Create local datetime strings without timezone conversion
      const startDateTime = `${newEvent.start_date}T${newEvent.start_time}:00`;
      const endDateTime = `${newEvent.end_date || newEvent.start_date}T${newEvent.end_time}:00`;
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || '',
        project_id: '1',
        creator_id: currentUser?.id || '1',
        start_date: startDateTime,
        end_date: endDateTime,
        attendees: newEvent.attendees,
        location: newEvent.location || '',
        type: newEvent.type as any
      };

      await eventsApi.createEvent(eventData);
      await loadCalendarData();
      
      setIsNewEventDialogOpen(false);
      resetNewEventForm();
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      // Create local datetime strings without timezone conversion
      const startDateTime = `${newEvent.start_date}T${newEvent.start_time}:00`;
      const endDateTime = `${newEvent.end_date || newEvent.start_date}T${newEvent.end_time}:00`;
      
      const updatedData = {
        ...selectedEvent,
        start_date: startDateTime,
        end_date: endDateTime,
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        type: newEvent.type as any,
        attendees: newEvent.attendees
      };

      await eventsApi.updateEvent(selectedEvent.id, updatedData);
      await loadCalendarData();
      
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      setEditMode(false);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      await eventsApi.deleteEvent(selectedEvent.id);
      await loadCalendarData();
      
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDoubleClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // Parse the date without timezone conversion
    const startDate = event.start_date.split('T')[0];
    const startTime = event.start_date.split('T')[1]?.slice(0, 5) || '09:00';
    const endDate = event.end_date.split('T')[0];
    const endTime = event.end_date.split('T')[1]?.slice(0, 5) || '10:00';
    
    setNewEvent({
      title: event.title,
      description: event.description || '',
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      location: event.location || '',
      type: event.type,
      attendees: event.attendees || []
    });
    setIsEventDialogOpen(true);
    setEditMode(false);
  };

  const resetNewEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      start_date: '',
      start_time: '09:00',
      end_date: '',
      end_time: '10:00',
      location: '',
      type: 'meeting',
      attendees: []
    });
  };

  const weekDates = getCurrentWeekDates();
  
  const getDisplayRange = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      return `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="flex h-full bg-[#181c28]">
      {/* Left Sidebar - My Calendar */}
      <div className="w-64 bg-[#1e2235] border-r border-[#3d4457] p-4 overflow-y-auto taskflow-scrollbar">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">My Calendar</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
              onClick={() => {
                setIsNewEventDialogOpen(true);
                resetNewEventForm();
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center space-x-2 group p-2 rounded hover:bg-[#292d39] transition-colors cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <Checkbox
                  checked={category.enabled}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="data-[state=checked]:bg-[#0394ff] data-[state=checked]:border-[#0394ff]"
                />
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-[#e2e8f0] flex-1">{category.name}</span>
                {category.count > 0 && (
                  <Badge variant="secondary" className="bg-[#292d39] text-[#838a9c] text-xs h-5 px-2">
                    {category.count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="border-t border-[#3d4457] pt-4 mt-4">
          <h4 className="text-[#838a9c] text-xs mb-3">EVENT TYPES</h4>
          <div className="space-y-2">
            {Object.entries(EVENT_TYPES).map(([type, info]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <span className="text-sm">{info.icon}</span>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-[#838a9c]">{info.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-[#181c28]">
        {/* Header */}
        <div className="bg-[#292d39] border-b border-[#3d4457] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white">Calendar</h1>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('prev')}
                  className="h-8 w-8 p-0 border-[#4a5568] hover:bg-[#3d4457] text-[#838a9c]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToToday}
                  className="px-3 py-1 text-sm border-[#4a5568] hover:bg-[#3d4457] text-[#838a9c]"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('next')}
                  className="h-8 w-8 p-0 border-[#4a5568] hover:bg-[#3d4457] text-[#838a9c]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-lg text-white">{getDisplayRange()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#4a5568] text-[#838a9c] hover:bg-[#3d4457]">
                    {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#292d39] border-[#3d4457]">
                  <DropdownMenuItem 
                    onClick={() => setViewMode('day')}
                    className="text-[#e2e8f0] hover:bg-[#3d4457] cursor-pointer"
                  >
                    Day
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setViewMode('week')}
                    className="text-[#e2e8f0] hover:bg-[#3d4457] cursor-pointer"
                  >
                    Week
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setViewMode('month')}
                    className="text-[#e2e8f0] hover:bg-[#3d4457] cursor-pointer"
                  >
                    Month
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                onClick={() => {
                  setIsNewEventDialogOpen(true);
                  resetNewEventForm();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-auto bg-[#1a1f2e] taskflow-scrollbar">
          {viewMode === 'month' ? (
            <MonthView 
              currentDate={currentDate}
              events={events}
              categories={categories}
              onEventClick={handleEventDoubleClick}
              onDateClick={(date) => {
                setNewEvent({
                  ...newEvent,
                  start_date: date.toISOString().split('T')[0],
                  start_time: '09:00',
                  end_time: '10:00'
                });
                setIsNewEventDialogOpen(true);
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-8 border-b border-[#3d4457]">
                <div className="p-4 border-r border-[#3d4457]"></div>
                
                {viewMode === 'week' && weekDates.map((date, index) => {
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dayNumber = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={index} className="p-4 text-center border-r border-[#3d4457]">
                      <div className="text-xs text-[#838a9c]">{dayName}</div>
                      <div className={`text-sm mt-1 ${isToday ? 'text-[#0394ff]' : 'text-[#e2e8f0]'}`}>
                        {dayNumber < 10 ? `0${dayNumber}` : dayNumber}/{monthName.slice(0, 2)}
                      </div>
                    </div>
                  );
                })}

                {viewMode === 'day' && (
                  <div className="col-span-7 p-4 text-center border-r border-[#3d4457]">
                    <div className="text-xs text-[#838a9c]">
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                    </div>
                    <div className="text-lg mt-1 text-[#0394ff]">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-8">
                <div className="border-r border-[#3d4457]">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <div key={hour} className="h-16 p-2 border-b border-[#2a3041] text-right">
                      <span className="text-xs text-[#838a9c]">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {viewMode === 'week' && weekDates.map((date, dayIndex) => {
                  return (
                    <div key={dayIndex} className="border-r border-[#3d4457]">
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                        const hourEvents = getEventsForDate(date, hour);

                        return (
                          <div 
                            key={hour} 
                            className="h-16 border-b border-[#2a3041] p-1 hover:bg-[#292d39] cursor-pointer relative"
                            onClick={() => {
                              const dateString = date.toISOString().split('T')[0];
                              const timeString = `${hour.toString().padStart(2, '0')}:00`;
                              setNewEvent({
                                ...newEvent,
                                start_date: dateString,
                                start_time: timeString,
                                end_time: `${(hour + 1).toString().padStart(2, '0')}:00`
                              });
                              setIsNewEventDialogOpen(true);
                            }}
                          >
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-2 mb-1 rounded text-white cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
                                style={{ backgroundColor: event.color }}
                                title={`${event.title} - ${event.displayTime}\nDouble-click to view/edit`}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleEventDoubleClick(event);
                                }}
                              >
                                <span>{EVENT_TYPES[event.type]?.icon || '📅'}</span>
                                <span className="truncate flex-1">{event.title}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {viewMode === 'day' && (
                  <div className="col-span-7 border-r border-[#3d4457]">
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                      const hourEvents = getEventsForDate(currentDate, hour);

                      return (
                        <div 
                          key={hour} 
                          className="h-16 border-b border-[#2a3041] p-1 hover:bg-[#292d39] cursor-pointer relative"
                          onClick={() => {
                            const dateString = currentDate.toISOString().split('T')[0];
                            const timeString = `${hour.toString().padStart(2, '0')}:00`;
                            setNewEvent({
                              ...newEvent,
                              start_date: dateString,
                              start_time: timeString,
                              end_time: `${(hour + 1).toString().padStart(2, '0')}:00`
                            });
                            setIsNewEventDialogOpen(true);
                          }}
                        >
                          {hourEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-2 mb-1 rounded text-white cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
                              style={{ backgroundColor: event.color }}
                              title={`${event.title} - ${event.displayTime}\nDouble-click to view/edit`}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleEventDoubleClick(event);
                              }}
                            >
                              <span>{EVENT_TYPES[event.type]?.icon || '📅'}</span>
                              <span className="truncate flex-1">{event.title}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View/Edit Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
        setIsEventDialogOpen(open);
        if (!open) {
          setSelectedEvent(null);
          setEditMode(false);
        }
      }}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{EVENT_TYPES[selectedEvent?.type || 'meeting']?.icon}</span>
              {editMode ? 'Edit Event' : 'Event Details'}
            </DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              {editMode ? 'Update event information' : 'View event details'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-[#3d4457] w-full">
              <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-[#0394ff]">
                <Eye className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex-1 data-[state=active]:bg-[#0394ff]" onClick={() => setEditMode(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {selectedEvent && (
                <>
                  <div>
                    <Label className="text-[#838a9c] text-sm">Title</Label>
                    <div className="text-white mt-1">{selectedEvent.title}</div>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Description</Label>
                    <div className="text-white mt-1">{selectedEvent.description || 'No description'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#838a9c] text-sm">Type</Label>
                      <Badge 
                        className="mt-1" 
                        style={{ backgroundColor: selectedEvent.color }}
                      >
                        {EVENT_TYPES[selectedEvent.type]?.label || selectedEvent.type}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-sm">Location</Label>
                      <div className="text-white mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedEvent.location || 'No location'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#838a9c] text-sm">Start</Label>
                      <div className="text-white mt-1">
                        {new Date(selectedEvent.start_date).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-sm">End</Label>
                      <div className="text-white mt-1">
                        {new Date(selectedEvent.end_date).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={handleDeleteEvent}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <EventForm
                event={newEvent}
                onChange={setNewEvent}
                onSave={handleUpdateEvent}
                onCancel={() => {
                  setEditMode(false);
                  setIsEventDialogOpen(false);
                }}
                loading={loading}
                isEditMode={true}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              Add a new event to your calendar
            </DialogDescription>
          </DialogHeader>
          
          <EventForm
            event={newEvent}
            onChange={setNewEvent}
            onSave={handleCreateEvent}
            onCancel={() => setIsNewEventDialogOpen(false)}
            loading={loading}
            isEditMode={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Event Form Component
interface EventFormProps {
  event: any;
  onChange: (event: any) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isEditMode: boolean;
}

function EventForm({ event, onChange, onSave, onCancel, loading, isEditMode }: EventFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white mb-2">Event Title *</Label>
        <Input
          value={event.title}
          onChange={(e) => onChange({ ...event, title: e.target.value })}
          placeholder="Enter event title"
          className="bg-[#3d4457] border-[#4a5568] text-white"
        />
      </div>
      
      <div>
        <Label className="text-white mb-2">Description</Label>
        <Textarea
          value={event.description}
          onChange={(e) => onChange({ ...event, description: e.target.value })}
          placeholder="Enter event description"
          className="bg-[#3d4457] border-[#4a5568] text-white"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-white mb-2">Event Type *</Label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(EVENT_TYPES).map(([type, info]) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ ...event, type })}
              className={`p-3 rounded-lg border-2 transition-all ${
                event.type === type
                  ? 'border-white'
                  : 'border-transparent hover:border-[#3d4457]'
              }`}
              style={{ 
                backgroundColor: event.type === type ? info.color : `${info.color}30`,
                color: 'white'
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-xs">{info.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white mb-2">Start Date *</Label>
          <Input
            type="date"
            value={event.start_date}
            onChange={(e) => onChange({ ...event, start_date: e.target.value })}
            className="bg-[#3d4457] border-[#4a5568] text-white"
          />
        </div>
        <div>
          <Label className="text-white mb-2">Start Time *</Label>
          <Input
            type="time"
            value={event.start_time}
            onChange={(e) => onChange({ ...event, start_time: e.target.value })}
            className="bg-[#3d4457] border-[#4a5568] text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white mb-2">End Date</Label>
          <Input
            type="date"
            value={event.end_date || event.start_date}
            onChange={(e) => onChange({ ...event, end_date: e.target.value })}
            className="bg-[#3d4457] border-[#4a5568] text-white"
          />
        </div>
        <div>
          <Label className="text-white mb-2">End Time</Label>
          <Input
            type="time"
            value={event.end_time}
            onChange={(e) => onChange({ ...event, end_time: e.target.value })}
            className="bg-[#3d4457] border-[#4a5568] text-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-white mb-2">Location</Label>
        <Input
          value={event.location}
          onChange={(e) => onChange({ ...event, location: e.target.value })}
          placeholder="Enter location or meeting link"
          className="bg-[#3d4457] border-[#4a5568] text-white"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={loading || !event.title || !event.start_date}
          className="flex-1 bg-[#0394ff] hover:bg-[#0570cd] text-white"
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
        </Button>
      </div>
    </div>
  );
}

// Month View Component
interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

function MonthView({ currentDate, events, categories, onEventClick, onDateClick }: MonthViewProps) {
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthDays = getMonthDays();
  const weeks = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  const getEventsForDay = (date: Date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const enabledTypes = categories.filter(c => c.enabled).map(c => c.type);
    
    return events.filter(event => {
      const eventDate = event.start_date.split('T')[0];
      return eventDate === dateString && enabledTypes.includes(event.type as keyof typeof EVENT_TYPES);
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#3d4457]">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-3 text-center border-r border-[#3d4457] text-xs text-[#838a9c] last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-[#3d4457]">
            {week.map((date, dayIndex) => {
              const dayEvents = getEventsForDay(date);
              const today = isToday(date);
              const currentMonth = isCurrentMonth(date);

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[120px] p-2 border-r border-[#3d4457] last:border-r-0 cursor-pointer hover:bg-[#292d39] transition-colors ${
                    !currentMonth ? 'bg-[#1a1f2e]/50' : ''
                  }`}
                  onClick={() => onDateClick(date)}
                >
                  <div className={`text-sm mb-2 ${
                    today 
                      ? 'w-7 h-7 bg-[#0394ff] rounded-full flex items-center justify-center text-white'
                      : currentMonth
                      ? 'text-[#e2e8f0]'
                      : 'text-[#838a9c]'
                  }`}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 flex items-center gap-1"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        title={`${event.title} - ${event.displayTime}`}
                      >
                        <span className="text-[10px]">{EVENT_TYPES[event.type as keyof typeof EVENT_TYPES]?.icon || '📅'}</span>
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-[#838a9c] pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
