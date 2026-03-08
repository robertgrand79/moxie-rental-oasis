import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CheckSquare, 
  Plus, 
  ArrowRight, 
  Clock,
  AlertTriangle,
  X,
  Workflow,
  User
} from 'lucide-react';
import { usePlatformTasks, PlatformTask } from '@/hooks/usePlatformTasks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { PlatformAdminSelect } from '@/components/admin/platform/PlatformAdminSelect';

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    default:
      return null;
  }
};

const getInitials = (name: string | null, email: string | null) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
};

const TaskItem: React.FC<{
  task: PlatformTask;
  onToggle: (task: PlatformTask) => void;
  onAssign: (taskId: string, userId: string | null) => void;
}> = ({ task, onToggle, onAssign }) => {
  const isDue = task.due_date && (isPast(new Date(task.due_date)) || isToday(new Date(task.due_date)));
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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
        <div className="flex items-center gap-2 mt-0.5">
          {task.due_date && (
            <p className={cn(
              'text-xs flex items-center gap-1',
              isDue && task.status !== 'done' ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.status === 'in_progress' && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
            In Progress
          </Badge>
        )}
        <Popover open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              title={task.assignee ? `Assigned to ${task.assignee.full_name || task.assignee.email}` : 'Assign task'}
            >
              {task.assignee ? (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignee.full_name, task.assignee.email)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <PlatformAdminSelect
              value={task.assigned_to}
              onChange={(userId) => {
                onAssign(task.id, userId);
                setIsAssignOpen(false);
              }}
              placeholder="Assign to..."
            />
          </PopoverContent>
        </Popover>
      </div>
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

  const handleAssignTask = (taskId: string, userId: string | null) => {
    updateTask({
      id: taskId,
      assigned_to: userId,
    });
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
                    onAssign={handleAssignTask}
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
            onClick={() => navigate('/admin/platform/workflows')}
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
