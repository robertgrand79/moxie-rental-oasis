
import React from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import PropertyTaskKanbanBoard from './PropertyTaskKanbanBoard';

interface TaskManagementViewsProps {
  view: 'kanban' | 'table' | 'calendar';
  tasks: PropertyTask[];
  selectedTaskIds: string[];
  bulkMode: boolean;
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder: (task: PropertyTask) => void;
  onToggleTaskSelection: (taskId: string) => void;
}

const TaskManagementViews = ({
  view,
  tasks,
  selectedTaskIds,
  bulkMode,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  onCreateWorkOrder,
  onToggleTaskSelection,
}: TaskManagementViewsProps) => {
  if (view === 'kanban') {
    return (
      <PropertyTaskKanbanBoard
        tasks={tasks}
        onTaskClick={onTaskClick}
        onStatusChange={onStatusChange}
        onDeleteTask={onDeleteTask}
        onCreateWorkOrder={onCreateWorkOrder}
        selectedTaskIds={selectedTaskIds}
        onToggleTaskSelection={onToggleTaskSelection}
        bulkMode={bulkMode}
      />
    );
  }

  if (view === 'table') {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <p className="text-gray-500">Enhanced table view with bulk operations coming soon...</p>
      </div>
    );
  }

  if (view === 'calendar') {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <p className="text-gray-500">Calendar view with recurring task management coming soon...</p>
      </div>
    );
  }

  return null;
};

export default TaskManagementViews;
