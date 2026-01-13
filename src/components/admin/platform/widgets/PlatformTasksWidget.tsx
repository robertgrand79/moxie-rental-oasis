import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Plus, 
  ArrowRight, 
  Circle, 
  Clock,
  AlertTriangle,
  X,
  Workflow
} from 'lucide-react';
import { usePlatformTasks, PlatformTask } from '@/hooks/usePlatformTasks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    default:
      return null;
  }
};

const TaskItem: React.FC<{
  task: PlatformTask;
  onToggle: (task: PlatformTask) => void;
}> = ({ task, onToggle }) => {
  const isDue = task.due_date && (isPast(new Date(task.due_date)) || isToday(new Date(task.due_date)));

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group">
      <Checkbox
        checked={task.status === 'done'}
        onCheckedChange={() => onToggle(task)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm truncate',
            task.status === 'done' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {getPriorityIcon(task.priority)}
        </div>
        {task.due_date && (
          <p className={cn(
            'text-xs mt-0.5 flex items-center gap-1',
            isDue && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            <Clock className="h-3 w-3" />
            {format(new Date(task.due_date), 'MMM d')}
          </p>
        )}
      </div>
      {task.status === 'in_progress' && (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
          In Progress
        </Badge>
      )}
    </div>
  );
};

const PlatformTasksWidget: React.FC = () => {
  const navigate = useNavigate();
  const { pendingTasks, todoCount, inProgressCount, isLoading, createTask, updateTask, isCreating } = usePlatformTasks({ limit: 10 });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleToggleTask = (task: PlatformTask) => {
    updateTask({
      id: task.id,
      status: task.status === 'done' ? 'todo' : 'done',
    });
  };

  const displayTasks = pendingTasks.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Platform Tasks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigate('/admin/platform/workflows')}
              title="Manage Workflows"
            >
              <Workflow className="h-4 w-4" />
            </Button>
            {todoCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {todoCount} todo
              </Badge>
            )}
            {inProgressCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                {inProgressCount} active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {displayTasks.length === 0 && !showAddTask ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <CheckSquare className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {displayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                  />
                ))}
              </div>
            )}

            {showAddTask ? (
              <div className="flex items-center gap-2 mt-3">
                <Input
                  placeholder="Add a task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') {
                      setShowAddTask(false);
                      setNewTaskTitle('');
                    }
                  }}
                  autoFocus
                  disabled={isCreating}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim() || isCreating}
                >
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskTitle('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-xs"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            )}
          </>
        )}
        
        {pendingTasks.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => navigate('/admin/platform/tasks')}
          >
            View all {pendingTasks.length} tasks
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformTasksWidget;
