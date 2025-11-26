import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Resizable } from 're-resizable';

interface Task {
  id: string;
  name: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_to_avatar: string;
  start_date: string;
  due_date: string;
  related_to: string;
  stage: string;
  previous_task: string;
  parent_task: string;
}

interface LinkTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkTasks: (taskIds: string[]) => void;
}

export function LinkTaskDialog({ open, onOpenChange, onLinkTasks }: LinkTaskDialogProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogSize, setDialogSize] = useState({ width: 2340, height: 700 });
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Mock available tasks to link
  const availableTasks: Task[] = [
    {
      id: 'task-1',
      name: 'tạo điểm',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '',
      due_date: '',
      related_to: '',
      stage: 'Todo',
      previous_task: '',
      parent_task: 'Công tác chuẩn bị dự án'
    },
    {
      id: 'task-2',
      name: 'jh tên tài liệu',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '',
      due_date: '',
      related_to: '',
      stage: 'Todo',
      previous_task: '',
      parent_task: 'Công tác chuẩn bị dự án'
    },
    {
      id: 'task-3',
      name: 'tendo',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '',
      due_date: '',
      related_to: '',
      stage: 'Todo',
      previous_task: '',
      parent_task: ''
    },
    {
      id: 'task-4',
      name: 'Thiết kế giao diện Dashboard',
      assigned_to: 'user-2',
      assigned_to_name: 'Nguyễn A',
      assigned_to_avatar: 'N',
      start_date: '2024-01-20',
      due_date: '2024-01-28',
      related_to: 'Design Phase',
      stage: 'In Progress',
      previous_task: 'tạo điểm',
      parent_task: 'UI/UX Design'
    },
    {
      id: 'task-5',
      name: 'Phát triển API Backend',
      assigned_to: 'user-3',
      assigned_to_name: 'Lê B',
      assigned_to_avatar: 'L',
      start_date: '2024-01-22',
      due_date: '2024-02-05',
      related_to: 'Development',
      stage: 'In Progress',
      previous_task: 'jh tên tài liệu',
      parent_task: 'Backend Development'
    },
    {
      id: 'task-6',
      name: 'Viết unit tests',
      assigned_to: 'user-4',
      assigned_to_name: 'Trần C',
      assigned_to_avatar: 'C',
      start_date: '2024-02-01',
      due_date: '2024-02-10',
      related_to: 'Quality Assurance',
      stage: 'Todo',
      previous_task: 'Phát triển API Backend',
      parent_task: 'Testing'
    },
    {
      id: 'task-7',
      name: 'Tích hợp thanh toán',
      assigned_to: 'user-3',
      assigned_to_name: 'Lê B',
      assigned_to_avatar: 'L',
      start_date: '2024-02-05',
      due_date: '2024-02-15',
      related_to: 'Payment',
      stage: 'Todo',
      previous_task: '',
      parent_task: 'Payment Integration'
    },
    {
      id: 'task-8',
      name: 'Review code và merge PR',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '2024-02-12',
      due_date: '2024-02-14',
      related_to: 'Code Review',
      stage: 'Done',
      previous_task: 'Viết unit tests',
      parent_task: 'Code Review'
    },
    {
      id: 'task-9',
      name: 'Deploy lên staging environment',
      assigned_to: 'user-2',
      assigned_to_name: 'Nguyễn A',
      assigned_to_avatar: 'N',
      start_date: '2024-02-14',
      due_date: '2024-02-16',
      related_to: 'DevOps',
      stage: 'In Progress',
      previous_task: 'Review code và merge PR',
      parent_task: 'Deployment'
    },
    {
      id: 'task-10',
      name: 'Tối ưu hóa performance',
      assigned_to: 'user-4',
      assigned_to_name: 'Trần C',
      assigned_to_avatar: 'C',
      start_date: '2024-02-18',
      due_date: '2024-02-25',
      related_to: 'Optimization',
      stage: 'Todo',
      previous_task: 'Deploy lên staging environment',
      parent_task: 'Performance'
    },
    {
      id: 'task-11',
      name: 'Viết tài liệu hướng dẫn sử dụng',
      assigned_to: 'user-2',
      assigned_to_name: 'Nguyễn A',
      assigned_to_avatar: 'N',
      start_date: '2024-02-20',
      due_date: '2024-02-28',
      related_to: 'Documentation',
      stage: 'Todo',
      previous_task: '',
      parent_task: 'Documentation'
    },
    {
      id: 'task-12',
      name: 'Testing UAT với khách hàng',
      assigned_to: 'user-1',
      assigned_to_name: 'tr ng',
      assigned_to_avatar: 'T',
      start_date: '2024-03-01',
      due_date: '2024-03-05',
      related_to: 'UAT',
      stage: 'Todo',
      previous_task: 'Tối ưu hóa performance',
      parent_task: 'User Acceptance Testing'
    }
  ];

  const totalTasks = availableTasks.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalTasks);
  const displayedTasks = availableTasks.slice(startIndex, endIndex);

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleToggleAll = () => {
    if (selectedTasks.length === displayedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(displayedTasks.map(task => task.id));
    }
  };

  const handleLinkTasks = () => {
    onLinkTasks(selectedTasks);
    setSelectedTasks([]);
    onOpenChange(false);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setDialogSize({ width: 2340, height: 700 });
      setIsMaximized(false);
    } else {
      setDialogSize({ width: window.innerWidth * 0.95, height: window.innerHeight * 0.9 });
      setIsMaximized(true);
    }
  };

  // Load saved size from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem('linkTaskDialogSize');
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize);
        setDialogSize(parsed);
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save size to localStorage when it changes
  const handleResizeStop = (e: any, direction: any, ref: any, delta: any) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    setDialogSize(newSize);
    localStorage.setItem('linkTaskDialogSize', JSON.stringify(newSize));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!p-0 !max-w-none !w-auto !h-auto bg-transparent border-none overflow-visible">
        <DialogDescription className="sr-only">
          Select tasks to link from the list below
        </DialogDescription>
        
        <Resizable
          size={dialogSize}
          onResizeStop={handleResizeStop}
          minWidth={1200}
          minHeight={500}
          maxWidth={window.innerWidth * 0.95}
          maxHeight={window.innerHeight * 0.9}
          enable={{
            top: false,
            right: true,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: true,
            bottomLeft: false,
            topLeft: false,
          }}
          handleStyles={{
            right: {
              width: '8px',
              right: '-4px',
              cursor: 'ew-resize',
              background: 'transparent',
            },
            bottom: {
              height: '8px',
              bottom: '-4px',
              cursor: 'ns-resize',
              background: 'transparent',
            },
            bottomRight: {
              width: '16px',
              height: '16px',
              right: '-8px',
              bottom: '-8px',
              cursor: 'nwse-resize',
              background: 'transparent',
            },
          }}
          className="bg-[#292d39] border border-[#3d4457] rounded-lg shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3d4457] px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-6">
              <DialogTitle className="text-white text-lg">Tasks</DialogTitle>
              
              {/* Pagination - Left side */}
              <div className="flex items-center gap-2 text-sm text-[#838a9c]">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[50px] text-center">
                  {startIndex + 1} to {endIndex}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Maximize/Minimize Button */}
              <button
                onClick={toggleMaximize}
                className="text-[#838a9c] hover:text-white transition-colors p-1 rounded hover:bg-[#3d4457]"
                title={isMaximized ? 'Minimize' : 'Maximize'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Link Tasks Button - Right side */}
              <Button 
                size="sm"
                onClick={handleLinkTasks}
                disabled={selectedTasks.length === 0}
                className="bg-[#0394ff] hover:bg-[#0570cd] text-white px-6 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Link tasks
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 taskflow-scrollbar">
            <table className="w-full">
              <thead className="bg-[#292d39] border-b border-[#3d4457]">
                <tr>
                  <th className="text-left py-3 px-4 w-12">
                    <Checkbox
                      checked={selectedTasks.length === displayedTasks.length && displayedTasks.length > 0}
                      onCheckedChange={handleToggleAll}
                      className="border-[#838a9c] data-[state=checked]:bg-[#0394ff] data-[state=checked]:border-[#0394ff]"
                    />
                  </th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[320px]">NAME</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[240px]">ASSIGNED TO</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[180px]">START DATE</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[180px]">DUE DATE</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[240px]">RELATED TO</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[180px]">STAGE</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[240px]">PREVIOUS TASK</th>
                  <th className="text-left text-[#838a9c] text-xs py-3 px-4 whitespace-nowrap min-w-[280px]">PARENT TASK</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="border-b border-[#3d4457] hover:bg-[#3d4457]/20 transition-colors cursor-pointer"
                    onClick={() => handleToggleTask(task.id)}
                  >
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="border-[#838a9c] data-[state=checked]:bg-[#0394ff] data-[state=checked]:border-[#0394ff]"
                      />
                    </td>
                    <td className="py-3 px-4 text-white text-sm whitespace-nowrap">{task.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#0394ff] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                          {task.assigned_to_avatar}
                        </div>
                        <span className="text-white text-sm">{task.assigned_to_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#838a9c] text-sm whitespace-nowrap">{task.start_date || '-'}</td>
                    <td className="py-3 px-4 text-[#838a9c] text-sm whitespace-nowrap">{task.due_date || '-'}</td>
                    <td className="py-3 px-4 text-[#838a9c] text-sm whitespace-nowrap">{task.related_to || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-[#838a9c]/10 text-[#838a9c] border-[#838a9c]/30 text-xs">
                        {task.stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#838a9c] text-sm whitespace-nowrap">{task.previous_task || '-'}</td>
                    <td className="py-3 px-4 text-white text-sm whitespace-nowrap">{task.parent_task || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resize Indicator */}
          <div className="absolute bottom-1 right-1 w-4 h-4 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#838a9c] opacity-50"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M16 16L16 13L13 16L16 16Z" />
              <path d="M16 10L10 16L13 16L16 13L16 10Z" />
              <path d="M16 7L7 16L10 16L16 10L16 7Z" />
            </svg>
          </div>
        </Resizable>
      </DialogContent>
    </Dialog>
  );
}
