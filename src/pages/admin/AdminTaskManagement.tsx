
import React from 'react';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useBulkTaskOperations } from '@/hooks/useBulkTaskOperations';
import { useCustomTaskTypes } from '@/hooks/useCustomTaskTypes';
import { useTaskManagementState } from '@/hooks/useTaskManagementState';
import { useTaskManagementHandlers } from '@/hooks/useTaskManagementHandlers';
import { useTaskStats } from '@/components/admin/tasks/TaskManagementStats';
import PropertyTaskManagementHeader from '@/components/admin/tasks/PropertyTaskManagementHeader';
import TaskManagementActions from '@/components/admin/tasks/TaskManagementActions';
import TaskManagementViews from '@/components/admin/tasks/TaskManagementViews';
import TaskManagementModals from '@/components/admin/tasks/TaskManagementModals';
import BulkTaskActions from '@/components/admin/tasks/BulkTaskActions';
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
    refreshData,
  } = usePropertyManagement();

  const { contractors, createWorkOrder } = useWorkOrderManagement();
  const { taskTypes } = useCustomTaskTypes();
  
  const {
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
  } = useBulkTaskOperations();

  const {
    view,
    setView,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isProjectModalOpen,
    setIsProjectModalOpen,
    isWorkOrderModalOpen,
    setIsWorkOrderModalOpen,
    isTaskTypeModalOpen,
    setIsTaskTypeModalOpen,
    editingTask,
    setEditingTask,
    selectedTaskForWorkOrder,
    setSelectedTaskForWorkOrder,
    bulkMode,
    setBulkMode,
  } = useTaskManagementState();

  const {
    handleTaskClick,
    handleCreateWorkOrder,
    handleStatusChange,
    handleCreateTask,
    handleCreateProject,
    handleCreateWorkOrderFromTask,
    handleDeleteTask,
    handleToggleBulkMode,
    handleSelectAllTasks,
  } = useTaskManagementHandlers({
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
  });

  const { totalTasks, completedTasks, pendingTasks, overdueTasks } = useTaskStats(tasks);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PropertyTaskManagementHeader
        totalTasks={totalTasks}
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

      <TaskManagementActions
        bulkMode={bulkMode}
        onToggleBulkMode={handleToggleBulkMode}
        onSelectAllTasks={() => handleSelectAllTasks(tasks)}
        onOpenTaskTypeModal={() => setIsTaskTypeModalOpen(true)}
        tasksCount={tasks.length}
      />

      {bulkMode && (
        <BulkTaskActions
          selectedCount={selectedTaskIds.length}
          onClearSelection={clearSelection}
          onRefresh={refreshData}
        />
      )}

      <TaskManagementViews
        view={view}
        tasks={tasks}
        selectedTaskIds={selectedTaskIds}
        bulkMode={bulkMode}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        onCreateWorkOrder={handleCreateWorkOrder}
        onToggleTaskSelection={toggleTaskSelection}
      />

      <TaskManagementModals
        isTaskModalOpen={isTaskModalOpen}
        isProjectModalOpen={isProjectModalOpen}
        isWorkOrderModalOpen={isWorkOrderModalOpen}
        editingTask={editingTask}
        selectedTaskForWorkOrder={selectedTaskForWorkOrder}
        properties={properties}
        projects={projects}
        taskTypes={taskTypes}
        contractors={contractors}
        onCloseTaskModal={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onCloseProjectModal={() => setIsProjectModalOpen(false)}
        onCloseWorkOrderModal={() => {
          setIsWorkOrderModalOpen(false);
          setSelectedTaskForWorkOrder(null);
        }}
        onCreateTask={handleCreateTask}
        onCreateProject={handleCreateProject}
        onCreateWorkOrder={handleCreateWorkOrderFromTask}
      />
    </div>
  );
};

export default AdminTaskManagement;
