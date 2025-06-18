import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOptimizedPropertyData } from '@/hooks/useOptimizedPropertyData';
import { usePropertyOperations } from '@/hooks/usePropertyOperations';
import { useProjectOperations } from '@/hooks/property-management/useProjectOperations';
import { useTaskOperations } from '@/hooks/property-management/useTaskOperations';
import { useTurnoverTasks } from '@/hooks/property-management/useTurnoverTasks';
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
  // Use optimized data fetching - single source of truth
  const {
    properties,
    projects,
    tasks,
    loading,
    loadData,
    refreshData,
    setProjects,
    setTasks,
  } = useOptimizedPropertyData();

  // Use individual operation hooks without data loading
  const { createProject, updateProject, deleteProject } = useProjectOperations(setProjects);
  const { createTask, updateTask, deleteTask } = useTaskOperations(setTasks);
  const { generateTurnoverTasks } = useTurnoverTasks(setTasks);
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
    console.log('🚀 EnhancedPropertyManagementDashboard - Loading property management data...');
    loadData().catch((err) => {
      console.error('❌ EnhancedPropertyManagementDashboard - Failed to load data:', err);
      setError(err);
    });
  }, []);

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

  const retryLoadData = async () => {
    try {
      setError(null);
      console.log('🔄 EnhancedPropertyManagementDashboard - Retrying data load...');
      await loadData();
    } catch (err) {
      console.error('❌ EnhancedPropertyManagementDashboard - Retry failed:', err);
      setError(err as Error);
    }
  };

  // Create wrapper functions to handle the void returns expected by the component
  const handleCreateTask = async (taskData: any): Promise<void> => {
    try {
      console.log('📝 Creating task:', taskData);
      await createTask(taskData);
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to create task:', error);
    }
  };

  const handleCreateProject = async (projectData: any): Promise<void> => {
    try {
      console.log('📂 Creating project:', projectData);
      await createProject(projectData);
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (projectId: string, projectData: any): Promise<void> => {
    try {
      console.log('📝 Updating project:', projectId, projectData);
      await updateProject(projectId, projectData);
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to create project:', error);
    }
  };

  const handleCreateWorkOrder = async (workOrderData: any): Promise<void> => {
    try {
      console.log('🔧 Creating work order:', workOrderData);
      await createWorkOrder(workOrderData);
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to create work order:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'];
    if (validStatuses.includes(status)) {
      try {
        console.log('Updating task status:', taskId, status);
        await updateTask(taskId, { status: status as any });
        await refreshData();
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log('Deleting task:', taskId);
      await deleteTask(taskId);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      console.log('Deleting project:', projectId);
      await deleteProject(projectId);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleGenerateTurnoverTasks = async (propertyId: string) => {
    try {
      console.log('Generating turnover tasks for property:', propertyId);
      await generateTurnoverTasks(propertyId);
      await refreshData();
    } catch (error) {
      console.error('Failed to generate turnover tasks:', error);
    }
  };

  console.log('🎯 EnhancedPropertyManagementDashboard render - Loading:', loading, 'Properties:', properties.length, 'Tasks:', tasks.length, 'Projects:', projects.length, 'Error:', error?.message);

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
          getPriorityBadgeColor={(priority: string) => {
            switch (priority) {
              case 'critical': return 'bg-red-100 text-red-800';
              case 'high': return 'bg-orange-100 text-orange-800';
              case 'medium': return 'bg-yellow-100 text-yellow-800';
              case 'low': return 'bg-green-100 text-green-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
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
          generateTurnoverTasks={handleGenerateTurnoverTasks}
          onToggleBulkMode={() => setBulkMode(!bulkMode)}
          onSelectAllTasks={() => selectAllTasks(filteredTasks.map(t => t.id))}
          onTaskClick={(task) => setEditingTask(task)}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onDeleteProject={handleDeleteProject}
          onCreateWorkOrder={() => setIsWorkOrderModalOpen(true)}
          onToggleTaskSelection={toggleTaskSelection}
          clearSelection={clearSelection}
          refreshData={refreshData}
          getStatusBadgeColor={(status: string) => {
            switch (status) {
              case 'completed': return 'bg-green-100 text-green-800';
              case 'in_progress': return 'bg-blue-100 text-blue-800';
              case 'pending': return 'bg-yellow-100 text-yellow-800';
              case 'blocked': return 'bg-red-100 text-red-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
          getPriorityBadgeColor={(priority: string) => {
            switch (priority) {
              case 'critical': return 'bg-red-100 text-red-800';
              case 'high': return 'bg-orange-100 text-orange-800';
              case 'medium': return 'bg-yellow-100 text-yellow-800';
              case 'low': return 'bg-green-100 text-green-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
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
          onCreateTask={handleCreateTask}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      </div>
    </SmartLoadingWrapper>
  );
};

export default EnhancedPropertyManagementDashboard;
