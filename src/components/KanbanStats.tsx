import { Card } from './ui/card';
import { Task } from '../services/api';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface KanbanStatsProps {
  tasks: Task[];
}

export function KanbanStats({ tasks }: KanbanStatsProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: TrendingUp,
      color: '#0394ff',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: '#0394ff',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: '#51cf66',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: '#ff6b6b',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[#838a9c] text-sm">{stat.title}</p>
              <p className="text-white text-2xl">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
