
import React from 'react';
import CreatePropertyTaskModal from './CreatePropertyTaskModal';
import CreatePropertyProjectModal from './CreatePropertyProjectModal';
import CreateWorkOrderModal from '../workorders/CreateWorkOrderModal';
import { PropertyTask, PropertyProject, CustomTaskType } from '@/hooks/property-management/types';
import { Property } from '@/types/property';

interface TaskManagementModalsProps {
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  isWorkOrderModalOpen: boolean;
  editingTask?: PropertyTask | null;
  editingProject?: PropertyProject | null;
  selectedTaskForWorkOrder?: PropertyTask | null;
  properties: Property[];
  projects: PropertyProject[];
  taskTypes: CustomTaskType[];
  contractors: any[];
  onCloseTaskModal: () => void;
  onCloseProjectModal: () => void;
  onCloseWorkOrderModal: () => void;
  onCreateTask: (taskData: any) => Promise<void>;
  onCreateProject: (projectData: any) => Promise<void>;
  onUpdateProject?: (projectId: string, projectData: any) => Promise<void>;
  onCreateWorkOrder: (workOrderData: any) => Promise<void>;
  onAssignUsers?: (taskId: string, userIds: string[]) => Promise<void>;
}

const TaskManagementModals = ({
  isTaskModalOpen,
  isProjectModalOpen,
  isWorkOrderModalOpen,
  editingTask,
  editingProject,
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
  onUpdateProject,
  onCreateWorkOrder,
  onAssignUsers,
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
        onAssignUsers={onAssignUsers}
      />

      <CreatePropertyProjectModal
        isOpen={isProjectModalOpen}
        onClose={onCloseProjectModal}
        onCreateProject={onCreateProject}
        onUpdateProject={onUpdateProject}
        properties={properties}
        editingProject={editingProject}
      />

      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={onCloseWorkOrderModal}
        onCreateWorkOrder={onCreateWorkOrder}
        contractors={contractors}
      />
    </>
  );
};

export default TaskManagementModals;
