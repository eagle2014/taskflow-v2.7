/**
 * Phase 3 Integration Example
 *
 * This file demonstrates how to integrate the new Phase 3 components
 * (TaskTabs, SubtasksList, ActionItemsList) into TaskDetailDialog.tsx
 *
 * DO NOT import this file - it's for reference only!
 */

import { useState } from 'react';
import { WorkspaceTask, TaskFieldUpdate, Subtask, ActionItem } from '../types';
import { Dialog, DialogContent } from '../../ui/dialog';
import { TaskHeader } from '../components/TaskHeader';
import { TaskMetadata } from '../components/TaskMetadata';
import { TaskDescription } from '../components/TaskDescription';
import { AIPromptBar } from '../components/AIPromptBar';
import { TaskTabs } from '../components/TaskTabs';
import { useAutoSave } from '../hooks/useAutoSave';
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
  const [description, setDescription] = useState(task?.description || '');
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  // Phase 3: State for subtasks and action items
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(task?.actionItems || []);

  if (!task) return null;

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
    toast.info(`AI prompt received: "${prompt}"`);
    console.log('AI Prompt:', prompt);
    setShowAIPrompt(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Phase 3: Subtasks handlers
  const handleSubtasksChange = (newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, subtasks: newSubtasks });
    }
  };

  // Phase 3: Action items handlers
  const handleActionItemsChange = (newItems: ActionItem[]) => {
    setActionItems(newItems);
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, actionItems: newItems });
    }
  };

  // Helper to parse spent value
  const parseSpentValue = (spentStr: string): number => {
    if (!spentStr || spentStr === '-') return 0;
    return parseInt(spentStr.replace(/[$,]/g, '')) || 0;
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
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white overflow-hidden flex flex-col">
        {/* Header */}
        <TaskHeader task={task} onTitleChange={handleTitleChange} onClose={handleClose} />

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Metadata Grid */}
            <TaskMetadata task={task} onUpdate={handleFieldUpdate} />

            {/* Description Section */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <button
                  onClick={() => setShowAIPrompt(!showAIPrompt)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showAIPrompt ? 'Hide' : 'Show'} AI Assistant
                </button>
              </div>

              {/* AI Prompt Bar */}
              {showAIPrompt && (
                <AIPromptBar
                  onSubmit={handleAIPromptSubmit}
                  onClose={() => setShowAIPrompt(false)}
                />
              )}

              {/* Rich Text Editor */}
              <TaskDescription
                description={description}
                onChange={handleDescriptionChange}
                onAIAssist={() => setShowAIPrompt(true)}
              />
            </div>

            {/* Phase 3: Tabs Section */}
            <div className="px-6 py-6">
              <TaskTabs
                budget={task.budget}
                budgetRemaining={task.budgetRemaining}
                spent={parseSpentValue(task.sprint || '$0')}
                subtasks={subtasks}
                actionItems={actionItems}
                onSubtasksChange={handleSubtasksChange}
                onActionItemsChange={handleActionItemsChange}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="px-4 py-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity</h3>
              <div className="text-center text-gray-400 text-sm">
                <p className="mb-2">Activity sidebar coming in Phase 4:</p>
                <ul className="text-xs space-y-1">
                  <li>• Search activity</li>
                  <li>• Notifications</li>
                  <li>• Timeline</li>
                  <li>• Comment input</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the new components:
 *    - TaskTabs from './components/TaskTabs'
 *    - Subtask, ActionItem types from './types'
 *
 * 2. Add state for subtasks and action items (lines 24-25)
 *
 * 3. Add handlers for subtasks and action items (lines 60-72)
 *
 * 4. Replace the placeholder "Coming in Phase 3" section with TaskTabs (lines 121-130)
 *
 * 5. The component will automatically:
 *    - Render tab navigation
 *    - Handle tab switching
 *    - Show Details tab with custom fields
 *    - Show Subtasks tab with CRUD operations
 *    - Show Action Items tab with CRUD operations
 *    - Display badge counters
 *    - Track completion progress
 *
 * 6. All data changes will trigger onTaskUpdate callback
 *
 * 7. Local state (subtasks, actionItems) will sync with parent component
 */
