
import { useEffect } from 'react';
import { usePropertyData } from './property-management/usePropertyData';
import { useProjectOperations } from './property-management/useProjectOperations';
import { useTaskOperations } from './property-management/useTaskOperations';
import { useTurnoverTasks } from './property-management/useTurnoverTasks';
import { MaintenanceSchedule } from './property-management/types';

// Re-export types for backward compatibility
export type { PropertyProject, PropertyTask, MaintenanceSchedule } from './property-management/types';

export const usePropertyManagement = () => {
  const {
    properties,
    projects,
    tasks,
    loading,
    setProjects,
    setTasks,
    loadData,
    refreshData,
  } = usePropertyData();

  const { createProject, updateProject, deleteProject } = useProjectOperations(setProjects);
  const { createTask, updateTask, deleteTask } = useTaskOperations(setTasks);
  const { generateTurnoverTasks } = useTurnoverTasks(setTasks);

  // Empty schedules array for now - can be implemented later
  const schedules: MaintenanceSchedule[] = [];

  useEffect(() => {
    loadData();
  }, []);

  return {
    properties,
    projects,
    tasks,
    schedules,
    loading,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    generateTurnoverTasks,
    refreshData,
  };
};
