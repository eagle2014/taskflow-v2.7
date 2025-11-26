import { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Checkbox } from './ui/checkbox';
import { LinkTaskDialog } from './LinkTaskDialog';
import { 
  X,
  Save,
  FileText,
  Users,
  Target,
  Calendar,
  Clock,
  Flag,
  Plus,
  MessageSquare,
  Filter,
  CheckSquare,
  Paperclip,
  GitBranch,
  CalendarDays,
  Search,
  Send,
  AtSign,
  MoreHorizontal,
  Eye,
  Activity,
  Timer,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import { 
  tasksApi, 
  projectsApi, 
  usersApi,
  User
} from '../utils/mockApi';
import { toast } from 'sonner';

interface EditTaskFormProps {
  currentUser: any;
  task: any; // Task to edit
  onTaskUpdated: (task: any) => void;
  onCancel: () => void;
  projectId?: string; // Optional project ID to lock the project selector
}

interface SubTask {
  id: string;
  title: string;
  assignee_id: string;
  assignee_name: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: string;
}

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  tagged_users: string[];
  created_at: string;
}

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'linked' | 'status_changed' | 'assigned' | 'commented';
  user_id: string;
  user_name: string;
  user_avatar: string;
  action: string;
  details?: {
    field?: string;
    old_value?: string;
    new_value?: string;
    linked_task?: string;
  };
  created_at: string;
}

interface RelatedTask {
  id: string;
  name: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_to_avatar: string;
  start_date: string;
  due_date: string;
  related_to: string;
  stage: string;
  previous_task: string;
  parent_task: string;
  task_type: string;
  description: string;
  created_by: string;
  sla_name: string;
  resolution_due: string;
}

interface TaskFormData {
  title: string;
  description: string;
  project_id: string;
  parent_task_id: string;
  previous_task_id: string;
  phase: string;
  status: string;
  priority: string;
  assignee_id: string;
  related_to: string;
  start_date: string;
  start_time: string;
  due_date: string;
  due_time: string;
  estimated_hours: number;
  tags: string[];
  watchers: string[];
}

