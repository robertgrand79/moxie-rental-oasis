
import React from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import GoogleCalendarView from './GoogleCalendarView';

interface TaskCalendarViewProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onCreateTask: () => void;
}

const TaskCalendarView = ({
  tasks,
  onTaskClick,
  onCreateTask,
}: TaskCalendarViewProps) => {
  return (
    <GoogleCalendarView
      tasks={tasks}
      onTaskClick={onTaskClick}
      onCreateTask={onCreateTask}
    />
  );
};

export default TaskCalendarView;
