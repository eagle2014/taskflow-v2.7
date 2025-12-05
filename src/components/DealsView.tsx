import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Building2,
  ChevronDown,
  RefreshCw,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CreateDealDialog } from './CreateDealDialog';
import { CreateQuoteDialog } from './CreateQuoteDialog';
import EditDealDialog from './EditDealDialog';
import { dealsApi } from '../services/api';

type StageId = 'ready_to_close' | 'new' | 'qualifying' | 'requirements' | 'value_proposition' | 'negotiation' | 'closed_won';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: StageId;
  organization: string;
  createdAt: string;
  assignedTo: string;
  assignedAvatar?: string;
  customerId?: string;
  // Additional fields for edit dialog
  source?: string;
  description?: string;
  probability?: number;
  lostReason?: string;
  expectedCloseDate?: string;
  contactName?: string;
}

interface DealsViewProps {
  currentUser: any;
}

// VTiger-style pipeline stages with colored titles
const stages: { id: StageId; label: string; color: string }[] = [
  { id: 'ready_to_close', label: 'Ready To Close', color: '#22c55e' },
  { id: 'new', label: 'New', color: '#f97316' },
  { id: 'qualifying', label: 'Qualifying', color: '#14b8a6' },
  { id: 'requirements', label: 'Requirements Gathering', color: '#3b82f6' },
  { id: 'value_proposition', label: 'Value Proposition', color: '#eab308' },
  { id: 'negotiation', label: 'Negotiation', color: '#ec4899' },
  { id: 'closed_won', label: 'Closed Won', color: '#1e3a5f' },
];

// Map API stage to local StageId
const mapApiStageToLocal = (apiStage: string): StageId => {
  const stageMap: Record<string, StageId> = {
    'new': 'new',
    'qualifying': 'qualifying',
    'requirements': 'requirements',
    'value_proposition': 'value_proposition',
    'negotiation': 'negotiation',
    'ready_to_close': 'ready_to_close',
    'closed_won': 'closed_won',
    // API might use different case or names
    'New': 'new',
    'Qualifying': 'qualifying',
    'Requirements': 'requirements',
    'Value Proposition': 'value_proposition',
    'Negotiation': 'negotiation',
    'Ready To Close': 'ready_to_close',
    'Closed Won': 'closed_won',
    'Lead': 'new',
    'Qualified': 'qualifying',
    'Proposal': 'value_proposition',
    'Won': 'closed_won',
  };
  return stageMap[apiStage] || 'new';
};

