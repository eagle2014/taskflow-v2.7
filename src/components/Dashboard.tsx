import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Rocket,
  Plus,
  Users,
  ArrowRight,
  Timer
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import {
  User,
  Project,
  Task,
  projectsApi,
  tasksApi,
  usersApi
} from '../services/api';
import { toast } from "sonner";

interface DashboardProps {
  currentUser: User | null;
  onNavigate?: (view: string) => void;
}

export function Dashboard({ currentUser, onNavigate }: DashboardProps) {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll(),
        usersApi.getAll()
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  // Calculate stats
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p: Project) => p.status === 'in_progress').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: Task) => t.status === 'completed').length,
    activeTasks: tasks.filter((t: Task) => t.status !== 'completed').length,
    myTasks: tasks.filter((t: Task) => t.assigneeID === currentUser.userID).length,
    teamMembers: users.length
  };

  // Get recent projects
  const recentProjects = projects
    .sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Get upcoming tasks (filter tasks with dueDate)
  const upcomingTasks = tasks
    .filter((t: Task) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) > new Date())
    .sort((a: Task, b: Task) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'review':
        return 'text-yellow-400';
      case 'planning':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
            <p className="text-[#838a9c] mt-2">{t('dashboard.welcome')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[#3d4457] rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-[#3d4457] rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
          <p className="text-[#838a9c] mt-2">{t('common.welcome')}, {currentUser.name}!</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => onNavigate?.('projects')} 
            className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.createNew')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#292d39] border-[#3d4457] p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">{t('dashboard.overviewCards.totalProjects')}</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">{t('dashboard.overviewCards.activeTasks')}</p>
              <p className="text-2xl font-bold text-white">{stats.activeTasks}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">{t('dashboard.overviewCards.completedTasks')}</p>
              <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#838a9c] text-sm">{t('dashboard.overviewCards.teamMembers')}</p>
              <p className="text-2xl font-bold text-white">{stats.teamMembers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">{t('dashboard.recentProjects')}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate?.('projects')}
              className="text-[#838a9c] hover:text-white"
            >
              {t('projects.allProjects')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.map((project: Project) => (
              <div key={project.projectID} className="flex items-center justify-between p-3 bg-[#3d4457] rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <p className="text-sm text-[#838a9c] mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getPriorityColor(project.priority)} text-white text-xs`}>
                      {t(`tasks.priority.${project.priority}`)}
                    </Badge>
                    <span className={`text-sm ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-[#838a9c]">
                <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('projects.recentProjects')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">{t('dashboard.upcomingDeadlines')}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate?.('my-tasks')}
              className="text-[#838a9c] hover:text-white"
            >
              {t('tasks.myTasks')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingTasks.map((task: Task) => {
              const assignee = users.find((u: User) => u.userID === task.assigneeID);
              const daysUntilDue = task.dueDate ? Math.ceil(
                (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              ) : 0;

              return (
                <div key={task.taskID} className="flex items-center justify-between p-3 bg-[#3d4457] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <p className="text-sm text-[#838a9c] mt-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                        {t(`tasks.priority.${task.priority}`)}
                      </Badge>
                      {assignee && (
                        <span className="text-xs text-[#838a9c]">
                          {assignee.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${daysUntilDue <= 2 ? 'text-red-400' : 'text-[#838a9c]'}`}>
                      {daysUntilDue > 0 ? `${daysUntilDue}d` : 'Overdue'}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {upcomingTasks.length === 0 && (
              <div className="text-center py-8 text-[#838a9c]">
                <Timer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 p-4 h-auto bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
            onClick={() => onNavigate?.('projects')}
          >
            <Rocket className="w-5 h-5" />
            {t('nav.projects')}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 p-4 h-auto bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
            onClick={() => onNavigate?.('my-tasks')}
          >
            <CheckCircle className="w-5 h-5" />
            {t('nav.myTasks')}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 p-4 h-auto bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
            onClick={() => onNavigate?.('calendar')}
          >
            <Calendar className="w-5 h-5" />
            {t('nav.calendar')}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 p-4 h-auto bg-[#3d4457] border-[#3d4457] text-white hover:bg-[#4a5568]"
            onClick={() => onNavigate?.('reports')}
          >
            <BarChart3 className="w-5 h-5" />
            {t('nav.reports')}
          </Button>
        </div>
      </Card>
    </div>
  );
}