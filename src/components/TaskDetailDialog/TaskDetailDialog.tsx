import { useState, useCallback, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { WorkspaceTask, TaskFieldUpdate, Subtask, ActionItem, Activity } from './types';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { TaskHeader } from './components/TaskHeader';
import { TaskMetadata } from './components/TaskMetadata';
import { TaskDescription } from './components/TaskDescription';
import { AIPromptBar } from './components/AIPromptBar';
import { TaskTabs } from './components/TaskTabs';
import { ActivityHeader } from './components/ActivityHeader';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CommentInput, ReplyContext } from './components/CommentInput';
import { SidebarActions } from './components/SidebarActions';
import { SubtasksList } from './components/SubtasksList';
import { useAutoSave } from './hooks/useAutoSave';
import { toast } from 'sonner';
import { commentsApi, usersApi, User, authApi, tasksApi } from '@/services/api';

// Resize handle directions
type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

// LocalStorage key for persisting dialog size
const DIALOG_SIZE_STORAGE_KEY = 'taskflow-dialog-size';
const SIDEBAR_WIDTH_STORAGE_KEY = 'taskflow-sidebar-width';

// Default dialog size
const DEFAULT_DIALOG_SIZE = { width: 1200, height: 750 };
const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 250;
const MAX_SIDEBAR_WIDTH = 600;

