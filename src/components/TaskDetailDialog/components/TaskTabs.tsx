import { useState, useRef, useEffect, memo } from 'react';
import { TaskTab, Subtask, ActionItem, WorkspaceTask } from '../types';
import { SubtasksList } from './SubtasksList';
import { ActionItemsList } from './ActionItemsList';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { DollarSign, Clock, Percent, Edit2, Check, X, LucideIcon } from 'lucide-react';
import { tasksApi } from '@/services/api';
import { toast } from 'sonner';

// Editable field component - defined outside to prevent re-creation on each render
interface EditableFieldProps {
  field: string;
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  onSave: (field: string, value: number) => void;
}

const EditableField = memo(function EditableField({
  field,
  label,
  value,
  icon: Icon,
  prefix = '',
  suffix = '',
  onSave,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  // Track locally saved value to display while waiting for parent update
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when parent prop changes (API response came back)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Update editValue when localValue changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(localValue.toString());
    }
  }, [localValue, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setEditValue(localValue.toString());
    setIsEditing(true);
  };

  const saveEdit = () => {
    const numValue = parseFloat(editValue) || 0;
    // Update local value immediately so it displays the saved value
    setLocalValue(numValue);
    onSave(field, numValue);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(localValue.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#3d4457] group">
      <div className="flex items-center gap-2 text-[#838a9c]">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          {prefix && <span className="text-[#838a9c]">{prefix}</span>}
          <Input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-24 h-7 bg-[#2a2f3a] border-[#3d4457] text-white text-right text-sm"
          />
          {suffix && <span className="text-[#838a9c]">{suffix}</span>}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={saveEdit}
            className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancelEdit}
            className="p-1 hover:bg-red-500/20 rounded text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">
            {prefix}{localValue.toLocaleString()}{suffix}
          </span>
          <button
            onClick={startEdit}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#3d4457] rounded text-[#838a9c] hover:text-white transition-opacity"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

interface TaskTabsProps {
  task: WorkspaceTask;
  budget: number;
  spent: number;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  subtasks?: Subtask[];
  actionItems?: ActionItem[];
  onSubtasksChange?: (subtasks: Subtask[]) => void;
  onActionItemsChange?: (items: ActionItem[]) => void;
  onBudgetChange?: (budget: number) => void;
  onSpentChange?: (spent: number) => void;
  onEstimatedHoursChange?: (hours: number) => void;
  onActualHoursChange?: (hours: number) => void;
  onProgressChange?: (progress: number) => void;
}

export function TaskTabs({
  task,
  budget,
  spent,
  estimatedHours = 0,
  actualHours = 0,
  progress = 0,
  subtasks = [],
  actionItems = [],
  onSubtasksChange,
  onActionItemsChange,
  onBudgetChange,
  onSpentChange,
  onEstimatedHoursChange,
  onActualHoursChange,
  onProgressChange,
}: TaskTabsProps) {
  const [activeTab, setActiveTab] = useState<TaskTab>('details');

  // Track local values for immediate UI feedback
  const [localBudget, setLocalBudget] = useState(budget);
  const [localSpent, setLocalSpent] = useState(spent);

  // Sync with props when they change
  useEffect(() => {
    setLocalBudget(budget);
  }, [budget]);

  useEffect(() => {
    setLocalSpent(spent);
  }, [spent]);

  // Calculate budget remaining from local values
  const budgetRemaining = localBudget - localSpent;

  // Handle field save
  const handleFieldSave = (field: string, value: number) => {
    // Update local state immediately for responsive UI
    if (field === 'budget') {
      setLocalBudget(value);
    } else if (field === 'spent') {
      setLocalSpent(value);
    }

    switch (field) {
      case 'budget':
        onBudgetChange?.(value);
        break;
      case 'spent':
        onSpentChange?.(value);
        break;
      case 'estimatedHours':
        onEstimatedHoursChange?.(value);
        break;
      case 'actualHours':
        onActualHoursChange?.(value);
        break;
      case 'progress':
        onProgressChange?.(Math.min(100, Math.max(0, value)));
        break;
    }
  };

  const handleAddSubtask = async (name: string) => {
    if (!task.projectID) {
      toast.error('Task must belong to a project');
      return;
    }

    try {
      const newTask = await tasksApi.create({
        projectID: task.projectID,
        parentTaskID: task.id,
        title: name,
        status: 'To Do',
        priority: 'Medium',
      });

      const newSubtask: Subtask = {
        id: newTask.taskID,
        name: newTask.title,
        completed: false,
        status: 'todo',
      };
      onSubtasksChange?.([...subtasks, newSubtask]);
      toast.success('Subtask created');
    } catch (error) {
      console.error('Failed to create subtask:', error);
      toast.error('Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (id: string) => {
    const subtask = subtasks.find(st => st.id === id);
    if (!subtask) return;

    try {
      const newStatus = subtask.completed ? 'To Do' : 'Done';
      await tasksApi.update(id, { status: newStatus });

      const updated = subtasks.map((st) =>
        st.id === id
          ? { ...st, completed: !st.completed, status: (st.completed ? 'todo' : 'done') as 'todo' | 'done' }
          : st
      );
      onSubtasksChange?.(updated);
      toast.success('Subtask updated');
    } catch (error) {
      console.error('Failed to update subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      onSubtasksChange?.(subtasks.filter((st) => st.id !== id));
      toast.success('Subtask deleted');
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
    }
  };

  const handleAddActionItem = (name: string) => {
    const newItem: ActionItem = {
      id: `action-${Date.now()}`,
      name,
      completed: false,
    };
    onActionItemsChange?.([...actionItems, newItem]);
  };

  const handleToggleActionItem = (id: string) => {
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onActionItemsChange?.(updated);
  };

  const handleDeleteActionItem = (id: string) => {
    onActionItemsChange?.(actionItems.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-[#3d4457]">
        <nav className="flex gap-6" aria-label="Task tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-[#8b5cf6] text-white'
                : 'border-transparent text-[#838a9c] hover:text-white'
            }`}
            aria-current={activeTab === 'details' ? 'page' : undefined}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('subtasks')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'subtasks'
                ? 'border-[#8b5cf6] text-white'
                : 'border-transparent text-[#838a9c] hover:text-white'
            }`}
            aria-current={activeTab === 'subtasks' ? 'page' : undefined}
          >
            Subtasks
            {subtasks.length > 0 && (
              <Badge className="bg-[#8b5cf6] text-white border-none px-1.5 py-0 h-5 text-xs">
                {subtasks.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('action-items')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'action-items'
                ? 'border-[#8b5cf6] text-white'
                : 'border-transparent text-[#838a9c] hover:text-white'
            }`}
            aria-current={activeTab === 'action-items' ? 'page' : undefined}
          >
            Action Items
            {actionItems.length > 0 && (
              <Badge className="bg-[#8b5cf6] text-white border-none px-1.5 py-0 h-5 text-xs">
                {actionItems.length}
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto py-6">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Custom Fields</h3>

            <div className="space-y-1">
              {/* Budget - Editable */}
              <EditableField
                field="budget"
                label="Budget"
                value={budget}
                icon={DollarSign}
                prefix="$"
                onSave={handleFieldSave}
              />

              {/* Budget Remaining - Calculated, read-only */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Budget Remaining</span>
                </div>
                <div className={`font-semibold ${budgetRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${budgetRemaining.toLocaleString()}
                </div>
              </div>

              {/* Spent - Editable */}
              <EditableField
                field="spent"
                label="Spent"
                value={spent}
                icon={DollarSign}
                prefix="$"
                onSave={handleFieldSave}
              />

              {/* Estimated Hours - Editable */}
              <EditableField
                field="estimatedHours"
                label="Estimated Hours"
                value={estimatedHours}
                icon={Clock}
                suffix="h"
                onSave={handleFieldSave}
              />

              {/* Actual Hours - Editable */}
              <EditableField
                field="actualHours"
                label="Actual Hours"
                value={actualHours}
                icon={Clock}
                suffix="h"
                onSave={handleFieldSave}
              />

              {/* Progress - Editable */}
              <EditableField
                field="progress"
                label="Progress"
                value={progress}
                icon={Percent}
                suffix="%"
                onSave={handleFieldSave}
              />
            </div>
          </div>
        )}

        {activeTab === 'subtasks' && (
          <SubtasksList
            subtasks={subtasks}
            onAdd={handleAddSubtask}
            onToggle={handleToggleSubtask}
            onDelete={handleDeleteSubtask}
          />
        )}

        {activeTab === 'action-items' && (
          <ActionItemsList
            items={actionItems}
            onAdd={handleAddActionItem}
            onToggle={handleToggleActionItem}
            onDelete={handleDeleteActionItem}
          />
        )}
      </div>
    </div>
  );
}