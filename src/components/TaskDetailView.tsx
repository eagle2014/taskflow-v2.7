import { useState, useEffect } from 'react';
import { Task, User, usersApi, commentsApi, Comment, tasksApi } from '../services/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar, 
  Flag, 
  User as UserIcon, 
  Clock, 
  MessageSquare,
  Send,
  X,
  FileText,
  ClockIcon,
  CheckSquare,
  Link as LinkIcon,
  CalendarDays,
  Settings,
  Upload,
  FilePlus,
  Link2,
  Files
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { LinkTaskDialog } from './LinkTaskDialog';
import { toast } from 'sonner';

interface TaskDetailViewProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onTaskUpdated?: (task: Task) => void;
}

export function TaskDetailView({ task, currentUser, onClose, onTaskUpdated }: TaskDetailViewProps) {
  const [comments, setComments] = useState<(Comment & { author?: User })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [reporter, setReporter] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [showLinkDocDialog, setShowLinkDocDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [task.taskID || task.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const taskId = task.taskID || task.id;
      const [commentsData, usersData] = await Promise.all([
        commentsApi.getByTask(taskId),
        usersApi.getAll()
      ]);

      const commentsWithAuthors = commentsData.map(comment => ({
        ...comment,
        author: usersData.find(u => u.userID === comment.authorID || u.userID === comment.author_id)
      }));

      setComments(commentsWithAuthors);
      setUsers(usersData);
      const assigneeId = task.assigneeID || task.assignee_id;
      const reporterId = task.createdBy || task.reporter_id;
      setAssignee(usersData.find(u => u.userID === assigneeId) || null);
      setReporter(usersData.find(u => u.userID === reporterId) || null);
    } catch (error) {
      console.error('Failed to load task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const taskId = task.taskID || task.id;
      const comment = await commentsApi.create({
        taskID: taskId,
        authorID: currentUser.userID,
        content: newComment
      });

      setComments(prev => [...prev, { ...comment, author: currentUser }]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleLinkDocuments = (documentIds: string[]) => {
    toast.success(`Linked ${documentIds.length} document(s)`);
    setShowLinkDocDialog(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'todo':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-white text-2xl mb-2">{task.title}</h2>
          <p className="text-[#838a9c]">{task.description || 'No description provided'}</p>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(task.status)} px-3 py-1 border`}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getPriorityColor(task.priority)} px-3 py-1 border`}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority} priority
          </Badge>
        </div>
      </div>

      <Separator className="bg-[#3d4457]" />

      {/* Task Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Assignee */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#838a9c] text-sm">
            <UserIcon className="w-4 h-4" />
            <span>Assignee</span>
          </div>
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="bg-[#0394ff] text-white">
                  {assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white text-sm">{assignee.name}</div>
                <div className="text-[#838a9c] text-xs">{assignee.role}</div>
              </div>
            </div>
          ) : (
            <div className="text-[#838a9c] text-sm">Unassigned</div>
          )}
        </div>

        {/* Reporter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#838a9c] text-sm">
            <UserIcon className="w-4 h-4" />
            <span>Reporter</span>
          </div>
          {reporter ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={reporter.avatar} alt={reporter.name} />
                <AvatarFallback className="bg-[#0394ff] text-white">
                  {reporter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white text-sm">{reporter.name}</div>
                <div className="text-[#838a9c] text-xs">{reporter.role}</div>
              </div>
            </div>
          ) : (
            <div className="text-[#838a9c] text-sm">Unknown</div>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#838a9c] text-sm">
            <Calendar className="w-4 h-4" />
            <span>Due Date</span>
          </div>
          <div className="text-white text-sm">{formatDate(task.dueDate || task.due_date || '')}</div>
        </div>

        {/* Time Tracking */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#838a9c] text-sm">
            <Clock className="w-4 h-4" />
            <span>Time Tracking</span>
          </div>
          <div className="text-white text-sm">
            {task.actualHours || task.actual_hours || 0}h / {task.estimatedHours || task.estimated_hours || 0}h
            {(task.estimatedHours || task.estimated_hours || 0) > 0 && (
              <span className="text-[#838a9c] ml-2">
                ({Math.round(((task.actualHours || task.actual_hours || 0) / (task.estimatedHours || task.estimated_hours || 1)) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-[#3d4457]" />

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-[#3d4457] rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger 
            value="documents" 
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-0 pb-3 text-[#838a9c] data-[state=active]:text-[#0394ff] data-[state=active]:bg-transparent"
          >
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger 
            value="timelogs" 
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-0 pb-3 text-[#838a9c] data-[state=active]:text-[#0394ff] data-[state=active]:bg-transparent"
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            Timelogs
          </TabsTrigger>
          <TabsTrigger 
            value="feign-documents" 
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-0 pb-3 text-[#838a9c] data-[state=active]:text-[#0394ff] data-[state=active]:bg-transparent"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Feign Documents
          </TabsTrigger>
          <TabsTrigger 
            value="related-tasks" 
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-0 pb-3 text-[#838a9c] data-[state=active]:text-[#0394ff] data-[state=active]:bg-transparent"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Related Tasks
            <Badge className="ml-2 bg-[#0394ff] text-white border-none px-1.5 py-0 h-5 text-xs">1</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[#0394ff] rounded-none px-0 pb-3 text-[#838a9c] data-[state=active]:text-[#0394ff] data-[state=active]:bg-transparent"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab Content */}
        <TabsContent value="documents" className="mt-6">
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            {/* Empty State Illustration */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Floating papers illustration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-40 border-2 border-[#3d4457] bg-transparent rounded-lg transform -rotate-12 opacity-50"></div>
              
              {/* Main folder/document */}
              <div className="relative w-40 h-44 bg-[#292d39] border-2 border-[#3d4457] rounded-lg flex flex-col overflow-hidden">
                {/* Folder tab */}
                <div className="h-8 bg-[#0394ff]/20 border-b border-[#3d4457]"></div>
                
                {/* Smiley face */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-6xl text-[#838a9c]">
                    <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="35" cy="40" r="3" fill="currentColor" />
                      <circle cx="65" cy="40" r="3" fill="currentColor" />
                      <path d="M 30 60 Q 50 70 70 60" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="text-[#838a9c] text-center">
              Hey there are no Documents added to this Task yet
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowLinkDocDialog(true)}
                className="bg-transparent border-2 border-[#0394ff] text-[#0394ff] hover:bg-[#0394ff]/10 px-6 h-10"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Documents
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white px-6 h-10">
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
        </TabsContent>

        {/* Timelogs Tab Content */}
        <TabsContent value="timelogs" className="mt-6">
          <div className="text-center py-12 text-[#838a9c]">
            Timelogs feature coming soon
          </div>
        </TabsContent>

        {/* Feign Documents Tab Content */}
        <TabsContent value="feign-documents" className="mt-6">
          <div className="text-center py-12 text-[#838a9c]">
            Feign Documents feature coming soon
          </div>
        </TabsContent>

        {/* Related Tasks Tab Content */}
        <TabsContent value="related-tasks" className="mt-6">
          <div className="text-center py-12 text-[#838a9c]">
            Related Tasks feature coming soon
          </div>
        </TabsContent>

        {/* Events Tab Content */}
        <TabsContent value="events" className="mt-6">
          <div className="text-center py-12 text-[#838a9c]">
            Events feature coming soon
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="bg-[#3d4457]" />

      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-4 h-4" />
          <span>Comments ({comments.length})</span>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-64 overflow-y-auto taskflow-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-[#838a9c]">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
                  <AvatarFallback className="bg-[#0394ff] text-white text-xs">
                    {comment.author?.name.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{comment.author?.name || 'Unknown'}</span>
                    <span className="text-[#838a9c] text-xs">{formatDateTime(comment.created_at)}</span>
                  </div>
                  <p className="text-[#838a9c] text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-[#0394ff] text-white text-xs">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddComment();
                }
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-[#838a9c] text-xs">Press Ctrl+Enter to send</p>
      </div>

      {/* Metadata */}
      <Separator className="bg-[#3d4457]" />
      <div className="flex items-center justify-between text-xs text-[#838a9c]">
        <div>Created: {formatDateTime(task.createdAt || task.created_at || '')}</div>
        <div>Updated: {formatDateTime(task.updatedAt || task.updated_at || '')}</div>
      </div>

      {/* Link Documents Dialog */}
      <LinkTaskDialog
        open={showLinkDocDialog}
        onOpenChange={setShowLinkDocDialog}
        onLinkTasks={handleLinkDocuments}
      />
    </div>
  );
}
