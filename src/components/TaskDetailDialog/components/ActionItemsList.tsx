import { useState } from 'react';
import { ActionItem } from '../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Checkbox } from '../../ui/checkbox';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ActionItemsListProps {
  items: ActionItem[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ActionItemsList({ items, onAdd, onToggle, onDelete }: ActionItemsListProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewItemName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
        {!isAdding && (
          <Button
            onClick={handleAddClick}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add action item
          </Button>
        )}
      </div>

      {/* Add Action Item Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Action item name..."
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

      {/* Action Items List */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggle(item.id)}
                className="flex-shrink-0"
                aria-label={`Mark ${item.name} as ${item.completed ? 'incomplete' : 'complete'}`}
              />
              <span
                className={`flex-1 text-sm ${
                  item.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {item.name}
              </span>
              {item.completed && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <Button
                onClick={() => onDelete(item.id)}
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm mb-4">No action items yet</p>
            <Button
              onClick={handleAddClick}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your first action item
            </Button>
          </div>
        )
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            {items.filter((item) => item.completed).length} of {items.length} completed
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{
                width: `${items.length > 0 ? (items.filter((item) => item.completed).length / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
