import { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Calendar, Flag, MessageSquare, Paperclip, CheckSquare, Trash2, Edit2, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { tasksApi, usersApi, commentsApi, Task, User, Project } from '../services/api';
import { EditTaskForm } from './EditTaskForm';
import { NewTaskDialog } from './NewTaskDialog';
import { TaskDetailView } from './TaskDetailView';
import { KanbanStats } from './KanbanStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n/context';

interface KanbanColumn {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  color: string;
  wipLimit?: number;
}

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', status: 'todo', color: '#838a9c' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: '#0394ff' },
  { id: 'review', title: 'Review', status: 'review', color: '#ffd43b' },
  { id: 'completed', title: 'Done', status: 'completed', color: '#51cf66' }
];

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400'
};

interface KanbanBoardProps {
  project?: Project;
  currentUser: User;
}

interface TaskWithDetails extends Task {
  assignee?: User;
  reporter?: User;
  commentCount?: number;
}

export function KanbanBoard({ project, currentUser }: KanbanBoardProps) {
  const { t } = useI18n();
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [draggedTask, setDraggedTask] = useState<TaskWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState<string>('');
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [project]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTasks, allUsers] = await Promise.all([
        tasksApi.getAll(),
        usersApi.getAll()
      ]);

      // Filter tasks by project if specified
      const filteredTasks = project
        ? allTasks.filter(task => task.projectID === project.projectID)
        : allTasks;

      // Load comment counts for each task
      const tasksWithDetails = await Promise.all(
        filteredTasks.map(async (task) => {
          const assignee = allUsers.find(u => u.userID === task.assigneeID);
          const reporter = allUsers.find(u => u.userID === task.createdBy);
          let commentCount = 0;
          try {
            const comments = await commentsApi.getByTask(task.taskID);
            commentCount = comments.length;
          } catch {
            // Ignore comment loading errors
          }

          return {
            ...task,
            assignee,
            reporter,
            commentCount
          };
        })
      );

      setTasks(tasksWithDetails);
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load kanban data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (task: TaskWithDetails) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const targetColumn = columns.find(col => col.status === targetStatus);
    if (!targetColumn) return;

    // Check if source and target are the same
    if (draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    // Check WIP limit
    const tasksInColumn = tasks.filter(t => t.status === targetStatus);
    if (targetColumn.wipLimit && tasksInColumn.length >= targetColumn.wipLimit) {
      toast.error(`WIP limit reached for ${targetColumn.title}. Maximum ${targetColumn.wipLimit} tasks allowed.`);
      setDraggedTask(null);
      return;
    }

    try {
      // Update task status
      await tasksApi.update(draggedTask.taskID, { status: targetStatus });

      // Update local state
      setTasks(prev => prev.map(task =>
        task.taskID === draggedTask.taskID
          ? { ...task, status: targetStatus }
          : task
      ));

      toast.success(`Task moved to ${targetColumn.title}`);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to move task');
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskDoubleClick = (task: TaskWithDetails) => {
    setEditingTask(task);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task =>
      task.taskID === updatedTask.taskID
        ? { ...task, ...updatedTask }
        : task
    ));
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(task => task.taskID !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleQuickAddTask = async (columnStatus: string) => {
    if (!quickTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const newTask = await tasksApi.create({
        title: quickTaskTitle,
        description: '',
        projectID: project?.projectID || '',
        assigneeID: currentUser.userID,
        priority: 'medium',
        status: columnStatus,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        estimatedHours: 0,
        actualHours: 0,
        createdBy: currentUser.userID
      });

      const assignee = users.find(u => u.userID === newTask.assigneeID);
      const reporter = users.find(u => u.userID === newTask.createdBy);

      setTasks(prev => [...prev, { ...newTask, assignee, reporter, commentCount: 0 }]);
      setQuickTaskTitle('');
      setAddingToColumn(null);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleNewTaskClick = (columnStatus: string) => {
    setNewTaskColumn(columnStatus);
    setIsNewTaskDialogOpen(true);
  };

  const handleTaskCreated = async (task: Task) => {
    await loadData();
    setIsNewTaskDialogOpen(false);
    toast.success('Task created successfully');
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#838a9c]">Loading Kanban board...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white">
              {project ? `${project.name} - Board View` : 'Kanban Board'}
            </h1>
            <p className="text-[#838a9c] mt-1">Drag and drop tasks between columns to update status</p>
          </div>
        </div>

        {/* Stats */}
        <KanbanStats tasks={tasks} />

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 taskflow-scrollbar">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const isWipLimitReached = column.wipLimit && columnTasks.length >= column.wipLimit;

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="text-white">{column.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        isWipLimitReached 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-[#3d4457] text-[#838a9c]'
                      }`}>
                        {columnTasks.length}
                        {column.wipLimit ? `/${column.wipLimit}` : ''}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
                      onClick={() => handleNewTaskClick(column.status)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tasks Container */}
                <div 
                  className={`space-y-3 min-h-[500px] p-3 rounded-lg transition-all ${
                    draggedTask && draggedTask.status !== column.status
                      ? 'border-2 border-dashed bg-[#292d39]/50'
                      : 'border-2 border-transparent'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                  style={{
                    borderColor: draggedTask && draggedTask.status !== column.status 
                      ? column.color + '60' 
                      : 'transparent'
                  }}
                >
                  {columnTasks.map((task) => (
                    <Card
                      key={task.taskID}
                      className="bg-[#292d39] border-[#3d4457] p-4 cursor-move hover:shadow-lg hover:border-[#0394ff]/50 transition-all duration-200 group"
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDoubleClick={() => handleTaskDoubleClick(task)}
                    >
                      <div className="space-y-3">
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-white flex-1 line-clamp-2 leading-tight">
                            {task.title}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-[#838a9c] hover:text-white hover:bg-[#3d4457] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#292d39] border-[#3d4457]">
                              <DropdownMenuItem
                                onClick={() => handleTaskDoubleClick(task)}
                                className="text-white hover:bg-[#3d4457] cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.taskID)}
                                className="text-red-400 hover:bg-[#3d4457] cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Task Footer */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {/* Assignee Avatar */}
                            {task.assignee && (
                              <div
                                className="w-6 h-6 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-full flex items-center justify-center text-white"
                                title={task.assignee.name}
                              >
                                {task.assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            {/* Priority Flag */}
                            <Flag className={`h-3 w-3 ${priorityColors[task.priority as keyof typeof priorityColors] || 'text-gray-400'}`} />
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Comment Count */}
                            {task.commentCount ? (
                              <div className="flex items-center gap-1 text-[#838a9c]">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.commentCount}</span>
                              </div>
                            ) : null}

                            {/* Due Date */}
                            {task.dueDate && (
                              <div className={`flex items-center gap-1 ${
                                isOverdue(task.dueDate) && task.status !== 'completed'
                                  ? 'text-red-400'
                                  : 'text-[#838a9c]'
                              }`}>
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Quick Add Task */}
                  {addingToColumn === column.status ? (
                    <div className="bg-[#292d39] border-2 border-[#0394ff] rounded-lg p-3 space-y-2">
                      <Input
                        placeholder="Task title..."
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleQuickAddTask(column.status);
                          } else if (e.key === 'Escape') {
                            setAddingToColumn(null);
                            setQuickTaskTitle('');
                          }
                        }}
                        className="bg-[#3d4457] border-[#3d4457] text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddTask(column.status)}
                          className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingToColumn(null);
                            setQuickTaskTitle('');
                          }}
                          className="text-[#838a9c] hover:text-white hover:bg-[#3d4457]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingToColumn(column.status)}
                      className="w-full text-[#838a9c] hover:text-white hover:bg-[#3d4457] border-2 border-dashed border-[#3d4457] hover:border-[#0394ff]/50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Quick add task
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="bg-[#292d39] border-[#3d4457] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription className="text-[#838a9c]">
                View and manage task information
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-[#3d4457] w-full">
                <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-[#0394ff]">
                  Details
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex-1 data-[state=active]:bg-[#0394ff]">
                  Edit
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <TaskDetailView
                  task={editingTask}
                  currentUser={currentUser}
                  onClose={() => setEditingTask(null)}
                  onTaskUpdated={handleTaskUpdated}
                />
              </TabsContent>
              <TabsContent value="edit" className="mt-4">
                <EditTaskForm
                  task={editingTask}
                  onTaskUpdated={handleTaskUpdated}
                  onClose={() => setEditingTask(null)}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* New Task Dialog */}
      {isNewTaskDialogOpen && (
        <NewTaskDialog
          currentUser={currentUser}
          onTaskCreated={(newTask) => {
            handleTaskCreated(newTask);
            setIsNewTaskDialogOpen(false);
          }}
          onCancel={() => setIsNewTaskDialogOpen(false)}
          projectId={project?.projectID}
        />
      )}
    </>
  );
}
