import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity } from '../types';
import { formatDistance } from 'date-fns';

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 3);
  const hasMore = activities.length > 3;

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 text-sm text-center">
          <p className="font-medium mb-1">No activity yet</p>
          <p className="text-xs">Activity will appear here as you work on this task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {displayedActivities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={index === displayedActivities.length - 1 && !hasMore}
        />
      ))}

      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="mx-4 mb-3 justify-start h-auto p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ChevronRight className="h-3 w-3 mr-1" />
          Show {activities.length - 3} more
        </Button>
      )}
    </div>
  );
}

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const formatTimestamp = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return new Date(date).toLocaleDateString('en-US', options)
      .replace(',', '')
      .replace(' at', ' at')
      .toLowerCase();
  };

  const getActivityText = () => {
    switch (activity.type) {
      case 'created':
        return 'created this task';
      case 'updated':
        return 'updated this task';
      case 'estimated':
        return `estimated ${activity.content}`;
      case 'commented':
        return 'commented';
      case 'status_changed':
        return `changed status to ${activity.content}`;
      case 'assigned':
        return `assigned to ${activity.content}`;
      case 'attached':
        return 'attached a file';
      default:
        return activity.content;
    }
  };

  return (
    <div className={`flex gap-3 px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* Timeline dot */}
      <div className="flex-shrink-0 mt-1">
        <div className="h-2 w-2 rounded-full bg-purple-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            {activity.user.name}
          </span>
          <span className="text-sm text-gray-600">
            {getActivityText()}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {formatTimestamp(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}
