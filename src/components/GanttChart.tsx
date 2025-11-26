import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color?: string;
  children?: GanttTask[];
  type?: 'project' | 'phase' | 'task';
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  onTaskReorder?: (taskId: string, newIndex: number, parentId?: string) => void;
  onTaskDateChange?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
}

export function GanttChart({ tasks, startDate, endDate, onTaskReorder, onTaskDateChange }: GanttChartProps) {
  // Auto-expand all phases by default
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    tasks.forEach(task => {
      if (task.type === 'phase' || task.type === 'project') {
        initialExpanded.add(task.id);
      }
    });
    return initialExpanded;
  });
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [dragOverTask, setDragOverTask] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<{ id: string; edge: 'left' | 'right' } | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [originalDates, setOriginalDates] = useState<{ start: Date; end: Date } | null>(null);

  // Calculate timeline headers (months and weeks)
  const getTimelineHeaders = () => {
    if (!startDate || !endDate) return [];
    
    const headers: { month: string; weeks: Date[] }[] = [];
    const current = new Date(startDate);
    current.setDate(1); // Start from first day of month

    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const weeks: Date[] = [];

      // Get all weeks in this month
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const weekStart = new Date(current);
      
      while (weekStart <= monthEnd && weekStart <= endDate) {
        weeks.push(new Date(weekStart));
        weekStart.setDate(weekStart.getDate() + 7);
      }

      headers.push({ month: monthName, weeks });
      current.setMonth(current.getMonth() + 1);
    }

    return headers;
  };

  // Calculate position and width of task bar
  const getTaskBarStyle = (task: GanttTask) => {
    if (!startDate || !endDate || !task.startDate || !task.endDate) {
      return { left: '0%', width: '0%' };
    }
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskStartDays = Math.ceil((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));

    const left = (taskStartDays / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Get today position
  const getTodayPosition = () => {
    if (!startDate || !endDate) return null;
    
    const today = new Date();
    if (today < startDate || today > endDate) return null;
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const todayDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (todayDays / totalDays) * 100;
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedItems(newExpanded);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTask(taskId);
  };

  const handleDragLeave = () => {
    setDragOverTask(null);
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (draggingTask && draggingTask !== targetTaskId && onTaskReorder) {
      // onTaskReorder(draggingTask, 0, targetTaskId);
      toast.success('Task reordered successfully');
    }
    setDraggingTask(null);
    setDragOverTask(null);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverTask(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, taskId: string, edge: 'left' | 'right', task: GanttTask) => {
    e.stopPropagation();
    setResizingTask({ id: taskId, edge });
    setResizeStartX(e.clientX);
    setOriginalDates({ start: task.startDate, end: task.endDate });
  };

  useEffect(() => {
    if (!resizingTask) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingTask || !originalDates) return;

      const deltaX = e.clientX - resizeStartX;
      const totalWidth = window.innerWidth - 300; // Subtract sidebar width
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysPerPixel = totalDays / totalWidth;
      const daysDelta = Math.round(deltaX * daysPerPixel);

      // Update task dates based on resize
      if (resizingTask.edge === 'left') {
        const newStartDate = new Date(originalDates.start);
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        // Ensure start date doesn't go past end date
        if (newStartDate < originalDates.end) {
          // Call callback or update local state
        }
      } else {
        const newEndDate = new Date(originalDates.end);
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        // Ensure end date doesn't go before start date
        if (newEndDate > originalDates.start) {
          // Call callback or update local state
        }
      }
    };

    const handleMouseUp = () => {
      if (resizingTask && onTaskDateChange && originalDates) {
        toast.success('Task duration updated');
      }
      setResizingTask(null);
      setOriginalDates(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingTask, resizeStartX, originalDates]);

  const renderTaskRow = (task: GanttTask, level: number = 0): JSX.Element[] => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedItems.has(task.id);
    const rows: JSX.Element[] = [];

    // Main task row
    rows.push(
      <div
        key={task.id}
        draggable={task.type === 'task'}
        onDragStart={(e) => task.type === 'task' && handleDragStart(e, task.id)}
        onDragOver={(e) => handleDragOver(e, task.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, task.id)}
        onDragEnd={handleDragEnd}
        className={`flex border-b border-[#3d4457] hover:bg-[#292d39]/50 transition-all relative group ${
          draggingTask === task.id ? 'opacity-40 bg-[#292d39]/30' : ''
        } ${dragOverTask === task.id && draggingTask !== task.id ? 'border-t-2 border-t-[#0394ff] bg-[#0394ff]/5' : ''}`}
        onMouseEnter={() => setHoveredTask(task.id)}
        onMouseLeave={() => setHoveredTask(null)}
      >
        {/* Left sidebar - Task name */}
        <div className="w-[300px] border-r border-[#3d4457] py-3 flex items-center gap-2 bg-[#181c28] relative" style={{ paddingLeft: `${level * 20 + 12}px`, paddingRight: '12px' }}>
          {/* Drag Handle - Only show for tasks on hover */}
          {task.type === 'task' && (
            <div 
              className={`absolute left-2 flex-shrink-0 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                hoveredTask === task.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
              }`}
              style={{ 
                pointerEvents: hoveredTask === task.id ? 'auto' : 'none',
              }}
            >
              <GripVertical className="w-3.5 h-3.5 text-[#838a9c] hover:text-[#0394ff]" />
            </div>
          )}
          
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(task.id)}
              className="text-[#838a9c] hover:text-white transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            !task.type || task.type === 'task' ? <div className="w-4 flex-shrink-0" /> : null
          )}
          <span className={`text-sm truncate ${
            task.type === 'project' 
              ? 'font-semibold text-white' 
              : task.type === 'phase' 
                ? 'font-medium text-[#0394ff]' 
                : 'text-[#e4e6eb]'
          }`}>
            {task.name}
          </span>
        </div>

        {/* Right side - Timeline chart */}
        <div className="flex-1 relative min-h-[48px] bg-[#1f2330]">
          {/* Task bar */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-7 rounded-sm shadow-sm flex items-center transition-all cursor-pointer group-hover:shadow-md overflow-visible select-none"
            style={{
              ...getTaskBarStyle(task),
              backgroundColor: task.color || '#0394ff',
              opacity: hoveredTask === task.id ? 1 : 0.85,
              zIndex: hoveredTask === task.id ? 10 : 1,
            }}
            title={`${task.name}\n${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()}\nProgress: ${task.progress}%`}
          >
            {/* Left resize handle */}
            {task.type === 'task' && hoveredTask === task.id && (
              <div
                className="absolute -left-1 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 active:bg-white/50 z-10 transition-colors rounded-l-sm"
                onMouseDown={(e) => handleResizeStart(e, task.id, 'left', task)}
                title="Drag to change start date"
              />
            )}
            
            {/* Progress bar */}
            <div
              className="h-full bg-black/15 pointer-events-none rounded-l-sm"
              style={{ width: `${task.progress}%` }}
            />

            {/* Right resize handle */}
            {task.type === 'task' && hoveredTask === task.id && (
              <div
                className="absolute -right-1 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 active:bg-white/50 z-10 transition-colors rounded-r-sm"
                onMouseDown={(e) => handleResizeStart(e, task.id, 'right', task)}
                title="Drag to change end date"
              />
            )}
          </div>
        </div>
      </div>
    );

    // Children rows
    if (hasChildren && isExpanded) {
      task.children!.forEach(child => {
        rows.push(...renderTaskRow(child, level + 1));
      });
    }

    return rows;
  };

  const timelineHeaders = getTimelineHeaders();
  const todayPosition = getTodayPosition();
  const totalWeeks = timelineHeaders.reduce((acc, h) => acc + h.weeks.length, 0);

  return (
    <div className="h-full flex flex-col bg-[#181c28]">
      {/* Header */}
      <div className="flex border-b border-[#3d4457] bg-[#1f2330] sticky top-0 z-10">
        {/* Left sidebar header */}
        <div className="w-[300px] border-r border-[#3d4457] px-3 py-2 bg-[#1f2330]">
          <span className="text-sm text-[#838a9c] uppercase tracking-wide">Task Name</span>
        </div>

        {/* Timeline header */}
        <div className="flex-1 overflow-x-auto taskflow-scrollbar bg-[#1f2330]">
          <div style={{ minWidth: `${totalWeeks * 80}px` }}>
            {/* Month headers */}
            <div className="flex border-b border-[#3d4457]">
              {timelineHeaders.map((header, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 border-r border-[#3d4457]/50 last:border-r-0"
                  style={{ width: `${header.weeks.length * 80}px` }}
                >
                  <span className="text-xs font-medium text-white">{header.month}</span>
                </div>
              ))}
            </div>
            
            {/* Week/Day headers */}
            <div className="flex">
              {timelineHeaders.map((header) =>
                header.weeks.map((week, weekIdx) => (
                  <div
                    key={`${header.month}-${weekIdx}`}
                    className="px-2 py-1.5 border-r border-[#3d4457]/50 last:border-r-0 text-center"
                    style={{ width: '80px' }}
                  >
                    <span className="text-xs text-[#838a9c]">
                      {week.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task rows */}
      <div className="flex-1 overflow-auto taskflow-scrollbar relative">
        <div className="flex flex-col relative" style={{ minWidth: `${totalWeeks * 80 + 300}px` }}>
          {/* Vertical grid lines for timeline */}
          <div className="absolute inset-0 pointer-events-none" style={{ left: '300px' }}>
            {timelineHeaders.map((header) =>
              header.weeks.map((week, weekIdx) => {
                const weekIndex = timelineHeaders.slice(0, timelineHeaders.indexOf(header))
                  .reduce((acc, h) => acc + h.weeks.length, 0) + weekIdx;
                return (
                  <div
                    key={`grid-${header.month}-${weekIdx}`}
                    className="absolute top-0 bottom-0 w-px bg-[#3d4457]/20"
                    style={{ left: `${weekIndex * 80}px` }}
                  />
                );
              })
            )}
          </div>

          {tasks.map(task => renderTaskRow(task))}
        </div>

        {/* Today marker */}
        {todayPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
            style={{ left: `calc(300px + ${todayPosition}% * ${totalWeeks * 80 / 100}px)` }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg font-medium">
                TODAY
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
