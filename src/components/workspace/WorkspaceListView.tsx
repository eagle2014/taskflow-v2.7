import { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Lock
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import type { WorkspaceTask } from '../../data/projectWorkspaceMockData';
import { DraggableTaskRow } from './DraggableTaskRow';

interface WorkspaceListViewProps {
  tasks: WorkspaceTask[];
  groupedTasks: { [key: string]: WorkspaceTask[] };
  groupBy: string;
  selectedTasks: Set<string>;
  collapsedGroups: Set<string>;
  columns: any[];
  onToggleTask: (taskId: string) => void;
  onToggleAll: () => void;
  onToggleGroup: (groupKey: string) => void;
  onTaskClick: (task: WorkspaceTask) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onAssigneeChange: (taskId: string, userId: string | null) => void;
  onDueDateChange: (taskId: string, date: Date | undefined) => void;
  onSubtaskToggle: (taskId: string) => void;
  onReorderTasks?: (tasks: WorkspaceTask[]) => void;
}

export function WorkspaceListView({
  tasks,
  groupedTasks,
  groupBy,
  selectedTasks,
  collapsedGroups,
  columns,
  onToggleTask,
  onToggleAll,
  onToggleGroup,
  onTaskClick,
  onStatusChange,
  onAssigneeChange,
  onDueDateChange,
  onSubtaskToggle,
  onReorderTasks
}: WorkspaceListViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [datePopoverOpen, setDatePopoverOpen] = useState<string | null>(null);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<WorkspaceTask[]>(tasks);

  // Sync local tasks with props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [removed] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, removed);
      return newTasks;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    // Update task orders and call parent callback
    if (onReorderTasks) {
      const reorderedTasks = localTasks.map((task, index) => ({
        ...task,
        order: index
      }));
      onReorderTasks(reorderedTasks);
    }
  }, [localTasks, onReorderTasks]);

  const statusOptions = [
    { value: 'todo', label: 'TO DO', color: '#838a9c' },
    { value: 'in-progress', label: 'IN PROGRESS', color: '#0ea5e9' },
    { value: 'ready', label: 'READY', color: '#a78bfa' },
    { value: 'done', label: 'COMPLETE', color: '#10b981' },
  ];

  const toggleTaskExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const renderTaskRow = (task: WorkspaceTask, level: number = 0, index?: number) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    const taskContent = (
      <>
        {/* Checkbox & Name */}
        <td className="p-3 sticky left-0 bg-[#181c28] group-hover:bg-[#292d39]">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            <Checkbox
              checked={selectedTasks.has(task.id)}
              onCheckedChange={() => onToggleTask(task.id)}
              onClick={(e) => e.stopPropagation()}
            />
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskExpand(task.id);
                }}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <span className="text-white text-sm">{task.name}</span>
            {task.comments > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{task.comments}</span>
              </div>
            )}
          </div>
        </td>

        {/* Dynamic Columns */}
        {columns.filter(col => col.visible).map((column) => (
          <td key={column.id} className="p-3 text-sm">
            {column.id === 'status' && (
              <Badge
                style={{
                  backgroundColor: statusOptions.find(s => s.value === task.status)?.color + '20',
                  color: statusOptions.find(s => s.value === task.status)?.color,
                  border: `1px solid ${statusOptions.find(s => s.value === task.status)?.color}`
                }}
                className="text-xs"
              >
                {statusOptions.find(s => s.value === task.status)?.label}
              </Badge>
            )}
            {column.id === 'assignee' && (
              task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <div
                      className="w-full h-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: task.assignee.color }}
                    >
                      {task.assignee.initials}
                    </div>
                  </Avatar>
                  <span className="text-gray-300 text-sm">{task.assignee.name}</span>
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Unassigned</span>
              )
            )}
            {column.id === 'dueDate' && (
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarIcon className="h-4 w-4" />
                <span>{task.dueDate || '-'}</span>
              </div>
            )}
            {column.id === 'budget' && (
              <span className="text-gray-300">${task.budget.toLocaleString()}</span>
            )}
            {column.id === 'budgetRemaining' && (
              <div className="flex items-center gap-2">
                {column.formula && <Lock className="h-3 w-3 text-blue-400" />}
                <span className="text-gray-300">${task.budgetRemaining.toLocaleString()}</span>
              </div>
            )}
          </td>
        ))}
      </>
    );

    return (
      <>
        {/* Only make draggable if at root level (level === 0) and has index */}
        {level === 0 && index !== undefined && onReorderTasks ? (
          <DraggableTaskRow
            id={task.id}
            index={index}
            onMoveTask={moveTask}
            onDragEnd={handleDragEnd}
            disabled={false}
          >
            {taskContent}
          </DraggableTaskRow>
        ) : (
          <tr
            key={task.id}
            className="border-b border-[#3a3f4f] hover:bg-[#292d39] transition-colors cursor-pointer group"
            onClick={() => onTaskClick(task)}
          >
            {taskContent}
          </tr>
        )}

        {/* Subtasks */}
        {isExpanded && hasSubtasks && task.subtasks!.map(subtask =>
          renderTaskRow(subtask, level + 1)
        )}
      </>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#292d39] z-10">
            <tr className="border-b border-[#3a3f4f]">
              {/* Drag handle column header */}
              <th className="p-3 w-8"></th>
              <th className="p-3 text-left text-sm text-gray-400 sticky left-0 bg-[#292d39]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTasks.size === localTasks.length && localTasks.length > 0}
                    onCheckedChange={onToggleAll}
                  />
                  <span>Task Name</span>
                </div>
              </th>
              {columns.filter(col => col.visible).map((column) => (
                <th key={column.id} className="p-3 text-left text-sm text-gray-400 min-w-[150px]">
                  <div className="flex items-center gap-2">
                    {column.formula && <Lock className="h-3 w-3 text-blue-400" />}
                    <span>{column.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupBy === 'none' ? (
              localTasks.map((task, index) => renderTaskRow(task, 0, index))
            ) : (
              Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
                const isCollapsed = collapsedGroups.has(groupKey);

                return (
                  <>
                    <tr key={`group-${groupKey}`} className="bg-[#292d39] border-b border-[#3a3f4f]">
                      <td colSpan={columns.filter(c => c.visible).length + 2} className="p-3">
                        <button
                          onClick={() => onToggleGroup(groupKey)}
                          className="flex items-center gap-2 text-white hover:text-gray-300"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">{groupKey}</span>
                          <Badge variant="secondary" className="ml-2">
                            {groupTasks.length}
                          </Badge>
                        </button>
                      </td>
                    </tr>
                    {!isCollapsed && groupTasks.map((task, index) => renderTaskRow(task, 0, index))}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
}
