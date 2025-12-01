import { useState } from 'react';
import { ChevronRight, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  activities: Activity[];
  onReply?: (activityId: string) => void;
  onLike?: (activityId: string) => void;
}

export function ActivityTimeline({ activities, onReply, onLike }: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const displayedActivities = showAll ? activities : activities.slice(0, 3);
  const hasMore = activities.length > 3;

  const handleLike = (activityId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
    onLike?.(activityId);
  };

  // Helper to find parent comment for replies
  const getParentComment = (parentId: string | undefined) => {
    if (!parentId) return null;
    return activities.find(a => a.id === parentId && a.type === 'commented');
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-[#838a9c] text-sm text-center">
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
          parentComment={getParentComment(activity.parentCommentId)}
          isLast={index === displayedActivities.length - 1 && !hasMore}
          isLiked={likedComments.has(activity.id)}
          onLike={() => handleLike(activity.id)}
          onReply={() => onReply?.(activity.id)}
        />
      ))}

      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="mx-4 mb-3 justify-start h-auto p-2 text-xs text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
        >
          <ChevronRight className="h-3 w-3 mr-1" />
          Show more
        </Button>
      )}
    </div>
  );
}

interface ActivityItemProps {
  activity: Activity;
  parentComment?: Activity | null;
  isLast?: boolean;
  isLiked?: boolean;
  onLike?: () => void;
  onReply?: () => void;
}

function ActivityItem({ activity, parentComment, isLast, isLiked, onLike, onReply }: ActivityItemProps) {
  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return 'recently';
    }
  };

  // Truncate long content for quoted reply display
  const truncateContent = (text: string, maxLength: number = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isComment = activity.type === 'commented';

  const getActivityText = () => {
    switch (activity.type) {
      case 'created':
        return 'created this task';
      case 'updated':
        return 'updated this task';
      case 'estimated':
        return `estimated ${activity.content}`;
      case 'commented':
        return null; // Comments show content differently
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

  // Non-comment activity item (simpler format)
  if (!isComment) {
    return (
      <div className={`flex gap-3 px-4 py-2 ${!isLast ? '' : ''}`}>
        <div className="flex-shrink-0 mt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#838a9c]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap text-xs">
            <span className="font-medium text-white">{activity.user.name}</span>
            <span className="text-[#838a9c]">{getActivityText()}</span>
            <span className="text-[#838a9c] ml-auto">{formatTimestamp(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Comment activity item (full format with avatar, reply, like)
  return (
    <div className={`px-4 py-3 ${!isLast ? 'border-b border-[#3d4457]' : ''}`}>
      {/* Comment Header */}
      <div className="flex items-start gap-3">
        <Avatar
          className="w-8 h-8 flex-shrink-0"
          style={{ backgroundColor: activity.user.color || '#0ea5e9' }}
        >
          <AvatarFallback className="text-xs text-white font-medium">
            {activity.user.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name and Time */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{activity.user.name}</span>
            <span className="text-xs text-[#838a9c]">{formatTimestamp(activity.timestamp)}</span>
          </div>

          {/* Quoted Reply Box - Zalo/ClickUp style */}
          {parentComment && (
            <div className="mt-2 p-2 bg-[#292d39] border-l-2 border-[#8b5cf6] rounded-r-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#c5c9d6]">
                  {parentComment.user.name}
                </span>
              </div>
              <p className="text-xs text-[#838a9c]">
                {truncateContent(parentComment.content || '', 100)}
              </p>
            </div>
          )}

          {/* Comment Content */}
          <div className="mt-2 text-sm text-[#c5c9d6] whitespace-pre-wrap break-words">
            {activity.content}
          </div>

          {/* Actions: Like and Reply */}
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`h-6 px-2 py-0 text-xs gap-1 ${
                isLiked
                  ? 'text-[#8b5cf6] hover:text-[#a78bfa]'
                  : 'text-[#838a9c] hover:text-white'
              } hover:bg-[#3d4457]`}
            >
              <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="h-6 px-2 py-0 text-xs text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
            >
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
