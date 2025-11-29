import { AssigneeListProps } from '../types';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Plus } from 'lucide-react';

export function AssigneeList({ assignees, onAdd }: AssigneeListProps) {
  // Handle single assignee or empty state
  const assigneeArray = assignees || [];
  const hasAssignees = assigneeArray.length > 0;

  if (!hasAssignees) {
    return (
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1 text-sm text-[#838a9c] hover:text-white transition-colors"
      >
        <span>Empty</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {assigneeArray.map((assignee, index) => (
        <Avatar
          key={index}
          className="w-6 h-6 border-2 border-[#1f2330] -ml-1 first:ml-0"
          style={{ backgroundColor: assignee?.color || '#0394ff' }}
        >
          <AvatarFallback className="text-xs text-white font-medium">
            {assignee?.initials || 'U'}
          </AvatarFallback>
        </Avatar>
      ))}
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-full border border-dashed border-[#3d4457] flex items-center justify-center hover:border-[#8b5cf6] hover:bg-[#292d39] transition-colors"
        >
          <Plus className="w-3 h-3 text-[#838a9c]" />
        </button>
      )}
    </div>
  );
}
