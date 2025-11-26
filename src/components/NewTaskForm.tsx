import { useState, useRef, useEffect } from 'react';
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
import { LinkDocumentsDialog } from './LinkDocumentsDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
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
  ChevronDown,
  Upload,
  Link2,
  Files,
  FilePlus
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import { 
  tasksApi, 
  projectsApi, 
  usersApi,
  User
} from '../utils/mockApi';
import { toast } from 'sonner';

interface NewTaskFormProps {
  currentUser: any;
  onTaskCreated: (task: any) => void;
  onCancel: () => void;
  projectId?: string; // Optional project ID to pre-select and lock the project
}

interface SubTask {
  id: string;
  title: string;
  assignee_id: string;
  assignee_name: string;
  status: 'todo' | 'in-progress' | 'done';
  due_date?: string;
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

interface NewTaskForm {
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

export function NewTaskForm({ currentUser, onTaskCreated, onCancel, projectId }: NewTaskFormProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('summary');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false);
  
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
    return { width: 1200, height: window.innerHeight * 0.85 };
  });
  const [subtasks, setSubtasks] = useState<SubTask[]>([
    {
      id: 'subtask-1',
      title: 'Research competitor solutions',
      assignee_id: 'user-1',
      assignee_name: 'Nguyễn Văn A',
      status: 'done',
      created_at: new Date().toISOString()
    },
    {
      id: 'subtask-2',
      title: 'Create wireframes for main dashboard',
      assignee_id: 'user-2',
      assignee_name: 'Trần Thị B',
      status: 'in-progress',
      created_at: new Date().toISOString()
    },
    {
      id: 'subtask-3',
      title: 'Review design system components',
      assignee_id: 'user-3',
      assignee_name: 'Lê Văn C',
      status: 'todo',
      created_at: new Date().toISOString()
    },
    {
      id: 'subtask-4',
      title: 'Prepare presentation deck',
      assignee_id: 'demo-user-id',
      assignee_name: 'Demo User',
      status: 'todo',
      created_at: new Date().toISOString()
    }
  ]);
  const [comments, setComments] = useState<Comment[]>([]);
  
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
  const [showLinkTaskDialog, setShowLinkTaskDialog] = useState(false);
  const [showLinkDocumentsDialog, setShowLinkDocumentsDialog] = useState(false);
  const [linkedDocuments, setLinkedDocuments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // API Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    project_id: projectId || '', // Pre-fill with projectId if provided
    parent_task_id: '',
    previous_task_id: '',
    phase: 'Lên kế hoạch',
    status: 'Chưa thực hiện',
    priority: 'Trung bình',
    assignee_id: currentUser?.id || '1',
    related_to: '',
    start_date: '',
    start_time: '09:00',
    due_date: '',
    due_time: '17:00',
    estimated_hours: 8,
    tags: [],
    watchers: []
  });

  // Subtask form state
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    assignee_id: currentUser?.id || '1'
  });

  // Load data when form opens
  useEffect(() => {
    if (currentUser?.id) {
      loadProjects();
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const apiUsers = await usersApi.getUsers();
      setUsers(apiUsers);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    }
  };

  // Mock team members
  const teamMembers = [
    { id: 'demo-user-id', name: 'Demo User', avatar: 'DU', email: 'demo@taskflow.com' },
    { id: 'user-1', name: 'Nguyễn Văn A', avatar: 'NA', email: 'a.nguyen@taskflow.com' },
    { id: 'user-2', name: 'Trần Thị B', avatar: 'TB', email: 'b.tran@taskflow.com' },
    { id: 'user-3', name: 'Lê Văn C', avatar: 'LC', email: 'c.le@taskflow.com' },
    { id: 'user-4', name: 'Phạm Thị D', avatar: 'PD', email: 'd.pham@taskflow.com' },
    { id: 'user-5', name: 'Hoàng Văn E', avatar: 'HE', email: 'e.hoang@taskflow.com' }
  ];

  const availableTasks = [
    { id: 'task-1', title: 'Setup project structure' },
    { id: 'task-2', title: 'Design system implementation' },
    { id: 'task-3', title: 'API development' },
    { id: 'task-4', title: 'Database design' }
  ];



  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'detail', label: 'Detail', icon: Target },
    { id: 'updates', label: 'Updates', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'timelog', label: 'Timelog', icon: Clock },
    { id: 'related', label: 'Related Tasks', icon: GitBranch },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'invoices', label: 'Invoices', icon: FileText }
  ];

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

  const loadProjects = async () => {
    setLoadingProjects(true);
    
    try {
      console.log('📁 Loading projects for NewTaskForm...');
      const apiProjects = await projectsApi.getProjects();
      
      if (apiProjects && apiProjects.length > 0) {
        setProjects(apiProjects);
        console.log('✅ Projects loaded successfully:', apiProjects);
      } else {
        console.log('📝 No projects found');
        setProjects([]);
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateTask = async () => {
    console.log('🚀 === TASK CREATION STARTED ===');
    
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate required fields
    if (!newTask.title.trim()) {
      console.log('❌ Validation failed: Empty title');
      setError('Vui lòng nhập tên công việc');
      return;
    }

    if (!newTask.project_id) {
      console.log('❌ Validation failed: No project selected');
      setError('Vui lòng chọn dự án');
      return;
    }

    setSaving(true);
    console.log('🔄 Setting saving state to true');

    try {
      console.log('📋 Form data:', newTask);
      
      // Find selected project to get custom project_id
      const selectedProject = projects.find(p => p.id === newTask.project_id);
      
      // Prepare task data for API - Only send fields that exist in database schema
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        project_id: newTask.project_id,
        custom_project_id: selectedProject?.project_id || null, // Add custom project ID relationship
        status: mapStatusToApi(newTask.status),
        priority: mapPriorityToApi(newTask.priority),
        assignee: newTask.assignee_id,
        due_date: newTask.due_date || null,
        start_date: newTask.start_date || null,
        progress: 0,
        user_id: currentUser?.id || '1',
        created_by: currentUser?.id || '1'
      };

      console.log('📤 API payload:', taskData);
      console.log('🔐 User info:', {
        hasCurrentUser: !!currentUser,
        hasUserId: !!currentUser?.id
      });
      console.log('👤 Assignee info:', {
        assignee_id: newTask.assignee_id,
        assignee_name: teamMembers.find(m => m.id === newTask.assignee_id)?.name
      });

      // Check if we have a current user
      if (currentUser?.id) {
        console.log('🌐 Creating task with mock API...');
        
        try {
          const newTaskData = {
            title: taskData.title,
            description: taskData.description,
            project_id: taskData.project_id,
            assignee_id: taskData.assignee,
            reporter_id: currentUser.id,
            priority: taskData.priority as 'low' | 'medium' | 'high',
            status: taskData.status as 'todo' | 'in_progress' | 'review' | 'completed',
            due_date: taskData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            estimated_hours: newTask.estimated_hours,
            actual_hours: 0
          };
          
          const response = await tasksApi.createTask(newTaskData);
          console.log('✅ Mock API Response received:', response);
          
          setSuccess('✅ Task created successfully!');
          
          // Call the parent callback with the new task
          onTaskCreated(response);
          
        } catch (apiError) {
          console.error('❌ API Error:', apiError);
          throw apiError;
        }
      } else {
        console.log('🎭 No user - cannot create task');
        setError('Please sign in to create tasks');
        return;
      }

      console.log('🎉 Task creation successful, triggering callbacks...');

      // Show success message briefly then close
      setTimeout(() => {
        console.log('🚪 Closing form and resetting...');
        onCancel();
        resetForm();
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ TASK CREATION FAILED:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      setError(`Có lỗi xảy ra khi tạo task: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
      console.log('🔄 Setting saving state to false');
      console.log('🏁 === TASK CREATION FINISHED ===');
    }
  };

  const resetForm = () => {
    console.log('🧹 Resetting form to initial state');
    setNewTask({
      title: '',
      description: '',
      project_id: '',
      parent_task_id: '',
      previous_task_id: '',
      phase: 'Lên kế hoạch',
      status: 'Chưa thực hiện',
      priority: 'Trung bình',
      assignee_id: currentUser?.id || '1',
      related_to: '',
      start_date: '',
      start_time: '09:00',
      due_date: '',
      due_time: '17:00',
      estimated_hours: 8,
      tags: [],
      watchers: []
    });
    setSubtasks([]);
    setComments([]);
    setActiveTab('summary');
    setError('');
    setSuccess('');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.title.trim()) return;

    const subtask: SubTask = {
      id: `subtask-${Date.now()}`,
      title: newSubtask.title,
      assignee_id: newSubtask.assignee_id,
      assignee_name: teamMembers.find(m => m.id === newSubtask.assignee_id)?.name || 'Unknown',
      status: 'todo',
      created_at: new Date().toISOString()
    };

    setSubtasks([...subtasks, subtask]);
    setNewSubtask({ title: '', assignee_id: currentUser?.id || '1' });
    setShowSubtaskDialog(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author_id: currentUser?.id || '1',
      author_name: currentUser?.name || 'Demo User',
      author_avatar: currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'DU',
      content: newComment,
      tagged_users: extractTaggedUsers(newComment),
      created_at: new Date().toISOString()
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleCreateDocument = () => {
    toast.info('Create New Document feature coming soon');
  };

  const handleFileUpload = () => {
    toast.info('File Upload feature coming soon');
  };

  const handleLinkExternal = () => {
    toast.info('Link External Document feature coming soon');
  };

  const handleUploadMultiple = () => {
    toast.info('Upload Multiple Files feature coming soon');
  };

  const handleLinkDocuments = (documentIds: string[]) => {
    setLinkedDocuments(prev => [...prev, ...documentIds]);
    toast.success(`Linked ${documentIds.length} document(s) successfully`);
  };

  const handleLinkTasks = (taskIds: string[]) => {
    // In real app, this would link the selected tasks
    toast.success(`Linked ${taskIds.length} task(s) successfully`);
    
    // Mock: Add linked tasks to related tasks list
    // In real implementation, fetch the actual task data
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

  const extractTaggedUsers = (content: string): string[] => {
    const matches = content.match(/@(\w+)/g);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  const handleUserTag = (username: string) => {
    const cursorPos = commentInputRef.current?.selectionStart || 0;
    const textBefore = newComment.substring(0, cursorPos);
    const textAfter = newComment.substring(cursorPos);
    const newText = `${textBefore}@${username} ${textAfter}`;
    setNewComment(newText);
    setShowUserSuggestions(false);
  };

  const mapStatusToApi = (status: string) => {
    const statusMap: Record<string, string> = {
      'Chưa thực hiện': 'Todo',
      'Đang thực hiện': 'In Progress',
      'Đã hoàn thành': 'Done',
      'Tạm dừng': 'Paused',
      'Quá hạn': 'Overdue'
    };
    return statusMap[status] || 'Todo';
  };

  const mapPriorityToApi = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'Thấp': 'Low',
      'Trung bình': 'Medium',
      'Cao': 'High',
      'Khẩn cấp': 'Critical'
    };
    return priorityMap[priority] || 'Medium';
  };

  const renderSummaryTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Main Content - 3/4 width */}
      <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Header Fields - Single Row */}
        <div className="grid grid-cols-6 gap-3 flex-shrink-0">
          {/* Assigned To */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Assigned To</Label>
            <select
              value={newTask.assignee_id}
              onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
              className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving}
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          {/* Previous Task */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Previous Task</Label>
            <select
              value={newTask.previous_task_id}
              onChange={(e) => setNewTask({ ...newTask, previous_task_id: e.target.value })}
              className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving}
            >
              <option value="">Not set</option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>

          {/* Parent Task */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Parent Task</Label>
            <select
              value={newTask.parent_task_id}
              onChange={(e) => setNewTask({ ...newTask, parent_task_id: e.target.value })}
              className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving}
            >
              <option value="">Not set</option>
            </select>
          </div>

          {/* Start Date & Time */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Start Date & Time</Label>
            <Input
              type="datetime-local"
              value={newTask.start_date && newTask.start_time ? `${newTask.start_date}T${newTask.start_time}` : ''}
              onChange={(e) => {
                const [date, time] = e.target.value.split('T');
                setNewTask({ ...newTask, start_date: date, start_time: time });
              }}
              className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
              disabled={saving}
            />
          </div>

          {/* Due Date & Time */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Due Date & Time</Label>
            <Input
              type="datetime-local"
              value={newTask.due_date && newTask.due_time ? `${newTask.due_date}T${newTask.due_time}` : ''}
              onChange={(e) => {
                const [date, time] = e.target.value.split('T');
                setNewTask({ ...newTask, due_date: date, due_time: time });
              }}
              className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
              disabled={saving}
            />
          </div>

          {/* Related To */}
          <div className="col-span-1">
            <Label className="text-[#838a9c] text-xs mb-1 block">Related To</Label>
            <Input
              value={newTask.related_to}
              onChange={(e) => setNewTask({ ...newTask, related_to: e.target.value })}
              placeholder="Not set"
              className="bg-[#3d4457] border-[#3d4457] text-white h-auto py-1.5 text-xs"
              disabled={saving}
            />
          </div>
        </div>

        {/* Add Description */}
        <div className="flex-shrink-0">
          <Label className="text-white text-sm mb-2 block">Add Description</Label>
          <Textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Enter task description..."
            rows={3}
            className="bg-[#181c28] border-[#3d4457] text-white text-sm resize-none"
            disabled={saving}
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
                onClick={() => setShowSubtaskDialog(!showSubtaskDialog)}
                className="text-[#0394ff] hover:text-[#0570cd] text-xs h-auto py-1 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Section
              </Button>
            </div>
          </div>
          
          <div className="bg-[#181c28] border border-[#3d4457] rounded-lg">
            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="divide-y divide-[#3d4457]">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 hover:bg-[#292d39] group">
                    {/* Checkbox */}
                    <Checkbox 
                      id={`subtask-${subtask.id}`}
                      checked={subtask.status === 'done'}
                      onCheckedChange={(checked) => {
                        const updated = [...subtasks];
                        updated[index].status = checked ? 'done' : 'todo';
                        setSubtasks(updated);
                      }}
                      className="border-[#3d4457] data-[state=checked]:bg-[#0394ff] data-[state=checked]:border-[#0394ff]"
                    />
                    
                    {/* Subtask Name - Editable */}
                    <Input
                      value={subtask.title}
                      onChange={(e) => {
                        const updated = [...subtasks];
                        updated[index].title = e.target.value;
                        setSubtasks(updated);
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
                      value={subtask.due_date || ''}
                      onChange={(e) => {
                        const updated = [...subtasks];
                        updated[index].due_date = e.target.value;
                        setSubtasks(updated);
                      }}
                      className="bg-transparent border-0 text-[#838a9c] text-xs h-6 w-28 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Set due..."
                    />
                    
                    {/* Assignee Avatar */}
                    <div className="w-5 h-5 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-[10px] flex-shrink-0">
                      {subtask.assignee_name?.charAt(0) || teamMembers.find(m => m.id === subtask.assignee_id)?.avatar || 'U'}
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSubtasks(subtasks.filter((_, i) => i !== index));
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
                value={newSubtask.title}
                onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubtask.title.trim()) {
                    handleAddSubtask();
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
                        {comment.author_avatar}
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
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a comment and mention @users / @teams to notify"
                rows={2}
                className="bg-[#3d4457] border-[#3d4457] text-white text-xs resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleAddComment();
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
            onClick={handleCreateTask} 
            disabled={saving || !newTask.title.trim() || !newTask.project_id}
            className="w-full bg-[#0394ff] hover:bg-[#0570cd] disabled:opacity-50 text-sm h-9"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-2" />
                Create Task
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
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving}
            >
              <option value="Chưa thực hiện">Chưa thực hiện</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          {/* Estimate */}
          <div className="bg-[#3d4457] rounded-lg p-3">
            <Label className="text-[#838a9c] text-xs mb-2 block">Estimate</Label>
            <Input
              type="number"
              value={newTask.estimated_hours}
              onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseInt(e.target.value) || 0 })}
              className="bg-[#292d39] border-[#292d39] text-white h-auto py-1.5 text-xs"
              placeholder="Set Estimate"
              disabled={saving}
            />
          </div>

          {/* Priority */}
          <div className="bg-[#3d4457] rounded-lg p-3">
            <Label className="text-[#838a9c] text-xs mb-2 block">Priority</Label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving}
            >
              <option value="Thấp">Thấp</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Cao">Cao</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
            </select>
          </div>

          {/* Project */}
          <div className="bg-[#3d4457] rounded-lg p-3">
            <Label className="text-[#838a9c] text-xs mb-2 block">Project *</Label>
            <select
              value={newTask.project_id}
              onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
              className="w-full bg-[#292d39] border-[#292d39] text-white rounded px-2 py-1.5 text-xs"
              disabled={saving || loadingProjects}
            >
              <option value="">{loadingProjects ? 'Loading...' : 'Select Project'}</option>
              {projects.map((project) => (
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
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        <Card className="w-full h-full bg-[#292d39] border-[#3d4457] flex flex-col shadow-2xl"
          style={{
            borderWidth: '2px',
            borderColor: '#0394ff',
            boxShadow: '0 0 0 1px rgba(3, 148, 255, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d4457] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0394ff] rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">New Task</h2>
              <p className="text-[#838a9c] text-sm">Create a new task and assign it to team members</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#3d4457] px-6 flex-shrink-0">
          <div className="flex space-x-8 overflow-x-auto taskflow-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0394ff] text-[#0394ff]'
                      : 'border-transparent text-[#838a9c] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Fixed height area with scroll */}
        <div className="flex-1 overflow-y-auto taskflow-scrollbar p-6" style={{ minHeight: 0 }}>
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'detail' && (
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
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Assigned To</Label>
                      <select
                        value={newTask.assignee_id}
                        onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={saving}
                      >
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Start Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newTask.start_date && newTask.start_time ? `${newTask.start_date}T${newTask.start_time}` : ''}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          setNewTask({ ...newTask, start_date: date, start_time: time });
                        }}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Due Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={newTask.due_date && newTask.due_time ? `${newTask.due_date}T${newTask.due_time}` : ''}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          setNewTask({ ...newTask, due_date: date, due_time: time });
                        }}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Related To</Label>
                      <Input
                        value={newTask.related_to}
                        onChange={(e) => setNewTask({ ...newTask, related_to: e.target.value })}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Contact Name</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Stage</Label>
                      <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={saving}
                      >
                        <option value="Chưa thực hiện">Todo</option>
                        <option value="Đang thực hiện">In Progress</option>
                        <option value="Đã hoàn thành">Done</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Priority</Label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={saving}
                      >
                        <option value="Thấp">Low</option>
                        <option value="Trung bình">Medium</option>
                        <option value="Cao">High</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Location</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Milestone</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Previous Task</Label>
                      <select
                        value={newTask.previous_task_id}
                        onChange={(e) => setNewTask({ ...newTask, previous_task_id: e.target.value })}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={saving}
                      >
                        <option value="">None</option>
                        {availableTasks.map((task) => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Percent Task</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">* Task Type</Label>
                      <Input 
                        value="Checklist Item"
                        readOnly
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled={saving} 
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Estimate</Label>
                      <Input
                        type="number"
                        value={newTask.estimated_hours}
                        onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseInt(e.target.value) || 0 })}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm"
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Related Task</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">
                        Project Name
                        {projectId && <span className="text-[#0394ff] ml-1">(Locked)</span>}
                      </Label>
                      <select
                        value={newTask.project_id}
                        onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                        className="w-full bg-[#3d4457] border-[#3d4457] text-white rounded px-2 py-1.5 text-sm h-8"
                        disabled={saving || loadingProjects || !!projectId}
                      >
                        <option value="">{loadingProjects ? 'Loading...' : 'Select Project'}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Organization Name</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Modified/Last Id</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
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
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={4}
                      className="bg-[#3d4457] border-[#3d4457] text-white text-sm resize-none"
                      disabled={saving}
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
                      <Input value="0h" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Billable Time Spent</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Time Spent</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Total Time Spent on Subtasks</Label>
                      <Input value="0 seconds" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Progress 0</Label>
                      <Input value="0%" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Actual Completion Date</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Created Time</Label>
                      <Input 
                        value={new Date().toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Modified Time</Label>
                      <Input 
                        value={new Date().toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
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
                        value={currentUser?.name || 'Unknown'}
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
                        value={`Task${Math.floor(Math.random() * 1000)}`}
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
                        <Checkbox id="billable" className="border-[#3d4457]" disabled={saving} />
                        <label htmlFor="billable" className="text-white text-sm">Billable</label>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Invoiced</Label>
                      <div className="flex items-center gap-2 h-8">
                        <Checkbox id="invoiced" className="border-[#3d4457]" disabled={saving} />
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
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">SLA Status</Label>
                      <Input className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>

                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Resolution Due</Label>
                      <Input type="datetime-local" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
                    </div>
                    <div>
                      <Label className="text-[#838a9c] text-xs mb-1 block">Resolution Actual</Label>
                      <Input type="datetime-local" className="bg-[#3d4457] border-[#3d4457] text-white h-8 text-sm" disabled={saving} />
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
                    onClick={() => setShowLinkDocumentsDialog(true)}
                    className="bg-transparent border-[#0394ff] text-[#0394ff] hover:bg-[#0394ff] hover:text-white"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Link Documents
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
                        <FilePlus className="w-4 h-4 mr-2" />
                        Add Documents
                        <svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-[#292d39] border-[#3d4457] text-white"
                    >
                      <DropdownMenuItem 
                        onClick={handleCreateDocument}
                        className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Create New Document
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleFileUpload}
                        className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        File Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleLinkExternal}
                        className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Link External Document
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-[#3d4457]" />
                      
                      <DropdownMenuLabel className="text-[#838a9c] text-xs px-2 py-1.5">
                        Custom Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={handleUploadMultiple}
                        className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                      >
                        <Files className="w-4 h-4 mr-2" />
                        Upload Multiple Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
          
          {activeTab !== 'summary' && activeTab !== 'detail' && activeTab !== 'updates' && activeTab !== 'invoices' && activeTab !== 'documents' && activeTab !== 'related' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#838a9c]">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>This tab is not implemented yet</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      </Resizable>

      {/* Link Task Dialog */}
      <LinkTaskDialog
        open={showLinkTaskDialog}
        onOpenChange={setShowLinkTaskDialog}
        onLinkTasks={handleLinkTasks}
      />

      {/* Link Documents Dialog */}
      <LinkDocumentsDialog
        open={showLinkDocumentsDialog}
        onOpenChange={setShowLinkDocumentsDialog}
        onLinkDocuments={handleLinkDocuments}
      />
    </div>
  );
}