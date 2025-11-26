import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  X,
  Save,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Globe,
  Lock,
  Eye,
  Bell,
  Repeat,
  Camera,
  FileText,
  Plus,
  Video,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
// Note: Event creation temporarily uses demo mode
// TODO: Integrate with real events API when available

interface NewEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  session: any;
}

interface EventForm {
  title: string;
  description: string;
  location: string;
  location_type: 'physical' | 'virtual' | 'hybrid';
  meeting_url: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  timezone: string;
  category: string;
  event_type: string;
  priority: string;
  visibility: string;
  organizer_id: string;
  attendees: string[];
  required_attendees: string[];
  optional_attendees: string[];
  max_attendees: number;
  registration_required: boolean;
  registration_deadline: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  recurrence_end_date: string;
  reminder_time: number;
  notification_enabled: boolean;
  agenda: string;
  materials: string[];
  tags: string[];
  budget: number;
  currency: string;
  notes: string;
}

export function NewEventForm({ isOpen, onClose, onEventCreated, session }: NewEventFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newEvent, setNewEvent] = useState<EventForm>({
    title: '',
    description: '',
    location: '',
    location_type: 'physical',
    meeting_url: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '10:00',
    timezone: 'Asia/Ho_Chi_Minh',
    category: 'Meeting',
    event_type: 'Work',
    priority: 'Medium',
    visibility: 'Team',
    organizer_id: session?.user?.id || 'demo-user-id',
    attendees: [],
    required_attendees: [],
    optional_attendees: [],
    max_attendees: 0,
    registration_required: false,
    registration_deadline: '',
    is_recurring: false,
    recurrence_pattern: 'none',
    recurrence_end_date: '',
    reminder_time: 15,
    notification_enabled: true,
    agenda: '',
    materials: [],
    tags: [],
    budget: 0,
    currency: 'VND',
    notes: ''
  });

  // Mock data
  const categories = [
    'Meeting',
    'Workshop',
    'Training',
    'Conference',
    'Presentation',
    'Review',
    'Brainstorming',
    'Planning',
    'Social',
    'Other'
  ];

  const eventTypes = [
    'Work',
    'Personal',
    'Client',
    'Internal',
    'External',
    'Team Building',
    'All Hands',
    'Interview'
  ];

  const teamMembers = [
    { id: 'demo-user-id', name: 'Demo User', avatar: 'DU', email: 'demo@taskflow.com' },
    { id: 'user-1', name: 'Nguyễn Văn A', avatar: 'NA', email: 'a.nguyen@taskflow.com' },
    { id: 'user-2', name: 'Trần Thị B', avatar: 'TB', email: 'b.tran@taskflow.com' },
    { id: 'user-3', name: 'Lê Văn C', avatar: 'LC', email: 'c.le@taskflow.com' },
    { id: 'user-4', name: 'Phạm Thị D', avatar: 'PD', email: 'd.pham@taskflow.com' },
    { id: 'user-5', name: 'Hoàng Văn E', avatar: 'HE', email: 'e.hoang@taskflow.com' }
  ];

  const timezones = [
    { value: 'Asia/Ho_Chi_Minh', label: '(GMT+7) Ho Chi Minh' },
    { value: 'America/New_York', label: '(GMT-5) New York' },
    { value: 'Europe/London', label: '(GMT+0) London' },
    { value: 'Asia/Tokyo', label: '(GMT+9) Tokyo' },
    { value: 'Australia/Sydney', label: '(GMT+11) Sydney' }
  ];

  const currencies = [
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  if (!isOpen) return null;

  const handleCreateEvent = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate required fields
    if (!newEvent.title.trim()) {
      setError('Vui lòng nhập tên sự kiện');
      return;
    }

    if (!newEvent.start_date || !newEvent.start_time) {
      setError('Vui lòng chọn ngày và giờ bắt đầu');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        ...newEvent,
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        start_datetime: `${newEvent.start_date}T${newEvent.start_time}:00`,
        end_datetime: newEvent.end_date && newEvent.end_time 
          ? `${newEvent.end_date}T${newEvent.end_time}:00`
          : `${newEvent.start_date}T${newEvent.end_time}:00`,
        created_by: session?.user?.id || 'demo-user-id'
      };

      console.log('Creating event with data:', eventData);

      // Use real API if authenticated
      if (session?.access_token && session.access_token !== 'demo-token') {
        // TODO: Integrate with real events API when backend endpoint is ready
        // await eventsApi.createEvent(session.access_token, eventData);
        console.log('Event creation via API not yet implemented - using demo mode');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('Demo mode - simulating event creation');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSuccess('✅ Event đã được tạo thành công!');
      onEventCreated();

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);

    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(`Có lỗi xảy ra khi tạo event: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      location_type: 'physical',
      meeting_url: '',
      start_date: '',
      start_time: '09:00',
      end_date: '',
      end_time: '10:00',
      timezone: 'Asia/Ho_Chi_Minh',
      category: 'Meeting',
      event_type: 'Work',
      priority: 'Medium',
      visibility: 'Team',
      organizer_id: session?.user?.id || 'demo-user-id',
      attendees: [],
      required_attendees: [],
      optional_attendees: [],
      max_attendees: 0,
      registration_required: false,
      registration_deadline: '',
      is_recurring: false,
      recurrence_pattern: 'none',
      recurrence_end_date: '',
      reminder_time: 15,
      notification_enabled: true,
      agenda: '',
      materials: [],
      tags: [],
      budget: 0,
      currency: 'VND',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  const handleAddAttendee = (memberId: string, type: 'required' | 'optional') => {
    if (type === 'required' && !newEvent.required_attendees.includes(memberId)) {
      setNewEvent({
        ...newEvent,
        required_attendees: [...newEvent.required_attendees, memberId],
        attendees: [...new Set([...newEvent.attendees, memberId])]
      });
    } else if (type === 'optional' && !newEvent.optional_attendees.includes(memberId)) {
      setNewEvent({
        ...newEvent,
        optional_attendees: [...newEvent.optional_attendees, memberId],
        attendees: [...new Set([...newEvent.attendees, memberId])]
      });
    }
  };

  const handleRemoveAttendee = (memberId: string) => {
    setNewEvent({
      ...newEvent,
      required_attendees: newEvent.required_attendees.filter(id => id !== memberId),
      optional_attendees: newEvent.optional_attendees.filter(id => id !== memberId),
      attendees: newEvent.attendees.filter(id => id !== memberId)
    });
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <Card 
        className="bg-[#292d39] border-[#3d4457] w-[95vw] max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
        style={{ zIndex: 10000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d4457]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0394ff] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {newEvent.title || 'New Event'}
              </h2>
              <p className="text-[#838a9c] text-sm">
                Tạo sự kiện mới và mời các thành viên tham gia
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateEvent}
              disabled={!newEvent.title.trim() || saving}
              className="bg-[#0394ff] hover:bg-[#0570cd] px-6 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[#838a9c] hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400">{success}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" />
                    Tên sự kiện *
                  </Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nhập tên sự kiện..."
                    className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 text-base">Mô tả</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Thêm mô tả cho sự kiện..."
                    rows={4}
                    className="bg-[#3d4457] border-[#4a5568] text-white text-base resize-none"
                    disabled={saving}
                  />
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-2 text-base">Loại sự kiện</Label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-4 py-3 text-base"
                      disabled={saving}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 text-base">Phân loại</Label>
                    <select
                      value={newEvent.event_type}
                      onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                      className="w-full bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-4 py-3 text-base"
                      disabled={saving}
                    >
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-2 flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4" />
                      Ngày & giờ bắt đầu *
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={newEvent.start_date}
                        onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                      <Input
                        type="time"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2 flex items-center gap-2 text-base">
                      <Clock className="w-4 h-4" />
                      Ngày & giờ kết thúc
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={newEvent.end_date}
                        onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                      <Input
                        type="time"
                        value={newEvent.end_time}
                        onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4" />
                      Loại địa điểm
                    </Label>
                    <select
                      value={newEvent.location_type}
                      onChange={(e) => setNewEvent({ ...newEvent, location_type: e.target.value as 'physical' | 'virtual' | 'hybrid' })}
                      className="w-full bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-4 py-3 text-base"
                      disabled={saving}
                    >
                      <option value="physical">Trực tiếp</option>
                      <option value="virtual">Trực tuyến</option>
                      <option value="hybrid">Kết hợp</option>
                    </select>
                  </div>

                  {(newEvent.location_type === 'physical' || newEvent.location_type === 'hybrid') && (
                    <div>
                      <Label className="text-white mb-2 text-base">Địa điểm</Label>
                      <Input
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Nhập địa chỉ, phòng họp..."
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                    </div>
                  )}

                  {(newEvent.location_type === 'virtual' || newEvent.location_type === 'hybrid') && (
                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2 text-base">
                        <Video className="w-4 h-4" />
                        Link cuộc họp
                      </Label>
                      <Input
                        value={newEvent.meeting_url}
                        onChange={(e) => setNewEvent({ ...newEvent, meeting_url: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                        className="bg-[#3d4457] border-[#4a5568] text-white text-base h-12"
                        disabled={saving}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="border-t border-[#3d4457] pt-6 space-y-6">
                  <div>
                    <Label className="text-white mb-2 text-base">Chương trình sự kiện</Label>
                    <Textarea
                      value={newEvent.agenda}
                      onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                      placeholder="Danh sách các hoạt động, nội dung chính..."
                      rows={3}
                      className="bg-[#3d4457] border-[#4a5568] text-white text-base resize-none"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 text-base">Ghi chú</Label>
                    <Textarea
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      placeholder="Thông tin bổ sung, yêu cầu đặc biệt..."
                      rows={2}
                      className="bg-[#3d4457] border-[#4a5568] text-white text-base resize-none"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Event Summary */}
              <Card className="bg-[#3d4457] border-[#4a5568] p-4">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Summary
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#838a9c] text-sm">Priority</Label>
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityBadgeColor(newEvent.priority)} border mt-1`}
                    >
                      {newEvent.priority}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-[#838a9c] text-sm">Type</Label>
                    <div className="text-white text-sm mt-1">{newEvent.category}</div>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Duration</Label>
                    <div className="text-white text-sm mt-1">
                      {newEvent.start_date && newEvent.start_time && newEvent.end_time ? (
                        `${newEvent.start_time} - ${newEvent.end_time}`
                      ) : (
                        'Not set'
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Location</Label>
                    <div className="text-white text-sm mt-1">
                      {newEvent.location_type === 'virtual' ? 'Online' : 
                       newEvent.location_type === 'hybrid' ? 'Hybrid' : 
                       newEvent.location || 'Physical'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Attendees Management */}
              <Card className="bg-[#3d4457] border-[#4a5568] p-4">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Attendees
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#838a9c] text-sm">Organizer</Label>
                    <select
                      value={newEvent.organizer_id}
                      onChange={(e) => setNewEvent({ ...newEvent, organizer_id: e.target.value })}
                      className="w-full bg-[#292d39] border border-[#4a5568] text-white rounded-lg px-3 py-2 text-sm mt-1"
                      disabled={saving}
                    >
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Team Members</Label>
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                      {teamMembers
                        .filter(member => member.id !== newEvent.organizer_id)
                        .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-[#292d39] rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#0394ff] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">{member.avatar}</span>
                            </div>
                            <div>
                              <div className="text-white text-sm">{member.name}</div>
                              <div className="text-[#838a9c] text-xs">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddAttendee(member.id, 'required')}
                              disabled={newEvent.required_attendees.includes(member.id)}
                              className="text-xs p-1 h-auto text-[#0394ff] hover:text-blue-300"
                            >
                              Required
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddAttendee(member.id, 'optional')}
                              disabled={newEvent.optional_attendees.includes(member.id)}
                              className="text-xs p-1 h-auto text-[#838a9c] hover:text-white"
                            >
                              Optional
                            </Button>
                            {newEvent.attendees.includes(member.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAttendee(member.id)}
                                className="text-xs p-1 h-auto text-red-400 hover:text-red-300"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Settings */}
              <Card className="bg-[#3d4457] border-[#4a5568] p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  {newEvent.visibility === 'Public' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#838a9c] text-sm">Visibility</Label>
                    <select
                      value={newEvent.visibility}
                      onChange={(e) => setNewEvent({ ...newEvent, visibility: e.target.value })}
                      className="w-full bg-[#292d39] border border-[#4a5568] text-white rounded-lg px-3 py-2 text-sm mt-1"
                      disabled={saving}
                    >
                      <option value="Public">Public</option>
                      <option value="Team">Team</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Priority</Label>
                    <select
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
                      className="w-full bg-[#292d39] border border-[#4a5568] text-white rounded-lg px-3 py-2 text-sm mt-1"
                      disabled={saving}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[#838a9c] text-sm">Reminder (minutes before)</Label>
                    <Input
                      type="number"
                      value={newEvent.reminder_time}
                      onChange={(e) => setNewEvent({ ...newEvent, reminder_time: parseInt(e.target.value) || 0 })}
                      className="bg-[#292d39] border-[#4a5568] text-white text-sm h-8 mt-1"
                      min="0"
                      max="1440"
                      disabled={saving}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}