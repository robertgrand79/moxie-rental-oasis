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
import { Card, CardContent } from '@/components/ui/card';
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

interface EventsGridProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onView?: (event: Event) => void;
}

const EventsGrid = ({ events, onEdit, onView }: EventsGridProps) => {
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
      ? 'bg-green-500' 
      : 'bg-yellow-500';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
            {/* Status indicator stripe */}
            <div className={`h-1 ${getStatusColor(event.status)}`} />
            
            <CardContent className="p-4">
              {/* Header: Badges */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
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
                </div>
                {event.category && (
                  <Badge className={`${getCategoryColor(event.category)} text-xs`}>
                    {event.category}
                  </Badge>
                )}
              </div>

              {/* Title - Clickable for View */}
              <h3 
                className="font-semibold text-lg mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                onClick={() => onView?.(event)}
              >
                {event.title}
              </h3>

              {/* Date, Time, Location */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  {formatEventDate(event.event_date)}
                </div>
                
                {event.time_start && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 shrink-0" />
                    {event.time_start}{event.time_end && ` - ${event.time_end}`}
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              {/* Price Range */}
              {event.price_range && (
                <div className="text-sm font-medium text-green-600 mb-4">
                  {event.price_range}
                </div>
              )}

              {/* Footer: Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={!event.website_url}
                        onClick={() => event.website_url && window.open(event.website_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </Button>
                    </TooltipTrigger>
                    {!event.website_url && (
                      <TooltipContent>No website URL available</TooltipContent>
                    )}
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
                        <Ticket className="h-4 w-4 mr-1" />
                        Tickets
                      </Button>
                    </TooltipTrigger>
                    {!event.ticket_url && (
                      <TooltipContent>No ticket URL available</TooltipContent>
                    )}
                  </Tooltip>
                </div>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default EventsGrid;
