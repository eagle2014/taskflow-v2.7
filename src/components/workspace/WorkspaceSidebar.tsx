import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ChevronLeft,
  ChevronUp,
  FolderOpen
} from 'lucide-react';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger 
} from '../ui/context-menu';
import type { Space, Phase } from '../../data/projectWorkspaceMockData';
import type { Project } from '../../utils/mockApi';

interface WorkspaceSidebarProps {
  spaces: Space[];
  projects: Project[];
  activeSpace: string | null;
  activeProject: string | null;
  activePhase: string | null;
  expandedSpaces: Set<string>;
  expandedProjects: Set<string>;
  sidebarCollapsed: boolean;
  onSpaceClick: (spaceId: string) => void;
  onProjectClick: (projectId: string, spaceId?: string) => void;
  onPhaseClick: (phaseId: string) => void;
  onToggleSpace: (spaceId: string) => void;
  onToggleProject: (projectId: string) => void;
  onToggleSidebar: () => void;
  onCreateSpace: () => void;
  onCreateProject: (spaceId: string) => void;
  onCreatePhase: (spaceId: string) => void;
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
  onSpaceClick,
  onProjectClick,
  onPhaseClick,
  onToggleSpace,
  onToggleProject,
  onToggleSidebar,
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
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('workspace-sidebar-width');
    return saved ? parseInt(saved) : 256;
  });

  useEffect(() => {
    localStorage.setItem('workspace-sidebar-width', width.toString());
  }, [width]);

  // Save scroll position on scroll - debounced
  useLayoutEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Don't update scroll if a menu is open
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

  // Restore scroll position only when needed (after expand/collapse)
  useLayoutEffect(() => {
    const scrollContainer = menuScrollContainerRef.current;
    if (!scrollContainer || isScrolling.current || openMenuId) return;
    
    // Use requestAnimationFrame to avoid forced reflows
    requestAnimationFrame(() => {
      if (scrollContainer && !isScrolling.current && !openMenuId) {
        scrollContainer.scrollTop = savedScrollPosition.current;
      }
    });
  }, [expandedSpaces, expandedProjects, openMenuId]);

  if (sidebarCollapsed) {
    return (
      <div className="w-16 bg-[#292d39] border-r border-[#3a3f4f] flex flex-col h-full">
        {/* Header Icon */}
        <div className="p-4 border-b border-[#3a3f4f] flex justify-center">
          <FolderOpen className="h-6 w-6 text-[#0394ff]" />
        </div>
        
        {/* Space Icons */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-2">
            {spaces.map((space) => {
              const isActive = activeSpace === space.id;
              return (
                <button
                  key={space.id}
                  onClick={() => onSpaceClick(space.id)}
                  className={`w-full p-2 rounded flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-[#0394ff]/20 text-[#0394ff]' 
                      : 'text-gray-400 hover:bg-[#3a3f4f] hover:text-white'
                  }`}
                  title={space.name}
                >
                  <span className="text-xl">📁</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expand Button */}
        <div className="p-2 border-t border-[#3a3f4f]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="w-full text-gray-400 hover:text-white hover:bg-[#3a3f4f]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Resizable
      size={{ width, height: '100%' }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      minWidth={200}
      maxWidth={400}
      enable={{ right: true }}
      handleStyles={{
        right: {
          width: '4px',
          right: 0,
          cursor: 'col-resize',
        }
      }}
      handleClasses={{
        right: 'hover:bg-[#0394ff] transition-colors'
      }}
    >
      <div className="bg-[#292d39] border-r border-[#3a3f4f] flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#3a3f4f] flex items-center justify-between">
          <h2 className="font-semibold text-white">Workspace</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateSpace}
              className="text-gray-400 hover:text-white hover:bg-[#3a3f4f]"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-gray-400 hover:text-white hover:bg-[#3a3f4f]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable menu */}
        <div ref={menuScrollContainerRef} className="flex-1 overflow-y-auto p-2">
        {spaces.map((space) => {
          const spaceProjects = projects.filter(p => 
            space.projectIds && space.projectIds.includes(p.id)
          );
          const isExpanded = expandedSpaces.has(space.id);
          
          return (
            <div key={space.id} className="mb-1">
              <ContextMenu 
                onOpenChange={(open) => setOpenMenuId(open ? `space-${space.id}` : null)}
              >
                <ContextMenuTrigger asChild>
                  <div
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                      hover:bg-[#3a3f4f] transition-colors
                      ${activeSpace === space.id ? 'bg-[#3a3f4f]' : ''}
                    `}
                    onClick={() => onSpaceClick(space.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSpace(space.id);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="text-lg">📁</span>
                    <span className="text-sm text-gray-300 flex-1">{space.name}</span>
                    <span className="text-xs text-gray-500">{spaceProjects.length}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onCreateProject(space.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onCreatePhase(space.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Phase
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onEditSpace(space.id)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => onDeleteSpace(space.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              {/* Projects in Space */}
              {isExpanded && spaceProjects.map((project) => {
                const isProjectExpanded = expandedProjects.has(project.id);
                
                return (
                  <div key={project.id} className="ml-6">
                    <ContextMenu 
                      onOpenChange={(open) => setOpenMenuId(open ? `project-${project.id}` : null)}
                    >
                      <ContextMenuTrigger asChild>
                        <div
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                            hover:bg-[#3a3f4f] transition-colors
                            ${activeProject === project.id ? 'bg-[#0394ff]/20' : ''}
                          `}
                          onClick={() => onProjectClick(project.id, space.id)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleProject(project.id);
                            }}
                            className="text-gray-400 hover:text-white"
                          >
                            {isProjectExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                          <span className="text-base">🚀</span>
                          <span className="text-sm text-gray-300 flex-1">{project.name}</span>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onEditProject(project.id)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem 
                          onClick={() => onDeleteProject(project.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    {/* Phases in Project */}
                    {isProjectExpanded && space.phases && space.phases.map((phase) => (
                      <ContextMenu 
                        key={phase.id}
                        onOpenChange={(open) => setOpenMenuId(open ? `phase-project-${phase.id}` : null)}
                      >
                        <ContextMenuTrigger asChild>
                          <div
                            className={`
                              ml-6 flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                              hover:bg-[#3a3f4f] transition-colors
                              ${activePhase === phase.name ? 'bg-[#0394ff]/10' : ''}
                            `}
                            onClick={() => onPhaseClick(phase.name)}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: phase.color }}
                            />
                            <span className="text-sm text-gray-400 flex-1">{phase.name}</span>
                            <span className="text-xs text-gray-500">{phase.taskCount}</span>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => onEditPhase(space.id, phase.id)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem 
                            onClick={() => onDeletePhase(space.id, phase.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                );
              })}

              {/* Phases in Space (if no projects) */}
              {isExpanded && spaceProjects.length === 0 && space.phases && space.phases.map((phase) => (
                <ContextMenu 
                  key={phase.id}
                  onOpenChange={(open) => setOpenMenuId(open ? `phase-space-${phase.id}` : null)}
                >
                  <ContextMenuTrigger asChild>
                    <div
                      className={`
                        ml-6 flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                        hover:bg-[#3a3f4f] transition-colors
                        ${activePhase === phase.name ? 'bg-[#0394ff]/10' : ''}
                      `}
                      onClick={() => onPhaseClick(phase.name)}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      <span className="text-sm text-gray-400 flex-1">{phase.name}</span>
                      <span className="text-xs text-gray-500">{phase.taskCount}</span>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onEditPhase(space.id, phase.id)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem 
                      onClick={() => onDeletePhase(space.id, phase.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          );
        })}
        </div>
      </div>
    </Resizable>
  );
}
