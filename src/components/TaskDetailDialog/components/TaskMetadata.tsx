import { TaskMetadataProps } from '../types';
import { MetadataField } from '../fields/MetadataField';
import { StatusPill } from '../fields/StatusPill';
import { AssigneeList } from '../fields/AssigneeList';
import { DateRange } from '../fields/DateRange';
import { Badge } from '../../ui/badge';
import { Circle, Users, Calendar, Zap, Clock, Link2 } from 'lucide-react';

export function TaskMetadata({ task, onUpdate }: TaskMetadataProps) {
  const handleStatusChange = (newStatus: typeof task.status) => {
    onUpdate({ field: 'status', value: newStatus });
  };

  // Handle assignee as array (convert single assignee to array)
  const assignees = task.assignee ? [task.assignee] : [];

  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-5 mb-6 mt-6">
      {/* Status */}
      <MetadataField
        icon={<Circle className="w-3 h-3 text-[#838a9c]" />}
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
        icon={<Users className="w-3 h-3 text-[#838a9c]" />}
        label="Assignees"
        value={<AssigneeList assignees={assignees} />}
      />

      {/* Dates */}
      <MetadataField
        icon={<Calendar className="w-3 h-3 text-[#838a9c]" />}
        label="Dates"
        value={
          <DateRange
            startDate={task.startDate}
            endDate={task.endDate || task.dueDate}
          />
        }
      />

      {/* Time Estimate */}
      <MetadataField
        icon={<Zap className="w-3 h-3 text-[#838a9c]" />}
        label="Time Estimate"
        value={
          task.budget > 0 ? (
            <Badge className="bg-[#292d39] text-white border-[#3d4457] font-medium">
              {task.budget}h
            </Badge>
          ) : (
            <span className="text-sm text-[#838a9c]">Empty</span>
          )
        }
      />

      {/* Track Time */}
      <MetadataField
        icon={<Clock className="w-3 h-3 text-[#838a9c]" />}
        label="Track Time"
        value={
          <button className="text-sm text-[#8b5cf6] hover:text-[#7c66d9] hover:underline transition-colors">
            Add time
          </button>
        }
      />

      {/* Relationships */}
      <MetadataField
        icon={<Link2 className="w-3 h-3 text-[#838a9c]" />}
        label="Relationships"
        value={<span className="text-sm text-[#838a9c]">Empty</span>}
      />
    </div>
  );
}
