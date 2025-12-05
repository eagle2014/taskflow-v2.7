import { useState, useRef, useEffect } from 'react';
import { X, Save, Loader2, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CustomerPicker, ContactPicker, DealPicker } from './EntityPicker';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { CreateContactDialog } from './CreateContactDialog';
import { CreateDealDialog } from './CreateDealDialog';
import { projectsApi, customersApi, contactsApi, dealsApi, usersApi } from '../services/api';
import type { Project } from '../services/api';
import type { Customer, Contact, Deal } from '../types/crm';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  customerId?: string;
  contactId?: string;
  dealId?: string;
  assigneeId?: string;
  projectUrl?: string;
  progress: number;
}

type TabType = 'projectDetails' | 'customInfo' | 'description';

// LocalStorage keys
const DIALOG_SIZE_KEY = 'createproject-dialog-size';
const DIALOG_POSITION_KEY = 'createproject-dialog-position';

// Default size and constraints
const DEFAULT_SIZE = { width: 1200, height: 750 };
const MIN_WIDTH = 900;
const MIN_HEIGHT = 600;

// Resize direction type
type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function CreateProjectDialog({ onClose, onCreated }: CreateProjectDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projectDetails');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Collapsible sections state (for Project Details tab)
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    dates: true,
    additional: true,
  });

  // CRM entities
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<any | null>(null);

  // Creation dialogs
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    progress: 0,
  });

  // Draggable & Resizable state
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
    // Center on screen
    return {
      x: (window.innerWidth - DEFAULT_SIZE.width) / 2,
      y: (window.innerHeight - DEFAULT_SIZE.height) / 2,
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(DIALOG_SIZE_KEY, JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem(DIALOG_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const { width: startWidth, height: startHeight } = resizeStartRef.current;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = position.x;
    let newY = position.y;

    // Handle horizontal resize
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
    } else if (resizeDirection.includes('w')) {
      newWidth = Math.max(MIN_WIDTH, startWidth - deltaX);
      if (newWidth > MIN_WIDTH) newX = position.x + deltaX;
    }

    // Handle vertical resize
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(MIN_HEIGHT, startHeight + deltaY);
    } else if (resizeDirection.includes('n')) {
      newHeight = Math.max(MIN_HEIGHT, startHeight - deltaY);
      if (newHeight > MIN_HEIGHT) newY = position.y + deltaY;
    }

    setSize({ width: newWidth, height: newHeight });
    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeDirection]);

  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    setSaving(true);
    try {
      const project = await projectsApi.create({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        assigneeID: selectedAssignee?.userID,
        customerID: selectedCustomer?.customerId,
        contactID: selectedContact?.contactId,
        dealID: selectedDeal?.dealId,
        projectUrl: formData.projectUrl,
        progress: formData.progress,
      });
      toast.success('Project created successfully');
      onCreated(project);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  // Search handlers
  const handleCustomerSearch = async (searchTerm: string) => {
    try {
      return await customersApi.search({ searchTerm, pageSize: 10 });
    } catch (error) {
      return [];
    }
  };

  const handleContactSearch = async (searchTerm: string) => {
    try {
      return await contactsApi.search({
        searchTerm,
        customerId: selectedCustomer?.customerId,
        pageSize: 10
      });
    } catch (error) {
      return [];
    }
  };

  const handleDealSearch = async (searchTerm: string) => {
    try {
      return await dealsApi.search({
        searchTerm,
        customerId: selectedCustomer?.customerId,
        pageSize: 10
      });
    } catch (error) {
      return [];
    }
  };

  const handleUserSearch = async (searchTerm: string) => {
    try {
      const users = await usersApi.getAll();
      return users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      return [];
    }
  };

  // Resize handles with much larger hit areas for better usability
  const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    // Edge handles - 8px thick for easy targeting
    { direction: 'n', className: 'absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-all z-[100]' },
    { direction: 's', className: 'absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-[#0394ff]/40 transition-all z-[100]' },
    { direction: 'e', className: 'absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-all z-[100]' },
    { direction: 'w', className: 'absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize bg-transparent hover:bg-[#0394ff]/40 transition-all z-[100]' },
    // Corner handles - 12px for easier diagonal resizing with visible indicators
    { direction: 'ne', className: 'absolute top-0 right-0 w-3 h-3 cursor-nesw-resize bg-[#0394ff]/30 hover:bg-[#0394ff]/70 transition-all rounded-tr-lg z-[110] border-r border-t border-[#0394ff]' },
    { direction: 'nw', className: 'absolute top-0 left-0 w-3 h-3 cursor-nwse-resize bg-[#0394ff]/30 hover:bg-[#0394ff]/70 transition-all rounded-tl-lg z-[110] border-l border-t border-[#0394ff]' },
    { direction: 'se', className: 'absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-[#0394ff]/30 hover:bg-[#0394ff]/70 transition-all rounded-br-lg z-[110] border-r border-b border-[#0394ff]' },
    { direction: 'sw', className: 'absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize bg-[#0394ff]/30 hover:bg-[#0394ff]/70 transition-all rounded-bl-lg z-[110] border-l border-b border-[#0394ff]' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" />
      <div
        ref={dialogRef}
        className="fixed z-50 bg-[#1f2330] rounded-lg shadow-2xl border border-[#3d4457] flex flex-col"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Resize Handles */}
        {resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            className={className}
            onMouseDown={(e) => handleResizeStart(e, direction)}
          />
        ))}

        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-4 border-b border-[#3d4457] cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0394ff]/10">
              <Folder className="h-5 w-5 text-[#0394ff]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Create New Project
              </h2>
              <p className="text-sm text-[#838a9c]">
                VTiger-style project creation
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tabs */}
          <div className="w-64 border-r border-[#3d4457] bg-[#292d39] p-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('projectDetails')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'projectDetails'
                  ? 'bg-[#0394ff] text-white'
                  : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
              }`}
            >
              Project Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customInfo')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'customInfo'
                  ? 'bg-[#0394ff] text-white'
                  : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
              }`}
            >
              Custom Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'description'
                  ? 'bg-[#0394ff] text-white'
                  : 'text-[#838a9c] hover:bg-[#3d4457] hover:text-white'
              }`}
            >
              Description Details
            </button>
          </div>

          {/* Right Content Area */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Project Details Tab */}
              {activeTab === 'projectDetails' && (
                <div className="space-y-4">
                  {/* Section 1: Basic Information */}
                  <div className="border border-[#3d4457] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('basicInfo')}
                      className="w-full flex items-center justify-between p-3 bg-[#292d39] hover:bg-[#3d4457] transition-colors"
                    >
                      <span className="font-medium text-white">Basic Information</span>
                      {expandedSections.basicInfo ? (
                        <ChevronDown className="h-4 w-4 text-[#838a9c]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#838a9c]" />
                      )}
                    </button>
                    {expandedSections.basicInfo && (
                      <div className="p-4 space-y-4">
                        <div>
                          <Label htmlFor="projectName">
                            Project Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="projectName"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter project name"
                            required
                            className="bg-[#292d39] border-[#3d4457] text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              value={formData.status}
                              onChange={(e) => handleChange('status', e.target.value)}
                              className="w-full px-3 py-2 border border-[#3d4457] rounded-lg bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                            >
                              <option value="Active">Active</option>
                              <option value="Planning">Planning</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <select
                              id="priority"
                              value={formData.priority}
                              onChange={(e) => handleChange('priority', e.target.value)}
                              className="w-full px-3 py-2 border border-[#3d4457] rounded-lg bg-[#292d39] text-white focus:outline-none focus:ring-2 focus:ring-[#0394ff]"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Dates */}
                  <div className="border border-[#3d4457] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('dates')}
                      className="w-full flex items-center justify-between p-3 bg-[#292d39] hover:bg-[#3d4457] transition-colors"
                    >
                      <span className="font-medium text-white">Dates</span>
                      {expandedSections.dates ? (
                        <ChevronDown className="h-4 w-4 text-[#838a9c]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#838a9c]" />
                      )}
                    </button>
                    {expandedSections.dates && (
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => handleChange('startDate', e.target.value)}
                              className="bg-[#292d39] border-[#3d4457] text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => handleChange('endDate', e.target.value)}
                              className="bg-[#292d39] border-[#3d4457] text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Additional Information */}
                  <div className="border border-[#3d4457] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection('additional')}
                      className="w-full flex items-center justify-between p-3 bg-[#292d39] hover:bg-[#3d4457] transition-colors"
                    >
                      <span className="font-medium text-white">Additional Information</span>
                      {expandedSections.additional ? (
                        <ChevronDown className="h-4 w-4 text-[#838a9c]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#838a9c]" />
                      )}
                    </button>
                    {expandedSections.additional && (
                      <div className="p-4 space-y-4">
                        <div>
                          <Label htmlFor="projectUrl">Project URL</Label>
                          <Input
                            id="projectUrl"
                            value={formData.projectUrl}
                            onChange={(e) => handleChange('projectUrl', e.target.value)}
                            placeholder="https://..."
                            className="bg-[#292d39] border-[#3d4457] text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="progress">
                            Progress (%) - {formData.progress}%
                          </Label>
                          <input
                            type="range"
                            id="progress"
                            min="0"
                            max="100"
                            step="5"
                            value={formData.progress}
                            onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Information Tab */}
              {activeTab === 'customInfo' && (
                <div className="space-y-4">
                  <CustomerPicker
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    onSearch={handleCustomerSearch}
                    onCreate={() => setShowCustomerDialog(true)}
                  />

                  <ContactPicker
                    value={selectedContact}
                    onChange={setSelectedContact}
                    onSearch={handleContactSearch}
                    onCreate={() => setShowContactDialog(true)}
                    disabled={!selectedCustomer}
                  />

                  <DealPicker
                    value={selectedDeal}
                    onChange={setSelectedDeal}
                    onSearch={handleDealSearch}
                    onCreate={() => setShowDealDialog(true)}
                    disabled={!selectedCustomer}
                  />
                </div>
              )}

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter project description..."
                    rows={12}
                    className="bg-[#292d39] border-[#3d4457] text-white"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#3d4457]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="border-[#3d4457] text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline Creation Dialogs */}
      {showCustomerDialog && (
        <CreateCustomerDialog
          onClose={() => setShowCustomerDialog(false)}
          onCreated={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerDialog(false);
          }}
        />
      )}

      {showContactDialog && (
        <CreateContactDialog
          onClose={() => setShowContactDialog(false)}
          onCreated={(contact) => {
            setSelectedContact(contact);
            setShowContactDialog(false);
          }}
          customerId={selectedCustomer?.customerId}
        />
      )}

      {showDealDialog && (
        <CreateDealDialog
          onClose={() => setShowDealDialog(false)}
          onCreated={(deal) => {
            setSelectedDeal(deal);
            setShowDealDialog(false);
          }}
          customerId={selectedCustomer?.customerId}
        />
      )}
    </>
  );
}
