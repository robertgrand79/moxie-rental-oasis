
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyTask } from '@/hooks/property-management/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Plus, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyTasksDashboardProps {
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (taskId: string, status: PropertyTask['status']) => void;
}

const MyTasksDashboard = ({ onTaskClick, onStatusChange }: MyTasksDashboardProps) => {
  const [myTasks, setMyTasks] = useState<PropertyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          property_tasks!inner(
            id,
            title,
            description,
            type,
            status,
            priority,
            due_date,
            estimated_hours,
            created_at,
            property:properties(id, title),
            project:property_projects(id, title),
            task_type:custom_task_types(id, name, color, icon)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const tasks = data?.map(item => item.property_tasks).filter(Boolean) || [];
      setMyTasks(tasks as PropertyTask[]);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      pending: myTasks.filter(t => t.status === 'pending').length,
      in_progress: myTasks.filter(t => t.status === 'in_progress').length,
      completed: myTasks.filter(t => t.status === 'completed').length,
      blocked: myTasks.filter(t => t.status === 'blocked').length,
    };
    return stats;
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return myTasks.filter(task => 
      task.due_date && 
      task.status !== 'completed' && 
      new Date(task.due_date) < today
    );
  };

  const getDueTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return myTasks.filter(task => 
      task.due_date === today && 
      task.status !== 'completed'
    );
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return myTasks.filter(task => 
      task.due_date && 
      task.status !== 'completed' &&
      new Date(task.due_date) > today &&
      new Date(task.due_date) <= nextWeek
    );
  };

  const handleQuickStatusChange = async (task: PropertyTask, newStatus: PropertyTask['status']) => {
    try {
      await onStatusChange(task.id, newStatus);
      // Refresh the tasks
      await fetchMyTasks();
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    blocked: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = getStatusStats();
  const overdueTasks = getOverdueTasks();
  const dueTodayTasks = getDueTodayTasks();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Tasks</h2>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{myTasks.length} total tasks</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
              </div>
              <Plus className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-2xl font-bold">{stats.blocked}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Overdue ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.slice(0, 5).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskClick={onTaskClick}
                  onStatusChange={handleQuickStatusChange}
                  priorityColors={priorityColors}
                  statusColors={statusColors}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Due Today */}
        {dueTodayTasks.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-yellow-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Due Today ({dueTodayTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueTodayTasks.slice(0, 5).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskClick={onTaskClick}
                  onStatusChange={handleQuickStatusChange}
                  priorityColors={priorityColors}
                  statusColors={statusColors}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        {upcomingTasks.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming ({upcomingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.slice(0, 5).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskClick={onTaskClick}
                  onStatusChange={handleQuickStatusChange}
                  priorityColors={priorityColors}
                  statusColors={statusColors}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* All My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>All My Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks assigned to you yet.</p>
            </div>
          ) : (
            myTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick}
                onStatusChange={handleQuickStatusChange}
                priorityColors={priorityColors}
                statusColors={statusColors}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onTaskClick, 
  onStatusChange, 
  priorityColors, 
  statusColors 
}: {
  task: PropertyTask;
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (task: PropertyTask, status: PropertyTask['status']) => void;
  priorityColors: Record<string, string>;
  statusColors: Record<string, string>;
}) => {
  return (
    <div 
      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <div className="flex gap-1">
          <Badge className={priorityColors[task.priority]} variant="outline" size="sm">
            {task.priority}
          </Badge>
          <Badge className={statusColors[task.status]} variant="outline" size="sm">
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.property && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{task.property.title}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {task.status !== 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus = task.status === 'pending' ? 'in_progress' : 
                               task.status === 'in_progress' ? 'completed' : 'pending';
              onStatusChange(task, nextStatus);
            }}
            className="text-xs"
          >
            {task.status === 'pending' ? 'Start' : 
             task.status === 'in_progress' ? 'Complete' : 'Activate'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MyTasksDashboard;
