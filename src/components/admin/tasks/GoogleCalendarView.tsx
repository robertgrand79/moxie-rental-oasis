import React, { useState, useMemo } from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';
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
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react';
import { 
  format, 
  isSameDay, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addWeeks, 
  addMonths, 
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
  parseISO
} from 'date-fns';
import GoogleCalendarIntegration from './GoogleCalendarIntegration';

interface GoogleCalendarViewProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onCreateTask: () => void;
}

type ViewMode = 'month' | 'week' | 'day';

const GoogleCalendarView = ({
  tasks,
  onTaskClick,
  onCreateTask,
}: GoogleCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<PropertyTask[]>([]);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);

  const { events: googleEvents, exportTask, calendars } = useGoogleCalendarIntegration();

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (propertyFilter === 'all') return true;
      return task.property_id === propertyFilter;
    });
  }, [tasks, propertyFilter]);

  // Combine tasks and Google Calendar events for display
  const combinedEvents = useMemo(() => {
    const taskEvents = filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.due_date,
      type: 'task' as const,
      priority: task.priority,
      status: task.status,
      data: task,
    }));

    const calendarEvents = googleEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.start_time,
      type: 'google_event' as const,
      priority: 'medium' as const,
      status: 'completed' as const,
      data: event,
    }));

    return [...taskEvents, ...calendarEvents];
  }, [filteredTasks, googleEvents]);

  const getEventsForDate = (date: Date) => {
    return combinedEvents.filter(event => 
      event.date && isSameDay(new Date(event.date), date)
    );
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
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const getCalendarWeeks = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = calendarStart;
    
    while (currentDate <= calendarEnd) {
      currentWeek.push(new Date(currentDate));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return weeks;
  };

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const dayTasks = dayEvents.filter(e => e.type === 'task').map(e => e.data as PropertyTask);
    
    if (dayTasks.length > 0) {
      setSelectedDayTasks(dayTasks);
      setShowTaskDialog(true);
    }
    setSelectedDate(date);
  };

  const renderEventBar = (event: any, index: number) => {
    const eventTime = event.date ? format(new Date(event.date), 'HH:mm') : '';
    const isGoogleEvent = event.type === 'google_event';
    
    return (
      <div
        key={event.id}
        className={`text-xs p-1 mb-1 rounded border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${
          isGoogleEvent 
            ? 'bg-blue-100 text-blue-800 border-blue-500' 
            : `${getPriorityColor(event.priority)} ${getStatusColor(event.status)}`
        } ${
          event.type === 'task' && isOverdue(event.data) ? 'ring-1 ring-red-400' : ''
        }`}
        onClick={() => {
          if (event.type === 'task') {
            onTaskClick(event.data);
          }
        }}
        style={{ zIndex: 10 - index }}
      >
        <div className="font-medium truncate flex items-center gap-1">
          {isGoogleEvent && <ExternalLink className="h-3 w-3" />}
          {event.title}
        </div>
        {eventTime && (
          <div className="text-xs text-gray-600 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {eventTime}
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const weeks = getCalendarWeeks();
    
    return (
      <div className="flex flex-col h-full">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1 grid grid-rows-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
              {week.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, viewDate);
                const isTodayDate = isToday(date);
                const isSelected = isSameDay(date, selectedDate);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`border-r last:border-r-0 p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'
                    } ${isTodayDate ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
                    onClick={() => handleDayClick(date)}
                  >
                    <div className={`text-sm font-medium mb-2 ${isTodayDate ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, index) => renderEventBar(event, index))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-1 py-0.5 bg-gray-100 rounded">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(viewDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="flex flex-col h-full">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center border-r last:border-r-0">
              <div className="font-medium text-gray-700">{format(day, 'EEE')}</div>
              <div className={`text-2xl font-bold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Week grid */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`border-r last:border-r-0 p-3 ${isTodayDate ? 'bg-blue-50' : 'bg-white'}`}
              >
                <div className="space-y-1 h-full">
                  {dayEvents.map((event, index) => renderEventBar(event, index))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(viewDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="border-b bg-gray-50 p-4">
          <div className="text-center">
            <div className="font-medium text-gray-700">{format(viewDate, 'EEEE')}</div>
            <div className={`text-3xl font-bold ${isToday(viewDate) ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(viewDate, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
        
        {/* All-day events */}
        {dayEvents.length > 0 && (
          <div className="border-b p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">All Day</div>
            <div className="space-y-1">
              {dayEvents.map((event, index) => renderEventBar(event, index))}
            </div>
          </div>
        )}
        
        {/* Time slots */}
        <div className="flex-1 overflow-auto">
          {hours.map((hour) => (
            <div key={hour} className="border-b border-gray-100 flex">
              <div className="w-20 p-2 text-right text-sm text-gray-500 border-r">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              <div className="flex-1 p-2 min-h-[60px]">
                {/* Time-based events would go here */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">
                {viewMode === 'month' && format(viewDate, 'MMMM yyyy')}
                {viewMode === 'week' && `${format(startOfWeek(viewDate), 'MMM d')} - ${format(endOfWeek(viewDate), 'MMM d, yyyy')}`}
                {viewMode === 'day' && format(viewDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setViewDate(new Date())}>
                  Today
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowIntegrationDialog(true)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>

              <Button onClick={onCreateTask} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                }`}
                onClick={() => {
                  onTaskClick(task);
                  setShowTaskDialog(false);
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{task.title}</div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} text-white`}>
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
                  {task.due_date && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(task.due_date), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Calendar Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Google Calendar Integration</DialogTitle>
          </DialogHeader>
          <GoogleCalendarIntegration />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoogleCalendarView;
