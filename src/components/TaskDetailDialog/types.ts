// TaskDetailDialog Types

// Tab Type
export type TaskTab = 'details' | 'subtasks' | 'action-items';

// Subtask Type
export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  status: 'todo' | 'in-progress' | 'done';
}

// Action Item Type
export interface ActionItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface WorkspaceTask {
  id: string;
  name: string;
  description?: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
    color: string;
  } | null;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  status: 'todo' | 'in-progress' | 'ready' | 'done' | 'in-review' | 'completed' | 'new';
  budget: number;
  sprint: string;
  budgetRemaining: number;
  comments?: number;
  subtasks?: Subtask[];
  actionItems?: ActionItem[];
  parentId?: string;
  phase?: string;
  phaseID?: string;
  projectID?: string;
  impact?: 'low' | 'medium' | 'high';
  files?: number;
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
}

// Discriminated union for type-safe field updates
export type TaskFieldUpdate =
  | { field: 'status'; value: WorkspaceTask['status'] }
  | { field: 'assignee'; value: WorkspaceTask['assignee'] }
  | { field: 'startDate' | 'endDate' | 'dueDate'; value: string | undefined }
  | { field: 'name'; value: string }
  | { field: 'description'; value: string }
  | { field: 'budget' | 'budgetRemaining'; value: number };

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
  content: string;
  metadata?: Record<string, unknown>;
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
