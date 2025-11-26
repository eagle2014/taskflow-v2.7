// Custom hook for task management operations
import { useCallback } from 'react';
import { WorkspaceTask } from '../types';
import { toast } from 'sonner';
import { tasksApi, authApi } from '../../../services/api';

interface UseTaskManagementProps {
  activeProject: string | null;
  projectTasks: Record<string, WorkspaceTask[]>;
  setProjectTasks: (tasks: Record<string, WorkspaceTask[]>) => void;
  setWorkspaceTasks: (tasks: WorkspaceTask[]) => void;
}

export const useTaskManagement = ({
  activeProject,
  projectTasks,
  setProjectTasks,
  setWorkspaceTasks,
}: UseTaskManagementProps) => {
  
  // Add a new task
  const addTask = useCallback((task: WorkspaceTask) => {
    if (!activeProject) {
      toast.error('Please select a project first');
      return;
    }

    setProjectTasks({
      ...projectTasks,
      [activeProject]: [...(projectTasks[activeProject] || []), task]
    });
    
    toast.success('Task added successfully');
  }, [activeProject, projectTasks, setProjectTasks]);

  // Update a task
  const updateTask = useCallback((taskId: string, updates: Partial<WorkspaceTask>) => {
    if (!activeProject) return;

    const updatedTasks = projectTasks[activeProject]?.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    if (updatedTasks) {
      setProjectTasks({
        ...projectTasks,
        [activeProject]: updatedTasks
      });
      toast.success('Task updated successfully');
    }
  }, [activeProject, projectTasks, setProjectTasks]);

  // Delete a task
  const deleteTask = useCallback((taskId: string) => {
    if (!activeProject) return;

    const updatedTasks = projectTasks[activeProject]?.filter(task => task.id !== taskId);

    if (updatedTasks) {
      setProjectTasks({
        ...projectTasks,
        [activeProject]: updatedTasks
      });
      toast.success('Task deleted successfully');
    }
  }, [activeProject, projectTasks, setProjectTasks]);

  // Duplicate a task
  const duplicateTask = useCallback((taskId: string) => {
    if (!activeProject) return;

    const taskToDuplicate = projectTasks[activeProject]?.find(task => task.id === taskId);
    if (!taskToDuplicate) return;

    const duplicatedTask: WorkspaceTask = {
      ...taskToDuplicate,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${taskToDuplicate.name} (Copy)`,
    };

    setProjectTasks({
      ...projectTasks,
      [activeProject]: [...(projectTasks[activeProject] || []), duplicatedTask]
    });
    
    toast.success('Task duplicated successfully');
  }, [activeProject, projectTasks, setProjectTasks]);

  // Change task status
  const changeTaskStatus = useCallback((taskId: string, newStatus: WorkspaceTask['status']) => {
    setWorkspaceTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    // Also update in projectTasks
    if (activeProject) {
      const updatedTasks = projectTasks[activeProject]?.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );

      if (updatedTasks) {
        setProjectTasks({
          ...projectTasks,
          [activeProject]: updatedTasks
        });
      }
    }
    
    toast.success('Task status updated');
  }, [activeProject, projectTasks, setProjectTasks, setWorkspaceTasks]);

  // Add subtask with API persistence
  const addSubtask = useCallback(async (parentTaskId: string, subtask: WorkspaceTask) => {
    if (!activeProject) return;

    try {
      const user = authApi.getStoredUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Create subtask via API with parentTaskID
      const createdSubtask = await tasksApi.create({
        projectID: activeProject,
        parentTaskID: parentTaskId,
        title: subtask.name,
        status: subtask.status,
        priority: subtask.phase || 'Medium',
        dueDate: subtask.dueDate,
        startDate: subtask.startDate,
        progress: 0,
      });

      // Update local state with API response
      const updatedTasks = projectTasks[activeProject]?.map(task => {
        if (task.id === parentTaskId) {
          const newSubtask: WorkspaceTask = {
            ...subtask,
            id: createdSubtask.taskID,
            parentTaskID: parentTaskId,
          };
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask]
          };
        }
        return task;
      });

      if (updatedTasks) {
        setProjectTasks({
          ...projectTasks,
          [activeProject]: updatedTasks
        });
        toast.success('Subtask added successfully');
      }
    } catch (error) {
      console.error('Failed to create subtask:', error);
      toast.error('Failed to create subtask');
    }
  }, [activeProject, projectTasks, setProjectTasks]);

  // Move task to different phase
  const moveTaskToPhase = useCallback((taskId: string, newPhase: string) => {
    updateTask(taskId, { phase: newPhase });
  }, [updateTask]);

  // Update task order with API persistence
  const updateTaskOrder = useCallback(async (taskId: string, newOrder: number) => {
    if (!activeProject) return;

    try {
      // Update via API
      await tasksApi.update(taskId, { order: newOrder });

      // Update local state
      const updatedTasks = projectTasks[activeProject]?.map(task =>
        task.id === taskId ? { ...task, order: newOrder } : task
      );

      if (updatedTasks) {
        setProjectTasks({
          ...projectTasks,
          [activeProject]: updatedTasks
        });
      }
    } catch (error) {
      console.error('Failed to update task order:', error);
      toast.error('Failed to update task order');
    }
  }, [activeProject, projectTasks, setProjectTasks]);

  // Batch update task orders (for drag-drop reordering)
  const updateTaskOrders = useCallback(async (updates: Array<{ taskId: string; order: number }>) => {
    if (!activeProject) return;

    try {
      // Update all tasks via API in parallel
      await Promise.all(
        updates.map(({ taskId, order }) =>
          tasksApi.update(taskId, { order: order })
        )
      );

      // Update local state
      const updatedTasks = projectTasks[activeProject]?.map(task => {
        const update = updates.find(u => u.taskId === task.id);
        return update ? { ...task, order: update.order } : task;
      });

      if (updatedTasks) {
        setProjectTasks({
          ...projectTasks,
          [activeProject]: updatedTasks
        });
        toast.success('Task order updated');
      }
    } catch (error) {
      console.error('Failed to update task orders:', error);
      toast.error('Failed to update task order');
    }
  }, [activeProject, projectTasks, setProjectTasks]);

  return {
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    changeTaskStatus,
    addSubtask,
    moveTaskToPhase,
    updateTaskOrder,
    updateTaskOrders,
  };
};
