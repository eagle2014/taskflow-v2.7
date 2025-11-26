import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  List, 
  LayoutGrid, 
  Settings, 
  Share2 
} from 'lucide-react';

interface WorkspaceToolbarProps {
  currentView: 'list' | 'board' | 'calendar' | 'gantt' | 'workload' | 'mindmap';
  groupBy: string;
  searchQuery: string;
  availableViews: { id: string; name: string; icon: any }[];
  visibleViewIds: Set<string>;
  onViewChange: (view: 'list' | 'board' | 'calendar' | 'gantt' | 'workload' | 'mindmap') => void;
  onGroupByChange: (groupBy: string) => void;
  onSearchChange: (query: string) => void;
  onAddTask: () => void;
  onManageViews: () => void;
}

export function WorkspaceToolbar({
  currentView,
  groupBy,
  searchQuery,
  availableViews,
  visibleViewIds,
  onViewChange,
  onGroupByChange,
  onSearchChange,
  onAddTask,
  onManageViews
}: WorkspaceToolbarProps) {
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupOptions = [
    { value: 'none', label: 'No Grouping' },
    { value: 'status', label: 'Status' },
    { value: 'sprint', label: 'Sprint' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'phase', label: 'Phase' }
  ];

  const visibleViews = availableViews.filter(view => visibleViewIds.has(view.id));

  return (
    <div className="bg-[#292d39] border-b border-[#3a3f4f]">
      {/* View tabs */}
      <div className="flex items-center gap-1 px-4 pt-3">
        {visibleViews.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id as any)}
            className={`
              px-3 py-2 rounded-t text-sm flex items-center gap-2 transition-colors
              ${currentView === view.id 
                ? 'bg-[#181c28] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#3a3f4f]'
              }
            `}
          >
            {view.icon}
            <span>{view.name}</span>
          </button>
        ))}
        <button
          onClick={onManageViews}
          className="px-3 py-2 rounded-t text-sm flex items-center gap-2 text-gray-400 hover:text-white hover:bg-[#3a3f4f] transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#181c28]">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-64 bg-[#292d39] border-[#3a3f4f] text-white placeholder:text-gray-500"
            />
          </div>

          {/* Group By */}
          <div className="relative" ref={groupDropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGroupDropdown(!showGroupDropdown)}
              className="bg-[#292d39] border-[#3a3f4f] text-gray-300 hover:bg-[#3a3f4f]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Group by: {groupOptions.find(opt => opt.value === groupBy)?.label}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showGroupDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#292d39] border border-[#3a3f4f] rounded-md shadow-lg z-50">
                {groupOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onGroupByChange(option.value);
                      setShowGroupDropdown(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-[#3a3f4f] transition-colors
                      ${groupBy === option.value ? 'bg-[#3a3f4f] text-white' : 'text-gray-300'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#292d39] border-[#3a3f4f] text-gray-300 hover:bg-[#3a3f4f]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#292d39] border-[#3a3f4f] text-gray-300 hover:bg-[#3a3f4f]"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button
            size="sm"
            onClick={onAddTask}
            className="bg-[#0394ff] hover:bg-[#0394ff]/80 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}
