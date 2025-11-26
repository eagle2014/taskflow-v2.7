import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { BarChart3, TrendingUp, Target, CheckCircle, Clock, AlertTriangle, Calendar, Users, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

export function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30days');

  // Mock data for reports
  const taskCompletionData = [
    { name: 'Week 1', completed: 12, pending: 5, overdue: 2 },
    { name: 'Week 2', completed: 15, pending: 8, overdue: 1 },
    { name: 'Week 3', completed: 10, pending: 12, overdue: 3 },
    { name: 'Week 4', completed: 18, pending: 6, overdue: 1 },
  ];

  const projectProgressData = [
    { name: 'Web Revamp', progress: 75, target: 80, completed: 45, total: 60 },
    { name: 'Mobile App', progress: 60, target: 65, completed: 24, total: 40 },
    { name: 'API Integration', progress: 90, target: 85, completed: 18, total: 20 },
    { name: 'UI/UX Redesign', progress: 45, target: 50, completed: 9, total: 20 },
  ];

  const teamPerformanceData = [
    { name: 'John Doe', tasksCompleted: 28, tasksAssigned: 32, efficiency: 87.5 },
    { name: 'Jane Smith', tasksCompleted: 25, tasksAssigned: 28, efficiency: 89.3 },
    { name: 'Mike Johnson', tasksCompleted: 22, tasksAssigned: 30, efficiency: 73.3 },
    { name: 'Sarah Wilson', tasksCompleted: 31, tasksAssigned: 35, efficiency: 88.6 },
  ];

  const priorityDistribution = [
    { name: 'High', value: 15, color: '#ff6b6b' },
    { name: 'Medium', value: 35, color: '#ffd43b' },
    { name: 'Low', value: 20, color: '#51cf66' },
    { name: 'Critical', value: 5, color: '#ff8cc8' },
  ];

  const velocityData = [
    { sprint: 'Sprint 1', planned: 25, completed: 23, velocity: 92 },
    { sprint: 'Sprint 2', planned: 30, completed: 28, velocity: 93 },
    { sprint: 'Sprint 3', planned: 28, completed: 25, velocity: 89 },
    { sprint: 'Sprint 4', planned: 32, completed: 31, velocity: 97 },
    { sprint: 'Sprint 5', planned: 35, completed: 33, velocity: 94 },
    { sprint: 'Sprint 6', planned: 30, completed: 32, velocity: 107 },
  ];

  const kpiData = [
    {
      title: 'Tasks Completed',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: CheckCircle,
      color: '#51cf66',
      description: 'This month'
    },
    {
      title: 'Average Completion Time',
      value: '2.3 days',
      change: '-15%',
      trend: 'down',
      icon: Clock,
      color: '#0394ff',
      description: 'Faster than last month'
    },
    {
      title: 'Team Efficiency',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: '#ffd43b',
      description: 'Overall productivity'
    },
    {
      title: 'On-Time Delivery',
      value: '94%',
      change: '+3%',
      trend: 'up',
      icon: Target,
      color: '#ff8cc8',
      description: 'Meeting deadlines'
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[#838a9c] text-sm mb-1">{kpi.title}</p>
                  <p className="text-2xl font-semibold text-white mb-1">{kpi.value}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-[#838a9c]">{kpi.description}</span>
                  </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task Completion Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Completion Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3d4457" />
              <XAxis dataKey="name" stroke="#838a9c" />
              <YAxis stroke="#838a9c" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#292d39', 
                  border: '1px solid #3d4457',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="completed" fill="#51cf66" name="Completed" />
              <Bar dataKey="pending" fill="#ffd43b" name="Pending" />
              <Bar dataKey="overdue" fill="#ff6b6b" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#292d39] border-[#3d4457] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#292d39', 
                  border: '1px solid #3d4457',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {priorityDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[#838a9c]">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Project Progress Overview</h3>
        <div className="space-y-6">
          {projectProgressData.map((project) => (
            <div key={project.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <p className="text-sm text-[#838a9c]">
                    {project.completed}/{project.total} tasks completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{project.progress}%</span>
                    <span className="text-sm text-[#838a9c]">Target: {project.target}%</span>
                  </div>
                  <div className={`text-xs ${
                    project.progress >= project.target ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {project.progress >= project.target ? 'On Track' : 'Behind Schedule'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-[#3d4457] rounded-full h-3">
                  <div 
                    className="bg-[#0394ff] h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${project.progress}%` }}
                  >
                    <div 
                      className="absolute top-0 right-0 w-1 h-3 bg-white rounded-full"
                      style={{ left: `${project.target}%` }}
                      title={`Target: ${project.target}%`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sprint Velocity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3d4457" />
            <XAxis dataKey="sprint" stroke="#838a9c" />
            <YAxis stroke="#838a9c" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#292d39', 
                border: '1px solid #3d4457',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Area type="monotone" dataKey="velocity" stroke="#0394ff" fill="url(#colorVelocity)" />
            <defs>
              <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0394ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0394ff" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <Card className="bg-[#292d39] border-[#3d4457] p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Team Performance</h3>
        <div className="space-y-4">
          {teamPerformanceData.map((member) => (
            <div key={member.name} className="p-4 bg-[#3d4457] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0394ff] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{member.name}</h4>
                    <p className="text-sm text-[#838a9c]">
                      {member.tasksCompleted}/{member.tasksAssigned} tasks completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-white">
                    {member.efficiency.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[#838a9c]">Efficiency</div>
                </div>
              </div>
              
              <div className="w-full bg-[#4a5568] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    member.efficiency >= 85 ? 'bg-green-400' :
                    member.efficiency >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${member.efficiency}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports & Analytics</h1>
          <p className="text-[#838a9c] mt-1">Track progress and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline" size="sm" className="border-[#4a5568] text-[#838a9c] hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="bg-[#0394ff] hover:bg-[#0570cd]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-[#3d4457] rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'projects', label: 'Projects', icon: Target },
          { id: 'team', label: 'Team', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0394ff] text-white'
                  : 'text-[#838a9c] hover:text-white hover:bg-[#4a5568]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'projects' && renderProjects()}
      {activeTab === 'team' && renderTeam()}
    </div>
  );
}