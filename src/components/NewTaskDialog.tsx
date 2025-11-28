import { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import {
  X,
  Save,
  FileText,
  Target,
  MessageSquare,
  Paperclip,
  GitBranch,
  CalendarDays,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import {
  tasksApi,
  projectsApi,
  usersApi
} from '../services/api';
import { toast } from 'sonner';

interface NewTaskDialogProps {
  currentUser: any;
  onTaskCreated: (task: any) => void;
  onCancel: () => void;
  projectId?: string; // Optional project ID to lock the project selector
  defaultPhase?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  project_id: string;
  phase: string;
  status: string;
  priority: string;
  assignee_id: string;
  start_date: string;
  start_time: string;
  due_date: string;
  due_time: string;
  estimated_hours: number;
}

export function NewTaskDialog({ currentUser, onTaskCreated, onCancel, projectId, defaultPhase }: NewTaskDialogProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('summary');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resizable state - load from localStorage if available
  const [size, setSize] = useState(() => {
    try {
      const savedSize = localStorage.getItem('taskflow-new-task-size');
      if (savedSize) {
        const parsed = JSON.parse(savedSize);
        // Validate the saved size
        if (parsed.width && parsed.height &&
            parsed.width >= 800 && parsed.width <= window.innerWidth - 64 &&
            parsed.height >= 500 && parsed.height <= window.innerHeight - 64) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load saved form size:', error);
    }
    // Default size if no saved size or invalid
    return { width: 1024, height: window.innerHeight * 0.85 };
  });

  // Form data - initialize with defaults
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    project_id: projectId || '',
    phase: defaultPhase || '',
    status: 'todo',
    priority: 'medium',
    assignee_id: currentUser?.userID || '',
    start_date: '',
    start_time: '09:00',
    due_date: '',
    due_time: '17:00',
    estimated_hours: 0
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        projectsApi.getAll(),
        usersApi.getAll()
      ]);

      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!formData.title.trim()) {
        setError('Task title is required');
        return;
      }

      if (!formData.project_id) {
        setError('Project is required');
        return;
      }

      // Prepare task data for creation (using backend camelCase field names)
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectID: formData.project_id,
        phaseID: formData.phase || null,
        assigneeID: formData.assignee_id || null,
        createdBy: currentUser?.userID,
        priority: formData.priority,
        status: formData.status,
        estimatedHours: formData.estimated_hours,
        actualHours: 0,
        dueDate: formData.due_date ? `${formData.due_date}T${formData.due_time}:00Z` : null,
        startDate: formData.start_date ? `${formData.start_date}T${formData.start_time}:00Z` : null,
        progress: 0
      };

      console.log('Creating task:', taskData);

      // Create task via API
      const newTask = await tasksApi.create(taskData);

      setSuccess('Task created successfully!');
      toast.success('Task created successfully!');

      // Call callback with new task
      onTaskCreated(newTask);

      // Close form after a brief delay
      setTimeout(() => {
        onCancel();
      }, 1000);

    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'details', label: 'Details', icon: Target },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'timelog', label: 'Timelog', icon: Clock },
    { id: 'related', label: 'Related Tasks', icon: GitBranch },
    { id: 'events', label: 'Events', icon: CalendarDays }
  ];

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.projectID === projectId || p.id === projectId);
    return project?.name || 'Select Project';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.userID === userId || u.id === userId);
    return user?.name || 'Select User';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#0394ff]" />
            <span className="text-white">Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Resizable
        size={size}
        onResizeStop={(e, direction, ref, d) => {
          const newSize = {
            width: size.width + d.width,
            height: size.height + d.height,
          };
          setSize(newSize);

          // Save to localStorage
          try {
            localStorage.setItem('taskflow-new-task-size', JSON.stringify(newSize));
          } catch (error) {
            console.error('Failed to save form size:', error);
          }
        }}
        minWidth={800}
        minHeight={500}
        maxWidth={window.innerWidth - 64}
        maxHeight={window.innerHeight - 64}
        enable={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
        className="animate-scale-in"
      >
        <Card className="bg-[#292d39] border-[#3d4457] w-full h-full flex flex-col shadow-2xl"
          style={{
            borderWidth: '2px',
            borderColor: '#0394ff',
            boxShadow: '0 0 0 1px rgba(3, 148, 255, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d4457] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#0394ff] rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">New Task</h2>
              <p className="text-sm text-[#838a9c]">Create a new task</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-[#838a9c] hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border-b border-green-500/20 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[#3d4457] flex-shrink-0">
          <nav className="flex space-x-8 px-6 overflow-x-auto taskflow-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0394ff] text-[#0394ff]'
                      : 'border-transparent text-[#838a9c] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content - Fixed height area with scroll */}
        <div className="flex-1 overflow-y-auto taskflow-scrollbar p-6" style={{ minHeight: 0 }}>
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Main Content - 3/4 width */}
              <div className="lg:col-span-3 space-y-6">
                {/* Task Title */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Task Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task title..."
                    className="bg-[#181c28] border-[#3d4457] text-white text-base"
                    autoFocus
                  />
                </div>

                {/* Header Fields - Single Row */}
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Assigned To</Label>
                    <select
                      value={formData.assignee_id}
                      onChange={(e) => handleInputChange('assignee_id', e.target.value)}
                      className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Not set</option>
                      {users.map((user: any) => (
                        <option key={user.userID} value={user.userID}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Phase</Label>
                    <Input
                      value={formData.phase}
                      onChange={(e) => handleInputChange('phase', e.target.value)}
                      placeholder="Phase"
                      className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Priority</Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Start Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date && formData.start_time ? `${formData.start_date}T${formData.start_time}` : ''}
                      onChange={(e) => {
                        const [date, time] = e.target.value.split('T');
                        handleInputChange('start_date', date);
                        handleInputChange('start_time', time);
                      }}
                      className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Due Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.due_date && formData.due_time ? `${formData.due_date}T${formData.due_time}` : ''}
                      onChange={(e) => {
                        const [date, time] = e.target.value.split('T');
                        handleInputChange('due_date', date);
                        handleInputChange('due_time', time);
                      }}
                      className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Estimate (hours)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => handleInputChange('estimated_hours', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-white text-sm mb-2 block">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description..."
                    rows={6}
                    className="bg-[#181c28] border-[#3d4457] text-white text-sm resize-none"
                  />
                </div>
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="space-y-4">
                {/* Quick Properties */}
                <div className="space-y-3">
                  {/* Status */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Project */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">
                      Project *
                      {projectId && <span className="text-[#0394ff] ml-1">(Locked)</span>}
                    </Label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => handleInputChange('project_id', e.target.value)}
                      className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
                      disabled={!!projectId}
                    >
                      <option value="">Select Project</option>
                      {projects.map((project: any) => (
                        <option key={project.projectID} value={project.projectID}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'summary' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[#838a9c]">{activeTab} tab - Coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#3d4457] p-6 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-[#4a5568] text-[#838a9c] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.title.trim() || !formData.project_id}
              className="bg-[#0394ff] hover:bg-[#0570cd]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      </Resizable>
    </div>
  );
}
