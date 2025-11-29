/**
 * Activity Sidebar Integration Example
 *
 * This example shows how to integrate the Activity Sidebar components
 * into the TaskDetailDialog right sidebar.
 */

import { ActivityHeader } from '../components/ActivityHeader';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { CommentInput } from '../components/CommentInput';
import type { Activity } from '../types';

// Mock activity data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'created',
    user: {
      name: 'You',
      initials: 'YU',
      color: 'bg-purple-500',
    },
    timestamp: new Date('2021-06-15T22:44:00'),
    content: 'created this task',
  },
  {
    id: '2',
    type: 'estimated',
    user: {
      name: 'You',
      initials: 'YU',
      color: 'bg-purple-500',
    },
    timestamp: new Date('2021-06-15T22:45:00'),
    content: '8 weeks',
  },
  {
    id: '3',
    type: 'assigned',
    user: {
      name: 'Sarah Wilson',
      initials: 'SW',
      color: 'bg-blue-500',
    },
    timestamp: new Date('2021-06-16T09:30:00'),
    content: 'John Doe',
  },
  {
    id: '4',
    type: 'status_changed',
    user: {
      name: 'John Doe',
      initials: 'JD',
      color: 'bg-green-500',
    },
    timestamp: new Date('2021-06-16T14:20:00'),
    content: 'In Progress',
  },
  {
    id: '5',
    type: 'commented',
    user: {
      name: 'Mike Chen',
      initials: 'MC',
      color: 'bg-orange-500',
    },
    timestamp: new Date('2021-06-17T11:15:00'),
    content: 'Added a comment',
  },
];

export function ActivitySidebarExample() {
  const handleCommentSubmit = (content: string) => {
    console.log('Comment submitted:', content);
    // TODO: Call API to save comment
    // TODO: Add new activity to timeline
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with search, notifications, and more options */}
      <ActivityHeader />

      {/* Scrollable activity timeline */}
      <div className="flex-1 overflow-y-auto">
        <ActivityTimeline activities={mockActivities} />
      </div>

      {/* Comment input at bottom */}
      <CommentInput onSubmit={handleCommentSubmit} />
    </div>
  );
}

/**
 * Integration into TaskDetailDialog.tsx:
 *
 * <Dialog>
 *   <DialogContent className="max-w-6xl h-[90vh]">
 *     <div className="flex h-full gap-0">
 *       <!-- Main content area (flex-1) -->
 *       <div className="flex-1 flex flex-col">
 *         <TaskHeader />
 *         <TaskMetadata />
 *         <TaskDescription />
 *         <TaskTabs />
 *       </div>
 *
 *       <!-- Activity sidebar (w-80) -->
 *       <div className="w-80 border-l border-gray-200">
 *         <ActivitySidebarExample />
 *       </div>
 *     </div>
 *   </DialogContent>
 * </Dialog>
 */
