import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Target,
  Clock,
  TrendingUp,
  MoreHorizontal,
  UserPlus,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  Database
} from 'lucide-react';
import { Input } from './ui/input';
import { AddMemberForm } from './AddMemberForm';
import { UserManagement } from './UserManagement';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TeamMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  location?: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'away' | 'busy' | 'offline';
  assignedProject?: string;
  createdAt: string;
  updatedAt: string;
  // Optional fields for display (computed or default values)
  assignedProjects?: {
    id: string;
    name: string;
    role: string;
    progress: number;
  }[];
  stats?: {
    tasksCompleted: number;
    tasksInProgress: number;
    overdueTasks: number;
    efficiency: number;
  };
  skills?: string[];
  workload?: number; // percentage
}

export function Team() {
  const [activeTab, setActiveTab] = useState('team-members');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load team members when component mounts
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(!showLoading);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/team-members`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
        if (!showLoading) {
          toast.success(`Refreshed team data - ${data.count || 0} members found`);
        }
      } else {
        console.log('🔄 Server not available, using demo data');
        // Fallback to demo data if server fails
        setTeamMembers(getDemoTeamMembers());
      }
    } catch (error) {
      console.log('🔄 Server connection failed, using demo data');
      // Fallback to demo data
      setTeamMembers(getDemoTeamMembers());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getDemoTeamMembers = (): TeamMember[] => [
    {
      id: 'demo-user-id',
      userId: 'demo-user-id',
      fullName: 'Demo User',
      email: 'demo@taskflow.com',
      avatar: 'DU',
      role: 'Product Manager',
      department: 'Product',
      location: 'Ho Chi Minh City, VN',
      phone: '+84 901 234 567',
      joinDate: '2024-01-15',
      status: 'active',
      assignedProject: '1',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      assignedProjects: [
        { id: '1', name: 'Web Revamp', role: 'Project Lead', progress: 75 },
        { id: '2', name: 'Mobile App', role: 'Product Owner', progress: 60 }
      ],
      stats: {
        tasksCompleted: 45,
        tasksInProgress: 8,
        overdueTasks: 1,
        efficiency: 94.2
      },
      skills: ['Product Strategy', 'Agile', 'Roadmapping'],
      workload: 85
    },
    {
      id: 'user-1',
      userId: 'user-1',
      fullName: 'Nguyễn Văn A',
      email: 'a.nguyen@taskflow.com',
      avatar: 'NA',
      role: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Ha Noi, VN',
      phone: '+84 912 345 678',
      joinDate: '2023-08-20',
      status: 'active',
      assignedProject: '1',
      createdAt: '2023-08-20T00:00:00Z',
      updatedAt: '2023-08-20T00:00:00Z',
      assignedProjects: [
        { id: '1', name: 'Web Revamp', role: 'Frontend Lead', progress: 75 },
        { id: '3', name: 'Design System', role: 'Developer', progress: 90 }
      ],
      stats: {
        tasksCompleted: 52,
        tasksInProgress: 6,
        overdueTasks: 0,
        efficiency: 96.8
      },
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      workload: 90
    },
    {
      id: 'user-2',
      userId: 'user-2',
      fullName: 'Trần Thị B',
      email: 'b.tran@taskflow.com',
      avatar: 'TB',
      role: 'Backend Developer',
      department: 'Engineering',
      location: 'Da Nang, VN',
      phone: '+84 923 456 789',
      joinDate: '2023-11-10',
      status: 'busy',
      assignedProject: '2',
      createdAt: '2023-11-10T00:00:00Z',
      updatedAt: '2023-11-10T00:00:00Z',
      assignedProjects: [
        { id: '2', name: 'Mobile App', role: 'API Developer', progress: 60 },
        { id: '4', name: 'API Integration', role: 'Backend Lead', progress: 85 }
      ],
      stats: {
        tasksCompleted: 38,
        tasksInProgress: 12,
        overdueTasks: 2,
        efficiency: 88.5
      },
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      workload: 95
    },
    {
      id: 'user-3',
      userId: 'user-3',
      fullName: 'Lê Văn C',
      email: 'c.le@taskflow.com',
      avatar: 'LC',
      role: 'UI/UX Designer',
      department: 'Design',
      location: 'Ho Chi Minh City, VN',
      phone: '+84 934 567 890',
      joinDate: '2024-02-01',
      status: 'active',
      assignedProject: '1',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
      assignedProjects: [
        { id: '1', name: 'Web Revamp', role: 'UI Designer', progress: 75 },
        { id: '5', name: 'Brand Refresh', role: 'Lead Designer', progress: 40 }
      ],
      stats: {
        tasksCompleted: 28,
        tasksInProgress: 5,
        overdueTasks: 0,
        efficiency: 92.1
      },
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      workload: 70
    },
    {
      id: 'user-4',
      userId: 'user-4',
      fullName: 'Phạm Thị D',
      email: 'd.pham@taskflow.com',
      avatar: 'PD',
      role: 'QA Engineer',
      department: 'Quality Assurance',
      location: 'Can Tho, VN',
      phone: '+84 945 678 901',
      joinDate: '2023-06-15',
      status: 'away',
      assignedProject: '2',
      createdAt: '2023-06-15T00:00:00Z',
      updatedAt: '2023-06-15T00:00:00Z',
      assignedProjects: [
        { id: '2', name: 'Mobile App', role: 'QA Lead', progress: 60 },
        { id: '4', name: 'API Integration', role: 'Test Engineer', progress: 85 }
      ],
      stats: {
        tasksCompleted: 41,
        tasksInProgress: 7,
        overdueTasks: 1,
        efficiency: 89.7
      },
      skills: ['Test Automation', 'Selenium', 'API Testing', 'Performance Testing'],
      workload: 80
    },
    {
      id: 'user-5',
      userId: 'user-5',
      fullName: 'Hoàng Văn E',
      email: 'e.hoang@taskflow.com',
      avatar: 'HE',
      role: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Ho Chi Minh City, VN',
      phone: '+84 956 789 012',
      joinDate: '2023-09-05',
      status: 'offline',
      assignedProject: '4',
      createdAt: '2023-09-05T00:00:00Z',
      updatedAt: '2023-09-05T00:00:00Z',
      assignedProjects: [
        { id: '4', name: 'API Integration', role: 'Infrastructure Lead', progress: 85 },
        { id: '6', name: 'CI/CD Pipeline', role: 'DevOps Lead', progress: 95 }
      ],
      stats: {
        tasksCompleted: 35,
        tasksInProgress: 4,
        overdueTasks: 0,
        efficiency: 91.3
      },
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
      workload: 75
    }
  ];

  const departments = [
    'Product',
    'Engineering', 
    'Design',
    'Quality Assurance',
    'Infrastructure',
    'Marketing',
    'Sales'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'busy':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'away':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'offline':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 95) return '#ff6b6b';
    if (workload >= 85) return '#ffd43b';
    if (workload >= 70) return '#0394ff';
    return '#51cf66';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return '#51cf66';
    if (efficiency >= 90) return '#0394ff';
    if (efficiency >= 80) return '#ffd43b';
    return '#ff6b6b';
  };

  const handleAddMemberSuccess = () => {
    loadTeamMembers(false); // Reload without showing full loading state
  };

  const filteredMembers = teamMembers.filter(member => {
    const searchableText = `${member.fullName} ${member.email} ${member.role}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const calculateTeamStats = () => {
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    
    // Handle case where stats might not be available for all members
    const membersWithStats = teamMembers.filter(m => m.stats && m.workload);
    const avgEfficiency = membersWithStats.length > 0 
      ? membersWithStats.reduce((sum, member) => sum + (member.stats?.efficiency || 0), 0) / membersWithStats.length
      : 0;
    const avgWorkload = membersWithStats.length > 0
      ? membersWithStats.reduce((sum, member) => sum + (member.workload || 0), 0) / membersWithStats.length
      : 0;
    
    return {
      totalMembers,
      activeMembers,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
      avgWorkload: Math.round(avgWorkload)
    };
  };

  const stats = calculateTeamStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0394ff] animate-spin" />
          <p className="text-[#838a9c]">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Team Management</h1>
            <p className="text-[#838a9c] mt-1">Manage team members, users, and project assignments</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#292d39] border-[#3d4457]">
            <TabsTrigger value="team-members" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Team Members (Legacy)
            </TabsTrigger>
            <TabsTrigger value="user-management" className="data-[state=active]:bg-[#0394ff] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team-members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Legacy Team Members</h2>
                <p className="text-[#838a9c] mt-1">Old team member system (will be migrated)</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => loadTeamMembers(false)}
                  disabled={isRefreshing}
                  className="border-[#4a5568] text-[#838a9c] hover:bg-[#3d4457] hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={() => setShowAddMemberForm(true)}
                  className="bg-[#0394ff] hover:bg-[#0570cd]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Total Members</p>
                <p className="text-2xl font-semibold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-[#0394ff]" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Active Now</p>
                <p className="text-2xl font-semibold text-green-400">{stats.activeMembers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Avg Efficiency</p>
                <p className="text-2xl font-semibold text-[#0394ff]">{stats.avgEfficiency}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#0394ff]" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Avg Workload</p>
                <p className="text-2xl font-semibold text-[#ffd43b]">{stats.avgWorkload}%</p>
              </div>
              <Clock className="w-8 h-8 text-[#ffd43b]" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team members..."
                  className="bg-[#3d4457] border-[#4a5568] text-white pl-10"
                />
              </div>
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-3 py-2"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#3d4457] border border-[#4a5568] text-white rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="bg-[#292d39] border-[#3d4457] p-4 hover:shadow-lg transition-all">
              <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-10 h-10 bg-[#0394ff] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{member.avatar}</span>
                      </div>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#292d39] ${
                          member.status === 'active' ? 'bg-green-400' :
                          member.status === 'busy' ? 'bg-red-400' :
                          member.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-sm">{member.fullName}</h3>
                      <p className="text-[#838a9c] text-xs">{member.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#838a9c] hover:text-white h-7 w-7 p-0">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Status, Department & Contact Info - Compact */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className={`${getStatusColor(member.status)} border text-[10px] px-1.5 py-0`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-[#3d4457] text-[#838a9c] border-[#4a5568] text-[10px] px-1.5 py-0">
                    {member.department}
                  </Badge>
                </div>
                
                <div className="text-[11px] text-[#838a9c] space-y-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {member.location && (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{member.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Stats & Workload Combined */}
                {member.stats && (
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#3d4457]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#838a9c]">Done</p>
                        <p className="text-white text-xs">{member.stats.tasksCompleted}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {member.stats.overdueTasks > 0 ? (
                        <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#838a9c]">Overdue</p>
                        <p className={`text-xs ${member.stats.overdueTasks > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {member.stats.overdueTasks}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Workload & Efficiency */}
                {member.workload !== undefined && member.stats && (
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[#838a9c] text-[10px]">Workload</span>
                        <span className="text-white text-[10px]">{member.workload}%</span>
                      </div>
                      <div className="w-full bg-[#4a5568] rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${member.workload}%`,
                            backgroundColor: getWorkloadColor(member.workload)
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[#838a9c] text-[10px]">Efficiency</span>
                        <span className="text-white text-[10px]">{member.stats.efficiency}%</span>
                      </div>
                      <div className="w-full bg-[#4a5568] rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${member.stats.efficiency}%`,
                            backgroundColor: getEfficiencyColor(member.stats.efficiency)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Projects - Compact */}
                {member.assignedProjects && member.assignedProjects.length > 0 && (
                  <div>
                    <h4 className="text-white text-xs mb-1.5">Projects</h4>
                    <div className="space-y-1.5">
                      {member.assignedProjects.slice(0, 2).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-1.5 bg-[#3d4457] rounded text-xs">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-white truncate">{project.name}</p>
                            <p className="text-[#838a9c] text-[10px]">{project.role}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-white text-[10px]">{project.progress}%</span>
                            <div className="w-10 bg-[#4a5568] rounded-full h-1">
                              <div 
                                className="bg-[#0394ff] h-1 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {member.assignedProjects.length > 2 && (
                        <p className="text-[#838a9c] text-[10px] pl-1">+{member.assignedProjects.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills - Compact */}
                {member.skills && member.skills.length > 0 && (
                  <div>
                    <h4 className="text-white text-xs mb-1.5">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge 
                          key={skill}
                          variant="outline" 
                          className="bg-[#0394ff]/20 text-[#0394ff] border-[#0394ff]/30 text-[10px] px-1.5 py-0 h-5"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="bg-[#3d4457] text-[#838a9c] border-[#4a5568] text-[10px] px-1.5 py-0 h-5"
                        >
                          +{member.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

            {filteredMembers.length === 0 && (
              <div className="text-center text-[#838a9c] py-12">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No team members found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Form Dialog */}
      <AddMemberForm 
        isOpen={showAddMemberForm}
        onClose={() => setShowAddMemberForm(false)}
        onMemberAdded={handleAddMemberSuccess}
      />
    </>
  );
}