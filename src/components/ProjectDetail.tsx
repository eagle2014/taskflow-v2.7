import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar } from './ui/avatar';
import { Input } from './ui/input';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  Quote,
  Briefcase,
  File,
  Link as LinkIcon,
  CheckSquare,
  BarChart3,
  Settings,
  MoreHorizontal,
  Target,
  Paperclip,
  CalendarDays,
  Upload,
  Link2,
  Files,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { useI18n } from '../utils/i18n/context';
import { Project, Task, User, tasksApi, usersApi } from '../utils/mockApi';
import { toast } from 'sonner';
import { AddInvoiceDialog } from './AddInvoiceDialog';
import { NewTaskForm } from './NewTaskForm';
import { EditTaskForm } from './EditTaskForm';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  currentUser: User | null;
}

export function ProjectDetail({ project, onBack, currentUser }: ProjectDetailProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('summary');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Number of tabs to show before collapsing into dropdown
  const MAX_VISIBLE_TABS = 7;

  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [tasksData, usersData] = await Promise.all([
        tasksApi.getTasks(),
        usersApi.getUsers()
      ]);
      
      // Filter tasks for this project
      const projectTasks = tasksData.filter(task => task.project_id === project.id);
      setTasks(projectTasks);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStageColor = (status: string) => {
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

  const getStageLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'todo':
        return 'Todo';
      default:
        return status;
    }
  };

  const handleTaskCreated = async (task: any) => {
    toast.success('Task created successfully!');
    setShowNewTaskForm(false);
    // Reload tasks to show the new one
    await loadProjectData();
  };

  const handleTaskUpdated = async (task: any) => {
    toast.success('Task updated successfully!');
    setEditingTask(null);
    // Reload tasks to show the updated one
    await loadProjectData();
  };

  const handleTaskDoubleClick = (task: Task) => {
    setEditingTask(task);
  };

  const tabs = [
    { id: 'summary', label: t('Summary'), icon: BarChart3 },
    { id: 'details', label: t('Details'), icon: Target },
    { id: 'milestones', label: t('Project Milestones'), icon: Target },
    { id: 'tasks', label: t('Tasks'), icon: CheckSquare },
    { id: 'updates', label: t('Updates'), icon: MessageSquare },
    { id: 'documents', label: t('Documents'), icon: Paperclip },
    { id: 'invoices', label: t('Invoices'), icon: FileText },
    { id: 'events', label: t('Events'), icon: CalendarDays },
    { id: 'quotes', label: t('Quotes'), icon: Quote },
    { id: 'cases', label: t('Cases'), icon: Briefcase },
    { id: 'edge-documents', label: t('Edge Documents'), icon: LinkIcon }
  ];

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const assignee = getUserById(task.assignee_id);
    const reporter = getUserById(task.reporter_id);
    
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      assignee?.name.toLowerCase().includes(query) ||
      reporter?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col bg-[#181c28]">
      {/* Header */}
      <div className="bg-[#292d39] border-b border-[#3d4457] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('Back')}
            </Button>
            <div className="h-6 w-px bg-[#3d4457]"></div>
            <div>
              <h1 className="text-xl text-white mb-1">{project.name}</h1>
              <p className="text-sm text-[#838a9c]">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#3d4457] text-white hover:bg-[#3d4457]"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('Settings')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {/* Visible Tabs */}
          {tabs.slice(0, MAX_VISIBLE_TABS).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'bg-[#0394ff] text-white'
                    : 'text-[#838a9c] hover:text-white hover:bg-[#3d4457]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          
          {/* Dropdown for remaining tabs */}
          {tabs.length > MAX_VISIBLE_TABS && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors
                    ${tabs.slice(MAX_VISIBLE_TABS).some(tab => tab.id === activeTab)
                      ? 'bg-[#0394ff] text-white'
                      : 'text-[#838a9c] hover:text-white hover:bg-[#3d4457]'
                    }
                  `}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-[#292d39] border-[#3d4457] min-w-[200px]"
              >
                {tabs.slice(MAX_VISIBLE_TABS).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 cursor-pointer
                        ${activeTab === tab.id
                          ? 'bg-[#0394ff] text-white'
                          : 'text-white hover:bg-[#3d4457]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto taskflow-scrollbar p-6">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                <Input
                  placeholder="Type to search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#292d39] border-[#3d4457] text-white pl-10"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#3d4457] text-white hover:bg-[#3d4457]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('Filters')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowNewTaskForm(true)}
                  className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('Add Task')}
                </Button>
              </div>
            </div>

            {/* Tasks Table */}
            <Card className="bg-[#292d39] border-[#3d4457]">
              <div className="overflow-x-auto taskflow-scrollbar">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#3d4457]">
                    <tr>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">NAME</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">ASSIGNED TO</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">START DATE...</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">DUE DATE &...</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">RELATED TO</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">STAGE</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">TASK TYPE</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">DESCRIPTION</th>
                      <th className="text-left text-[#838a9c] py-3 px-4 whitespace-nowrap">CREATED BY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-[#838a9c]">
                          Loading tasks...
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-[#838a9c]">
                          {searchQuery ? 'No tasks found matching your search' : 'No tasks in this project yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const assignee = getUserById(task.assignee_id);
                        const reporter = getUserById(task.reporter_id);
                        
                        return (
                          <tr
                            key={task.id}
                            className="border-b border-[#3d4457] hover:bg-[#3d4457]/30 transition-colors cursor-pointer"
                            onDoubleClick={() => handleTaskDoubleClick(task)}
                            title="Double-click to edit task"
                          >
                            <td className="py-3 px-4 text-[#0394ff] whitespace-nowrap">
                              {task.title}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {assignee && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6 bg-[#0394ff] text-white text-xs">
                                    {assignee.name.charAt(0)}
                                  </Avatar>
                                  <span className="text-white">{assignee.name}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">
                              {formatDate(task.created_at)}
                            </td>
                            <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">
                              {formatDate(task.due_date)}
                            </td>
                            <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap">-</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <Badge variant="outline" className={`text-xs ${getStageColor(task.status)}`}>
                                {getStageLabel(task.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-white whitespace-nowrap">
                              Checklist Item
                            </td>
                            <td className="py-3 px-4 text-[#838a9c] whitespace-nowrap max-w-xs truncate">
                              {task.description || '-'}
                            </td>
                            <td className="py-3 px-4 text-white whitespace-nowrap">
                              {reporter?.name || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination info */}
            {filteredTasks.length > 0 && (
              <div className="text-sm text-[#838a9c]">
                Showing 1 to {filteredTasks.length} of {filteredTasks.length} tasks
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Project Overview */}
            <Card className="bg-[#292d39] border-[#3d4457] p-6">
              <h3 className="text-white mb-4">Project Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Total Tasks</div>
                  <div className="text-white text-2xl">{tasks.length}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Completed</div>
                  <div className="text-green-400 text-2xl">{tasks.filter(t => t.status === 'completed').length}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">In Progress</div>
                  <div className="text-blue-400 text-2xl">{tasks.filter(t => t.status === 'in_progress').length}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Todo</div>
                  <div className="text-gray-400 text-2xl">{tasks.filter(t => t.status === 'todo').length}</div>
                </div>
              </div>
            </Card>

            {/* Project Details */}
            <Card className="bg-[#292d39] border-[#3d4457] p-6">
              <h3 className="text-white mb-4">Project Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[#838a9c] text-xs mb-1">Project Name</div>
                    <div className="text-white">{project.name}</div>
                  </div>
                  <div>
                    <div className="text-[#838a9c] text-xs mb-1">Status</div>
                    <Badge variant="outline" className={getStageColor(project.status || 'in_progress')}>
                      {getStageLabel(project.status || 'in_progress')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Description</div>
                  <div className="text-white">{project.description || 'No description'}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <Card className="bg-[#292d39] border-[#3d4457] p-6">
              <h3 className="text-white mb-4">Project Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Project ID</div>
                  <div className="text-white">{project.project_id || project.id}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Category</div>
                  <div className="text-white">{project.category || '-'}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Priority</div>
                  <Badge variant="outline" className="text-xs">
                    {project.priority || 'Medium'}
                  </Badge>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Progress</div>
                  <div className="text-white">{project.progress || 0}%</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Start Date</div>
                  <div className="text-white">{formatDate(project.start_date || project.created_at)}</div>
                </div>
                <div>
                  <div className="text-[#838a9c] text-xs mb-1">Due Date</div>
                  <div className="text-white">{formatDate(project.end_date || project.due_date)}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            <Card className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">Activity Timeline</h3>
                <MessageSquare className="w-5 h-5 text-[#838a9c]" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-3 pb-4 border-b border-[#3d4457]">
                  <div className="w-8 h-8 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm mb-1">{currentUser?.name || 'User'}</div>
                    <div className="text-[#838a9c] text-xs">Project created</div>
                    <div className="text-[#838a9c] text-xs mt-1">{formatDate(project.created_at)}</div>
                  </div>
                </div>
                <div className="text-center text-[#838a9c] text-sm py-4">
                  No recent updates
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md">
              {/* Empty State Illustration */}
              <div className="mb-6 relative">
                {/* Document/Folder Icon */}
                <svg 
                  width="120" 
                  height="120" 
                  viewBox="0 0 120 120" 
                  className="mx-auto"
                  style={{ transform: 'rotate(-15deg)' }}
                >
                  <rect 
                    x="20" 
                    y="15" 
                    width="60" 
                    height="70" 
                    rx="4" 
                    fill="none" 
                    stroke="#838a9c" 
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <line x1="30" y1="30" x2="70" y2="30" stroke="#838a9c" strokeWidth="2" opacity="0.3" />
                  <line x1="30" y1="45" x2="70" y2="45" stroke="#838a9c" strokeWidth="2" opacity="0.3" />
                  <line x1="30" y1="60" x2="60" y2="60" stroke="#838a9c" strokeWidth="2" opacity="0.3" />
                </svg>

                {/* Smiling Box/Folder Below */}
                <div className="absolute left-1/2 top-[70px] transform -translate-x-1/2">
                  <svg width="140" height="80" viewBox="0 0 140 80" className="mx-auto">
                    {/* Box/Container */}
                    <rect 
                      x="10" 
                      y="10" 
                      width="120" 
                      height="60" 
                      rx="8" 
                      fill="none" 
                      stroke="#0394ff" 
                      strokeWidth="3"
                    />
                    {/* Top lid line */}
                    <path 
                      d="M 10 25 L 130 25" 
                      stroke="#0394ff" 
                      strokeWidth="3"
                      opacity="0.6"
                    />
                    
                    {/* Smiley Face */}
                    {/* Eyes */}
                    <circle cx="50" cy="42" r="3" fill="#0394ff" />
                    <circle cx="90" cy="42" r="3" fill="#0394ff" />
                    {/* Smile */}
                    <path 
                      d="M 50 52 Q 70 60 90 52" 
                      fill="none" 
                      stroke="#0394ff" 
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <p className="text-[#838a9c] mb-6 mt-12" style={{ fontSize: '15px' }}>
                Hey there are no Documents added to this Project yet
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {/* Link Documents Button */}
                <Button 
                  className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                  onClick={() => {
                    toast.success('Link Documents dialog would open here');
                  }}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link Documents
                </Button>

                {/* Add Documents Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Documents
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-[#292d39] border-[#3d4457] text-white"
                  >
                    <DropdownMenuItem 
                      onClick={() => toast.success('Create New Document clicked')}
                      className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create New Document
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toast.success('File Upload clicked')}
                      className="focus:bg-[#3d4457] focus:text-white cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      File Upload
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toast.success('Link External Document clicked')}
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
                      onClick={() => toast.success('Upload Multiple Files clicked')}
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

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md">
              {/* Empty State Illustration - Business Person */}
              <div className="mb-6 relative">
                <svg width="180" height="180" viewBox="0 0 180 180" className="mx-auto">
                  {/* Head */}
                  <circle cx="90" cy="50" r="20" fill="#0394ff" opacity="0.3" />
                  
                  {/* Hair */}
                  <path 
                    d="M 70 45 Q 75 35 90 35 Q 105 35 110 45" 
                    fill="#0394ff" 
                    opacity="0.5"
                  />
                  
                  {/* Face */}
                  <circle cx="90" cy="55" r="18" fill="#838a9c" opacity="0.2" />
                  
                  {/* Eyes */}
                  <circle cx="83" cy="52" r="2" fill="#0394ff" />
                  <circle cx="97" cy="52" r="2" fill="#0394ff" />
                  
                  {/* Smile */}
                  <path 
                    d="M 83 60 Q 90 64 97 60" 
                    fill="none" 
                    stroke="#0394ff" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Body/Shirt */}
                  <path 
                    d="M 70 73 L 70 130 L 110 130 L 110 73 Z" 
                    fill="#3d4457"
                    opacity="0.6"
                  />
                  
                  {/* Tie */}
                  <path 
                    d="M 90 73 L 85 90 L 90 115 L 95 90 Z" 
                    fill="#0394ff"
                    opacity="0.7"
                  />
                  
                  {/* Tie knot */}
                  <rect 
                    x="85" 
                    y="70" 
                    width="10" 
                    height="6" 
                    fill="#0394ff"
                    opacity="0.8"
                  />
                  
                  {/* Left Arm */}
                  <rect 
                    x="50" 
                    y="80" 
                    width="20" 
                    height="60" 
                    rx="10"
                    fill="#3d4457"
                    opacity="0.5"
                  />
                  
                  {/* Right Arm */}
                  <rect 
                    x="110" 
                    y="80" 
                    width="20" 
                    height="60" 
                    rx="10"
                    fill="#3d4457"
                    opacity="0.5"
                  />
                  
                  {/* Left Hand - holding paper */}
                  <ellipse 
                    cx="55" 
                    cy="145" 
                    rx="8" 
                    ry="10"
                    fill="#838a9c"
                    opacity="0.3"
                  />
                  
                  {/* Right Hand - holding briefcase */}
                  <ellipse 
                    cx="125" 
                    cy="145" 
                    rx="8" 
                    ry="10"
                    fill="#838a9c"
                    opacity="0.3"
                  />
                  
                  {/* Briefcase */}
                  <rect 
                    x="115" 
                    y="135" 
                    width="25" 
                    height="20" 
                    rx="2"
                    fill="#0394ff"
                    opacity="0.4"
                  />
                  <rect 
                    x="125" 
                    y="132" 
                    width="5" 
                    height="5" 
                    rx="1"
                    fill="#0394ff"
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* Text */}
              <p className="text-[#838a9c] mb-6 mt-4" style={{ fontSize: '15px' }}>
                Hey there are no invoices added to this Project yet
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {/* Link Invoices Button */}
                <Button 
                  className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                  onClick={() => {
                    toast.success('Link Invoices dialog would open here');
                  }}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link invoices
                </Button>

                {/* Add Invoice Button */}
                <Button 
                  className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                  onClick={() => setAddInvoiceOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add invoice
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white">Project Events</h3>
              <Button size="sm" className="bg-[#0394ff] hover:bg-[#0570cd]">
                <CalendarDays className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
            <Card className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="text-center text-[#838a9c] py-8">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No events scheduled</p>
              </div>
            </Card>
          </div>
        )}

        {/* Other placeholder tabs */}
        {!['summary', 'details', 'milestones', 'tasks', 'updates', 'documents', 'invoices', 'events'].includes(activeTab) && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-[#838a9c]">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>This tab is not implemented yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Invoice Dialog */}
      <AddInvoiceDialog 
        open={addInvoiceOpen} 
        onOpenChange={setAddInvoiceOpen}
        projectId={project.id}
      />

      {/* New Task Form */}
      {showNewTaskForm && (
        <NewTaskForm
          currentUser={currentUser}
          projectId={project.id}
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowNewTaskForm(false)}
        />
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <EditTaskForm
          currentUser={currentUser}
          task={editingTask}
          projectId={project.id}
          onTaskUpdated={handleTaskUpdated}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
