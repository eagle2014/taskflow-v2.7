import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Calendar, User, Flag, CheckSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const tasks = [
  {
    id: '1',
    title: 'Design new homepage layout',
    assignee: { name: 'Sarah Chen', avatar: 'SC' },
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-12-15',
    project: 'Web Revamp',
    tags: ['Design', 'Frontend'],
    subtasks: { completed: 3, total: 5 }
  },
  {
    id: '2',
    title: 'Implement user authentication',
    assignee: { name: 'Mike Johnson', avatar: 'MJ' },
    status: 'Todo',
    priority: 'High',
    dueDate: '2024-12-18',
    project: 'Mobile App',
    tags: ['Backend', 'Security'],
    subtasks: { completed: 0, total: 3 }
  },
  {
    id: '3',
    title: 'Write API documentation',
    assignee: { name: 'Lisa Wang', avatar: 'LW' },
    status: 'In Review',
    priority: 'Medium',
    dueDate: '2024-12-20',
    project: 'Mobile App',
    tags: ['Documentation'],
    subtasks: { completed: 2, total: 2 }
  },
  {
    id: '4',
    title: 'Update brand guidelines',
    assignee: { name: 'David Park', avatar: 'DP' },
    status: 'Done',
    priority: 'Low',
    dueDate: '2024-12-10',
    project: 'Marketing Q3',
    tags: ['Design', 'Branding'],
    subtasks: { completed: 4, total: 4 }
  },
  {
    id: '5',
    title: 'Setup monitoring dashboard',
    assignee: { name: 'Alex Kumar', avatar: 'AK' },
    status: 'Todo',
    priority: 'Medium',
    dueDate: '2024-12-25',
    project: 'Operations',
    tags: ['DevOps', 'Monitoring'],
    subtasks: { completed: 1, total: 6 }
  }
];

const statusColors = {
  'Todo': 'bg-gray-500/20 text-gray-400',
  'In Progress': 'bg-blue-500/20 text-blue-400',
  'In Review': 'bg-yellow-500/20 text-yellow-400',
  'Done': 'bg-green-500/20 text-green-400'
};

const priorityColors = {
  'Low': 'text-green-400',
  'Medium': 'text-yellow-400',
  'High': 'text-red-400'
};

interface TaskListProps {
  project?: any;
}

export function TaskList({ project }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {project ? `${project.name} Tasks` : 'All Tasks'}
          </h1>
          <p className="text-[#838a9c] mt-1">{filteredTasks.length} tasks found</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="bg-[#292d39] border-[#3d4457] p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c] w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3d4457] border border-[#4a5568] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
            />
          </div>
          <Button variant="outline" size="sm" className="border-[#4a5568] text-[#838a9c] hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="border-[#4a5568] text-[#838a9c] hover:text-white">
            Group by
          </Button>
          <Button variant="outline" size="sm" className="border-[#4a5568] text-[#838a9c] hover:text-white">
            Sort
          </Button>
        </div>
      </Card>

      {/* Task Table */}
      <Card className="bg-[#292d39] border-[#3d4457] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3d4457] border-b border-[#4a5568]">
              <tr>
                <th className="text-left p-4 w-8">
                  <input
                    type="checkbox"
                    className="rounded border-[#4a5568] bg-transparent"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTasks(filteredTasks.map(task => task.id));
                      } else {
                        setSelectedTasks([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Task</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Assignee</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Status</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Priority</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Due Date</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Progress</th>
                <th className="text-left p-4 text-[#838a9c] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-[#3d4457] hover:bg-[#3d4457]/50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="rounded border-[#4a5568] bg-transparent"
                    />
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{task.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#838a9c]">{task.project}</span>
                        <div className="flex gap-1">
                          {task.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-[#3d4457] text-[#838a9c] text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-full flex items-center justify-center text-xs font-medium text-white">
                        {task.assignee.avatar}
                      </div>
                      <span className="text-white text-sm">{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Flag className={`w-4 h-4 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
                      <span className={`text-sm ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        {task.priority}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[#838a9c] text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#3d4457] rounded-full h-2">
                        <div 
                          className="bg-[#0394ff] h-2 rounded-full"
                          style={{ width: `${(task.subtasks.completed / task.subtasks.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#838a9c]">
                        {task.subtasks.completed}/{task.subtasks.total}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="p-1 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}