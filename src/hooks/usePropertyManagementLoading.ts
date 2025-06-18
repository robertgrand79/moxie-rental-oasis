
import { useState } from 'react';

interface LoadingStates {
  properties: boolean;
  projects: boolean;
  tasks: boolean;
  workOrders: boolean;
  contractors: boolean;
  taskTypes: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  bulkOperations: boolean;
  fileOperations: boolean;
}

interface OperationLoadingStates {
  [key: string]: boolean;
}

export const usePropertyManagementLoading = () => {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    properties: false,
    projects: false,
    tasks: false,
    workOrders: false,
    contractors: false,
    taskTypes: false,
    creating: false,
    updating: false,
    deleting: false,
    bulkOperations: false,
    fileOperations: false,
  });

  const [operationLoading, setOperationLoading] = useState<OperationLoadingStates>({});

  const setLoading = (key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const setOperationLoading = (operationId: string, value: boolean) => {
    setOperationLoading(prev => ({ ...prev, [operationId]: value }));
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean) || Object.values(operationLoading).some(Boolean);

  const getLoadingMessage = (): string => {
    if (loadingStates.creating) return 'Creating...';
    if (loadingStates.updating) return 'Updating...';
    if (loadingStates.deleting) return 'Deleting...';
    if (loadingStates.bulkOperations) return 'Processing bulk operations...';
    if (loadingStates.fileOperations) return 'Processing files...';
    if (loadingStates.properties) return 'Loading properties...';
    if (loadingStates.projects) return 'Loading projects...';
    if (loadingStates.tasks) return 'Loading tasks...';
    if (loadingStates.workOrders) return 'Loading work orders...';
    if (loadingStates.contractors) return 'Loading contractors...';
    if (loadingStates.taskTypes) return 'Loading task types...';
    return 'Loading...';
  };

  return {
    loadingStates,
    operationLoading,
    isAnyLoading,
    setLoading,
    setOperationLoading,
    getLoadingMessage,
  };
};
