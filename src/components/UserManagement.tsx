import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  UserPlus,
  Database,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  authUserId?: string;
  fullName: string;
  email: string;
  age?: number;
  phone?: string;
  location?: string;
  department?: string;
  role?: string;
  bio?: string;
  avatar: string;
  skills: string[];
  status: 'active' | 'away' | 'busy' | 'offline';
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  location?: string;
  phone?: string;
  status: string;
  assignedProject?: string;
  joinDate: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(!showLoading);

    try {
      // Load users
      const usersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/users`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load team members (for migration)
      const teamResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/team-members`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.members || []);
      }

      if (!showLoading) {
        toast.success('Data refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8837ac96/migrate/team-to-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      setMigrationResult(result);

      if (result.success) {
        toast.success(result.message);
        await loadData(false); // Reload data after successful migration
      } else {
        toast.error(result.error || 'Migration failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed due to server error');
    } finally {
      setIsMigrating(false);
    }
  };

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

  const filteredUsers = users.filter(user => {
    const searchableText = `${user.fullName} ${user.email} ${user.role}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const calculateStats = () => {
    const totalUsers = users.length;
    const totalTeamMembers = teamMembers.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const needsMigration = totalTeamMembers > 0 && totalUsers === 0;
    
    return {
      totalUsers,
      totalTeamMembers,
      activeUsers,
      needsMigration
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0394ff] animate-spin" />
          <p className="text-[#838a9c]">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">User Management</h1>
            <p className="text-[#838a9c] mt-1">Manage users and migrate from team members</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              className="border-[#4a5568] text-[#838a9c] hover:bg-[#3d4457] hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {stats.needsMigration && (
              <Button 
                onClick={() => setShowMigrationDialog(true)}
                className="bg-[#ffd43b] hover:bg-[#ffcd02] text-black"
              >
                <Database className="w-4 h-4 mr-2" />
                Migrate Data
              </Button>
            )}
            <Button 
              className="bg-[#0394ff] hover:bg-[#0570cd]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Total Users</p>
                <p className="text-2xl font-semibold text-white">{stats.totalUsers}</p>
              </div>
              <User className="w-8 h-8 text-[#0394ff]" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Active Users</p>
                <p className="text-2xl font-semibold text-green-400">{stats.activeUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Team Members</p>
                <p className="text-2xl font-semibold text-[#ffd43b]">{stats.totalTeamMembers}</p>
              </div>
              <Users className="w-8 h-8 text-[#ffd43b]" />
            </div>
          </Card>

          <Card className="bg-[#292d39] border-[#3d4457] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#838a9c] text-sm">Migration Status</p>
                <p className={`text-2xl font-semibold ${stats.needsMigration ? 'text-[#ff6b6b]' : 'text-green-400'}`}>
                  {stats.needsMigration ? 'Pending' : 'Complete'}
                </p>
              </div>
              <Database className={`w-8 h-8 ${stats.needsMigration ? 'text-[#ff6b6b]' : 'text-green-400'}`} />
            </div>
          </Card>
        </div>

        {/* Migration Alert */}
        {stats.needsMigration && (
          <Card className="bg-[#ffd43b]/10 border-[#ffd43b] p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#ffd43b]" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Migration Required</h3>
                <p className="text-[#838a9c] text-sm">
                  You have {stats.totalTeamMembers} team members that need to be migrated to the new user system.
                </p>
              </div>
              <Button 
                onClick={() => setShowMigrationDialog(true)}
                className="bg-[#ffd43b] hover:bg-[#ffcd02] text-black"
              >
                Start Migration
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-[#292d39] border-[#3d4457] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
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

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-[#292d39] border-[#3d4457] p-6 hover:shadow-lg transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#0394ff] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.avatar}</span>
                      </div>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#292d39] ${
                          user.status === 'active' ? 'bg-green-400' :
                          user.status === 'busy' ? 'bg-red-400' :
                          user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{user.fullName}</h3>
                      <p className="text-[#838a9c] text-sm">{user.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#838a9c] hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status & Department */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getStatusColor(user.status)} border text-xs`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline" className="bg-[#3d4457] text-[#838a9c] border-[#4a5568] text-xs">
                      {user.department}
                    </Badge>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#838a9c]">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2 text-[#838a9c]">
                      <MapPin className="w-3 h-3" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#838a9c]">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill) => (
                        <Badge 
                          key={skill}
                          variant="outline" 
                          className="bg-[#0394ff]/20 text-[#0394ff] border-[#0394ff]/30 text-xs px-2 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="bg-[#3d4457] text-[#838a9c] border-[#4a5568] text-xs px-2 py-1"
                        >
                          +{user.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center text-[#838a9c] py-12">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Migration Dialog */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white">
          <DialogHeader>
            <DialogTitle>Migrate Team Members to Users</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              This will migrate all team members to the new user system and create project member relationships where applicable.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#3d4457] rounded-lg">
              <Users className="w-6 h-6 text-[#ffd43b]" />
              <div className="flex-1">
                <p className="text-white">Team Members: {stats.totalTeamMembers}</p>
                <p className="text-[#838a9c] text-sm">Will be migrated to users table</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#838a9c]" />
              <div className="flex-1">
                <p className="text-white">Users: {stats.totalUsers}</p>
                <p className="text-[#838a9c] text-sm">Current users in system</p>
              </div>
            </div>

            {migrationResult && (
              <div className={`p-3 rounded-lg ${migrationResult.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <p className={`font-medium ${migrationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {migrationResult.message}
                </p>
                {migrationResult.summary && (
                  <div className="mt-2 text-sm text-[#838a9c]">
                    <p>Users migrated: {migrationResult.summary.users_migrated}</p>
                    <p>Project memberships created: {migrationResult.summary.project_members_created}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline"
                onClick={() => setShowMigrationDialog(false)}
                disabled={isMigrating}
                className="border-[#4a5568] text-[#838a9c]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMigration}
                disabled={isMigrating}
                className="bg-[#ffd43b] hover:bg-[#ffcd02] text-black"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  'Start Migration'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}