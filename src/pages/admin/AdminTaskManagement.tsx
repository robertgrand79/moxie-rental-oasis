
import React, { useState } from 'react';
import { useTaskManagement, Task } from '@/hooks/useTaskManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import TaskManagementHeader from '@/components/admin/tasks/TaskManagementHeader';
import TaskKanbanBoard from '@/components/admin/tasks/TaskKanbanBoard';
import CreateTaskModal from '@/components/admin/tasks/CreateTaskModal';
import CreateProjectModal from '@/components/admin/tasks/CreateProjectModal';
import CreateWorkOrderModal from '@/components/admin/workorders/CreateWorkOrderModal';
import LoadingState from '@/components/ui/loading-state';

const AdminTaskManagement = () => {
  const {
    projects,
    tasks,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskManagement();

  const {
    contractors,
    createWorkOrder,
  } = useWorkOrderManagement();

  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForWorkOrder, setSelectedTaskForWorkOrder] = useState<Task | null>(null);

  const completedTasks = tasks.filter(task => task.status === 'done').length;

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateWorkOrder = (task: Task) => {
    setSelectedTaskForWorkOrder(task);
    setIsWorkOrderModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { 
        status, 
        completed_at: status === 'done' ? new Date().toISOString() : null 
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project'>) => {
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

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <TaskManagementHeader
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        onCreateTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onCreateProject={() => setIsProjectModalOpen(true)}
        view={view}
        onViewChange={setView}
      />

      {view === 'kanban' && (
        <TaskKanbanBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      )}

      {view === 'table' && (
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-gray-500">Table view coming soon...</p>
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-lg p-6 border">
          <p className="text-gray-500">Calendar view coming soon...</p>
        </div>
      )}

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onCreateTask={handleCreateTask}
        projects={projects}
        editingTask={editingTask}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => {
          setIsWorkOrderModalOpen(false);
          setSelectedTaskForWorkOrder(null);
        }}
        onCreateWorkOrder={handleCreateWorkOrderFromTask}
        contractors={contractors}
        editingWorkOrder={null}
      />
    </div>
  );
};

export default AdminTaskManagement;
