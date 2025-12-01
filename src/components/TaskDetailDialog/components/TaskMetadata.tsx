import { useState, useEffect } from 'react';
import { TaskMetadataProps, Assignee } from '../types';
import { MetadataField } from '../fields/MetadataField';
import { StatusPill } from '../fields/StatusPill';
import { ClickUpDatePicker } from '../fields/ClickUpDatePicker';
import { Circle, Users, Calendar, Zap, Clock, Link2, Plus, Check, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { usersApi, User } from '@/services/api';

// Generate random color for user avatar
const generateUserColor = (name: string): string => {
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Extended Assignee with email for display
interface AssigneeWithEmail extends Assignee {
  email?: string;
}

// Convert API User to Assignee format
const userToAssignee = (user: User): AssigneeWithEmail => ({
  id: user.userID,  // Use userID as unique identifier
  name: user.name,
  email: user.email,  // Include email for display
  initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
  color: generateUserColor(user.name),
  avatar: user.avatar || '',
});

export function TaskMetadata({ task, onUpdate }: TaskMetadataProps) {
  const [timeEstimate, setTimeEstimate] = useState(task.budget > 0 ? task.budget.toString() : '');
  const [trackedTime, setTrackedTime] = useState('');
  const [availableUsers, setAvailableUsers] = useState<AssigneeWithEmail[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load users from API on mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await usersApi.getAll();
        const assignees = users.map(userToAssignee);
        setAvailableUsers(assignees);
      } catch (error) {
        console.error('Failed to load users:', error);
        // Keep empty list on error
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);
  const [startDate, setStartDate] = useState<Date | undefined>(
    task.startDate ? new Date(task.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    task.endDate || task.dueDate ? new Date(task.endDate || task.dueDate!) : undefined
  );
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(
    task.assignee ? [task.assignee] : []
  );
  const [isTimeEstimateOpen, setIsTimeEstimateOpen] = useState(false);
  const [isTrackTimeOpen, setIsTrackTimeOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  const handleStatusChange = (newStatus: typeof task.status) => {
    onUpdate({ field: 'status', value: newStatus });
  };

  const handleDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (date) {
        onUpdate({ field: 'startDate', value: format(date, 'yyyy-MM-dd') });
      }
    } else {
      setEndDate(date);
      if (date) {
        onUpdate({ field: 'dueDate', value: format(date, 'yyyy-MM-dd') });
      }
    }
  };

  const handleTimeEstimateChange = (value: string) => {
    setTimeEstimate(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdate({ field: 'budget', value: numValue });
    }
  };

  const handleTrackTimeChange = (value: string) => {
    setTrackedTime(value);
  };

  const handleAssigneeSelect = (user: Assignee) => {
    // Use id for comparison if available, fallback to name
    const isSelected = selectedAssignees.some(a => (a.id && user.id) ? a.id === user.id : a.name === user.name);
    let newAssignees: Assignee[];

    if (isSelected) {
      newAssignees = selectedAssignees.filter(a => (a.id && user.id) ? a.id !== user.id : a.name !== user.name);
    } else {
      newAssignees = [...selectedAssignees, user];
    }

    setSelectedAssignees(newAssignees);
    onUpdate({ field: 'assignee', value: newAssignees[0] || null });
  };

  const handleRemoveAssignee = (user: Assignee) => {
    const newAssignees = selectedAssignees.filter(a => (a.id && user.id) ? a.id !== user.id : a.name !== user.name);
    setSelectedAssignees(newAssignees);
    onUpdate({ field: 'assignee', value: newAssignees[0] || null });
  };

  return (
    <div className="grid grid-cols-2 gap-x-20 gap-y-6 mb-6 mt-6 py-4">
      {/* Status */}
      <MetadataField
        icon={<Circle className="w-4 h-4 text-[#838a9c]" />}
        label="Status"
        value={
          <StatusPill
            status={task.status}
            onChange={handleStatusChange}
          />
        }
      />

      {/* Assignees */}
      <MetadataField
        icon={<Users className="w-4 h-4 text-[#838a9c]" />}
        label="Assignees"
        value={
          <Popover open={isAssigneeOpen} onOpenChange={setIsAssigneeOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-[#292d39] px-2 py-1 rounded transition-colors min-h-[32px]">
                {selectedAssignees.length > 0 ? (
                  <div className="flex items-center gap-1">
                    {selectedAssignees.map((assignee) => (
                      <div key={assignee.id || assignee.name} className="flex items-center gap-1 bg-[#292d39] rounded-full pr-2">
                        <Avatar
                          className="w-6 h-6"
                          style={{ backgroundColor: assignee.color || '#0394ff' }}
                        >
                          <AvatarFallback className="text-xs text-white font-medium">
                            {assignee.initials || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">{assignee.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAssignee(assignee);
                          }}
                          className="ml-1 text-[#838a9c] hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <Plus className="w-4 h-4 text-[#838a9c]" />
                  </div>
                ) : (
                  <span className="text-sm text-[#838a9c]">Empty</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#292d39] border-[#3d4457]" align="start">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Search by name or email..."
                  className="bg-transparent text-white placeholder:text-[#838a9c] border-b border-[#3d4457]"
                />
                <CommandList>
                  <CommandEmpty className="text-[#838a9c] text-sm py-4 text-center">No users found</CommandEmpty>
                  <CommandGroup>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[#838a9c]" />
                        <span className="ml-2 text-sm text-[#838a9c]">Loading users...</span>
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-[#838a9c] text-sm py-4 text-center">No users available</div>
                    ) : (
                      availableUsers.map((user) => {
                        const isSelected = selectedAssignees.some(a => (a.id && user.id) ? a.id === user.id : a.name === user.name);
                        return (
                          <CommandItem
                            key={user.id || user.name}
                            value={`${user.name} ${user.email || ''}`}
                            onSelect={() => handleAssigneeSelect(user)}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer text-[#c5c9d6] hover:bg-[#3d4457] hover:text-white aria-selected:bg-[#3d4457]"
                          >
                            <Avatar
                              className="w-8 h-8 flex-shrink-0"
                              style={{ backgroundColor: user.color }}
                            >
                              <AvatarFallback className="text-xs text-white font-medium">
                                {user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">{user.name}</div>
                              {user.email && (
                                <div className="text-xs text-[#838a9c] truncate">{user.email}</div>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />}
                          </CommandItem>
                        );
                      })
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        }
      />

      {/* Dates - ClickUp style */}
      <MetadataField
        icon={<Calendar className="w-4 h-4 text-[#838a9c]" />}
        label="Dates"
        value={
          <ClickUpDatePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(date) => handleDateChange(date, 'start')}
            onEndDateChange={(date) => handleDateChange(date, 'end')}
          />
        }
      />

      {/* Time Estimate */}
      <MetadataField
        icon={<Zap className="w-4 h-4 text-[#838a9c]" />}
        label="Time Estimate"
        value={
          <Popover open={isTimeEstimateOpen} onOpenChange={setIsTimeEstimateOpen}>
            <PopoverTrigger asChild>
              <button className="text-sm hover:bg-[#292d39] px-2 py-1 rounded transition-colors">
                {timeEstimate ? (
                  <span className="text-white font-medium">{timeEstimate}h</span>
                ) : (
                  <span className="text-[#838a9c]">Empty</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-3 bg-[#292d39] border-[#3d4457]"
              align="start"
              onOpenAutoFocus={(e: Event) => e.preventDefault()}
            >
              <label className="text-xs text-[#838a9c] mb-2 block">Hours</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={timeEstimate}
                onChange={(e) => handleTimeEstimateChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsTimeEstimateOpen(false);
                  }
                }}
                placeholder="e.g. 8"
                className="bg-[#1f2330] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
                autoFocus
              />
            </PopoverContent>
          </Popover>
        }
      />

      {/* Track Time */}
      <MetadataField
        icon={<Clock className="w-4 h-4 text-[#838a9c]" />}
        label="Track Time"
        value={
          <Popover open={isTrackTimeOpen} onOpenChange={setIsTrackTimeOpen}>
            <PopoverTrigger asChild>
              <button className="text-sm text-[#8b5cf6] hover:text-[#7c66d9] hover:bg-[#292d39] px-2 py-1 rounded transition-colors">
                {trackedTime ? `${trackedTime}h logged` : 'Add time'}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-3 bg-[#292d39] border-[#3d4457]"
              align="start"
              onOpenAutoFocus={(e: Event) => e.preventDefault()}
            >
              <label className="text-xs text-[#838a9c] mb-2 block">Hours worked</label>
              <Input
                type="number"
                min="0"
                step="0.25"
                value={trackedTime}
                onChange={(e) => handleTrackTimeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsTrackTimeOpen(false);
                  }
                }}
                placeholder="e.g. 2.5"
                className="bg-[#1f2330] border-[#3d4457] text-white placeholder:text-[#838a9c] focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
                autoFocus
              />
            </PopoverContent>
          </Popover>
        }
      />

      {/* Relationships */}
      <MetadataField
        icon={<Link2 className="w-4 h-4 text-[#838a9c]" />}
        label="Relationships"
        value={
          <button className="text-sm text-[#838a9c] hover:text-white hover:bg-[#292d39] px-2 py-1 rounded transition-colors">
            Empty
          </button>
        }
      />
    </div>
  );
}