export function EditTaskForm({ currentUser, task, onTaskUpdated, onCancel, projectId }: EditTaskFormProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('summary');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Resizable state - load from localStorage if available
  const [size, setSize] = useState(() => {
    try {
      const savedSize = localStorage.getItem('taskflow-edit-task-size');
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

  // Form data - initialize with task data
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    project_id: task?.project_id || '',
    parent_task_id: task?.parent_task_id || '',
    previous_task_id: task?.previous_task_id || '',
    phase: task?.phase || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignee_id: task?.assignee_id || currentUser?.id || '',
    related_to: task?.related_to || '',
    start_date: task?.start_date ? task.start_date.split('T')[0] : '',
    start_time: task?.start_time || '09:00',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    due_time: task?.due_time || '17:00',
    estimated_hours: task?.estimated_hours || 0,
    tags: task?.tags || [],
    watchers: task?.watchers || []
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([
    {
      id: 'subtask-1',
      title: 'Research competitor solutions',
      assignee_id: currentUser?.id || '1',
      assignee_name: currentUser?.name || 'Current User',
      status: 'done',
      created_at: new Date().toISOString()
    },
    {
      id: 'subtask-2',
      title: 'Create wireframes for main dashboard',
      assignee_id: currentUser?.id || '1',
      assignee_name: currentUser?.name || 'Current User',
      status: 'in-progress',
      created_at: new Date().toISOString()
    },
    {
      id: 'subtask-3',
      title: 'Review design system components',
      assignee_id: currentUser?.id || '1',
      assignee_name: currentUser?.name || 'Current User',
      status: 'todo',
      created_at: new Date().toISOString()
    }
  ]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 'activity-1',
      type: 'linked',
      user_id: 'user-1',
      user_name: 'tr ng',
      user_avatar: 'T',
      action: 'Linked',
      details: {
        linked_task: 'tendo'
      },
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
      id: 'activity-2',
      type: 'updated',
      user_id: 'user-1',
      user_name: 'tr ng',
      user_avatar: 'T',
      action: 'updated',
      details: {
        field: 'Name',
        old_value: 'to233',
        new_value: 'Công tác chuẩn bị dự án'
      },
      created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString() // 9 minutes ago
    },
    {
      id: 'activity-3',
      type: 'updated',
      user_id: 'user-1',
      user_name: 'tr ng',
      user_avatar: 'T',
      action: 'updated',
      details: {},
      created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString() // 9 minutes ago
    },
    {
      id: 'activity-4',
      type: 'created',
      user_id: 'user-1',
      user_name: 'tr ng',
      user_avatar: 'T',
      action: 'Created',
      details: {},
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
    }
  ]);
  
  const [showLinkTaskDialog, setShowLinkTaskDialog] = useState(false);
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([
    {
      id: 'task-rel-1',
      name: 'testo',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '',
      due_date: '',
      related_to: '',
      stage: 'Todo',
      previous_task: '',
      parent_task: '',
      task_type: 'Checklist Item',
      description: '',
      created_by: 'tr ng',
      sla_name: '',
      resolution_due: ''
    }
  ]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        projectsApi.getProjects(),
        usersApi.getUsers()
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);
      
      // Load task comments if available
      if (task?.id) {
        // Mock comments for now
        const mockComments: Comment[] = [
          {
            id: '1',
            author_id: currentUser?.id || '1',
            author_name: currentUser?.name || 'Current User',
            author_avatar: currentUser?.avatar || '',
            content: 'Task is in progress...',
            tagged_users: [],
            created_at: new Date().toISOString()
          }
        ];
        setComments(mockComments);
      }
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

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleWatcherAdd = (userId: string) => {
    if (!formData.watchers.includes(userId)) {
      handleInputChange('watchers', [...formData.watchers, userId]);
    }
  };

  const handleWatcherRemove = (userId: string) => {
    handleInputChange('watchers', formData.watchers.filter(id => id !== userId));
  };

  const handleSubTaskAdd = () => {
    if (newSubTaskTitle.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTaskTitle.trim(),
        assignee_id: currentUser?.id || '',
        assignee_name: currentUser?.name || '',
        status: 'todo',
        created_at: new Date().toISOString()
      };
      setSubTasks([...subTasks, newSubTask]);
      setNewSubTaskTitle('');
    }
  };

  const handleCommentAdd = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author_id: currentUser?.id || '',
        author_name: currentUser?.name || '',
        author_avatar: currentUser?.avatar || '',
        content: newComment.trim(),
        tagged_users: [],
        created_at: new Date().toISOString()
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
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

      // Prepare task data for update
      const taskData = {
        id: task.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_id: formData.project_id,
        assignee_id: formData.assignee_id,
        reporter_id: task.reporter_id || currentUser?.id,
        priority: formData.priority,
        status: formData.status,
        estimated_hours: formData.estimated_hours,
        actual_hours: task.actual_hours || 0,
        due_date: formData.due_date ? `${formData.due_date}T${formData.due_time}:00Z` : null,
        created_at: task.created_at,
        updated_at: new Date().toISOString()
      };

      console.log('Updating task:', taskData);

      // Update task via API
      const updatedTask = await tasksApi.updateTask(task.id, taskData);
      
      setSuccess('Task updated successfully!');
      toast.success('Task updated successfully!');
      
      // Call callback with updated task
      onTaskUpdated(updatedTask);
      
      // Close form after a brief delay
      setTimeout(() => {
        onCancel();
      }, 1000);

    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkTasks = (taskIds: string[]) => {
    // In real app, this would link the selected tasks
    toast.success(`Linked ${taskIds.length} task(s) successfully`);
    
    // Mock: Add linked tasks to related tasks list
    const newLinkedTasks: RelatedTask[] = taskIds.map((taskId, index) => ({
      id: taskId,
      name: `Linked Task ${index + 1}`,
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '',
      due_date: '',
      related_to: '',
      stage: 'Todo',
      previous_task: '',
      parent_task: '',
      task_type: 'Task',
      description: '',
      created_by: 'tr ng',
      sla_name: '',
      resolution_due: ''
    }));
    
    setRelatedTasks([...relatedTasks, ...newLinkedTasks]);
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'details', label: 'Details', icon: Target },
    { id: 'updates', label: 'Updates', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'timelog', label: 'Timelog', icon: Clock },
    { id: 'related', label: 'Related Tasks', icon: GitBranch },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'invoices', label: 'Invoices', icon: FileText }
  ];

  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.name || 'Select Project';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.name || 'Select User';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#0394ff]" />
            <span className="text-white">Loading task data...</span>
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
            localStorage.setItem('taskflow-edit-task-size', JSON.stringify(newSize));
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
        handleStyles={{
          right: {
            width: '8px',
            right: '-4px',
            cursor: 'ew-resize',
          },
          bottom: {
            height: '8px',
            bottom: '-4px',
            cursor: 'ns-resize',
          },
          bottomRight: {
            width: '16px',
            height: '16px',
            right: '-4px',
            bottom: '-4px',
            cursor: 'nwse-resize',
          },
          bottomLeft: {
            width: '16px',
            height: '16px',
            left: '-4px',
            bottom: '-4px',
            cursor: 'nesw-resize',
          },
          topRight: {
            width: '16px',
            height: '16px',
            right: '-4px',
            top: '-4px',
            cursor: 'nesw-resize',
          },
          topLeft: {
            width: '16px',
            height: '16px',
            left: '-4px',
            top: '-4px',
            cursor: 'nwse-resize',
          },
          top: {
            height: '8px',
            top: '-4px',
            cursor: 'ns-resize',
          },
          left: {
            width: '8px',
            left: '-4px',
            cursor: 'ew-resize',
          },
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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Edit Task</h2>
              <p className="text-sm text-[#838a9c]">Update task information</p>
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
              <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
                {/* Header Fields - Single Row */}
                <div className="grid grid-cols-6 gap-3 flex-shrink-0">
                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Assigned To</Label>
                    <select
                      value={formData.assignee_id}
                      onChange={(e) => handleInputChange('assignee_id', e.target.value)}
                      className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Not set</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Previous Task</Label>
                    <select
                      value={formData.previous_task_id}
                      onChange={(e) => handleInputChange('previous_task_id', e.target.value)}
                      className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Not set</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <Label className="text-[#838a9c] text-xs mb-1 block">Parent Task</Label>
                    <select
                      value={formData.parent_task_id}
                      onChange={(e) => handleInputChange('parent_task_id', e.target.value)}
                      className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Not set</option>
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
                    <Label className="text-[#838a9c] text-xs mb-1 block">Related To</Label>
                    <Input
                      value={formData.related_to}
                      onChange={(e) => handleInputChange('related_to', e.target.value)}
                      placeholder="Not set"
                      className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Add Description */}
                <div className="flex-shrink-0">
                  <Label className="text-white text-sm mb-2 block">Add Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description..."
                    rows={3}
                    className="bg-[#181c28] border-[#3d4457] text-white text-sm resize-none"
                  />
                </div>

                {/* Subtasks */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white text-sm">Subtasks</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#838a9c] hover:text-white text-xs h-auto py-1 px-2"
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#838a9c] hover:text-white text-xs h-auto py-1 px-2"
                      >
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0394ff] hover:text-[#0570cd] text-xs h-auto py-1 px-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Section
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-[#181c28] border border-[#3d4457] rounded-lg">
                    {/* Subtasks List */}
                    {subTasks.length > 0 && (
                      <div className="divide-y divide-[#3d4457]">
                        {subTasks.map((subtask, index) => (
                          <div key={subtask.id} className="flex items-center gap-2 p-2 hover:bg-[#292d39] group">
                            {/* Checkbox */}
                            <Checkbox 
                              id={`subtask-${subtask.id}`}
                              checked={subtask.status === 'done'}
                              onCheckedChange={(checked) => {
                                const updated = [...subTasks];
                                updated[index].status = checked ? 'done' : 'todo';
                                setSubTasks(updated);
                              }}
                              className="border-[#3d4457] data-[state=checked]:bg-[#0394ff] data-[state=checked]:border-[#0394ff]"
                            />
                            
                            {/* Subtask Name - Editable */}
                            <Input
                              value={subtask.title}
                              onChange={(e) => {
                                const updated = [...subTasks];
                                updated[index].title = e.target.value;
                                setSubTasks(updated);
                              }}
                              className="flex-1 bg-transparent border-0 text-white text-xs h-6 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="Subtask name"
                            />
                            
                            {/* Status Badge */}
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] h-5 px-2 border ${
                                subtask.status === 'done' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                subtask.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }`}
                            >
                              {subtask.status === 'in-progress' ? 'In Progress' : subtask.status === 'done' ? 'Done' : 'Todo'}
                            </Badge>
                            
                            {/* Due Date */}
                            <Input
                              type="date"
                              defaultValue=""
                              className="bg-transparent border-0 text-[#838a9c] text-xs h-6 w-28 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="Set due..."
                            />
                            
                            {/* Assignee Avatar */}
                            <div className="w-5 h-5 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0">
                              {subtask.assignee_name?.charAt(0) || 'U'}
                            </div>
                            
                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSubTasks(subTasks.filter((_, i) => i !== index));
                              }}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-[#838a9c] hover:text-red-400 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add New Subtask Input */}
                    <div className="p-2 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#838a9c] flex-shrink-0" />
                      <Input
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSubTaskTitle.trim()) {
                            handleSubTaskAdd();
                          }
                        }}
                        placeholder="Add subtask name and press enter"
                        className="flex-1 bg-transparent border-0 text-white text-xs h-6 px-1 placeholder:text-[#838a9c] focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-white text-sm">Activity</h3>
                    <Button variant="ghost" size="sm" className="text-[#838a9c] text-xs h-auto py-1">
                      <Filter className="w-3 h-3 mr-1" />
                      Filters
                    </Button>
                  </div>
                  
                  {/* Comments List - Scrollable */}
                  <div className="flex-1 overflow-y-auto taskflow-scrollbar mb-3 min-h-0">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8">
                        <div className="text-center text-[#838a9c]">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="text-sm">No activities found</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="w-6 h-6">
                              <div className="w-full h-full bg-[#0394ff] flex items-center justify-center text-white text-xs">
                                {comment.author_avatar || comment.author_name?.charAt(0) || 'U'}
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-[#3d4457] rounded-lg p-2">
                                <div className="text-white text-xs mb-1">{comment.author_name}</div>
                                <p className="text-[#838a9c] text-xs">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comment Input - Fixed at bottom */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Avatar className="w-6 h-6">
                      <div className="w-full h-full bg-[#0394ff] flex items-center justify-center text-white text-xs">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Post a comment and mention @users / @teams to notify"
                        rows={2}
                        className="bg-[#3d4457] border-[#3d4457] text-white text-xs resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleCommentAdd();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - 1/4 width */}
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !formData.title.trim() || !formData.project_id}
                    className="w-full bg-[#0394ff] hover:bg-[#0570cd] disabled:opacity-50 text-sm h-9"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-2" />
                        Update Task
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={saving}
                    className="w-full border-[#4a5568] text-[#838a9c] hover:text-white text-sm h-9"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Quick Properties */}
                <div className="space-y-3">
                  {/* Running Status */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Running Status</Label>
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

                  {/* Estimate */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Estimate</Label>
                    <Input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => handleInputChange('estimated_hours', parseInt(e.target.value) || 0)}
                      className="bg-[#292d39] border-[#292d39] text-white h-auto py-1.5 text-xs"
                      placeholder="Set Estimate"
                    />
                  </div>

                  {/* Priority */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Priority</Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Project */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Project *</Label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => handleInputChange('project_id', e.target.value)}
                      className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Select Project</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timelog */}
                  <div className="bg-[#3d4457] rounded-lg p-3">
                    <Label className="text-[#838a9c] text-xs mb-2 block">Timelog</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[#0394ff] hover:text-[#0570cd] text-xs h-auto py-1 justify-start"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Timelog
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                <Input
                  placeholder="Type to search"
                  className="bg-[#3d4457] border-[#3d4457] text-white pl-10 h-9 text-sm"
                />
              </div>

              {/* Task Details */}
              <Collapsible defaultOpen className="bg-[#292d39] border border-[#3d4457] rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#3d4457] transition-colors">
                  <span className="text-white text-sm">Task Details</span>
                  <ChevronDown className="w-4 h-4 text-[#838a9c]" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Name</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Assigned To</Label>
                      <select
                        value={formData.assignee_id}
                        onChange={(e) => handleInputChange('assignee_id', e.target.value)}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                      >
                        <option value="">Not set</option>
                        {users.map((user: any) => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Start Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.start_date && formData.start_time ? `${formData.start_date}T${formData.start_time}` : ''}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          handleInputChange('start_date', date);
                          handleInputChange('start_time', time);
                        }}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Due Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.due_date && formData.due_time ? `${formData.due_date}T${formData.due_time}` : ''}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          handleInputChange('due_date', date);
                          handleInputChange('due_time', time);
                        }}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Related To</Label>
                      <Input
                        value={formData.related_to}
                        onChange={(e) => handleInputChange('related_to', e.target.value)}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Contact Name</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Stage</Label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Priority</Label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Location</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Milestone</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Previous Task</Label>
                      <select
                        value={formData.previous_task_id}
                        onChange={(e) => handleInputChange('previous_task_id', e.target.value)}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                      >
                        <option value="">None</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Percent Task</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Task Type</Label>
                      <Input 
                        value="Checklist Item"
                        readOnly
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Estimate</Label>
                      <Input
                        type="number"
                        value={formData.estimated_hours}
                        onChange={(e) => handleInputChange('estimated_hours', parseInt(e.target.value) || 0)}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Related Task</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">
                        Project Name
                        {projectId && <span className="text-[#0394ff] ml-1">(Locked)</span>}
                      </Label>
                      <select
                        value={formData.project_id}
                        onChange={(e) => handleInputChange('project_id', e.target.value)}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={!!projectId}
                      >
                        <option value="">Select Project</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Organization Name</Label>
                      <Input defaultValue="" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Modified/Last Id</Label>
                      <Input value={task?.id || ''} className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Description Details */}
              <Collapsible defaultOpen className="bg-[#292d39] border border-[#3d4457] rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#3d4457] transition-colors">
                  <span className="text-white text-sm">Description Details</span>
                  <ChevronDown className="w-4 h-4 text-[#838a9c]" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div>
                    <Label className="text-[#838a9c] text-xs mb-1 block">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="bg-[#3d4457] border-[#3d4457] text-white text-sm resize-none"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* System Details */}
              <Collapsible defaultOpen className="bg-[#292d39] border border-[#3d4457] rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#3d4457] transition-colors">
                  <span className="text-white text-sm">System Details</span>
                  <ChevronDown className="w-4 h-4 text-[#838a9c]" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Estimate vs Subtasks</Label>
                      <Input value={`${formData.estimated_hours}h`} className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Billable Time Spent</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Time Spent</Label>
                      <Input value={`${task?.actual_hours || 0}h`} className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Time Spent on Subtasks</Label>
                      <Input value="0 seconds" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Progress</Label>
                      <Input value={`${task?.progress || 0}%`} className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Actual Completion Date</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Created Time</Label>
                      <Input 
                        value={task?.created_at ? new Date(task.created_at).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Modified Time</Label>
                      <Input 
                        value={task?.updated_at ? new Date(task.updated_at).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Last Modified By</Label>
                      <Input 
                        value={currentUser?.name || 'Unknown'}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Created By</Label>
                      <Input 
                        value={getUserName(task?.reporter_id || '')}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Source</Label>
                      <Input value="CRM" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Task No</Label>
                      <Input 
                        value={task?.id ? `Task${task.id.slice(0, 6)}` : ''}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Service Details */}
              <Collapsible className="bg-[#292d39] border border-[#3d4457] rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#3d4457] transition-colors">
                  <span className="text-white text-sm">Service Details</span>
                  <ChevronDown className="w-4 h-4 text-[#838a9c]" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Is Billable?</Label>
                      <div className="flex items-center gap-2 h-8">
                        <Checkbox id="billable" className="border-[#3d4457]" />
                        <label htmlFor="billable" className="text-white text-sm">Billable</label>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Invoiced</Label>
                      <div className="flex items-center gap-2 h-8">
                        <Checkbox id="invoiced" className="border-[#3d4457]" />
                        <label htmlFor="invoiced" className="text-white text-sm">Invoiced</label>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SLA Information */}
              <Collapsible className="bg-[#292d39] border border-[#3d4457] rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-[#3d4457] transition-colors">
                  <span className="text-white text-sm">SLA Information</span>
                  <ChevronDown className="w-4 h-4 text-[#838a9c]" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">SLA Name</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">SLA Status</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Resolution Due</Label>
                      <Input type="datetime-local" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Resolution Actual</Label>
                      <Input type="datetime-local" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Time Elapsed</Label>
                      <Input value="0s" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">SLA Time Elapsed</Label>
                      <Input value="0s" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {/* Activity Timeline */}
              <div className="relative">
                {activities.map((activity, index) => {
                  const timeAgo = formatTimeAgo(activity.created_at);
                  
                  return (
                    <div key={activity.id} className="relative flex gap-3 pb-6">
                      {/* Timeline line */}
                      {index !== activities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#3d4457]"></div>
                      )}
                      
                      {/* Avatar */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-8 h-8 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-sm">
                          {activity.user_avatar}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">{activity.user_name}</span>
                            <span className="text-[#838a9c] text-xs">{timeAgo}</span>
                          </div>
                          <Users className="w-4 h-4 text-[#838a9c]" />
                        </div>
                        
                        {/* Activity Details */}
                        <div className="text-[#838a9c] text-sm">
                          {activity.type === 'linked' && activity.details?.linked_task && (
                            <div>
                              <span className="text-[#838a9c]">{activity.action}</span>{' '}
                              <Badge variant="outline" className="bg-[#0394ff]/10 text-[#0394ff] border-[#0394ff]/30 text-xs">
                                {activity.details.linked_task}
                              </Badge>
                            </div>
                          )}
                          
                          {activity.type === 'updated' && activity.details?.field && (
                            <div>
                              <span className="text-[#838a9c]">{activity.action}</span>
                              {' '}changed{' '}
                              <span className="text-white">{activity.details.field}</span>
                              {' '}from{' '}
                              <Badge variant="outline" className="bg-[#3d4457] text-white border-[#3d4457] text-xs mx-1">
                                {activity.details.old_value}
                              </Badge>
                              {' '}to{' '}
                              <Badge variant="outline" className="bg-[#3d4457] text-white border-[#3d4457] text-xs mx-1">
                                {activity.details.new_value}
                              </Badge>
                            </div>
                          )}
                          
                          {activity.type === 'updated' && !activity.details?.field && (
                            <span className="text-[#838a9c]">{activity.action}</span>
                          )}
                          
                          {activity.type === 'created' && (
                            <span className="text-[#838a9c]">{activity.action}</span>
                          )}
                          
                          {activity.type === 'status_changed' && (
                            <div>
                              <span className="text-[#838a9c]">changed status to</span>{' '}
                              <Badge variant="outline" className="bg-[#0394ff]/10 text-[#0394ff] border-[#0394ff]/30 text-xs">
                                {activity.details?.new_value}
                              </Badge>
                            </div>
                          )}
                          
                          {activity.type === 'assigned' && (
                            <div>
                              <span className="text-[#838a9c]">assigned to</span>{' '}
                              <span className="text-white">{activity.details?.new_value}</span>
                            </div>
                          )}
                          
                          {activity.type === 'commented' && (
                            <div className="mt-2 bg-[#3d4457] rounded-lg p-3">
                              <p className="text-white text-sm">{activity.details?.new_value}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other tabs content similar to NewTaskForm */}
          {activeTab === 'documents' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                {/* Illustration */}
                <div className="mb-6 relative">
                  <div className="inline-block">
                    {/* Document box illustration */}
                    <div className="w-64 h-48 mx-auto mb-4 relative">
                      {/* Flying papers */}
                      <div className="absolute left-16 top-8 w-16 h-20 transform -rotate-12">
                        <div className="w-full h-full border-2 border-[#838a9c] rounded-sm bg-[#3d4457] relative">
                          <div className="absolute top-3 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                          <div className="absolute top-5 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                          <div className="absolute top-7 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                        </div>
                      </div>
                      
                      <div className="absolute right-16 top-6 w-16 h-20 transform rotate-12">
                        <div className="w-full h-full border-2 border-[#838a9c] rounded-sm bg-[#3d4457] relative">
                          <div className="absolute top-3 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                          <div className="absolute top-5 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                          <div className="absolute top-7 left-2 right-2 h-0.5 bg-[#838a9c] opacity-30"></div>
                        </div>
                      </div>

                      {/* Document box/folder */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8">
                        {/* Box top */}
                        <div className="relative">
                          {/* Tab */}
                          <div className="absolute -top-3 left-8 w-16 h-3 bg-[#0394ff] rounded-t-sm"></div>
                          
                          {/* Main box */}
                          <div className="w-32 h-20 bg-[#0394ff] rounded-t-lg rounded-b-sm border-4 border-[#0570cd] relative overflow-hidden">
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0394ff] to-[#0570cd]"></div>
                            
                            {/* Smile face */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative">
                                {/* Eyes */}
                                <div className="flex gap-3 mb-2">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                {/* Smile */}
                                <div className="w-8 h-3 border-b-2 border-white rounded-b-full"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Shadow */}
                          <div className="w-36 h-2 bg-[#181c28] opacity-20 rounded-full mt-1 mx-auto blur-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <p className="text-[#838a9c] mb-6">
                  Hey there are no Documents added to this Project yet
                </p>

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    className="bg-transparent border-[#0394ff] text-[#0394ff] hover:bg-[#0394ff] hover:text-white"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Link Documents
                  </Button>
                  <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Documents
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timelog' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto text-[#838a9c] mb-4" />
                <p className="text-[#838a9c]">Time logging will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4">
              {/* Header with Actions */}
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm">Related Tasks</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkTaskDialog(true)}
                  className="bg-transparent border-[#0394ff] text-[#0394ff] hover:bg-[#0394ff] hover:text-white text-xs h-8"
                >
                  <GitBranch className="w-3 h-3 mr-1" />
                  Link Task
                </Button>
              </div>
              
              {/* Related Tasks Table */}
              <div className="bg-[#292d39] border border-[#3d4457] rounded-lg overflow-hidden">
                <div className="overflow-x-auto taskflow-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#3d4457]">
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">NAME</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">ASSIGNED TO</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">START DATE...</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">DUE DATE &...</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">RELATED TO</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">STAGE</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">PREVIOUS TA...</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">PARENT TASK</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">TASK TYPE</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">DESCRIPTION</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">CREATED BY</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">SLA NAME</th>
                        <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">RESOLUTION...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedTasks.map((task) => (
                        <tr key={task.id} className="border-b border-[#3d4457] hover:bg-[#3d4457]/30 transition-colors">
                          <td className="py-3 px-4 text-white whitespace-nowrap">{task.name}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                                {task.assigned_to_avatar}
                              </div>
                              <span className="text-white">{task.assigned_to_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.start_date || '-'}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.due_date || '-'}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.related_to || '-'}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant="outline" className="bg-[#838a9c]/10 text-[#838a9c] border-[#838a9c]/30 text-xs">
                              {task.stage}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.previous_task || '-'}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.parent_task || '-'}</td>
                          <td className="py-3 px-4 text-white whitespace-nowrap">{task.task_type}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.description || '-'}</td>
                          <td className="py-3 px-4 text-white whitespace-nowrap">{task.created_by}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.sla_name || '-'}</td>
                          <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">{task.resolution_due || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CalendarDays className="w-12 h-12 mx-auto text-[#838a9c] mb-4" />
                <p className="text-[#838a9c]">Events will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                {/* Illustration */}
                <div className="mb-6 relative">
                  <div className="inline-block">
                    {/* Person working illustration */}
                    <div className="w-64 h-48 mx-auto mb-4 relative">
                      {/* Coffee cup */}
                      <div className="absolute left-12 bottom-8 w-8 h-10 bg-[#51cf66] rounded-b-lg opacity-60">
                        <div className="absolute top-0 w-full h-3 bg-[#51cf66] rounded-t-sm"></div>
                        <div className="absolute -right-2 top-2 w-4 h-5 border-2 border-[#51cf66] rounded-r-lg"></div>
                      </div>
                      
                      {/* Laptop */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0">
                        {/* Screen */}
                        <div className="w-32 h-20 bg-[#3d4457] rounded-t-lg border-4 border-[#4a5568] relative">
                          <div className="absolute inset-2 bg-[#292d39] rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-[#0394ff] rounded-full"></div>
                          </div>
                        </div>
                        {/* Base */}
                        <div className="w-40 h-2 bg-[#4a5568] rounded-b-sm relative">
                          <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-16 h-1 bg-[#3d4457]"></div>
                        </div>
                      </div>
                      
                      {/* Person head */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
                        <div className="w-12 h-12 bg-[#7c8db0] rounded-full relative">
                          {/* Hair */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-14 h-8 bg-[#5a6b8c] rounded-t-full"></div>
                        </div>
                        {/* Neck/Body */}
                        <div className="w-8 h-6 bg-[#7c8db0] mx-auto"></div>
                        <div className="w-20 h-16 bg-[#0394ff] rounded-t-2xl -mt-2 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#0394ff] to-[#0570cd]"></div>
                        </div>
                      </div>

                      {/* Files/Documents */}
                      <div className="absolute right-8 bottom-12 w-10 h-12 bg-[#0394ff] rounded opacity-60 transform rotate-12">
                        <div className="absolute top-2 left-2 right-2 h-0.5 bg-white opacity-40"></div>
                        <div className="absolute top-4 left-2 right-2 h-0.5 bg-white opacity-40"></div>
                        <div className="absolute top-6 left-2 right-2 h-0.5 bg-white opacity-40"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <p className="text-[#838a9c] mb-6">
                  Hey there are no Invoices added to this Project yet
                </p>

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    className="bg-transparent border-[#0394ff] text-[#0394ff] hover:bg-[#0394ff] hover:text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Link Invoices
                  </Button>
                  <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Invoice
                  </Button>
                </div>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Task
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      </Resizable>

      {/* Link Task Dialog */}
      <LinkTaskDialog
        open={showLinkTaskDialog}
        onOpenChange={setShowLinkTaskDialog}
        onLinkTasks={handleLinkTasks}
      />
    </div>
  );
}