import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  CheckSquare,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User as UserIcon,
  Flag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Database,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '../utils/i18n/context';
import {
  User,
  Task,
  Project,
  tasksApi,
  projectsApi,
  usersApi
} from '../services/api';
import { toast } from 'sonner';
import { NewTaskDialog } from './NewTaskDialog';
import { EditTaskForm } from './EditTaskForm';

export function MyTasks({ currentUser }: { currentUser: User | null }) {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Initial load
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);

    try {
      console.log('🔍 Loading tasks for user:', currentUser?.userID);

      if (currentUser?.userID) {
        const [allTasksData, projectsData, usersData] = await Promise.all([
          tasksApi.getAll(),
          projectsApi.getAll(),
          usersApi.getAll()
        ]);

        // Filter tasks assigned to current user
        const tasksData = allTasksData.filter(t => t.assigneeID === currentUser.userID);

        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
        console.log('✅ Successfully loaded tasks:', tasksData.length);
      } else {
        console.log('📝 No current user');
        setTasks([]);
        setProjects([]);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Load tasks error:', error);
      toast.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSyncMockData = async () => {
    try {
      // Clear current data and reload from mock
      localStorage.removeItem('taskflow_tasks');
      localStorage.removeItem('taskflow_projects');
      localStorage.removeItem('taskflow_users');
      
      await loadData();
      toast.success('Mock data synced successfully!');
    } catch (error) {
      console.error('Error syncing mock data:', error);
      toast.error('Failed to sync mock data');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(task => task.taskID !== taskId));
      toast.success(t('message.taskDeleted'));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(t('message.error'));
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updatedTask = await tasksApi.update(taskId, {
        status: newStatus
      });

      setTasks(prev => prev.map(task =>
        task.taskID === taskId ? updatedTask : task
      ));

      toast.success(t('message.taskUpdated'));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(t('message.error'));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditTaskForm(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task =>
      task.taskID === updatedTask.taskID ? updatedTask : task
    ));
    toast.success('Task updated successfully!');
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setShowNewTaskForm(false);
    toast.success('Task created successfully!');
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = filteredTasks.filter(task =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const performanceRate = 81.2; // Mock performance rate

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
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
        return 'text-green-400 bg-green-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'review':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'todo':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'review':
        return 'Đang review';
      case 'todo':
        return 'Nghiên cứu';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const getProjectName = (projectId: string | undefined) => {
    if (!projectId) return 'No Project';
    const project = projects.find(p => p.projectID === projectId);
    return project?.name || 'Unknown Project';
  };

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.userID === userId);
    return user?.name || 'Unknown User';
  };

  const getUserAvatar = (userId: string | undefined) => {
    if (!userId) return '';
    const user = users.find(u => u.userID === userId);
    return user?.avatar || '';
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-[#838a9c] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">Please sign in</h3>
        <p className="text-[#838a9c]">You need to be signed in to view your tasks</p>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Tasks</h1>
            <p className="text-[#838a9c] mt-2">Loading your tasks...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-[#3d4457] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-[#3d4457] rounded w-full mb-2"></div>
                <div className="h-4 bg-[#3d4457] rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Tasks</h1>
          <p className="text-[#838a9c] mt-2">
            Quản lý và theo dõi tiến độ công việc được giao
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowNewTaskForm(true)}
            size="sm"
            className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Tổng số task</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
            <CheckSquare className="w-6 h-6 text-[#838a9c]" />
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Đang thực hiện</p>
              <p className="text-2xl font-bold text-blue-400">{inProgressTasks}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Quá hạn</p>
              <p className="text-2xl font-bold text-red-400">{overdueTasks}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Tiến độ T6</p>
              <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">Hiệu suất T6</p>
              <p className="text-2xl font-bold text-yellow-400">{performanceRate}%</p>
            </div>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c] w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#3d4457] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:border-[#0394ff]"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#3d4457] border border-[#3d4457] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="todo">Nghiên cứu</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="review">Đang review</option>
          <option value="completed">Hoàn thành</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#3d4457] border border-[#3d4457] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
        >
          <option value="all">Tất cả độ ưu tiên</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
      </div>

      {/* Tasks Table */}
      <Card className="bg-[#292d39] border-[#3d4457] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3d4457]/50">
              <tr>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Tên công việc</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Giai đoạn</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Trạng thái</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Tiến độ</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Ưu tiên</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Người thực hiện</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Bắt đầu thực hiện</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Kết thúc thực hiện</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium">Thời gian thực tế</th>
                <th className="text-left py-3 px-4 text-[#838a9c] font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => {
                const progressPercent = (task.estimatedHours ?? 0) > 0
                  ? Math.min(100, Math.round(((task.actualHours ?? 0) / (task.estimatedHours ?? 1)) * 100))
                  : (task.progress ?? 0);

                return (
                  <tr
                    key={task.taskID}
                    className="border-t border-[#3d4457] hover:bg-[#3d4457]/30 cursor-pointer"
                    onDoubleClick={() => handleEditTask(task)}
                    title="Double-click to edit task"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <div>
                          <p className="text-white font-medium">{task.title}</p>
                          <p className="text-[#838a9c] text-sm">{getProjectName(task.projectID)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {index < 3 ? 'Phát triển' : index === 3 ? 'Nghiên cứu' : 'Thực hiện'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={`${getStatusColor(task.status)} px-2 py-1 text-xs rounded-full border`}>
                        {getStatusText(task.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{progressPercent}%</span>
                        <div className="w-16 bg-[#3d4457] rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={getPriorityBadgeColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getUserAvatar(task.assigneeID) && (
                          <img
                            src={getUserAvatar(task.assigneeID)}
                            alt={getUserName(task.assigneeID)}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-white text-sm">{getUserName(task.assigneeID)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#838a9c] text-sm">
                        {task.startDate ? format(new Date(task.startDate), 'dd/MM/yyyy') : format(new Date(task.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#838a9c] text-sm">
                        {task.dueDate ? format(new Date(task.dueDate), 'dd/MM/yyyy') : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white text-sm">{task.actualHours ?? 0}h</span>
                      <br />
                      <span className="text-[#838a9c] text-xs">/{task.estimatedHours ?? 0}h</span>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-[#838a9c] hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#292d39] border-[#3d4457]">
                          <DropdownMenuItem 
                            onClick={() => handleEditTask(task)}
                            className="text-white hover:bg-[#3d4457]"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateTaskStatus(task.taskID, 'in_progress')}
                            className="text-white hover:bg-[#3d4457]"
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateTaskStatus(task.taskID, 'completed')}
                            className="text-white hover:bg-[#3d4457]"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.taskID)}
                            className="text-red-400 hover:bg-[#3d4457]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-[#838a9c] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'No tasks match your filters' 
              : 'No tasks assigned to you'
            }
          </h3>
          <p className="text-[#838a9c] mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Tasks assigned to you will appear here'
            }
          </p>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskForm && (
        <NewTaskDialog
          currentUser={currentUser}
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowNewTaskForm(false)}
        />
      )}

      {/* Edit Task Modal */}
      {showEditTaskForm && editingTask && (
        <EditTaskForm 
          currentUser={currentUser}
          task={editingTask}
          onTaskUpdated={handleTaskUpdated}
          onCancel={() => {
            setShowEditTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}