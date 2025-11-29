import { useState } from 'react';
import { TaskTab, Subtask, ActionItem } from '../types';
import { SubtasksList } from './SubtasksList';
import { ActionItemsList } from './ActionItemsList';
import { Badge } from '../../ui/badge';
import { DollarSign, CheckCircle2 } from 'lucide-react';

interface TaskTabsProps {
  budget: number;
  budgetRemaining: number;
  spent: number;
  subtasks?: Subtask[];
  actionItems?: ActionItem[];
  onSubtasksChange?: (subtasks: Subtask[]) => void;
  onActionItemsChange?: (items: ActionItem[]) => void;
}

export function TaskTabs({
  budget,
  budgetRemaining,
  spent,
  subtasks = [],
  actionItems = [],
  onSubtasksChange,
  onActionItemsChange,
}: TaskTabsProps) {
  const [activeTab, setActiveTab] = useState<TaskTab>('details');

  const handleAddSubtask = (name: string) => {
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      name,
      completed: false,
      status: 'todo',
    };
    onSubtasksChange?.([...subtasks, newSubtask]);
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id
        ? { ...st, completed: !st.completed, status: (st.completed ? 'todo' : 'done') as const }
        : st
    );
    onSubtasksChange?.(updated);
  };

  const handleDeleteSubtask = (id: string) => {
    onSubtasksChange?.(subtasks.filter((st) => st.id !== id));
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

            <div className="space-y-3">
              {/* Budget */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Budget</span>
                </div>
                <div className="text-white font-semibold">${budget.toLocaleString()}</div>
              </div>

              {/* Budget Remaining */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Budget Remaining</span>
                </div>
                <div className="text-white font-semibold">${budgetRemaining.toLocaleString()}</div>
              </div>

              {/* Review */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Review</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Done
                </Badge>
              </div>

              {/* Revision */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Revision</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Done
                </Badge>
              </div>

              {/* Spent */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d4457]">
                <div className="flex items-center gap-2 text-[#838a9c]">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Spent</span>
                </div>
                <div className="text-white font-semibold">${spent.toLocaleString()}</div>
              </div>
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
