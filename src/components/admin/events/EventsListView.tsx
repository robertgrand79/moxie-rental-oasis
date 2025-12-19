import React from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink,
  Ticket,
  Eye,
  RefreshCw,
  CheckCircle,
  FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Event, useDeleteEvent, useUpdateEvent } from '@/hooks/useEvents';

interface EventsListViewProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onView?: (event: Event) => void;
}

const EventsListView = ({ events, onEdit, onView }: EventsListViewProps) => {
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  const handleDelete = (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      deleteEvent.mutate(event.id);
    }
  };

  const handleTogglePublish = (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    updateEvent.mutate({ id: event.id, status: newStatus });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      outdoor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      dining: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      culture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      sports: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      community: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'border-l-green-500' 
      : 'border-l-yellow-500';
  };

  const formatEventDate = (eventDate: string) => {
    const date = new Date(eventDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No events found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow border-l-4 ${getStatusColor(event.status)}`}
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 
                    className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onView?.(event)}
                  >
                    {event.title}
                  </h3>
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {event.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                  {event.is_featured && (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {event.is_recurring && (
                    <Badge variant="outline" className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                  {event.category && (
                    <Badge className={`${getCategoryColor(event.category)} text-xs`}>
                      {event.category}
                    </Badge>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatEventDate(event.event_date)}
                  </div>
                  
                  {event.time_start && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.time_start}{event.time_end && ` - ${event.time_end}`}
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate max-w-[150px]">{event.location}</span>
                    </div>
                  )}
                  
                  {event.price_range && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      {event.price_range}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={!event.website_url}
                    onClick={() => event.website_url && window.open(event.website_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {event.website_url ? 'Open Website' : 'No website URL'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={!event.ticket_url}
                    onClick={() => event.ticket_url && window.open(event.ticket_url, '_blank')}
                  >
                    <Ticket className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {event.ticket_url ? 'Open Tickets' : 'No ticket URL'}
                </TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => onView?.(event)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(event)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePublish(event)}>
                    {event.status === 'published' ? (
                      <>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(event)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default EventsListView;
