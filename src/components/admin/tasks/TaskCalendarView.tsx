
import React, { useState, useMemo } from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format, isSameDay, startOfWeek, endOfWeek, addDays, addWeeks, addMonths, startOfDay, endOfDay, isSameWeek, isSameMonth } from 'date-fns';

interface TaskCalendarViewProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onCreateTask: () => void;
}

type ViewMode = 'month' | 'week' | 'day';

const TaskCalendarView = ({
  tasks,
  onTaskClick,
  onCreateTask,
}: TaskCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showDayTasks, setShowDayTasks] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (propertyFilter === 'all') return true;
      return task.property_id === propertyFilter;
    });
  }, [tasks, propertyFilter]);

  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const getTasksForWeek = (date: Date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    return filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (task: PropertyTask) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setViewDate(direction === 'prev' 
        ? addMonths(viewDate, -1) 
        : addMonths(viewDate, 1)
      );
    } else if (viewMode === 'week') {
      setViewDate(direction === 'prev' 
        ? addWeeks(viewDate, -1) 
        : addWeeks(viewDate, 1)
      );
    } else {
      setViewDate(direction === 'prev' 
        ? addDays(viewDate, -1) 
        : addDays(viewDate, 1)
      );
    }
  };

  const properties = Array.from(new Set(tasks.map(task => task.property).filter(Boolean)));

  const renderMonthView = () => (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {format(viewDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={viewDate}
          onMonthChange={setViewDate}
          className="w-full"
          components={{
            Day: ({ date, ...props }) => {
              const dayTasks = getTasksForDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <div className="relative p-2 w-full h-full min-h-[80px]">
                  <button
                    {...props}
                    className={`w-full h-full flex flex-col items-start justify-start p-2 rounded-md hover:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 border-2 border-blue-300' : ''
                    }`}
                    onClick={() => {
                      setSelectedDate(date);
                      if (dayTasks.length > 0) {
                        setShowDayTasks(true);
                      }
                    }}
                  >
                    <span className="text-sm font-medium mb-2">
                      {format(date, 'd')}
                    </span>
                    <div className="flex flex-col gap-1 w-full">
                      {dayTasks.slice(0, 3).map((task, index) => (
                        <div
                          key={task.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(task.priority)} text-white ${
                            isOverdue(task) ? 'ring-1 ring-red-300' : ''
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-xs text-gray-500 px-1">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            }
          }}
        />
      </CardContent>
    </Card>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(viewDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(weekStart, 'MMM d')} - {format(endOfWeek(viewDate), 'MMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded-lg p-3 min-h-[200px] ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="font-medium text-sm mb-2">
                    {format(day, 'EEE d')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white ${
                          isOverdue(task) ? 'ring-1 ring-red-300' : ''
                        }`}
                        onClick={() => onTaskClick(task)}
                        title={task.description}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(viewDate);

    return (
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(viewDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dayTasks.length > 0 ? (
            <div className="space-y-3">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                  }`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-medium">{task.title}</div>
                      <div className="flex gap-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-600">{task.description}</div>
                    )}
                    {task.property && (
                      <div className="text-sm text-gray-600">
                        Property: {task.property.title}
                      </div>
                    )}
                    {isOverdue(task) && (
                      <div className="text-sm text-red-600 font-medium">
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No tasks scheduled</p>
              <p className="text-sm mb-4">Add a task to get started</p>
              <Button onClick={onCreateTask} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>

          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property?.id} value={property?.id || ''}>
                  {property?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date())}
          >
            Today
          </Button>
          <Button onClick={onCreateTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Day Tasks Modal for Month View */}
      <Dialog open={showDayTasks} onOpenChange={setShowDayTasks}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tasks for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDate && getTasksForDate(selectedDate).map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                }`}
                onClick={() => {
                  onTaskClick(task);
                  setShowDayTasks(false);
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{task.title}</div>
                    <div className="flex gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {task.description && (
                    <div className="text-sm text-gray-600">{task.description}</div>
                  )}
                  {task.property && (
                    <div className="text-sm text-gray-600">
                      Property: {task.property.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Priority:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-300"></div>
              <span>Overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendarView;