export function DealsView({ currentUser }: DealsViewProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterType] = useState<'my_deals' | 'all'>('my_deals');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDealForQuote, setSelectedDealForQuote] = useState<Deal | null>(null);
  const [selectedDealForEdit, setSelectedDealForEdit] = useState<Deal | null>(null);

  // Drag & Drop state
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageId | null>(null);
  const dragCounter = useRef(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ dealId: string; x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Fetch deals from API on mount
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiDeals = await dealsApi.getAll();
        // Map API deals to local Deal format
        const localDeals: Deal[] = apiDeals.map((d: any) => ({
          id: d.dealID || d.dealId,
          name: d.dealName,
          value: d.dealValue || 0,
          stage: mapApiStageToLocal(d.stage),
          organization: d.customerName || 'Unknown',
          createdAt: d.expectedCloseDate?.split('T')[0] || d.createdAt?.split('T')[0] || '',
          assignedTo: d.ownerName || 'Unknown',
          customerId: d.customerID || d.customerId,
          // Additional fields from API
          source: d.source,
          description: d.description,
          probability: d.probability || 0,
          lostReason: d.lostReason,
          expectedCloseDate: d.expectedCloseDate?.split('T')[0],
          contactName: d.contactName,
        }));
        setDeals(localDeals);
      } catch (err) {
        console.error('Failed to load deals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deals');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  // Context menu handlers
  const handleContextMenuOpen = (e: React.MouseEvent, dealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ dealId, x: rect.left, y: rect.bottom + 4 });
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDealForEdit(deal);
    setShowEditDialog(true);
    setContextMenu(null);
  };

  // Handle deal update from EditDealDialog
  const handleDealUpdate = (updatedDeal: any) => {
    console.log('Deal updated:', updatedDeal);
    setDeals(prev => prev.map(d =>
      d.id === updatedDeal.id
        ? {
            ...d,
            name: updatedDeal.name || d.name,
            value: updatedDeal.amount ?? d.value,
            stage: (updatedDeal.stage as StageId) || d.stage,
            organization: updatedDeal.organizationName || d.organization,
            assignedTo: updatedDeal.assignedTo || d.assignedTo,
            createdAt: updatedDeal.expectedCloseDate || d.createdAt,
            // Additional fields from edit dialog
            source: updatedDeal.leadSource || d.source,
            description: updatedDeal.description || d.description,
            probability: updatedDeal.probability ?? d.probability,
            lostReason: updatedDeal.lostReason || d.lostReason,
            expectedCloseDate: updatedDeal.expectedCloseDate || d.expectedCloseDate,
            contactName: updatedDeal.contactName || d.contactName,
          }
        : d
    ));
  };

  const handleDelete = async (deal: Deal) => {
    if (confirm(`Are you sure you want to delete "${deal.name}"?`)) {
      try {
        await dealsApi.delete(deal.id);
        setDeals(prev => prev.filter(d => d.id !== deal.id));
      } catch (err) {
        console.error('Failed to delete deal:', err);
        alert('Failed to delete deal. Please try again.');
      }
    }
    setContextMenu(null);
  };

  const handleCall = (deal: Deal) => {
    console.log('Call for deal:', deal);
    setContextMenu(null);
    // TODO: Implement call functionality
  };

  const handleEmail = (deal: Deal) => {
    console.log('Email for deal:', deal);
    setContextMenu(null);
    // TODO: Implement email functionality
  };

  const handleSendSMS = (deal: Deal) => {
    console.log('Send SMS for deal:', deal);
    setContextMenu(null);
    // TODO: Implement SMS functionality
  };

  const getSelectedDeal = () => deals.find(d => d.id === contextMenu?.dealId);

  // Handle new deal created
  const handleDealCreated = (newDeal: any) => {
    // Convert API deal to local Deal format
    const localDeal: Deal = {
      id: newDeal.dealId || String(Date.now()),
      name: newDeal.dealName,
      value: newDeal.dealValue || 0,
      stage: 'new',
      organization: newDeal.customerName || 'Unknown',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: currentUser?.fullName || 'Unknown',
    };
    setDeals(prev => [localDeal, ...prev]);
  };

  const filteredDeals = deals.filter(deal =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDealsByStage = (stageId: string) =>
    filteredDeals.filter(deal => deal.stage === stageId);

  const getStageTotal = (stageId: string) =>
    getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);

  const getTotalDeals = () => filteredDeals.length;
  const getClosedWonDeals = () => filteredDeals.filter(d => d.stage === 'closed_won').length;
  const getProgressPercent = () => {
    const total = getTotalDeals();
    if (total === 0) return 0;
    return Math.round((getClosedWonDeals() / total) * 100);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);


  const getStageColor = (stageId: string) =>
    stages.find(s => s.id === stageId)?.color || '#838a9c';

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverStage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: StageId) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverStage(null);

    if (draggedDeal && draggedDeal.stage !== targetStage) {
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === draggedDeal.id ? { ...deal, stage: targetStage } : deal
        )
      );
    }
    setDraggedDeal(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#1f2330]">
      {/* VTiger-style Header */}
      <div className="p-4 border-b border-[#3d4457]">
        <div className="flex items-center justify-between">
          {/* Left side - Title and filters */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Deals</h1>

            {/* My Deals dropdown */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#292d39] border border-[#3d4457] rounded text-sm text-white hover:bg-[#3d4457]">
              <span>{filterType === 'my_deals' ? 'My Deals' : 'All Deals'}</span>
              <ChevronDown className="h-4 w-4 text-[#838a9c]" />
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#838a9c]" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48 h-8 bg-[#292d39] border-[#3d4457] text-white placeholder:text-[#838a9c] text-sm"
              />
            </div>

            {/* All dropdown */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#292d39] border border-[#3d4457] rounded text-sm text-white hover:bg-[#3d4457]">
              <span>All</span>
              <ChevronDown className="h-4 w-4 text-[#838a9c]" />
            </button>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-24 h-2 bg-[#3d4457] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0394ff] rounded-full transition-all"
                  style={{ width: `${getProgressPercent()}%` }}
                />
              </div>
              <span className="text-[#838a9c]">{getProgressPercent()}%</span>
            </div>

            {/* New Deal button */}
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white h-8 px-3 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Deal
            </Button>

            {/* Sync button */}
            <button className="p-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded">
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* View options */}
            <div className="flex items-center gap-1 text-sm text-[#838a9c]">
              <span>View by</span>
              <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#3d4457] rounded">
                <span className="text-white">Stage</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <span className="mx-1">|</span>
              <span>Sort by</span>
              <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#3d4457] rounded">
                <span className="text-white">Created Time</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* View mode toggle */}
            <div className="flex border border-[#3d4457] rounded overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 ${viewMode === 'kanban' ? 'bg-[#0394ff] text-white' : 'bg-[#292d39] text-[#838a9c] hover:text-white'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-[#0394ff] text-white' : 'bg-[#292d39] text-[#838a9c] hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* More options */}
            <button className="p-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Full height - VTiger Layout Dark Mode */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#1a1d27]">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[#838a9c]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading deals...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-md text-center">
              <p className="text-red-400 mb-2">Failed to load deals</p>
              <p className="text-[#838a9c] text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-[#0394ff] text-white rounded hover:bg-[#0570cd] text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          viewMode === 'kanban' ? (
          /* VTiger-style Kanban View - Dark Mode */
          <div className="flex gap-0 flex-1 min-h-0">
            {stages.map((stage) => {
              return (
              <div
                key={stage.id}
                className={`flex-1 min-w-[180px] flex flex-col ${
                  dragOverStage === stage.id ? 'bg-[#0394ff]/10' : ''
                }`}
                onDragEnter={(e) => handleDragEnter(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header - VTiger style with colored top border */}
                <div
                  className="border-t-4 px-3 py-3 bg-[#292d39] flex-shrink-0"
                  style={{ borderTopColor: stage.color }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white">
                      {stage.label}
                    </span>
                    {getStageTotal(stage.id) > 0 && (
                      <span className="text-xs text-[#838a9c]">
                        ₫{(getStageTotal(stage.id) / 1000000).toLocaleString('vi-VN')}M
                      </span>
                    )}
                    {getDealsByStage(stage.id).length > 0 && (
                      <span className="ml-auto text-xs bg-[#3d4457] text-[#838a9c] px-1.5 py-0.5 rounded">
                        {getDealsByStage(stage.id).length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards Container - Dark background */}
                <div className={`flex-1 overflow-y-auto px-2 py-3 space-y-3 transition-colors min-h-0 ${
                  dragOverStage === stage.id ? 'bg-[#0394ff]/10' : 'bg-[#1a1d27]'
                }`}>
                  {getDealsByStage(stage.id).map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      onDragEnd={handleDragEnd}
                      className={`bg-[#292d39] rounded-md cursor-grab active:cursor-grabbing hover:bg-[#323845] transition-all overflow-hidden ${
                        draggedDeal?.id === deal.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      {/* Card with left color border - VTiger style */}
                      <div
                        className="border-l-4 p-3 relative group"
                        style={{ borderLeftColor: stage.color }}
                      >
                        {/* 3-dot menu button - VTiger style */}
                        <button
                          onClick={(e) => handleContextMenuOpen(e, deal.id)}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#3d4457] text-[#838a9c] hover:text-white transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Deal name */}
                        <h3 className="font-medium text-white text-sm mb-2 pr-6">
                          {deal.name}
                        </h3>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs text-[#838a9c] mb-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{deal.createdAt}</span>
                        </div>

                        {/* Organization link */}
                        <div className="flex items-center gap-1.5 text-xs mb-1.5">
                          <Building2 className="h-3 w-3 text-[#838a9c]" />
                          <a href="#" className="text-[#0394ff] hover:underline">
                            {deal.organization}
                          </a>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-1.5 text-xs mb-2">
                          <span className="text-[#838a9c]">💰</span>
                          <span className="text-white">
                            ₫{deal.value.toLocaleString('vi-VN')}
                          </span>
                        </div>

                        {/* Footer with stage badge and avatar */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#3d4457]">
                          {/* Stage badge */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-[#3d4457] text-[#838a9c]">
                              {stages.find(s => s.id === deal.stage)?.label}
                            </span>
                          </div>

                          {/* Add button and Avatar */}
                          <div className="flex items-center gap-2">
                            <button className="text-[#838a9c] hover:text-[#0394ff] text-lg leading-none">+</button>
                            <div
                              className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-medium"
                              style={{ backgroundColor: stage.color }}
                            >
                              {getInitials(deal.assignedTo)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getDealsByStage(stage.id).length === 0 && (
                    <div className="bg-[#292d39] rounded-md p-4 text-center text-[#838a9c] text-sm border border-dashed border-[#3d4457]">
                      {dragOverStage === stage.id ? 'Drop here' : 'No Deals found'}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-[#292d39] rounded-lg border border-[#3d4457] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1f2330]">
                <tr className="text-left text-xs font-medium text-[#838a9c] uppercase tracking-wider">
                  <th className="p-4">Deal Name</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3d4457]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-[#3d4457]/30 cursor-pointer">
                    <td className="p-4 text-white font-medium">{deal.name}</td>
                    <td className="p-4 text-[#0394ff] font-bold">{formatCurrency(deal.value)}</td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${getStageColor(deal.stage)}20`,
                          color: getStageColor(deal.stage),
                        }}
                      >
                        {stages.find(s => s.id === deal.stage)?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <a href="#" className="text-[#0394ff] hover:underline">{deal.organization}</a>
                    </td>
                    <td className="p-4 text-[#838a9c]">{new Date(deal.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-medium">
                          {getInitials(deal.assignedTo)}
                        </div>
                        <span className="text-white text-sm">{deal.assignedTo}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => handleContextMenuOpen(e, deal.id)}
                        className="text-[#838a9c] hover:text-white p-1 rounded hover:bg-[#3d4457]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        )}
      </div>

      {/* Create Deal Dialog */}
      {showCreateDialog && (
        <CreateDealDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={handleDealCreated}
        />
      )}

      {/* VTiger-style Context Menu */}
      {contextMenu && getSelectedDeal() && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-[#292d39] border border-[#3d4457] rounded-md shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {/* Assigned user info */}
          <div className="px-3 py-2 border-b border-[#3d4457]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-medium">
                {getInitials(getSelectedDeal()!.assignedTo)}
              </div>
              <span className="text-sm text-white">{getSelectedDeal()!.assignedTo}</span>
            </div>
          </div>

          {/* Menu items */}
          <button
            onClick={() => handleEdit(getSelectedDeal()!)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <Pencil className="h-4 w-4 text-[#838a9c]" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => handleDelete(getSelectedDeal()!)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <Trash2 className="h-4 w-4 text-[#838a9c]" />
            <span>Delete</span>
          </button>

          <div className="border-t border-[#3d4457] my-1" />

          <button
            onClick={() => handleCall(getSelectedDeal()!)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <Phone className="h-4 w-4 text-[#22c55e]" />
            <span>Call</span>
          </button>

          <button
            onClick={() => handleEmail(getSelectedDeal()!)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <Mail className="h-4 w-4 text-[#0394ff]" />
            <span>Email</span>
          </button>

          <button
            onClick={() => handleSendSMS(getSelectedDeal()!)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-[#eab308]" />
            <span>Send SMS</span>
          </button>

          <div className="border-t border-[#3d4457] my-1" />

          <button
            onClick={() => {
              const deal = getSelectedDeal();
              if (deal) {
                setSelectedDealForQuote(deal);
                setShowQuoteDialog(true);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#3d4457] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#a855f7]" />
            <span>Create Quote</span>
          </button>
        </div>
      )}

      {/* Create Quote Dialog */}
      {showQuoteDialog && (
        <CreateQuoteDialog
          onClose={() => {
            setShowQuoteDialog(false);
            setSelectedDealForQuote(null);
          }}
          onCreated={(quote) => {
            console.log('Quote created:', quote);
          }}
          dealId={selectedDealForQuote?.id}
          dealName={selectedDealForQuote?.name}
        />
      )}

      {/* Edit Deal Dialog */}
      <EditDealDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedDealForEdit(null);
        }}
        deal={selectedDealForEdit ? {
          id: selectedDealForEdit.id,
          name: selectedDealForEdit.name,
          amount: selectedDealForEdit.value,
          stage: selectedDealForEdit.stage,
          probability: selectedDealForEdit.probability || 0,
          organizationName: selectedDealForEdit.organization,
          assignedTo: selectedDealForEdit.assignedTo,
          expectedCloseDate: selectedDealForEdit.expectedCloseDate || selectedDealForEdit.createdAt,
          customerId: selectedDealForEdit.customerId,
          // Additional fields
          leadSource: selectedDealForEdit.source,
          description: selectedDealForEdit.description,
          lostReason: selectedDealForEdit.lostReason,
          contactName: selectedDealForEdit.contactName,
        } : null}
        onSave={handleDealUpdate}
      />
    </div>
  );
}
