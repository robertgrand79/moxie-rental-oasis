
import React from 'react';
import { PropertyTask } from '@/hooks/property-management/types';

interface TaskManagementStatsProps {
  tasks: PropertyTask[];
}

export const useTaskStats = (tasks: PropertyTask[]) => {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  return {
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks,
    overdueTasks,
  };
};

const TaskManagementStats = ({ tasks }: TaskManagementStatsProps) => {
  const stats = useTaskStats(tasks);
  return stats;
};

export default TaskManagementStats;
