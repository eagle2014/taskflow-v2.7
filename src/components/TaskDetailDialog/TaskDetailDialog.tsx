import { useState } from 'react';
import { WorkspaceTask, TaskFieldUpdate, Subtask, ActionItem, Activity } from './types';
import { Dialog, DialogContent } from '../ui/dialog';
import { TaskHeader } from './components/TaskHeader';
import { TaskMetadata } from './components/TaskMetadata';
import { TaskDescription } from './components/TaskDescription';
import { AIPromptBar } from './components/AIPromptBar';
import { TaskTabs } from './components/TaskTabs';
import { ActivityHeader } from './components/ActivityHeader';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CommentInput } from './components/CommentInput';
import { useAutoSave } from './hooks/useAutoSave';
import { toast } from 'sonner';

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
  // Early return MUST come before any hooks
  if (!task) return null;

  const [description, setDescription] = useState(task.description || '');
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(task.actionItems || []);
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'created',
      user: {
        name: task.assignee?.name || 'You',
        avatar: task.assignee?.avatar || '',
        initials: task.assignee?.initials || 'Y',
        color: task.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      content: 'created this task',
    },
    {
      id: '2',
      type: 'estimated',
      user: {
        name: task.assignee?.name || 'You',
        avatar: task.assignee?.avatar || '',
        initials: task.assignee?.initials || 'Y',
        color: task.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      content: 'estimated 8 weeks',
    },
  ]);

  // Helper to parse spent value from sprint string (e.g., "$44,800" -> 24800)
  const parseSpentValue = (sprintStr: string): number => {
    const match = sprintStr.match(/\$?([\d,]+)/);
    if (match) {
      // Calculate spent from budget (ignore parsed value, use actual calculation)
      return task.budget - task.budgetRemaining;
    }
    return 0;
  };

  const handleTitleChange = (newTitle: string) => {
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, name: newTitle });
    }
    toast.success('Task title updated');
  };

  const handleFieldUpdate = (update: TaskFieldUpdate) => {
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, [update.field]: update.value });
    }
    toast.success(`${update.field} updated`);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
  };

  const handleAIPromptSubmit = async (prompt: string) => {
    // Placeholder for AI integration
    toast.info(`AI prompt received: "${prompt}"`);
    console.log('AI Prompt:', prompt);
    // TODO: Integrate with AI service in Phase 5
    setShowAIPrompt(false);
  };

  const handleCommentSubmit = (content: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      type: 'commented',
      user: {
        name: task.assignee?.name || 'You',
        avatar: task.assignee?.avatar || '',
        initials: task.assignee?.initials || 'Y',
        color: task.assignee?.color || '#0ea5e9',
      },
      timestamp: new Date(),
      content,
    };
    setActivities([...activities, newActivity]);
    toast.success('Comment added');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Auto-save description with 1 second debounce
  useAutoSave(description, {
    delay: 1000,
    onSave: (value) => {
      if (onTaskUpdate && value !== task.description) {
        onTaskUpdate({ ...task, description: value });
        toast.success('Description saved');
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[calc(100vw-100px)] !w-[80vw] h-[calc(100vh-100px)] p-0 bg-[#1f2330] border-2 border-[#3d4457] overflow-hidden flex flex-col">
        {/* Header */}
        <TaskHeader task={task} onTitleChange={handleTitleChange} onClose={handleClose} />

        {/* Main Layout - Two Column */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* AI Prompt Bar */}
            <AIPromptBar
              onSubmit={handleAIPromptSubmit}
              onClose={() => setShowAIPrompt(false)}
            />

            {/* Metadata Grid */}
            <TaskMetadata task={task} onUpdate={handleFieldUpdate} />

            {/* Description Section */}
            <div className="mt-6">
              <TaskDescription
                description={description}
                onChange={handleDescriptionChange}
                onAIAssist={() => setShowAIPrompt(true)}
              />
            </div>

            {/* Phase 3: Tabs Section */}
            <div className="mt-6">
              <TaskTabs
                budget={task.budget}
                budgetRemaining={task.budgetRemaining}
                spent={parseSpentValue(task.sprint || '$0')}
                subtasks={subtasks}
                actionItems={actionItems}
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

          {/* Right Sidebar - Phase 4: Activity */}
          <div className="w-80 border-l border-[#3d4457] bg-[#1f2330] flex flex-col">
            <ActivityHeader />
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ActivityTimeline activities={activities} />
            </div>
            <CommentInput onSubmit={handleCommentSubmit} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