// Load saved size from localStorage
const loadSavedDialogSize = (): { width: number; height: number } => {
  try {
    const saved = localStorage.getItem(DIALOG_SIZE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.width === 'number' && typeof parsed.height === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load dialog size from localStorage:', e);
  }
  return DEFAULT_DIALOG_SIZE;
};

// Save size to localStorage
const saveDialogSize = (size: { width: number; height: number }) => {
  try {
    localStorage.setItem(DIALOG_SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch (e) {
    console.warn('Failed to save dialog size to localStorage:', e);
  }
};

// Load saved sidebar width from localStorage
const loadSavedSidebarWidth = (): number => {
  try {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load sidebar width from localStorage:', e);
  }
  return DEFAULT_SIDEBAR_WIDTH;
};

// Save sidebar width to localStorage
const saveSidebarWidth = (width: number) => {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, JSON.stringify(width));
  } catch (e) {
    console.warn('Failed to save sidebar width to localStorage:', e);
  }
};

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WorkspaceTask | null;
  onTaskUpdate?: (task: WorkspaceTask) => void;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  onTaskUpdate,
}: TaskDetailDialogProps) {

  // All hooks MUST be called unconditionally at top level - use empty defaults for null task
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [usersCache, setUsersCache] = useState<Map<string, User>>(new Map());
  const loadedTaskIdRef = useRef<string | null>(null);

  // Reply state
  const [replyTo, setReplyTo] = useState<ReplyContext | null>(null);

  // Subtasks expanded state
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  // Dialog size and position state - load from localStorage
  const [dialogSize, setDialogSize] = useState(loadSavedDialogSize);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; direction: ResizeDirection } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(loadSavedSidebarWidth);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  // Drag state - null means auto-centered
  const [dialogPosition, setDialogPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Constants
  const PADDING = 30;
  const MIN_WIDTH = 700;
  const MIN_HEIGHT = 400;

  // Calculate constrained size and position to always fit viewport
  const getConstrainedValues = useCallback(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Constrain dialog size to fit viewport with padding
    const maxAllowedW = viewportW - (PADDING * 2);
    const maxAllowedH = viewportH - (PADDING * 2);

    const constrainedW = Math.min(dialogSize.width, maxAllowedW);
    const constrainedH = Math.min(dialogSize.height, maxAllowedH);

    // Calculate centered position
    const centerX = (viewportW - constrainedW) / 2;
    const centerY = (viewportH - constrainedH) / 2;

    return {
      width: Math.max(MIN_WIDTH, constrainedW),
      height: Math.max(MIN_HEIGHT, constrainedH),
      x: Math.max(PADDING, centerX),
      y: Math.max(PADDING, centerY),
    };
  }, [dialogSize.width, dialogSize.height]);

  // Get final display values
  const displayValues = getConstrainedValues();
  const currentPosition = dialogPosition || { x: displayValues.x, y: displayValues.y };

  // Handle drag mouse down (on header)
  const handleDragMouseDown = (e: ReactMouseEvent) => {
    // Don't start drag if clicking on buttons or inputs
    if ((e.target as HTMLElement).closest('button, input, [role="button"]')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    const pos = dialogPosition || { x: displayValues.x, y: displayValues.y };
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
  };

  // Handle resize mouse down
  const handleResizeMouseDown = (e: ReactMouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dialogSize.width,
      startHeight: dialogSize.height,
      direction,
    };
  };

  // Handle sidebar resize mouse down
  const handleSidebarResizeMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarResizing(true);
    sidebarResizeRef.current = {
      startX: e.clientX,
      startWidth: sidebarWidth,
    };
  };

  // Handle resize mouse move & up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      const { startX, startY, startWidth, startHeight, direction } = resizeRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calculate new dimensions based on direction
      if (direction.includes('e')) newWidth = startWidth + deltaX;
      if (direction.includes('w')) newWidth = startWidth - deltaX;
      if (direction.includes('s')) newHeight = startHeight + deltaY;
      if (direction.includes('n')) newHeight = startHeight - deltaY;

      // Apply min/max constraints (max based on viewport)
      const maxW = window.innerWidth - (PADDING * 2);
      const maxH = window.innerHeight - (PADDING * 2);
      newWidth = Math.max(MIN_WIDTH, Math.min(maxW, newWidth));
      newHeight = Math.max(MIN_HEIGHT, Math.min(maxH, newHeight));

      setDialogSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      // Save current size to localStorage when resize ends
      setDialogSize(currentSize => {
        saveDialogSize(currentSize);
        return currentSize;
      });
      setIsResizing(false);
      resizeRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Handle drag mouse move & up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;

      const { startX, startY, startPosX, startPosY } = dragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Calculate new position with boundary constraints
      let newX = startPosX + deltaX;
      let newY = startPosY + deltaY;

      // Keep dialog within viewport bounds (at least 100px visible)
      const minVisibleArea = 100;
      newX = Math.max(-dialogSize.width + minVisibleArea, Math.min(window.innerWidth - minVisibleArea, newX));
      newY = Math.max(0, Math.min(window.innerHeight - minVisibleArea, newY));

      setDialogPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!isResizing) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging, dialogSize.width, isResizing]);

  // Handle sidebar resize mouse move & up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSidebarResizing || !sidebarResizeRef.current) return;

      const { startX, startWidth } = sidebarResizeRef.current;
      // Dragging left increases sidebar width, dragging right decreases it
      const deltaX = startX - e.clientX;
      let newWidth = startWidth + deltaX;

      // Apply min/max constraints
      newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      // Save current sidebar width to localStorage when resize ends
      setSidebarWidth(currentWidth => {
        saveSidebarWidth(currentWidth);
        return currentWidth;
      });
      setIsSidebarResizing(false);
      sidebarResizeRef.current = null;
    };

    if (isSidebarResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!isResizing && !isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isSidebarResizing, isResizing, isDragging]);

  // Reset dialog position when dialog opens to ensure it's centered
  useEffect(() => {
    if (open) {
      // Reset to centered position when dialog opens
      setDialogPosition(null);
    }
  }, [open]);

  // Load comments from API when dialog opens with a task
  useEffect(() => {
    const loadComments = async () => {
      if (!open || !task?.id || loadedTaskIdRef.current === task.id) return;

      try {
        // Load comments for this task
        const comments = await commentsApi.getByTask(task.id);

        // Load users for comment authors (if not already cached)
        const userIdsToLoad = comments
          .map(c => c.userID)
          .filter(id => !usersCache.has(id));

        const uniqueUserIds = [...new Set(userIdsToLoad)];
        const newUsersCache = new Map(usersCache);

        for (const userId of uniqueUserIds) {
          try {
            const user = await usersApi.getById(userId);
            newUsersCache.set(userId, user);
          } catch {
            // User not found, use placeholder
          }
        }

        if (uniqueUserIds.length > 0) {
          setUsersCache(newUsersCache);
        }

        // Convert API comments to Activity format
        const commentActivities: Activity[] = comments.map(comment => {
          const user = newUsersCache.get(comment.userID);
          return {
            id: comment.commentID,
            type: 'commented' as const,
            user: {
              name: user?.name || 'Unknown User',
              avatar: user?.avatar || '',
              initials: user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
              color: '#0ea5e9',
            },
            timestamp: new Date(comment.createdAt),
            content: comment.content,
            parentCommentId: comment.parentCommentID, // Map parent comment ID for replies
          };
        });

        setActivities(commentActivities);
        loadedTaskIdRef.current = task.id;
      } catch (error) {
        console.error('Failed to load comments:', error);
        // Don't show error toast - comments might just not exist yet
      }
    };

    loadComments();
  }, [open, task?.id]);

  // Load subtasks from API when dialog opens with a task
  useEffect(() => {
    const loadSubtasks = async () => {
      if (!open || !task?.id) return;

      try {
        // Load subtasks from API
        const apiSubtasks = await tasksApi.getByParentTask(task.id);

        // Convert API Task[] to Subtask[] format
        const subtasksList: Subtask[] = apiSubtasks.map(apiTask => ({
          id: apiTask.taskID,
          name: apiTask.title,
          completed: apiTask.status === 'Done',
          status: apiTask.status === 'Done' ? 'done' : 'todo',
          assigneeID: apiTask.assigneeID,
          dueDate: apiTask.dueDate,
        }));

        setSubtasks(subtasksList);
      } catch (error) {
        console.error('Failed to load subtasks:', error);
        // Don't show error toast - subtasks might just not exist yet
      }
    };

    loadSubtasks();
  }, [open, task?.id]);

  // Memoized callback for auto-save - safe with null task
  const handleDescriptionSave = useCallback((value: string) => {
    if (task && onTaskUpdate && value !== task.description) {
      onTaskUpdate({ ...task, description: value });
      toast.success('Description saved');
    }
  }, [onTaskUpdate, task]);

  // Auto-save description with 1 second debounce
  useAutoSave(description, {
    delay: 1000,
    onSave: handleDescriptionSave,
  });

  // Return null if no task - AFTER all hooks
  if (!task) {
    return null;
  }

  // Helper functions - task is guaranteed non-null below this point
  const handleTitleChange = (newTitle: string) => {
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, name: newTitle });
    }
    toast.success('Task title updated');
  };

  const handleFieldUpdate = (update: TaskFieldUpdate) => {
    console.log('🔵 handleFieldUpdate called:', update.field, '=', update.value);
    console.log('🔵 onTaskUpdate exists:', !!onTaskUpdate);
    if (onTaskUpdate) {
      const updatedTask = { ...task, [update.field]: update.value };
      console.log('🔵 Calling onTaskUpdate with:', updatedTask);
      onTaskUpdate(updatedTask);
    }
    toast.success(`${update.field} updated`);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handleAIPromptSubmit = async (prompt: string) => {
    toast.info(`AI prompt received: "${prompt}"`);
    console.log('AI Prompt:', prompt);
  };

  const handleCommentSubmit = async (content: string, parentCommentId?: string) => {
    // Get current user from authApi
    const currentUser = authApi.getStoredUser();

    // Optimistically add comment to UI
    const tempId = crypto.randomUUID();
    const newActivity: Activity = {
      id: tempId,
      type: 'commented',
      user: {
        name: currentUser?.name || task.assignee?.name || 'You',
        avatar: currentUser?.avatar || task.assignee?.avatar || '',
        initials: currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || task.assignee?.initials || 'Y',
        color: task.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(),
      content,
      parentCommentId,
    };
    setActivities(prev => [...prev, newActivity]);

    try {
      // Send comment to API
      const createdComment = await commentsApi.create({
        taskID: task.id,
        content,
        parentCommentID: parentCommentId,
      });

      // Update activity with real ID from server
      setActivities(prev => prev.map(a =>
        a.id === tempId ? { ...a, id: createdComment.commentID } : a
      ));

      toast.success(parentCommentId ? 'Reply added' : 'Comment added');
    } catch (error) {
      console.error('Failed to create comment:', error);
      // Remove optimistic update on failure
      setActivities(prev => prev.filter(a => a.id !== tempId));
      toast.error('Failed to add comment. Please try again.');
    }
  };

  // Handle reply to a comment
  const handleReply = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && activity.type === 'commented') {
      setReplyTo({
        commentId: activity.id,
        userName: activity.user.name,
        content: activity.content || '',
        userInitials: activity.user.initials,
        userColor: activity.user.color,
        timestamp: activity.timestamp,
      });
    }
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Resize handle styles
  const resizeHandleBase = "absolute bg-transparent z-50 hover:bg-[#8b5cf6]/30 transition-colors";
  const resizeHandles: { direction: ResizeDirection; className: string; cursor: string }[] = [
    { direction: 'n', className: `${resizeHandleBase} top-0 left-2 right-2 h-1 cursor-ns-resize`, cursor: 'ns-resize' },
    { direction: 's', className: `${resizeHandleBase} bottom-0 left-2 right-2 h-1 cursor-ns-resize`, cursor: 'ns-resize' },
    { direction: 'e', className: `${resizeHandleBase} top-2 bottom-2 right-0 w-1 cursor-ew-resize`, cursor: 'ew-resize' },
    { direction: 'w', className: `${resizeHandleBase} top-2 bottom-2 left-0 w-1 cursor-ew-resize`, cursor: 'ew-resize' },
    { direction: 'ne', className: `${resizeHandleBase} top-0 right-0 w-3 h-3 cursor-nesw-resize rounded-tr-lg`, cursor: 'nesw-resize' },
    { direction: 'nw', className: `${resizeHandleBase} top-0 left-0 w-3 h-3 cursor-nwse-resize rounded-tl-lg`, cursor: 'nwse-resize' },
    { direction: 'se', className: `${resizeHandleBase} bottom-0 right-0 w-3 h-3 cursor-nwse-resize rounded-br-lg`, cursor: 'nwse-resize' },
    { direction: 'sw', className: `${resizeHandleBase} bottom-0 left-0 w-3 h-3 cursor-nesw-resize rounded-bl-lg`, cursor: 'nesw-resize' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        customPosition={true}
        className="!p-0 bg-[#1f2330] border border-[#3d4457] overflow-hidden flex flex-col rounded-lg shadow-2xl fixed"
        style={{
          width: `${displayValues.width}px`,
          height: `${displayValues.height}px`,
          maxWidth: 'none',
          minWidth: `${MIN_WIDTH}px`,
          minHeight: `${MIN_HEIGHT}px`,
          top: `${currentPosition.y}px`,
          left: `${currentPosition.x}px`,
        }}
        aria-describedby={undefined}
        showClose={false}
      >
        {/* Resize Handles */}
        {resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            className={className}
            onMouseDown={(e) => handleResizeMouseDown(e, direction)}
          />
        ))}

        <DialogTitle className="sr-only">{task.name}</DialogTitle>
        {/* Header - Draggable */}
        <TaskHeader
          task={task}
          onTitleChange={handleTitleChange}
          onClose={handleClose}
          onDragStart={handleDragMouseDown}
        />

        {/* Main Layout - Two Column */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* AI Prompt Bar */}
            <AIPromptBar
              onSubmit={handleAIPromptSubmit}
              onClose={() => {}}
            />

            {/* Metadata Grid */}
            <TaskMetadata task={task} onUpdate={handleFieldUpdate} />

            {/* Description Section */}
            <div className="mt-6">
              <TaskDescription
                description={description || task.description || ''}
                onChange={handleDescriptionChange}
                onAIAssist={() => {}}
              />
            </div>

            {/* Phase 3: Tabs Section */}
            <div className="mt-6">
              <TaskTabs
                task={task}
                budget={task.budget || 0}
                spent={task.spent || 0}
                estimatedHours={task.estimatedHours || 0}
                actualHours={task.actualHours || 0}
                progress={task.progress || 0}
                subtasks={subtasks.length > 0 ? subtasks : (task.subtasks as Subtask[] | undefined) || []}
                actionItems={actionItems.length > 0 ? actionItems : (task.actionItems as ActionItem[] | undefined) || []}
                onBudgetChange={(value) => {
                  handleFieldUpdate({ field: 'budget', value });
                }}
                onSpentChange={(value) => {
                  handleFieldUpdate({ field: 'spent', value });
                }}
                onEstimatedHoursChange={(value) => {
                  handleFieldUpdate({ field: 'estimatedHours', value });
                }}
                onActualHoursChange={(value) => {
                  handleFieldUpdate({ field: 'actualHours', value });
                }}
                onProgressChange={(value) => {
                  handleFieldUpdate({ field: 'progress', value });
                }}
                onSubtasksChange={(newSubtasks) => {
                  setSubtasks(newSubtasks);
                  if (onTaskUpdate) {
                    onTaskUpdate({ ...task, subtasks: newSubtasks });
                  }
                }}
                onActionItemsChange={(newItems) => {
                  setActionItems(newItems);
                  if (onTaskUpdate) {
                    onTaskUpdate({ ...task, actionItems: newItems });
                  }
                }}
              />
            </div>
          </div>

          {/* Sidebar Resize Handle */}
          <div
            className={`w-1 bg-[#3d4457] hover:bg-[#8b5cf6] cursor-ew-resize transition-colors flex-shrink-0 ${
              isSidebarResizing ? 'bg-[#8b5cf6]' : ''
            }`}
            onMouseDown={handleSidebarResizeMouseDown}
            title="Drag to resize"
          />

          {/* Right Sidebar - Phase 4: Activity */}
          <div
            className="border-l border-[#3d4457] bg-[#1f2330] flex flex-col flex-shrink-0"
            style={{ width: `${sidebarWidth}px` }}
          >
            <ActivityHeader
              createdDate={task.startDate || task.dueDate}
              notificationCount={activities.filter(a => a.type === 'commented').length}
            />
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ActivityTimeline activities={activities} onReply={handleReply} />
            </div>
            <CommentInput
              onSubmit={handleCommentSubmit}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
            />
          </div>

          {/* Far Right Action Icons */}
          <SidebarActions
            activeTab="activity"
            onTabChange={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
