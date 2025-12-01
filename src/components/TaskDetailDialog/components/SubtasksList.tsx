import { useState } from 'react';
import { Subtask } from '../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Circle, User, Calendar, Plus, MoreHorizontal, ArrowUpDown, Maximize2, Sparkles, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface SubtasksListProps {
  subtasks: Subtask[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortOption = 'default' | 'name' | 'status' | 'dueDate';

export function SubtasksList({ subtasks, onAdd, onToggle, onDelete }: SubtasksListProps) {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = () => {
    if (newSubtaskName.trim()) {
      onAdd(newSubtaskName.trim());
      setNewSubtaskName('');
    }
  };

  const handleCancel = () => {
    setNewSubtaskName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const progressPercent = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  // Sort subtasks based on selected option
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
      case 'dueDate':
        return 0;
      default:
        return 0;
    }
  });

  const handleSuggestSubtasks = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const suggestions = [
        'Research competitors',
        'Analyze market trends',
        'Create action plan'
      ];
      suggestions.forEach(suggestion => onAdd(suggestion));
      setIsGenerating(false);
    }, 1500);
  };

  // Fullscreen mode - expand to fill entire dialog (absolute positioning)
  if (isExpanded) {
    return (
      <div className="absolute inset-0 top-[60px] bg-[#1f2330] z-50 flex flex-col p-6">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#3d4457]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 gap-2 text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to task
            </Button>
            <h2 className="text-lg font-semibold text-white">Subtasks</h2>
            {subtasks.length > 0 && (
              <>
                <div className="w-24 h-2 bg-[#3d4457] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8b5cf6] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm text-[#838a9c]">{completedCount}/{subtasks.length}</span>
              </>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] text-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1e2028] border-[#3d4457]">
                <DropdownMenuItem
                  onClick={() => setSortBy('default')}
                  className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
                >
                  Default Order
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('name')}
                  className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
                >
                  Sort by Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy('status')}
                  className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
                >
                  Sort by Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSuggestSubtasks}
              disabled={isGenerating}
              className="h-8 gap-1.5 text-[#8b5cf6] hover:text-white hover:bg-[#3d4457] text-xs disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse' : ''}`} />
              Suggest subtasks
            </Button>
          </div>
        </div>

        {/* Fullscreen Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#3d4457]">
                <th className="text-left text-xs font-medium text-[#838a9c] uppercase tracking-wider py-3 px-2">Name</th>
                <th className="text-center text-xs font-medium text-[#838a9c] uppercase tracking-wider py-3 w-32">Assignee</th>
                <th className="text-center text-xs font-medium text-[#838a9c] uppercase tracking-wider py-3 w-32">Due date</th>
                <th className="text-center py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sortedSubtasks.map((subtask) => (
                <tr key={subtask.id} className="group hover:bg-[#292d39] transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggle(subtask.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          subtask.completed
                            ? 'bg-[#10b981] border-[#10b981]'
                            : 'border-[#838a9c] hover:border-[#8b5cf6]'
                        }`}
                      >
                        {subtask.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm ${subtask.completed ? 'line-through text-[#838a9c]' : 'text-white'}`}>
                        {subtask.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                      <User className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => onDelete(subtask.id)}
                      className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Add new subtask row */}
              <tr className="hover:bg-[#292d39] transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-[#838a9c] flex-shrink-0" />
                    <Input
                      value={newSubtaskName}
                      onChange={(e) => setNewSubtaskName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsAdding(true)}
                      placeholder="Task Name or type '/' for commands"
                      className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-[#838a9c] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    />
                  </div>
                </td>
                <td className="py-4 text-center">
                  <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                    <User className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-4 text-center">
                  <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-4 text-center">
                  {isAdding && newSubtaskName.trim() ? (
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        onClick={handleCancel}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[#838a9c] hover:text-white text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        size="sm"
                        className="h-7 px-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs"
                      >
                        Save ↵
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="space-y-2">
      {/* Header with progress */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">Subtasks</h3>
        {subtasks.length > 0 && (
          <>
            <div className="w-20 h-1.5 bg-[#3d4457] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8b5cf6] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm text-[#838a9c]">{completedCount}/{subtasks.length}</span>
          </>
        )}
      </div>

      {/* Toolbar with Sort, Expand, and Suggest buttons */}
      <div className="flex items-center justify-end gap-2 mb-3">
        {/* Sort Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] text-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1e2028] border-[#3d4457]">
            <DropdownMenuItem
              onClick={() => setSortBy('default')}
              className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
            >
              Default Order
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy('name')}
              className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
            >
              Sort by Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy('status')}
              className="text-[#838a9c] hover:text-white hover:bg-[#3d4457] cursor-pointer"
            >
              Sort by Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>

        {/* Suggest Subtasks Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSuggestSubtasks}
          disabled={isGenerating}
          className="h-8 gap-1.5 text-[#8b5cf6] hover:text-white hover:bg-[#3d4457] text-xs disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse' : ''}`} />
          Suggest subtasks
        </Button>
      </div>

      {/* Table */}
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-[#3d4457]">
            <th className="text-left text-xs font-medium text-[#838a9c] uppercase tracking-wider py-2 px-2">Name</th>
            <th className="text-center text-xs font-medium text-[#838a9c] uppercase tracking-wider py-2 w-24">Assignee</th>
            <th className="text-center text-xs font-medium text-[#838a9c] uppercase tracking-wider py-2 w-24">Due date</th>
            <th className="text-center py-2 w-10">
              <Plus className="w-4 h-4 text-[#838a9c] mx-auto" />
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedSubtasks.map((subtask) => (
            <tr key={subtask.id} className="group hover:bg-[#292d39] transition-colors">
              {/* Status + Name */}
              <td className="py-3 px-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggle(subtask.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      subtask.completed
                        ? 'bg-[#10b981] border-[#10b981]'
                        : 'border-[#838a9c] hover:border-[#8b5cf6]'
                    }`}
                  >
                    {subtask.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm ${subtask.completed ? 'line-through text-[#838a9c]' : 'text-white'}`}>
                    {subtask.name}
                  </span>
                </div>
              </td>

              {/* Assignee */}
              <td className="py-3 text-center">
                <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </td>

              {/* Due Date */}
              <td className="py-3 text-center">
                <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                  <Calendar className="w-4 h-4" />
                </button>
              </td>

              {/* Actions */}
              <td className="py-3 text-center">
                <button
                  onClick={() => onDelete(subtask.id)}
                  className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}

          {/* Add new subtask row */}
          <tr className="hover:bg-[#292d39] transition-colors">
            <td className="py-3 px-2">
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-[#838a9c] flex-shrink-0" />
                <Input
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsAdding(true)}
                  placeholder="Task Name or type '/' for commands"
                  className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-[#838a9c] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>
            </td>

            <td className="py-3 text-center">
              <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                <User className="w-4 h-4" />
              </button>
            </td>

            <td className="py-3 text-center">
              <button className="inline-flex items-center justify-center text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded p-1.5 transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
            </td>

            <td className="py-3 text-center">
              {isAdding && newSubtaskName.trim() ? (
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[#838a9c] hover:text-white text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    size="sm"
                    className="h-7 px-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs"
                  >
                    Save ↵
                  </Button>
                </div>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary footer */}
      {subtasks.length > 0 && (
        <div className="text-sm text-[#838a9c] pt-4">
          {completedCount} of {subtasks.length} completed
        </div>
      )}
    </div>
  );
}
