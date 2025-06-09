
import React, { useState } from 'react';
import { usePropertyManagement, PropertyTask } from '@/hooks/usePropertyManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import PropertyTaskManagementHeader from '@/components/admin/tasks/PropertyTaskManagementHeader';
import PropertyTaskKanbanBoard from '@/components/admin/tasks/PropertyTaskKanbanBoard';
import CreatePropertyTaskModal from '@/components/admin/tasks/CreatePropertyTaskModal';
import CreatePropertyProjectModal from '@/components/admin/tasks/CreatePropertyProjectModal';
import CreateWorkOrderModal from '@/components/admin/workorders/CreateWorkOrderModal';
import LoadingState from '@/components/ui/loading-state';

const AdminTaskManagement = () => {
  const {
    properties,
    projects,
    tasks,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
  } = usePropertyManagement();

  const {
    contractors,
    createWorkOrder,
  } = useWorkOrderManagement();

  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PropertyTask | null>(null);
  const [selectedTaskForWorkOrder, setSelectedTaskForWorkOrder] = useState<PropertyTask | null>(null);

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  const handleTaskClick = (task: PropertyTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateWorkOrder = (task: PropertyTask) => {
    setSelectedTaskForWorkOrder(task);
    setIsWorkOrderModalOpen(true);
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, { 
        status: status as any, 
        // completed_at: status === 'completed' ? new Date().toISOString() : null 
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project'>) => {
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
      <PropertyTaskManagementHeader
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        overdueTasks={overdueTasks}
        onCreateTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onCreateProject={() => setIsProjectModalOpen(true)}
        view={view}
        onViewChange={setView}
      />

      {view === 'kanban' && (
        <PropertyTaskKanbanBoard
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

      <CreatePropertyTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onCreateTask={handleCreateTask}
        properties={properties}
        projects={projects}
        editingTask={editingTask}
      />

      <CreatePropertyProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        properties={properties}
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
