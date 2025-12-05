import { useState, useEffect, useRef } from 'react';
import { X, Search, ExternalLink, ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';

interface CreateEventDialogProps {
  projectId: string;
  onClose: () => void;
  onCreated: (event: any) => void;
}

type SectionId = 'event' | 'reminder' | 'recurrence' | 'related' | 'description' | 'invitees';
type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface Section {
  id: SectionId;
  label: string;
  isOpen: boolean;
}

const DIALOG_SIZE_KEY = 'createevent-dialog-size';
const DIALOG_POSITION_KEY = 'createevent-dialog-position';
const DEFAULT_SIZE = { width: 800, height: 700 };
const MIN_WIDTH = 600;
const MIN_HEIGHT = 500;

export function CreateEventDialog({ projectId, onClose, onCreated }: CreateEventDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Load size from localStorage
  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem(DIALOG_SIZE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SIZE;
    } catch {
      return DEFAULT_SIZE;
    }
  });

  // Load position from localStorage, default to center
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(DIALOG_POSITION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      x: (window.innerWidth - DEFAULT_SIZE.width) / 2,
      y: (window.innerHeight - DEFAULT_SIZE.height) / 2,
    };
  });

  const [activeSection, setActiveSection] = useState<SectionId>('event');
  const [sections, setSections] = useState<Section[]>([
    { id: 'event', label: 'Event Details', isOpen: true },
    { id: 'reminder', label: 'Reminder Details', isOpen: true },
    { id: 'recurrence', label: 'Recurrence Details', isOpen: true },
    { id: 'related', label: 'Related To', isOpen: false },
    { id: 'description', label: 'Description Details', isOpen: false },
    { id: 'invitees', label: 'Invitees', isOpen: false },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    assignedTo: 'tr nguyen',
    startDateTime: '2025-12-03T12:00',
    endDateTime: '2025-12-03T12:30',
    status: 'Planned',
    activityType: 'Call',
    location: '',
    priority: 'High',
    visibility: 'Public',
    allDay: false,
    sendReminder: false,
    reminderBefore: '15',
    isRecurring: false,
    relatedTo: '',
    description: '',
    invitees: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleSection = (sectionId: SectionId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const scrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'The Name field is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreated(formData);
  };

  // Save size/position to localStorage
  useEffect(() => {
    localStorage.setItem(DIALOG_SIZE_KEY, JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem(DIALOG_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height });
  };

  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width - deltaX);
        newX = position.x + (size.width - newWidth);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height - deltaY);
        newY = position.y + (size.height - newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection]);

  // Resize handles - visible border indicators for better UX
  const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    { direction: 'n', className: 'absolute top-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 's', className: 'absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'e', className: 'absolute top-4 bottom-4 right-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'w', className: 'absolute top-4 bottom-4 left-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'ne', className: 'absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'nw', className: 'absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'se', className: 'absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'sw', className: 'absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
  ];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="absolute bg-[#1f2330] rounded-lg shadow-2xl flex flex-col pointer-events-auto border border-[#3d4457]"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#3d4457] cursor-move"
          onMouseDown={handleDragStart}
        >
          <h2 className="text-lg font-semibold text-white">Creating Event :</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#838a9c]" />
              <Input
                placeholder="Type to search"
                className="pl-9 w-64 h-9 text-sm bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c]"
              />
            </div>
            <Button variant="ghost" size="sm" className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Sections Navigation */}
          <div className="w-56 border-r border-[#3d4457] bg-[#292d39] flex flex-col">
            <div className="p-4 border-b border-[#3d4457]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Sections</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#0394ff]">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#0394ff]/20 text-[#0394ff] border-l-2 border-[#0394ff]'
                      : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content - Form */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#1f2330]">
            {/* Event Details Section */}
            <div id="section-event" className="mb-6">
              <button
                onClick={() => toggleSection('event')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'event')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Event Details
              </button>

              {sections.find(s => s.id === 'event')?.isOpen && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> Name
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`mt-1 bg-[#292d39] border-[#3d4457] text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Assigned To */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> Assigned To
                      </Label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => handleChange('assignedTo', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-[#3d4457] rounded-md text-sm bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                      >
                        <option value="tr nguyen">tr nguyen</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date & Time */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> Start Date & Time
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.startDateTime}
                        onChange={(e) => handleChange('startDateTime', e.target.value)}
                        className="mt-1 bg-[#292d39] border-[#3d4457] text-white"
                      />
                    </div>

                    {/* End Date & Time */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> End Date & Time
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.endDateTime}
                        onChange={(e) => handleChange('endDateTime', e.target.value)}
                        className="mt-1 bg-[#292d39] border-[#3d4457] text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> Status
                      </Label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-[#3d4457] rounded-md text-sm bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Held">Held</option>
                        <option value="Not Held">Not Held</option>
                      </select>
                    </div>

                    {/* Activity Type */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">
                        <span className="text-red-500">*</span> Activity Type
                      </Label>
                      <select
                        value={formData.activityType}
                        onChange={(e) => handleChange('activityType', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-[#3d4457] rounded-md text-sm bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                      >
                        <option value="Call">Call</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Mobile Call">Mobile Call</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Location */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">Location</Label>
                      <div className="relative mt-1">
                        <Textarea
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          rows={2}
                          className="resize-none bg-[#292d39] border-[#3d4457] text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 text-[#838a9c]"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">Priority</Label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-[#3d4457] rounded-md text-sm bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Visibility */}
                    <div>
                      <Label className="text-sm text-[#838a9c]">Visibility</Label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => handleChange('visibility', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-[#3d4457] rounded-md text-sm bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                      >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>

                    {/* All Day */}
                    <div className="flex items-center gap-2 pt-6">
                      <Label className="text-sm text-[#838a9c]">All day</Label>
                      <Checkbox
                        checked={formData.allDay}
                        onCheckedChange={(checked) => handleChange('allDay', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Details Section */}
            <div id="section-reminder" className="mb-6">
              <button
                onClick={() => toggleSection('reminder')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'reminder')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Reminder Details
              </button>

              {sections.find(s => s.id === 'reminder')?.isOpen && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm text-[#838a9c]">Send Email Reminder Before</Label>
                    <Checkbox
                      checked={formData.sendReminder}
                      onCheckedChange={(checked) => handleChange('sendReminder', checked)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recurrence Details Section */}
            <div id="section-recurrence" className="mb-6">
              <button
                onClick={() => toggleSection('recurrence')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'recurrence')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Recurrence Details
              </button>

              {sections.find(s => s.id === 'recurrence')?.isOpen && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm text-[#838a9c]">Recurring event</Label>
                    <Switch
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => handleChange('isRecurring', checked)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Related To Section */}
            <div id="section-related" className="mb-6">
              <button
                onClick={() => toggleSection('related')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'related')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Related To
              </button>

              {sections.find(s => s.id === 'related')?.isOpen && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#838a9c]">Related To</Label>
                    <Input
                      value={formData.relatedTo}
                      onChange={(e) => handleChange('relatedTo', e.target.value)}
                      placeholder="Search for related record..."
                      className="mt-1 bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description Details Section */}
            <div id="section-description" className="mb-6">
              <button
                onClick={() => toggleSection('description')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'description')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Description Details
              </button>

              {sections.find(s => s.id === 'description')?.isOpen && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#838a9c]">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      className="mt-1 bg-[#292d39] border-[#3d4457] text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Invitees Section */}
            <div id="section-invitees" className="mb-6">
              <button
                onClick={() => toggleSection('invitees')}
                className="flex items-center gap-2 text-white font-medium mb-4"
              >
                {sections.find(s => s.id === 'invitees')?.isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Invitees
              </button>

              {sections.find(s => s.id === 'invitees')?.isOpen && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-[#838a9c]">Invitees</Label>
                    <Input
                      value={formData.invitees}
                      onChange={(e) => handleChange('invitees', e.target.value)}
                      placeholder="Add invitees..."
                      className="mt-1 bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#3d4457] bg-[#292d39]">
          <Button
            onClick={handleSubmit}
            className="bg-[#0394ff] hover:bg-[#0570cd] text-white px-6"
          >
            Save
          </Button>
        </div>

        {/* Resize Handles */}
        {resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            className={className}
            onMouseDown={(e) => handleResizeStart(e, direction)}
          />
        ))}
      </div>
    </div>
  );
}
