// TaskDetailDialog Types
// Import and re-export types from the main types file
import { type WorkspaceTask, type Subtask, type ActionItem } from '@/types/workspace';
export { type WorkspaceTask, type Subtask, type ActionItem };

// Tab Type
export type TaskTab = 'details' | 'subtasks' | 'action-items';

// Assignee Type
export interface Assignee {
  id?: string;  // Unique identifier for key prop
  name: string;
  avatar: string;
  initials: string;
  color: string;
}

export interface TaskComment {
  id: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'activity';
}

export interface TaskHeaderProps {
  task: WorkspaceTask;
  onTitleChange: (title: string) => void;
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

// Discriminated union for type-safe field updates
export type TaskFieldUpdate =
  | { field: 'status'; value: WorkspaceTask['status'] }
  | { field: 'assignee'; value: WorkspaceTask['assignee'] }
  | { field: 'startDate' | 'endDate' | 'dueDate'; value: string | undefined }
  | { field: 'name'; value: string }
  | { field: 'description'; value: string }
  | { field: 'budget' | 'spent' | 'budgetRemaining' | 'estimatedHours' | 'actualHours' | 'progress'; value: number }
  | { field: 'phaseID'; value: string | null };

export interface TaskMetadataProps {
  task: WorkspaceTask;
  onUpdate: (update: TaskFieldUpdate) => void;
}

export interface MetadataFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export interface StatusPillProps {
  status: WorkspaceTask['status'];
  onChange: (status: WorkspaceTask['status']) => void;
}

export interface AssigneeListProps {
  assignees: WorkspaceTask['assignee'][];
  onAdd?: () => void;
}

export interface DateRangeProps {
  startDate?: string;
  endDate?: string;
  onStartChange?: (date: Date | undefined) => void;
  onEndChange?: (date: Date | undefined) => void;
}

// Activity Types
export type ActivityType = 'created' | 'updated' | 'estimated' | 'commented' | 'status_changed' | 'assigned' | 'attached';

export interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
    initials: string;
    color: string;
  };
  timestamp: Date;
  content?: string;
  metadata?: Record<string, unknown>;
  parentCommentId?: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
    color: string;
  };
  content: string;
  timestamp: Date;
  mentions?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}
