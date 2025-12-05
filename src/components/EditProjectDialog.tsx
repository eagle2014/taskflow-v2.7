import { useState, useEffect, useRef } from 'react';
import {
  X, Loader2, FileText, Info, Calendar, MessageSquare,
  Milestone, FileArchive, Receipt, Briefcase, FileSignature, Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { projectsApi } from '../services/api';
import type { Project } from '../services/api';
import { toast } from 'sonner';
import { SummaryTab } from './ProjectTabs/SummaryTab';
import { DetailsTab } from './ProjectTabs/DetailsTab';
import { EventsTab } from './ProjectTabs/EventsTab';
import { UpdatesTab } from './ProjectTabs/UpdatesTab';
import { MilestonesTab } from './ProjectTabs/MilestonesTab';
import { DocumentsTab } from './ProjectTabs/DocumentsTab';
import { QuotesTab } from './ProjectTabs/QuotesTab';
import { InvoicesTab } from './ProjectTabs/InvoicesTab';
import { ESignTab } from './ProjectTabs/ESignTab';
import { SettingsTab } from './ProjectTabs/SettingsTab';

interface EditProjectDialogProps {
  projectId: string;
  onClose: () => void;
  onUpdated: (project: Project) => void;
}

type TabType = 'summary' | 'details' | 'events' | 'updates' | 'milestones' |
               'documents' | 'quotes' | 'invoices' | 'esign' | 'settings';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const DIALOG_SIZE_KEY = 'editproject-dialog-size';
const DIALOG_POSITION_KEY = 'editproject-dialog-position';
const DEFAULT_SIZE = { width: 1200, height: 800 };
const MIN_WIDTH = 900;
const MIN_HEIGHT = 600;

export function EditProjectDialog({ projectId, onClose, onUpdated }: EditProjectDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [project, setProject] = useState<Project | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Load size and position from localStorage
  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem(DIALOG_SIZE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SIZE;
    } catch {
      return DEFAULT_SIZE;
    }
  });

  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(DIALOG_POSITION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      x: (window.innerWidth - DEFAULT_SIZE.width) / 2,
      y: (window.innerHeight - DEFAULT_SIZE.height) / 2,
    };
  });

  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Save to localStorage when size/position changes
  useEffect(() => {
    localStorage.setItem(DIALOG_SIZE_KEY, JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem(DIALOG_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getById(projectId);
      setProject(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load project');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData: Partial<Project>) => {
    if (!project) return;

    setSaving(true);
    try {
      const updated = await projectsApi.update(projectId, {
        ...project,
        ...updatedData,
      });
      setProject(updated);
      toast.success('Project updated successfully');
      onUpdated(updated);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height });
  };

  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width - deltaX);
        newX = position.x + (size.width - newWidth);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height - deltaY);
        newY = position.y + (size.height - newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection]);

  const tabs = [
    { id: 'summary' as TabType, label: 'Summary', icon: FileText },
    { id: 'details' as TabType, label: 'Details', icon: Info },
    { id: 'events' as TabType, label: 'Events', icon: Calendar },
    { id: 'updates' as TabType, label: 'Updates', icon: MessageSquare },
    { id: 'milestones' as TabType, label: 'Milestones', icon: Milestone },
    { id: 'documents' as TabType, label: 'Documents', icon: FileArchive },
    { id: 'quotes' as TabType, label: 'Quotes', icon: Receipt },
    { id: 'invoices' as TabType, label: 'Invoices', icon: Briefcase },
    { id: 'esign' as TabType, label: 'E-Sign', icon: FileSignature },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  // Resize handles - visible border indicators for better UX
  const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    { direction: 'n', className: 'absolute top-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 's', className: 'absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'e', className: 'absolute top-4 bottom-4 right-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'w', className: 'absolute top-4 bottom-4 left-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-colors z-10' },
    { direction: 'ne', className: 'absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'nw', className: 'absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'se', className: 'absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
    { direction: 'sw', className: 'absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-[#0394ff]/50 transition-colors z-20' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[#1f2330] rounded-lg shadow-xl p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0394ff]" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - clickable to close */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        onClick={onClose}
      />

      {/* Dialog - pointer-events-auto to receive all interactions */}
      <div
        ref={dialogRef}
        className="absolute bg-[#1f2330] rounded-lg shadow-2xl border border-[#3d4457] flex flex-col pointer-events-auto"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-4 border-b border-[#3d4457] cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {project.name}
            </h2>
            <p className="text-sm text-[#838a9c] mt-1">
              Last updated: {new Date(project.updatedAt).toLocaleString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Horizontal Tabs */}
        <div className="border-b border-[#3d4457] bg-[#1f2330]">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0394ff] text-white'
                      : 'border-transparent text-[#838a9c] hover:text-white hover:border-[#3d4457]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'summary' && (
            <SummaryTab project={project} onSave={handleSave} saving={saving} />
          )}
          {activeTab === 'details' && (
            <DetailsTab project={project} onSave={handleSave} saving={saving} />
          )}
          {activeTab === 'events' && <EventsTab projectId={project.projectID} />}
          {activeTab === 'updates' && <UpdatesTab projectId={project.projectID} />}
          {activeTab === 'milestones' && <MilestonesTab projectId={project.projectID} />}
          {activeTab === 'documents' && <DocumentsTab projectId={project.projectID} />}
          {activeTab === 'quotes' && <QuotesTab projectId={project.projectID} />}
          {activeTab === 'invoices' && <InvoicesTab projectId={project.projectID} />}
          {activeTab === 'esign' && <ESignTab projectId={project.projectID} />}
          {activeTab === 'settings' && (
            <SettingsTab project={project} onSave={handleSave} saving={saving} />
          )}
        </div>

        {/* Resize Handles - rendered last to be on top but not interfere with content */}
        {resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            className={className}
            onMouseDown={(e) => handleResizeStart(e, direction)}
          />
        ))}
      </div>
    </div>
  );
}
