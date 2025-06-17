
import React from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import PropertyTaskKanbanBoard from './PropertyTaskKanbanBoard';
import TaskTableView from './TaskTableView';
import TaskCalendarView from './TaskCalendarView';

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
      <TaskTableView
        tasks={tasks}
        selectedTaskIds={selectedTaskIds}
        bulkMode={bulkMode}
        onTaskClick={onTaskClick}
        onToggleTaskSelection={onToggleTaskSelection}
        onStatusChange={onStatusChange}
        onDeleteTask={onDeleteTask}
        onCreateWorkOrder={onCreateWorkOrder}
      />
    );
  }

  if (view === 'calendar') {
    return (
      <TaskCalendarView
        tasks={tasks}
        onTaskClick={onTaskClick}
        onCreateTask={() => {
          // This will be handled by the parent component
          const dummyTask = {
            id: 'new',
            title: '',
            type: 'admin' as const,
            status: 'pending' as const,
            priority: 'medium' as const,
            is_recurring: false,
            created_by: '',
            created_at: '',
            updated_at: ''
          };
          onTaskClick(dummyTask as PropertyTask);
        }}
      />
    );
  }

  return null;
};

export default TaskManagementViews;
