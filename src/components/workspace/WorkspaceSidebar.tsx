import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Home,
  Inbox,
  FileText,
  BarChart3,
  Target,
  Star,
  Folder,
  Rocket,
  Users,
  HelpCircle,
  Settings,
  Activity,
  Link2,
  Palette,
  Zap,
  SlidersHorizontal,
  CircleDot,
  MoreHorizontal,
  Move,
  Copy,
  Archive,
  Lock,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  RefreshCw,
  Layout,
  Info,
  Mail,
  Share2
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent
} from '../ui/context-menu';
import { toast } from 'sonner';
import type { Space, Phase } from '../../types/workspace';
import type { Project, User } from '../../services/api';

// Main menu items
const sidebarMenuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'docs', label: 'Docs', icon: FileText },
  { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
];

interface WorkspaceSidebarProps {
  spaces: Space[];
  projects: Project[];
  activeSpace: string | null;
  activeProject: string | null;
  activePhase: string | null;
  expandedSpaces: Set<string>;
  expandedProjects: Set<string>;
  sidebarCollapsed: boolean;
  currentUser?: User | null;
  projectPhases?: Record<string, Phase[]>;
  projectTasks?: Record<string, any[]>;
  onSpaceClick: (spaceId: string) => void;
  onProjectClick: (projectId: string, spaceId?: string) => void;
  onPhaseClick: (phaseId: string) => void;
  onToggleSpace: (spaceId: string) => void;
  onToggleProject: (projectId: string) => void;
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onCreateSpace: () => void;
  onCreateProject: (spaceId: string) => void;
  onCreatePhase: (projectId: string) => void;
  onEditSpace: (spaceId: string) => void;
  onDeleteSpace: (spaceId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditPhase: (spaceId: string, phaseId: string) => void;
  onDeletePhase: (spaceId: string, phaseId: string) => void;
}

export function WorkspaceSidebar({
  spaces,
  projects,
  activeSpace,
  activeProject,
  activePhase,
  expandedSpaces,
  expandedProjects,
  sidebarCollapsed,
  currentUser,
  projectPhases = {},
  projectTasks = {},
  onSpaceClick,
  onProjectClick,
  onPhaseClick,
  onToggleSpace,
  onToggleProject,
  onToggleSidebar,
  onNavigateHome,
  onCreateSpace,
  onCreateProject,
  onCreatePhase,
  onEditSpace,
  onDeleteSpace,
  onEditProject,
  onDeleteProject,
  onEditPhase,
  onDeletePhase
}: WorkspaceSidebarProps) {
  const menuScrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef(0);
  const isScrolling = useRef(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Get user initials
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const name = currentUser.fullName || currentUser.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser) return 'User';
    return currentUser.fullName || currentUser.email?.split('@')[0] || 'User';
  };

  // Save scroll position on scroll - debounced
  useLayoutEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (openMenuId) return;

