import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useOptimizedPropertyData } from '@/hooks/useOptimizedPropertyData';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useBulkTaskOperations } from '@/hooks/useBulkTaskOperations';
import { useCustomTaskTypes } from '@/hooks/useCustomTaskTypes';
import { useTaskManagementState } from '@/hooks/useTaskManagementState';
import { useTaskManagementHandlers } from '@/hooks/useTaskManagementHandlers';
import { usePropertyManagementLoading } from '@/hooks/usePropertyManagementLoading';
import { useTaskStats } from '@/components/admin/tasks/TaskManagementStats';
import SmartLoadingWrapper from './SmartLoadingWrapper';
import TaskManagementModals from '../tasks/TaskManagementModals';
import PropertyManagementHeader from './PropertyManagementHeader';
import PropertyManagementStats from './PropertyManagementStats';
import PropertyManagementAlerts from './PropertyManagementAlerts';
import PropertyManagementTabs from './PropertyManagementTabs';

const EnhancedPropertyManagementDashboard = () => {
  // Use optimized data fetching
  const {
    properties,
    projects,
    tasks,
    loading,
    loadData,
    refreshData,
  } = useOptimizedPropertyData();

  // Keep existing functionality for operations
  const { 
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    generateTurnoverTasks,
  } = usePropertyManagement();

  const { contractors, createWorkOrder } = useWorkOrderManagement();
  const { taskTypes } = useCustomTaskTypes();
  const { setLoading, loadingStates } = usePropertyManagementLoading();
  
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

  const [editingProject, setEditingProject] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const {
    handleTaskClick,
    handleCreateWorkOrder,
    handleStatusChange,
    handleCreateTask: originalHandleCreateTask,
    handleCreateProject: originalHandleCreateProject,
    handleCreateWorkOrderFromTask,
    handleDeleteTask: originalHandleDeleteTask,
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

  // Enhanced handlers with loading state management
  const handleCreateTask = async (taskData: any) => {
    try {
      setLoading('creating', true);
      await originalHandleCreateTask(taskData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading('creating', false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      setLoading('creating', true);
      await originalHandleCreateProject(projectData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading('creating', false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading('deleting', true);
      await originalHandleDeleteTask(taskId);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading('deleting', false);
    }
  };

  const handleUpdateProject = async (projectId: string, projectData: any) => {
    try {
      setLoading('updating', true);
      await updateProject(projectId, projectData);
      setEditingProject(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading('updating', false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading('deleting', true);
      await deleteProject(projectId);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading('deleting', false);
    }
  };

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

  const retryLoadData = async () => {
    try {
      setError(null);
      await loadData();
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <SmartLoadingWrapper
      isLoading={loading}
      view={activeTab as any}
      error={error}
      retry={retryLoadData}
      loadingMessage="Loading property management dashboard..."
    >
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
          setEditingProject={setEditingProject}
          setIsTaskModalOpen={setIsTaskModalOpen}
          setIsProjectModalOpen={setIsProjectModalOpen}
          setIsWorkOrderModalOpen={setIsWorkOrderModalOpen}
          generateTurnoverTasks={generateTurnoverTasks}
          onToggleBulkMode={() => setBulkMode(!bulkMode)}
          onSelectAllTasks={() => selectAllTasks(filteredTasks.map(t => t.id))}
          onTaskClick={(task) => setEditingTask(task)}
          onStatusChange={(taskId, status) => updateTask(taskId, { status })}
          onDeleteTask={deleteTask}
          onDeleteProject={deleteProject}
          onCreateWorkOrder={() => setIsWorkOrderModalOpen(true)}
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
          editingProject={editingProject}
          selectedTaskForWorkOrder={selectedTaskForWorkOrder}
          properties={properties}
          projects={projects}
          taskTypes={taskTypes}
          contractors={contractors}
          onCloseTaskModal={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onCloseProjectModal={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          onCloseWorkOrderModal={() => {
            setIsWorkOrderModalOpen(false);
            setSelectedTaskForWorkOrder(null);
          }}
          onCreateTask={createTask}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          onCreateWorkOrder={createWorkOrder}
        />
      </div>
    </SmartLoadingWrapper>
  );
};

export default EnhancedPropertyManagementDashboard;
