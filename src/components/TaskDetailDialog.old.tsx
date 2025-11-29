import { useState, useEffect, useRef } from 'react';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Link2,
  Sparkles,
  Plus,
  Send,
  Paperclip,
  Smile,
  AtSign,
  Hash,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Code,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  Menu,
  Search,
  Filter,
  MessageSquare,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { phasesApi, tasksApi, usersApi, type Phase, type User } from '../services/api';
import { RichTextEditor } from './RichTextEditor';

interface WorkspaceTask {
  id: string;
  name: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
    color: string;
  } | null;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  status: 'todo' | 'in-progress' | 'ready' | 'done' | 'in-review' | 'completed' | 'new';
  budget: number;
  sprint: string;
  budgetRemaining: number;
  comments?: number;
  subtasks?: WorkspaceTask[];
  parentId?: string;
  phase?: string;
  phaseID?: string;
  projectID?: string;
  impact?: 'low' | 'medium' | 'high';
  files?: number;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WorkspaceTask | null;
  onTaskUpdate?: (task: WorkspaceTask) => void;
}

const DIALOG_SIZE_STORAGE_KEY = 'taskDetailDialogSize';

const getDefaultDialogSize = () => {
  const defaultSize = { width: 1200, height: window.innerHeight * 0.9 };
  try {
    const saved = localStorage.getItem(DIALOG_SIZE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate the saved size
      if (parsed.width >= 800 && parsed.height >= 500) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading dialog size from localStorage:', error);
  }
  return defaultSize;
};

export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdate }: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.impact || 'medium');
  const [comment, setComment] = useState('');
  const [showActivity, setShowActivity] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(
    task?.startDate ? new Date(task.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    task?.endDate ? new Date(task.endDate) : undefined
  );
  const [timeEstimate, setTimeEstimate] = useState('112h');
  const [dialogSize, setDialogSize] = useState(getDefaultDialogSize);
  const [comments, setComments] = useState<Array<{
    id: string;
    author: string;
    authorInitials: string;
    authorColor: string;
    content: string;
    timestamp: Date;
    type: 'comment' | 'activity';
  }>>([]);
  const [phaseID, setPhaseID] = useState<string | undefined>(task?.phaseID);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigneeID, setAssigneeID] = useState<string | undefined>(task?.assignee ? 'mock-id' : undefined);
  const [description, setDescription] = useState(task?.name || ''); // Using task.name as placeholder since description field doesn't exist in WorkspaceTask
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);

  // Save dialog size to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(DIALOG_SIZE_STORAGE_KEY, JSON.stringify(dialogSize));
    } catch (error) {
      console.error('Error saving dialog size to localStorage:', error);
    }
  }, [dialogSize]);

  // Load comments from localStorage when task changes
  useEffect(() => {
    if (task?.id) {
      try {
        const saved = localStorage.getItem(`taskComments_${task.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          const commentsWithDates = parsed.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp)
          }));
          setComments(commentsWithDates);
        } else {
          // Initialize with default activity
          setComments([
            {
              id: 'activity-1',
              author: 'System',
              authorInitials: 'SY',
              authorColor: '#838a9c',
              content: 'You estimated 2 weeks',
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              type: 'activity'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  }, [task?.id]);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (task?.id && comments.length > 0) {
      try {
        localStorage.setItem(`taskComments_${task.id}`, JSON.stringify(comments));
      } catch (error) {
        console.error('Error saving comments:', error);
      }
    }
  }, [comments, task?.id]);

  // Fetch phases when task projectID changes
  useEffect(() => {
    const fetchPhases = async () => {
      if (!task?.projectID) {
        setPhases([]);
        return;
      }

      setLoadingPhases(true);
      try {
        const projectPhases = await phasesApi.getByProject(task.projectID);
        setPhases(projectPhases);
      } catch (error) {
        console.error('Error fetching phases:', error);
        toast.error('Failed to load phases');
        setPhases([]);
      } finally {
        setLoadingPhases(false);
      }
    };

    fetchPhases();
  }, [task?.projectID]);

  // Update phaseID when task changes
  useEffect(() => {
    setPhaseID(task?.phaseID);
  }, [task?.phaseID]);

  // Fetch users for assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const allUsers = await usersApi.getAll();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Debounce timer for description
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, []);

  // Update state when task changes
  useEffect(() => {
    if (task) {
      setStatus(task.status || 'todo');
      setPriority(task.impact || 'medium');
      setStartDate(task.startDate ? new Date(task.startDate) : undefined);
      setEndDate(task.endDate ? new Date(task.endDate) : undefined);
      setPhaseID(task.phaseID);
      setAssigneeID(task.assignee ? 'mock-id' : undefined);
      setDescription(task.name || '');
    }
  }, [task?.id]); // Only re-run when task ID changes

  // Guard clause - don't render if no task or dialog is closed
  if (!task || !open) return null;

  const parseSpentValue = (spentStr: string): number => {
    if (!spentStr || spentStr === '-') return 0;
    return parseInt(spentStr.replace(/[$,]/g, '')) || 0;
  };

  const spent = parseSpentValue(task.sprint || '$0');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
      case 'ready':
        return 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30';
      case 'in-review':
        return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30';
      case 'medium':
        return 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task?.id) return;

    const previousStatus = status;
    // Optimistic update
    setStatus(newStatus as any);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        status: newStatus
      } as any);

      toast.success(`Status changed to ${newStatus}`);
      if (onTaskUpdate) {
        onTaskUpdate({ ...task, status: newStatus as any });
      }
    } catch (error) {
      // Revert on error
      setStatus(previousStatus);
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: 'low' | 'medium' | 'high') => {
    if (!task?.id) return;

    const previousPriority = priority;
    // Optimistic update
    setPriority(newPriority);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        priority: newPriority
      } as any);

      toast.success(`Priority changed to ${newPriority}`);
      if (onTaskUpdate) {
        onTaskUpdate({ ...task, impact: newPriority });
      }
    } catch (error) {
      // Revert on error
      setPriority(previousPriority);
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const handlePhaseChange = async (newPhaseID: string) => {
    if (!task?.id) return;

    const selectedPhase = phases.find(p => p.phaseID === newPhaseID);
    const previousPhaseID = phaseID;

    // Optimistic update
    setPhaseID(newPhaseID === 'none' ? undefined : newPhaseID);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        phaseID: newPhaseID === 'none' ? null : newPhaseID
      } as any);

      // Update parent component's task state
      if (newPhaseID === 'none') {
        toast.success('Phase cleared');
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, phaseID: undefined, phase: undefined });
        }
      } else if (selectedPhase) {
        toast.success(`Phase changed to ${selectedPhase.name}`);
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, phaseID: newPhaseID, phase: selectedPhase.name });
        }
      }
    } catch (error) {
      // Revert on error
      setPhaseID(previousPhaseID);
      console.error('Error updating phase:', error);
      toast.error('Failed to update phase');
    }
  };

  const handleAssigneeChange = async (newAssigneeID: string) => {
    if (!task?.id) return;

    const selectedUser = users.find(u => u.userID === newAssigneeID);
    const previousAssigneeID = assigneeID;

    // Optimistic update
    setAssigneeID(newAssigneeID === 'none' ? undefined : newAssigneeID);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        assigneeID: newAssigneeID === 'none' ? null : newAssigneeID
      } as any);

      // Update parent component's task state
      if (newAssigneeID === 'none') {
        toast.success('Assignee cleared');
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, assignee: null });
        }
      } else if (selectedUser) {
        toast.success(`Assigned to ${selectedUser.name}`);
        // Create assignee object from User
        const assignee = {
          name: selectedUser.name,
          avatar: selectedUser.avatar || '',
          initials: selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          color: '#0394ff' // Default color
        };
        if (onTaskUpdate) {
          onTaskUpdate({ ...task, assignee });
        }
      }
    } catch (error) {
      // Revert on error
      setAssigneeID(previousAssigneeID);
      console.error('Error updating assignee:', error);
      toast.error('Failed to update assignee');
    }
  };

  const handleStartDateChange = async (newDate: Date | undefined) => {
    if (!task?.id) return;

    const previousDate = startDate;
    // Optimistic update
    setStartDate(newDate);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        startDate: newDate ? newDate.toISOString() : null
      } as any);

      toast.success(newDate ? 'Start date updated' : 'Start date cleared');
      if (onTaskUpdate) {
        onTaskUpdate({ ...task, startDate: newDate ? newDate.toISOString() : undefined });
      }
    } catch (error) {
      // Revert on error
      setStartDate(previousDate);
      console.error('Error updating start date:', error);
      toast.error('Failed to update start date');
    }
  };

  const handleEndDateChange = async (newDate: Date | undefined) => {
    if (!task?.id) return;

    const previousDate = endDate;
    // Optimistic update
    setEndDate(newDate);

    try {
      // Call API to persist the change
      await tasksApi.update(task.id, {
        dueDate: newDate ? newDate.toISOString() : null
      } as any);

      toast.success(newDate ? 'Due date updated' : 'Due date cleared');
      if (onTaskUpdate) {
        const updatedTask = { ...task };
        if (newDate) {
          updatedTask.dueDate = newDate.toISOString();
        } else {
          delete (updatedTask as any).dueDate;
        }
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      // Revert on error
      setEndDate(previousDate);
      console.error('Error updating due date:', error);
      toast.error('Failed to update due date');
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    if (!task?.id) return;

    // Update local state immediately
    setDescription(newDescription);

    // Clear previous timeout
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current);
    }

    // Debounce API call - save after 1 second of no typing
    descriptionTimeoutRef.current = setTimeout(async () => {
      try {
        // Validate GUID format
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(task.id)) {
          console.error('Invalid task ID format:', task.id, '- Expected GUID format');
          toast.error('Cannot save: Invalid task ID format');
          return;
        }

        await tasksApi.update(task.id, {
          description: newDescription
        } as any);
        console.log('✅ Description saved successfully');
        toast.success('Description saved');
      } catch (error) {
        console.error('❌ Error updating description:', error);
        console.error('Task ID:', task.id);
        console.error('Description length:', newDescription.length);
        toast.error(`Failed to save description: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 1000);
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: 'You',
      authorInitials: 'YO',
      authorColor: '#0394ff',
      content: comment.trim(),
      timestamp: new Date(),
      type: 'comment' as const
    };

    setComments([newComment, ...comments]);
    setComment('');
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send comment on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSendComment();
    }
    // Allow Shift+Enter for new line (default behavior)
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Global CSS to hide any unwanted close buttons */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide all default close buttons from shadcn/radix components */
        [data-task-detail-dialog] button[data-slot="dialog-close"],
        [data-task-detail-dialog] [data-radix-dialog-close],
        [data-task-detail-dialog] .radix-dialog-close,
        [data-task-detail-dialog] [data-radix-popover-close],
        [data-task-detail-dialog] [data-radix-select-close] {
          display: none !important;
        }
        
        /* Ensure only our custom close button is visible */
        [data-task-detail-dialog] button:not(.task-detail-close-btn) svg[data-lucide="x"] {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Make our close button always visible */
        [data-task-detail-dialog] .task-detail-close-btn {
          display: flex !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      ` }} />
      
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999] animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div className="fixed inset-0 z-[1000] pointer-events-none" data-task-detail-dialog>
        <Draggable
          handle=".drag-handle"
          defaultPosition={{ x: (window.innerWidth - 1200) / 2, y: (window.innerHeight - (window.innerHeight * 0.9)) / 2 }}
          bounds="parent"
        >
          <div style={{ display: 'inline-block' }} className="pointer-events-auto">
            <Resizable
              size={{ width: dialogSize.width, height: dialogSize.height }}
              onResizeStop={(e, direction, ref, d) => {
                setDialogSize({
                  width: dialogSize.width + d.width,
                  height: dialogSize.height + d.height,
                });
              }}
              minWidth={1200}
              minHeight={600}
              maxWidth={window.innerWidth * 0.95}
              maxHeight={window.innerHeight * 0.95}
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
                  width: '10px', 
                  right: '0',
                  cursor: 'ew-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                bottom: { 
                  height: '10px', 
                  bottom: '0',
                  cursor: 'ns-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                left: { 
                  width: '10px', 
                  left: '0',
                  cursor: 'ew-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                top: { 
                  height: '10px', 
                  top: '0',
                  cursor: 'ns-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                topRight: { 
                  width: '20px', 
                  height: '20px', 
                  right: '0', 
                  top: '0',
                  cursor: 'ne-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                bottomRight: { 
                  width: '20px', 
                  height: '20px', 
                  right: '0', 
                  bottom: '0',
                  cursor: 'se-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                bottomLeft: { 
                  width: '20px', 
                  height: '20px', 
                  left: '0', 
                  bottom: '0',
                  cursor: 'sw-resize',
                  background: 'transparent',
                  zIndex: 100
                },
                topLeft: { 
                  width: '20px', 
                  height: '20px', 
                  left: '0', 
                  top: '0',
                  cursor: 'nw-resize',
                  background: 'transparent',
                  zIndex: 100
                },
              }}
              className="bg-[#1f2330] border-2 border-[#3d4457] rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', position: 'relative', isolation: 'isolate' }}
            >
              <div className="flex flex-col h-full w-full relative z-0">
                {/* Header - Full Width (does not shrink) */}
                <div className="px-6 py-4 border-b border-[#3d4457] drag-handle cursor-move">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#838a9c]">
                        {/* Left Menu */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#838a9c] hover:text-white hover:bg-[#292d39]"
                            >
                              <Menu className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 bg-[#292d39] border-[#3d4457] p-2" align="start">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-[#181c28]">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-[#838a9c]" />
                                  <span className="text-sm text-white">Activity</span>
                                  {comments.length > 0 && (
                                    <Badge className="ml-1 bg-[#0394ff] text-white border-none px-1.5 py-0 h-4 text-xs">
                                      {comments.length}
                                    </Badge>
                                  )}
                                </div>
                                <Switch 
                                  checked={showActivity} 
                                  onCheckedChange={setShowActivity}
                                  className="data-[state=checked]:bg-[#0394ff]"
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        <span className="text-[#0394ff]">Space</span>
                        <ChevronDown className="w-4 h-4" />
                        <span>Project Management</span>
                        <ChevronDown className="w-4 h-4" />
                        <span>{task.phase}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#838a9c]">Created on Jan 15 2021</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#838a9c]">
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#838a9c]">
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#838a9c]">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#838a9c] hover:text-white task-detail-close-btn"
                          onClick={() => onOpenChange(false)}
                          aria-label="Close dialog"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Task Title */}
                    <h2 className="text-white text-2xl mb-3">{task.name}</h2>

                    {/* Status & Priority Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      {/* Status Badge Dropdown */}
                      <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className={`w-auto h-7 px-3 text-xs font-medium border ${getStatusColor(status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#292d39] border-[#3d4457]">
                          <SelectItem value="todo" className="text-white text-xs">TODO</SelectItem>
                          <SelectItem value="in-progress" className="text-white text-xs">IN PROGRESS</SelectItem>
                          <SelectItem value="ready" className="text-white text-xs">READY</SelectItem>
                          <SelectItem value="in-review" className="text-white text-xs">IN REVIEW</SelectItem>
                          <SelectItem value="done" className="text-white text-xs">DONE</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Priority Badge Dropdown */}
                      <Select value={priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger className={`w-auto h-7 px-3 text-xs font-medium border ${getPriorityColor(priority)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#292d39] border-[#3d4457]">
                          <SelectItem value="low" className="text-white text-xs">LOW</SelectItem>
                          <SelectItem value="medium" className="text-white text-xs">MEDIUM</SelectItem>
                          <SelectItem value="high" className="text-white text-xs">HIGH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* AI Suggestions */}
                    <div className="flex items-center gap-2 text-sm text-[#838a9c] mb-4">
                      <Sparkles className="w-4 h-4 text-[#7c66d9]" />
                      <span className="text-[#7c66d9]">Ask Brain</span>
                      <span>to write a description, create a summary or find similar milestones</span>
                    </div>

                    {/* Properties - 2 Rows Grid */}
                    <div className="space-y-3">
                      {/* Row 1 */}
                      <div className="grid grid-cols-4 gap-4">
                        {/* Assignees */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Assignees
                          </div>
                          <Select
                            value={assigneeID || 'none'}
                            onValueChange={handleAssigneeChange}
                            disabled={loadingUsers}
                          >
                            <SelectTrigger className="bg-[#292d39] border-[#3d4457] h-8">
                              <SelectValue placeholder={loadingUsers ? 'Loading...' : 'Select assignee'} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#292d39] border-[#3d4457]">
                              <SelectItem value="none" className="text-[#838a9c]">
                                Unassigned
                              </SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.userID} value={user.userID} className="text-white">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                      style={{ backgroundColor: '#0394ff' }}
                                    >
                                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <span>{user.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Dates */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Dates
                          </div>
                          <div className="flex items-center gap-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-white h-8 px-2 text-xs">
                                  {startDate ? format(startDate, 'M/d/yy') : 'Start'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]">
                                <Calendar
                                  mode="single"
                                  selected={startDate}
                                  onSelect={handleStartDateChange}
                                  className="bg-[#292d39]"
                                />
                              </PopoverContent>
                            </Popover>
                            <span className="text-[#838a9c]">→</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-white h-8 px-2 text-xs">
                                  {endDate ? format(endDate, 'M/d/yy') : 'End'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]">
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={handleEndDateChange}
                                  className="bg-[#292d39]"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Empty for now */}
                        <div></div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-4 gap-4">
                        {/* Track Time - Small width */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Track Time
                          </div>
                          <Button variant="outline" size="sm" className="bg-[#292d39] border-[#3d4457] text-[#838a9c] h-8 w-full justify-start">
                            <Plus className="w-3 h-3 mr-1" />
                            Add time
                          </Button>
                        </div>

                        {/* Relationships - Same column as Assignees */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            Relationships
                          </div>
                          <div className="px-3 py-1 bg-[#292d39] rounded-md h-8 flex items-center text-[#838a9c] text-sm">
                            Empty
                          </div>
                        </div>

                        {/* Time Estimate - Same column as Dates */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Time Estimate
                          </div>
                          <Input
                            value={timeEstimate}
                            onChange={(e) => setTimeEstimate(e.target.value)}
                            className="bg-[#292d39] border-[#3d4457] text-white h-8"
                          />
                        </div>

                        {/* Phase Selector */}
                        <div>
                          <div className="text-xs text-[#838a9c] mb-2 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Phase
                          </div>
                          <Select
                            value={phaseID || 'none'}
                            onValueChange={handlePhaseChange}
                            disabled={loadingPhases}
                          >
                            <SelectTrigger className="bg-[#292d39] border-[#3d4457] h-8">
                              <SelectValue placeholder={loadingPhases ? 'Loading...' : 'Select phase'} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#292d39] border-[#3d4457]">
                              <SelectItem value="none" className="text-[#838a9c]">
                                No Phase
                              </SelectItem>
                              {phases.map((phase) => (
                                <SelectItem key={phase.phaseID} value={phase.phaseID} className="text-white">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: phase.color || '#838a9c' }}
                                    />
                                    <span>{phase.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Description Editor */}
                    <div className="mt-4">
                      {showDescriptionEditor ? (
                        <div>
                          <RichTextEditor
                            content={description}
                            onChange={handleDescriptionChange}
                            placeholder="Add a description for this task..."
                            className="mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-[#7c66d9]" />
                              <span className="text-[#7c66d9]">Write with AI</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDescriptionEditor(false)}
                              className="text-[#838a9c] hover:text-white"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDescriptionEditor(true)}
                            className="bg-transparent border-[#3d4457] text-[#838a9c] hover:bg-[#292d39]"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add description
                          </Button>
                          {description && description !== task?.name && (
                            <div className="mt-2 text-sm text-[#838a9c]">
                              Click to edit description
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                {/* Body Content - Two Column Grid Layout */}
                <div className="flex-1 overflow-hidden">
                  <div className="grid grid-cols-[1fr,450px] gap-6 h-full">
                    {/* LEFT COLUMN - Primary Content */}
                    <div className="overflow-y-auto px-6 py-6 pr-4">
                      {/* Tabs Section */}
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="bg-transparent border-b border-[#3d4457] rounded-none justify-start h-auto p-0 mb-6">
                          <TabsTrigger
                            value="details"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-4 py-3 text-[#838a9c] data-[state=active]:text-white"
                          >
                            Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="subtasks"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-4 py-3 text-[#838a9c] data-[state=active]:text-white"
                          >
                            Subtasks
                            {task.subtasks && task.subtasks.length > 0 && (
                              <Badge className="ml-2 bg-[#0394ff] text-white border-none px-1.5 py-0 h-5 text-xs">
                                {task.subtasks.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger
                            value="action-items"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-4 py-3 text-[#838a9c] data-[state=active]:text-white"
                          >
                            Action Items
                          </TabsTrigger>
                        </TabsList>

                        <div className="flex-1">
                          {/* Details Tab */}
                          <TabsContent value="details" className="mt-0">
                            <div className="space-y-4">
                              <h3 className="text-white font-medium">Custom Fields</h3>

                              <div className="space-y-3">
                                {/* Budget */}
                                <div className="flex items-center justify-between py-2 border-b border-[#3d4457]">
                                  <div className="flex items-center gap-2 text-[#838a9c]">
                                    <span className="text-sm">$</span>
                                    <span className="text-sm">Budget</span>
                                  </div>
                                  <div className="text-white font-medium">${task.budget.toLocaleString()}</div>
                                </div>

                                {/* Budget Remaining */}
                                <div className="flex items-center justify-between py-2 border-b border-[#3d4457]">
                                  <div className="flex items-center gap-2 text-[#838a9c]">
                                    <span className="text-sm">$</span>
                                    <span className="text-sm">budget remaining</span>
                                  </div>
                                  <div className="text-white font-medium">${task.budgetRemaining.toLocaleString()}</div>
                                </div>

                                {/* Review */}
                                <div className="flex items-center justify-between py-2 border-b border-[#3d4457]">
                                  <div className="flex items-center gap-2 text-[#838a9c]">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm">Review</span>
                                  </div>
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    Done
                                  </Badge>
                                </div>

                                {/* Revision */}
                                <div className="flex items-center justify-between py-2 border-b border-[#3d4457]">
                                  <div className="flex items-center gap-2 text-[#838a9c]">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm">Revision</span>
                                  </div>
                                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    Done
                                  </Badge>
                                </div>

                                {/* Spent */}
                                <div className="flex items-center justify-between py-2 border-b border-[#3d4457]">
                                  <div className="flex items-center gap-2 text-[#838a9c]">
                                    <span className="text-sm">$</span>
                                    <span className="text-sm">Spent</span>
                                  </div>
                                  <div className="text-white font-medium">${spent.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Subtasks Tab */}
                          <TabsContent value="subtasks" className="mt-0">
                            <div className="text-[#838a9c] text-center py-8">
                              {task.subtasks && task.subtasks.length > 0 ? (
                                <div className="space-y-2">
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-2 p-2 bg-[#292d39] rounded">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span className="text-white">{subtask.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                'No subtasks yet'
                              )}
                            </div>
                          </TabsContent>

                          {/* Action Items Tab */}
                          <TabsContent value="action-items" className="mt-0">
                            <div className="text-[#838a9c] text-center py-8">
                              No action items yet
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>

                      {/* Comments Section - Bottom of Left Column */}
                      <div className="mt-8 border-t border-[#3d4457] pt-6">
                        <h3 className="text-white font-medium mb-4">Comments ({comments.length})</h3>

                        {/* Comment Input */}
                        <div className="mb-6">
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleCommentKeyDown}
                            placeholder="Write a comment... (Press Enter to send, Shift+Enter for new line)"
                            className="bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c] resize-none mb-2"
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#838a9c]">
                                <Smile className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#838a9c]">
                                <Paperclip className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                              onClick={handleSendComment}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                          {comments.length === 0 ? (
                            <div className="text-center py-8 text-[#838a9c] text-sm">
                              No comments yet. Be the first to comment!
                            </div>
                          ) : (
                            comments.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback
                                    className="text-xs"
                                    style={{ backgroundColor: item.authorColor }}
                                  >
                                    {item.authorInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-white font-medium">{item.author}</span>
                                    <span className="text-xs text-[#838a9c]">{formatTimestamp(item.timestamp)}</span>
                                  </div>
                                  {item.type === 'comment' ? (
                                    <div className="bg-[#292d39] rounded-lg px-3 py-2 text-sm text-white break-words">
                                      {item.content}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-[#838a9c]">
                                      {item.content}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN - Widgets Sidebar */}
                    <div className="border-l border-[#3d4457] overflow-y-auto px-6 py-6 space-y-6">
                      {/* Assignee Widget */}
                      <div>
                        <h3 className="text-white font-medium mb-3 text-sm">Assignee</h3>
                        <Select
                          value={assigneeID || 'none'}
                          onValueChange={handleAssigneeChange}
                          disabled={loadingUsers}
                        >
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] h-10 w-full">
                            <SelectValue placeholder={loadingUsers ? 'Loading...' : 'Select assignee'} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="none" className="text-[#838a9c]">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>Unassigned</span>
                              </div>
                            </SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.userID} value={user.userID} className="text-white">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                    style={{ backgroundColor: '#0394ff' }}
                                  >
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-sm text-white">{user.name}</p>
                                    <p className="text-xs text-[#838a9c]">{user.email}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activity Widget Placeholder */}
                      {showActivity && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-medium text-sm">Activity</h3>
                            <Badge className="bg-[#0394ff] text-white border-none px-2 py-0.5 text-xs">
                              {comments.length}
                            </Badge>
                          </div>
                          <div className="text-[#838a9c] text-sm">
                            Recent activity will appear here
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Resizable>
          </div>
        </Draggable>
      </div>
    </>
  );
}
