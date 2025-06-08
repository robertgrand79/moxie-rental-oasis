
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Kanban, Table, Calendar } from 'lucide-react';

interface TaskManagementHeaderProps {
  totalTasks: number;
  completedTasks: number;
  onCreateTask: () => void;
  onCreateProject: () => void;
  view: 'kanban' | 'table' | 'calendar';
  onViewChange: (view: 'kanban' | 'table' | 'calendar') => void;
}

const TaskManagementHeader = ({
  totalTasks,
  completedTasks,
  onCreateTask,
  onCreateProject,
  view,
  onViewChange,
}: TaskManagementHeaderProps) => {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Manage your projects, repairs, and property tasks</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onCreateProject} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Tasks:</span>
            <Badge variant="outline">{totalTasks}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Completed:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {completedTasks}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Progress:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {completionRate}%
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={view === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('kanban')}
          >
            <Kanban className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('table')}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('calendar')}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementHeader;
