
import { PropertyTask } from '@/hooks/property-management/types';

interface UseTaskManagementHandlersProps {
  bulkMode: boolean;
  editingTask: PropertyTask | null;
  selectedTaskForWorkOrder: PropertyTask | null;
  setEditingTask: (task: PropertyTask | null) => void;
  setIsTaskModalOpen: (open: boolean) => void;
  setSelectedTaskForWorkOrder: (task: PropertyTask | null) => void;
  setIsWorkOrderModalOpen: (open: boolean) => void;
  setBulkMode: (mode: boolean) => void;
  updateTask: (taskId: string, updates: any) => Promise<any>;
  createTask: (taskData: any) => Promise<any>;
  createProject: (projectData: any) => Promise<any>;
  createWorkOrder: (workOrderData: any) => Promise<any>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  clearSelection: () => void;
}

export const useTaskManagementHandlers = ({
  bulkMode,
  editingTask,
  selectedTaskForWorkOrder,
  setEditingTask,
  setIsTaskModalOpen,
  setSelectedTaskForWorkOrder,
  setIsWorkOrderModalOpen,
  setBulkMode,
  updateTask,
  createTask,
  createProject,
  createWorkOrder,
  deleteTask,
  toggleTaskSelection,
  selectAllTasks,
  clearSelection,
}: UseTaskManagementHandlersProps) => {
  const handleTaskClick = (task: PropertyTask) => {
    if (bulkMode) {
      toggleTaskSelection(task.id);
    } else {
      setEditingTask(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleCreateWorkOrder = (task: PropertyTask) => {
    setSelectedTaskForWorkOrder(task);
    setIsWorkOrderModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { status: status as any });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project' | 'task_type' | 'assignments'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await createTask(taskData);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateWorkOrderFromTask = async (workOrderData: any) => {
    if (selectedTaskForWorkOrder) {
      await createWorkOrder({
        ...workOrderData,
        task_id: selectedTaskForWorkOrder.id,
        title: workOrderData.title || selectedTaskForWorkOrder.title,
        description: workOrderData.description || selectedTaskForWorkOrder.description,
      });
      setSelectedTaskForWorkOrder(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      clearSelection();
    }
  };

  const handleSelectAllTasks = (tasks: PropertyTask[]) => {
    const allTaskIds = tasks.map(task => task.id);
    selectAllTasks(allTaskIds);
  };

  return {
    handleTaskClick,
    handleCreateWorkOrder,
    handleStatusChange,
    handleCreateTask,
    handleCreateProject,
    handleCreateWorkOrderFromTask,
    handleDeleteTask,
    handleToggleBulkMode,
    handleSelectAllTasks,
  };
};
