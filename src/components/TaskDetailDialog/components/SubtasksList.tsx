import { useState } from 'react';
import { Subtask } from '../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface SubtasksListProps {
  subtasks: Subtask[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubtasksList({ subtasks, onAdd, onToggle, onDelete }: SubtasksListProps) {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskName.trim()) {
      onAdd(newSubtaskName.trim());
      setNewSubtaskName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewSubtaskName('');
    setIsAdding(false);
  };

  const getStatusBadge = (status: Subtask['status']) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Done</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">To Do</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
        {!isAdding && (
          <Button
            onClick={handleAddClick}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add subtask
          </Button>
        )}
      </div>

      {/* Add Subtask Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Input
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            placeholder="Subtask name..."
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="sm">
            Add
          </Button>
          <Button type="button" onClick={handleCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </form>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 ? (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => onToggle(subtask.id)}
                className="flex-shrink-0"
                aria-label={`Mark ${subtask.name} as ${subtask.completed ? 'incomplete' : 'complete'}`}
              />
              <span
                className={`flex-1 text-sm ${
                  subtask.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {subtask.name}
              </span>
              {getStatusBadge(subtask.status)}
              <Button
                onClick={() => onDelete(subtask.id)}
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${subtask.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm mb-4">No subtasks yet</p>
            <Button
              onClick={handleAddClick}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your first subtask
            </Button>
          </div>
        )
      )}

      {/* Summary */}
      {subtasks.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            {subtasks.filter((st) => st.completed).length} of {subtasks.length} completed
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${subtasks.length > 0 ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
