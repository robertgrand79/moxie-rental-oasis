
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTaskManagement';
import { Calendar, MapPin, Trash2, User, Plus, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder?: (task: Task) => void;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-gray-200' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-200' },
  { id: 'review', title: 'Review', color: 'border-yellow-200' },
  { id: 'done', title: 'Done', color: 'border-green-200' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const TaskKanbanBoard = ({ 
  tasks, 
  onTaskClick, 
  onStatusChange, 
  onDeleteTask,
  onCreateWorkOrder 
}: TaskKanbanBoardProps) => {
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onStatusChange(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.id);
        
        return (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <Badge variant="outline">{columnTasks.length}</Badge>
            </div>
            
            <div
              className={cn(
                "min-h-[500px] p-4 rounded-lg border-2 border-dashed",
                column.color
              )}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
            >
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle 
                          className="text-sm cursor-pointer hover:text-blue-600"
                          onClick={() => onTaskClick(task)}
                        >
                          {task.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-2">
                      {task.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge className={priorityColors[task.priority as keyof typeof priorityColors]} variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        {task.project && (
                          <div className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            <span>{task.project.title}</span>
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Assigned</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {onCreateWorkOrder && (task.category === 'repairs' || task.category === 'maintenance') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCreateWorkOrder(task)}
                          className="w-full mt-2"
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Create Work Order
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanBoard;