      isScrolling.current = true;
      savedScrollPosition.current = scrollContainer.scrollTop;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [openMenuId]);

  // Restore scroll position
  useLayoutEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer || isScrolling.current || openMenuId) return;

    requestAnimationFrame(() => {
      if (scrollContainer && !isScrolling.current && !openMenuId) {
        scrollContainer.scrollTop = savedScrollPosition.current;
      }
    });
  }, [expandedSpaces, expandedProjects, openMenuId]);

  // Get projects for a space
  const getProjectsForSpace = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space?.projectIds) return [];
    // Case-insensitive comparison
    const spaceProjectIds = space.projectIds.map(id => id.toLowerCase());
    return projects.filter(p => {
      const projectId = (p.id || (p as any).projectID || '').toLowerCase();
      return spaceProjectIds.includes(projectId);
    });
  };

  // Collapsed sidebar view
  if (sidebarCollapsed && !sidebarHovered) {
    return (
      <div
        className="w-14 bg-[#1f2330] border-r border-[#3d4457] flex flex-col h-full"
        onMouseEnter={() => setSidebarHovered(true)}
      >
        {/* User Avatar */}
        <div className="p-3 border-b border-[#3d4457] flex justify-center">
          <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
            {getUserInitials()}
          </div>
        </div>

        {/* Menu Icons */}
        <div className="flex-1 p-2 overflow-y-auto">
          <nav className="space-y-0.5">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home' && onNavigateHome) {
                      onNavigateHome();
                    }
                  }}
                  className="flex items-center justify-center w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-sm transition-colors"
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </nav>

          {/* Favorites */}
          <div className="mt-4">
            <button
              className="flex items-center justify-center w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors"
              title="Favorites"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          {/* Spaces */}
          <div className="mt-4">
            <button
              className="flex items-center justify-center w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors"
              title="Spaces"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-[#3d4457] space-y-1">
          <button
            className="flex items-center justify-center w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors"
            title="Invite"
          >
            <Users className="w-4 h-4 text-[#838a9c]" />
          </button>
          <button
            className="flex items-center justify-center w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4 text-[#838a9c]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#1f2330] border-r border-[#3d4457] flex flex-col h-full transition-all duration-300 ease-in-out ${
        sidebarCollapsed && sidebarHovered ? 'absolute left-0 top-0 bottom-0 z-50 shadow-2xl w-60' : 'w-60'
      }`}
      onMouseLeave={() => sidebarCollapsed && setSidebarHovered(false)}
    >
      {/* User Profile */}
      <div className="p-3 border-b border-[#3d4457]">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 flex-1 hover:bg-[#292d39] rounded p-2 transition-colors">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
              {getUserInitials()}
            </div>
            <span className="text-sm text-[#e1e4e8] flex-1 text-left truncate">{getDisplayName()}</span>
            <ChevronDown className="w-4 h-4 text-[#838a9c]" />
          </button>
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#292d39] rounded transition-colors shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#838a9c]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-[#838a9c]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Menu */}
      <div ref={menuScrollContainerRef} className="flex-1 overflow-y-auto p-2 taskflow-scrollbar">
        <nav className="space-y-0.5">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home' && onNavigateHome) {
                    onNavigateHome();
                  }
                }}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors"
              >
                <Icon className="w-4 h-4 text-[#838a9c]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Favorites Section */}
        <div className="mt-4">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors">
            <Star className="w-3 h-3" />
            <span>Favorites</span>
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
        </div>

        {/* Spaces Section */}
        <div className="mt-4">
          <div className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-xs transition-colors">
            <button
              onClick={() => setSpacesExpanded(!spacesExpanded)}
              className="flex items-center gap-2 flex-1"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${!spacesExpanded ? '-rotate-90' : ''}`} />
              <span>Spaces</span>
            </button>
            <button
              onClick={onCreateSpace}
              className="hover:bg-[#3d4457] rounded p-0.5"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {spacesExpanded && (
            <div className="mt-1 space-y-0.5">
              {spaces.length === 0 && projects.length === 0 && (
                <div className="px-2 py-4 text-center text-sm text-[#838a9c]">
                  No projects found
                </div>
              )}

              {/* Spaces with Projects and Phases */}
              {spaces.map((space) => {
                const isSpaceExpanded = expandedSpaces.has(space.id);
                const isActiveSpace = space.id === activeSpace;
                const spaceProjects = getProjectsForSpace(space.id);

                return (
                  <div key={space.id}>
                    <ContextMenu
                      modal={false}
                      onOpenChange={(open) => setOpenMenuId(open ? `space-${space.id}` : null)}
                    >
                      <ContextMenuTrigger asChild>
                        <div
                          className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm transition-colors rounded cursor-pointer ${
                            isActiveSpace && !activePhase
                              ? 'bg-[#0394ff]/20 text-[#0394ff]'
                              : 'text-[#e1e4e8] hover:bg-[#292d39]'
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSpaceClick(space.id);
                              onToggleSpace(space.id);
                            }}
                            className="flex items-center gap-2 flex-1"
                          >
                            <ChevronDown className={`w-3 h-3 text-[#838a9c] transition-transform ${!isSpaceExpanded ? '-rotate-90' : ''}`} />
                            <Folder className="w-4 h-4 text-[#7c66d9]" />
                            <span className="flex-1 text-left">{space.name}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateProject(space.id);
                            }}
                            className="hover:bg-[#3d4457] rounded p-0.5 opacity-0 group-hover:opacity-100"
                          >
                            <Plus className="w-3 h-3 text-[#838a9c]" />
                          </button>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                        <ContextMenuItem
                          onClick={() => onEditSpace(space.id)}
                          className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/space/${space.id}`);
                            toast.success('Link copied to clipboard');
                          }}
                          className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy link
                        </ContextMenuItem>

                        <ContextMenuSeparator className="bg-[#3d4457]" />

                        <ContextMenuSub>
                          <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                            <Plus className="w-4 h-4 mr-2" />
                            Create new
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                            <ContextMenuItem
                              onClick={() => onCreateProject(space.id)}
                              className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              Project
                            </ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuSub>

                        <ContextMenuSub>
                          <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                            <Palette className="w-4 h-4 mr-2" />
                            Folder color
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                            <div className="grid grid-cols-5 gap-2 p-2">
                              {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(color => (
                                <button
                                  key={color}
                                  className="w-6 h-6 rounded hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => toast.success(`Color changed to ${color}`)}
                                />
                              ))}
                            </div>
                          </ContextMenuSubContent>
                        </ContextMenuSub>

                        <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                          <Zap className="w-4 h-4 mr-2" />
                          Automations
                        </ContextMenuItem>

                        <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                          <SlidersHorizontal className="w-4 h-4 mr-2" />
                          Custom Fields
                        </ContextMenuItem>

                        <ContextMenuSeparator className="bg-[#3d4457]" />

                        <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                          <Star className="w-4 h-4 mr-2" />
                          Add to Favorites
                        </ContextMenuItem>

                        <ContextMenuSeparator className="bg-[#3d4457]" />

                        <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </ContextMenuItem>

                        <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </ContextMenuItem>

                        <ContextMenuItem
                          onClick={() => onDeleteSpace(space.id)}
                          className="text-[#ef4444] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </ContextMenuItem>

                        <ContextMenuSeparator className="bg-[#3d4457]" />

                        <div className="px-1 py-1">
                          <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded py-2 px-3 text-sm transition-colors">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Sharing & Permissions
                          </button>
                        </div>
                      </ContextMenuContent>
                    </ContextMenu>

                    {/* Projects under Space */}
                    {isSpaceExpanded && spaceProjects.map((project) => {
                      const projectId = project.id || (project as any).projectID;
                      const isProjectExpanded = expandedProjects.has(projectId);
                      const phases = projectPhases[projectId] || [];
                      const tasks = projectTasks[projectId] || [];
                      const isActiveInSpace = activeProject === projectId;

                      return (
                        <div key={`space-project-${projectId}`} className="pl-4">
                          <ContextMenu
                            modal={false}
                            onOpenChange={(open) => setOpenMenuId(open ? `project-${projectId}` : null)}
                          >
                            <ContextMenuTrigger asChild>
                              <div
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm transition-colors rounded cursor-pointer ${
                                  isActiveInSpace
                                    ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                    : 'text-[#e1e4e8] hover:bg-[#292d39]'
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onProjectClick(projectId, space.id);
                                    onToggleProject(projectId);
                                  }}
                                  className="flex items-center gap-2 flex-1"
                                >
                                  {phases.length > 0 && (
                                    <ChevronDown className={`w-3 h-3 text-[#838a9c] transition-transform ${!isProjectExpanded ? '-rotate-90' : ''}`} />
                                  )}
                                  <Rocket className="w-4 h-4 text-[#0394ff]" />
                                  <span className="flex-1 text-left text-xs truncate">
                                    {project.projectID} - {project.name}
                                  </span>
                                </button>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-56 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                              <ContextMenuItem
                                onClick={() => onEditProject(projectId)}
                                className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Rename
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/project/${projectId}`);
                                  toast.success('Link copied to clipboard');
                                }}
                                className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <Link2 className="w-4 h-4 mr-2" />
                                Copy link
                              </ContextMenuItem>

                              <ContextMenuSeparator className="bg-[#3d4457]" />

                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Star className="w-4 h-4 mr-2" />
                                Add to Favorites
                              </ContextMenuItem>

                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </ContextMenuItem>

                              <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </ContextMenuItem>

                              <ContextMenuItem
                                onClick={() => onDeleteProject(projectId)}
                                className="text-[#ef4444] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>

                          {/* Phases under Project */}
                          {isProjectExpanded && phases.map((phase) => {
                            // Count tasks by phaseID (GUID) instead of phase name
                            const phaseTaskCount = tasks.filter(task => task.phaseID === phase.id).length;
                            const isActiveProjectPhase = activePhase === phase.id && activeProject === projectId;

                            return (
                              <ContextMenu key={`project-phase-${phase.id}`}>
                                <ContextMenuTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Pass phase.id (GUID) instead of phase.name
                                      onPhaseClick(phase.id);
                                    }}
                                    className={`flex items-center justify-between gap-2 w-full pl-8 pr-2 py-1 text-sm transition-colors rounded ${
                                      isActiveProjectPhase
                                        ? 'bg-[#0394ff]/20 text-[#0394ff]'
                                        : 'text-[#e1e4e8] hover:bg-[#292d39]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: phase.color }}
                                      />
                                      <span className="text-xs truncate">{phase.name}</span>
                                    </div>
                                    <span className="text-xs text-[#838a9c]">{phaseTaskCount}</span>
                                  </button>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                  {/* Rename */}
                                  <ContextMenuItem
                                    onClick={() => onEditPhase(space.id, phase.id)}
                                    className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Rename
                                  </ContextMenuItem>

                                  {/* Copy link */}
                                  <ContextMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/phase/${phase.id}`);
                                      toast.success('Link copied to clipboard');
                                    }}
                                    className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                                  >
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Copy link
                                  </ContextMenuItem>

                                  <ContextMenuSeparator className="bg-[#3d4457]" />

                                  {/* Create new submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Create new
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Task
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        <Folder className="w-4 h-4 mr-2" />
                                        List
                                      </ContextMenuItem>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  {/* Convert List to Sprint */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Convert List to Sprint
                                  </ContextMenuItem>

                                  <ContextMenuSeparator className="bg-[#3d4457]" />

                                  {/* Color & Icon submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <Palette className="w-4 h-4 mr-2" />
                                      Color & Icon
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <div className="px-2 py-1.5 text-xs text-[#838a9c]">Colors</div>
                                      <div className="grid grid-cols-5 gap-2 p-2">
                                        {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#06b6d4'].map(color => (
                                          <button
                                            key={color}
                                            className="w-6 h-6 rounded hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => toast.success(`Color changed to ${color}`)}
                                          />
                                        ))}
                                      </div>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  {/* Templates submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <Layout className="w-4 h-4 mr-2" />
                                      Templates
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Save as Template
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Browse Templates
                                      </ContextMenuItem>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  {/* Automations */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Automations
                                  </ContextMenuItem>

                                  {/* Custom Fields */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                                    Custom Fields
                                  </ContextMenuItem>

                                  {/* Task statuses */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <CircleDot className="w-4 h-4 mr-2" />
                                    Task statuses
                                  </ContextMenuItem>

                                  {/* More submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <MoreHorizontal className="w-4 h-4 mr-2" />
                                      More
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Activity
                                      </ContextMenuItem>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  <ContextMenuSeparator className="bg-[#3d4457]" />

                                  {/* List Info */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Info className="w-4 h-4 mr-2" />
                                    List Info
                                  </ContextMenuItem>

                                  {/* Add to Favorites */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Star className="w-4 h-4 mr-2" />
                                    Add to Favorites
                                  </ContextMenuItem>

                                  {/* Default task type submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <CheckSquare className="w-4 h-4 mr-2" />
                                      Default task type
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Task
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Bug
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Feature
                                      </ContextMenuItem>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  {/* Email to List */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email to List
                                  </ContextMenuItem>

                                  <ContextMenuSeparator className="bg-[#3d4457]" />

                                  {/* Move submenu */}
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457]">
                                      <Move className="w-4 h-4 mr-2" />
                                      Move
                                    </ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48 bg-[#292d39] border-[#3d4457] text-[#e1e4e8]">
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Move to Space...
                                      </ContextMenuItem>
                                      <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                        Move to Project...
                                      </ContextMenuItem>
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>

                                  {/* Duplicate */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </ContextMenuItem>

                                  {/* Archive */}
                                  <ContextMenuItem className="text-[#e1e4e8] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer">
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                  </ContextMenuItem>

                                  {/* Delete */}
                                  <ContextMenuItem
                                    onClick={() => onDeletePhase(space.id, phase.id)}
                                    className="text-[#ef4444] hover:bg-[#3d4457] focus:bg-[#3d4457] cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </ContextMenuItem>

                                  <ContextMenuSeparator className="bg-[#3d4457]" />

                                  {/* Sharing & Permissions button */}
                                  <div className="px-1 py-1">
                                    <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded py-2 px-3 text-sm transition-colors flex items-center justify-center">
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Sharing & Permissions
                                    </button>
                                  </div>
                                </ContextMenuContent>
                              </ContextMenu>
                            );
                          })}

                          {/* Add Phase Button */}
                          {isProjectExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreatePhase(projectId);
                              }}
                              className="flex items-center gap-2 w-full pl-8 pr-2 py-1 text-sm text-[#838a9c] hover:text-[#0394ff] hover:bg-[#292d39] transition-colors rounded"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="text-xs">Add Phase</span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Phases directly under Space (when no projects) */}
                    {isSpaceExpanded && spaceProjects.length === 0 && space.phases?.map((phase) => {
                      const isActiveSpacePhase = activePhase === phase.id;
                      return (
                        <button
                          key={phase.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhaseClick(phase.id);
                          }}
                          className={`flex items-center gap-2 w-full pl-8 pr-2 py-1.5 text-sm transition-colors rounded ${
                            isActiveSpacePhase
                              ? 'bg-[#0394ff]/20 text-[#0394ff]'
                              : 'text-[#e1e4e8] hover:bg-[#292d39]'
                          }`}
                        >
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: phase.color }}
                          />
                          <span className="flex-1 text-left">{phase.name}</span>
                          <span className="text-xs text-[#838a9c]">{phase.taskCount}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Create Space button */}
              <button
                onClick={onCreateSpace}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-[#838a9c] hover:bg-[#292d39] rounded text-sm transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Space</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-[#3d4457] space-y-1">
        <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors">
          <Users className="w-4 h-4 text-[#838a9c]" />
          <span>Invite</span>
        </button>
        <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[#e1e4e8] hover:bg-[#292d39] rounded text-sm transition-colors">
          <HelpCircle className="w-4 h-4 text-[#838a9c]" />
          <span>Help</span>
        </button>
      </div>
    </div>
  );
}
