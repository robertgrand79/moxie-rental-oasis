
import { useState } from 'react';
import { PropertyTask } from '@/hooks/property-management/types';

export const useTaskManagementState = () => {
  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isTaskTypeModalOpen, setIsTaskTypeModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PropertyTask | null>(null);
  const [selectedTaskForWorkOrder, setSelectedTaskForWorkOrder] = useState<PropertyTask | null>(null);
  const [bulkMode, setBulkMode] = useState(false);

  return {
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
  };
};
