import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Rocket, 
  Calendar, 
  Users, 
  MoreVertical, 
  Search,
  LayoutGrid,
  List,
  Kanban,
  ArrowLeft,
  Edit2,
  Trash2
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';
import { NewProjectForm } from './NewProjectForm';
import { KanbanBoard } from './KanbanBoard';
import { ProjectDetail } from './ProjectDetail';
import {
  User,
  Project,
  Category,
  projectsApi,
  usersApi,
  categoriesApi
} from '../services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ProjectsProps {
  onNavigate: (view: string) => void;
  onSelectProject: (project: any) => void;
  currentUser: User | null;
}

export function Projects({ onNavigate, onSelectProject, currentUser }: ProjectsProps) {
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectView, setProjectView] = useState<'list' | 'board'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [viewingProjectDetail, setViewingProjectDetail] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData, categoriesData] = await Promise.all([
        projectsApi.getAll(),
        usersApi.getAll(),
        categoriesApi.getAll()
      ]);
      
      // Ensure all projects have members array
      const projectsWithMembers = projectsData.map(p => ({
        ...p,
        members: p.members || []
      }));
      
      setProjects(projectsWithMembers);
      setUsers(usersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await projectsApi.create({
        ...projectData,
        createdBy: currentUser?.userID || ''
      });

      setProjects(prev => [newProject, ...prev]);
      setShowNewProject(false);
      toast.success(t('message.projectCreated'));
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(t('message.error'));
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return;

    try {
      const updatedProject = await projectsApi.update(editingProject.projectID, projectData);
      setProjects(prev => prev.map(p => p.projectID === updatedProject.projectID ? updatedProject : p));
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    try {
      await projectsApi.delete(deletingProject.projectID);
      setProjects(prev => prev.filter(p => p.projectID !== deletingProject.projectID));
      setDeletingProject(null);
      toast.success('Project deleted successfully');

      // If we're viewing the deleted project, go back to list
      if (selectedProject?.projectID === deletingProject.projectID) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    onSelectProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setProjectView('list');
  };

  const handleProjectDoubleClick = (project: Project) => {
    setViewingProjectDetail(project);
  };

  const handleBackFromDetail = () => {
    setViewingProjectDetail(null);
  };

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.categoryID === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
        return 'text-green-400 bg-green-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'review':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'planning':
        return 'text-purple-400 bg-purple-400/10';
      case 'on_hold':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getCategoryInfo = (categoryID: string | undefined) => {
    if (!categoryID) return { name: 'Uncategorized', color: '#838a9c', categoryID: '' };
    return categories.find(cat => cat.categoryID === categoryID) || { name: 'Unknown', color: '#838a9c', categoryID };
  };

  if (!currentUser) {
    return null;
  }

  // Show full project detail view
  if (viewingProjectDetail) {
    return (
      <ProjectDetail
        project={viewingProjectDetail}
        onBack={handleBackFromDetail}
        currentUser={currentUser}
      />
    );
  }

  // Show project detail view with board/list
  if (selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-white">{selectedProject.name}</h1>
              <p className="text-[#838a9c] mt-1">{selectedProject.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProjectView('list')}
              className={`${projectView === 'list' ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'} hover:text-white hover:bg-[#3d4457]`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProjectView('board')}
              className={`${projectView === 'board' ? 'bg-[#3d4457] text-white' : 'text-[#838a9c]'} hover:text-white hover:bg-[#3d4457]`}
            >
              <Kanban className="w-4 h-4 mr-2" />
              Board
            </Button>
          </div>
        </div>

        {/* Content */}
        {projectView === 'board' ? (
          <KanbanBoard project={selectedProject} currentUser={currentUser} />
        ) : (
          <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
            <h3 className="text-white mb-4">List view coming soon...</h3>
            <p className="text-[#838a9c]">Switch to Board view to manage tasks in a Kanban board.</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white">{t('projects.title')}</h1>
            <p className="text-[#838a9c] mt-2">Loading projects...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bg-[#292d39] border-[#3d4457] p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-[#3d4457] rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-[#3d4457] rounded w-full mb-2"></div>
                <div className="h-4 bg-[#3d4457] rounded w-2/3 mb-4"></div>
                <div className="h-2 bg-[#3d4457] rounded w-full"></div>
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
          <h1 className="text-white">{t('projects.title')}</h1>
          <p className="text-[#838a9c] mt-2">
            {filteredProjects.length} {t('projects.allProjects').toLowerCase()}
          </p>
        </div>
        <Button 
          onClick={() => setShowNewProject(true)}
          className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('projects.createNew')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#838a9c] w-4 h-4" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#3d4457] border border-[#3d4457] rounded-lg pl-10 pr-4 py-2 text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff] focus:border-transparent"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#3d4457] border border-[#3d4457] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#3d4457] border border-[#3d4457] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.categoryID} value={category.categoryID}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const owner = users.find(u => u.userID === project.createdBy);
          const categoryInfo = getCategoryInfo(project.categoryID);
          const memberUsers = users.filter(u => (project.members || []).includes(u.userID));

          return (
            <Card
              key={project.projectID}
              className="bg-[#292d39] border-[#3d4457] p-6 hover-card cursor-pointer group relative transition-all"
              onDoubleClick={() => handleProjectDoubleClick(project)}
              title="Double click to view project details"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-lg mb-2">
                      <span className="text-[#0394ff] font-mono text-sm mr-2">
                        {project.projectID.substring(0, 8).toUpperCase()}
                      </span>
                      {project.name}
                    </h3>
                    <p className="text-[#838a9c] text-sm line-clamp-2">{project.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#292d39] border-[#3d4457]">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                        }}
                        className="text-white hover:bg-[#3d4457] cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="text-red-400 hover:bg-[#3d4457] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Category and Priority */}
                <div className="flex items-center gap-2">
                  <div 
                    className="px-2 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: categoryInfo.color }}
                  >
                    {t(`category.${categoryInfo.name}`)}
                  </div>
                  <Badge className={`${getPriorityColor(project.priority)} text-white text-xs`}>
                    {t(`tasks.priority.${project.priority}`)}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(project.status)} px-2 py-1 text-xs rounded-full`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-[#838a9c]">{project.progress ?? 0}%</span>
                </div>

                {/* Progress Bar */}
                <Progress value={project.progress ?? 0} className="h-2" />

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#838a9c]" />
                    <div className="flex -space-x-2">
                      {memberUsers.slice(0, 3).map((member) => (
                        <Avatar key={member.userID} className="w-6 h-6 border-2 border-[#292d39]">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs bg-[#0394ff] text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {memberUsers.length > 3 && (
                        <div className="w-6 h-6 bg-[#3d4457] rounded-full border-2 border-[#292d39] flex items-center justify-center">
                          <span className="text-xs text-[#838a9c]">+{memberUsers.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Due Date */}
                  <div className="flex items-center gap-1 text-xs text-[#838a9c]">
                    <Calendar className="w-3 h-3" />
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No due date'}
                  </div>
                </div>

                {/* Owner */}
                {owner && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#3d4457]">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={owner.avatar} alt={owner.name} />
                      <AvatarFallback className="text-xs bg-[#0394ff] text-white">
                        {owner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-[#838a9c]">Owner: {owner.name}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <Rocket className="w-16 h-16 text-[#838a9c] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg text-white mb-2">
            {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' 
              ? 'No projects match your filters' 
              : 'No projects yet'
            }
          </h3>
          <p className="text-[#838a9c] mb-4">
            {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Create your first project to get started'
            }
          </p>
          <Button 
            onClick={() => setShowNewProject(true)}
            className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.createNew')}
          </Button>
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription className="text-[#838a9c]">
              Add a new project to your workspace
            </DialogDescription>
          </DialogHeader>
          <NewProjectForm
            onSave={handleCreateProject}
            onCancel={() => setShowNewProject(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription className="text-[#838a9c]">
                Update project details
              </DialogDescription>
            </DialogHeader>
            <NewProjectForm
              onSave={handleUpdateProject}
              onCancel={() => setEditingProject(null)}
              initialData={editingProject}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <AlertDialogContent className="bg-[#292d39] border-[#3d4457] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="text-[#838a9c]">
              Are you sure you want to delete "{deletingProject?.name}"? This action cannot be undone and will also delete all tasks associated with this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#3d4457] text-white border-[#3d4457] hover:bg-[#3d4457]/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
