
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useBulkTaskOperations } from '@/hooks/useBulkTaskOperations';
import { useCustomTaskTypes } from '@/hooks/useCustomTaskTypes';
import { useTaskManagementState } from '@/hooks/useTaskManagementState';
import { useTaskManagementHandlers } from '@/hooks/useTaskManagementHandlers';
import { useTaskStats } from '@/components/admin/tasks/TaskManagementStats';
import LoadingState from '@/components/ui/loading-state';
import TaskManagementModals from '../tasks/TaskManagementModals';
import PropertyManagementHeader from './PropertyManagementHeader';
import PropertyManagementStats from './PropertyManagementStats';
import PropertyManagementAlerts from './PropertyManagementAlerts';
import PropertyManagementTabs from './PropertyManagementTabs';

const EnhancedPropertyManagementDashboard = () => {
  const {
    properties,
    projects,
    tasks,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    generateTurnoverTasks,
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

  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');

  // Handle tab query parameter for redirects from old task management
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['tasks', 'projects', 'properties', 'calendar', 'workorders', 'integrations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const filteredTasks = selectedProperty === 'all' 
    ? tasks 
    : tasks.filter(task => task.property_id === selectedProperty);

  const filteredProjects = selectedProperty === 'all' 
    ? projects 
    : projects.filter(project => project.property_id === selectedProperty);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PropertyManagementHeader
        selectedProperty={selectedProperty}
        onPropertyChange={setSelectedProperty}
        properties={properties}
      />

      <PropertyManagementStats
        properties={properties}
        projects={projects}
        totalTasks={totalTasks}
        pendingTasks={pendingTasks}
        overdueTasks={overdueTasks}
      />

      <PropertyManagementAlerts
        tasks={tasks}
        overdueTasks={overdueTasks}
        getPriorityBadgeColor={getPriorityBadgeColor}
      />

      <PropertyManagementTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        view={view}
        setView={setView}
        filteredTasks={filteredTasks}
        filteredProjects={filteredProjects}
        properties={properties}
        tasks={tasks}
        selectedTaskIds={selectedTaskIds}
        bulkMode={bulkMode}
        contractors={contractors}
        setEditingTask={setEditingTask}
        setIsTaskModalOpen={setIsTaskModalOpen}
        setIsProjectModalOpen={setIsProjectModalOpen}
        setIsWorkOrderModalOpen={setIsWorkOrderModalOpen}
        generateTurnoverTasks={generateTurnoverTasks}
        onToggleBulkMode={handleToggleBulkMode}
        onSelectAllTasks={handleSelectAllTasks}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        onCreateWorkOrder={handleCreateWorkOrder}
        onToggleTaskSelection={toggleTaskSelection}
        clearSelection={clearSelection}
        refreshData={refreshData}
        getStatusBadgeColor={getStatusBadgeColor}
        getPriorityBadgeColor={getPriorityBadgeColor}
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

export default EnhancedPropertyManagementDashboard;
