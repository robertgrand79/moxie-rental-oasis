
import React from 'react';
import { PropertyTask, PropertyProject, CustomTaskType } from '@/hooks/property-management/types';
import { Property } from '@/types/property';
import CreatePropertyTaskModal from './CreatePropertyTaskModal';
import CreatePropertyProjectModal from './CreatePropertyProjectModal';
import CreateWorkOrderModal from '../workorders/CreateWorkOrderModal';

interface TaskManagementModalsProps {
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  isWorkOrderModalOpen: boolean;
  editingTask: PropertyTask | null;
  selectedTaskForWorkOrder: PropertyTask | null;
  properties: Property[];
  projects: PropertyProject[];
  taskTypes: CustomTaskType[];
  contractors: any[];
  onCloseTaskModal: () => void;
  onCloseProjectModal: () => void;
  onCloseWorkOrderModal: () => void;
  onCreateTask: (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project' | 'task_type' | 'assignments'>) => Promise<void>;
  onCreateProject: (projectData: any) => Promise<void>;
  onCreateWorkOrder: (workOrderData: any) => Promise<void>;
}

const TaskManagementModals = ({
  isTaskModalOpen,
  isProjectModalOpen,
  isWorkOrderModalOpen,
  editingTask,
  selectedTaskForWorkOrder,
  properties,
  projects,
  taskTypes,
  contractors,
  onCloseTaskModal,
  onCloseProjectModal,
  onCloseWorkOrderModal,
  onCreateTask,
  onCreateProject,
  onCreateWorkOrder,
}: TaskManagementModalsProps) => {
  return (
    <>
      <CreatePropertyTaskModal
        isOpen={isTaskModalOpen}
        onClose={onCloseTaskModal}
        onCreateTask={onCreateTask}
        properties={properties}
        projects={projects}
        taskTypes={taskTypes}
        editingTask={editingTask}
      />

      <CreatePropertyProjectModal
        isOpen={isProjectModalOpen}
        onClose={onCloseProjectModal}
        onCreateProject={onCreateProject}
        properties={properties}
      />

      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={onCloseWorkOrderModal}
        onCreateWorkOrder={onCreateWorkOrder}
        contractors={contractors}
        editingWorkOrder={null}
      />
    </>
  );
};

export default TaskManagementModals;
