import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event, useDeleteEvent } from '@/hooks/useEvents';

interface EventsListViewProps {
  events: Event[];
  onEdit: (event: Event) => void;
}

const EventsListView = ({ events, onEdit }: EventsListViewProps) => {
  const deleteEvent = useDeleteEvent();

  const handleDelete = (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      deleteEvent.mutate(event.id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      entertainment: 'bg-purple-100 text-purple-800',
      outdoor: 'bg-green-100 text-green-800',
      dining: 'bg-orange-100 text-orange-800',
      culture: 'bg-blue-100 text-blue-800',
      sports: 'bg-red-100 text-red-800',
      community: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const formatEventDate = (eventDate: string, timeStart?: string) => {
    const date = new Date(eventDate);
    const dateStr = date.toLocaleDateString();
    return timeStart ? `${dateStr} at ${timeStart}` : dateStr;
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-4 flex-1">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                {event.is_featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {event.category && (
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                )}
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              </div>
              
              {event.description && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                  {event.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatEventDate(event.event_date, event.time_start)}
                </div>
                
                {event.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                )}
                
                {event.time_start && event.time_end && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {event.time_start} - {event.time_end}
                  </div>
                )}
                
                {event.website_url && (
                  <div className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {event.price_range && (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {event.price_range}
              </span>
            )}
            
            {event.is_recurring && (
              <Badge variant="outline" className="text-xs">
                Recurring
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(event)}
                  className="text-destructive"
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
  );
};

export default EventsListView;