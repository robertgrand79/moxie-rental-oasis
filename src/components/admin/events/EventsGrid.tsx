import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, MapPin, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event, useDeleteEvent } from '@/hooks/useEvents';

interface EventsGridProps {
  events: Event[];
  onEdit: (event: Event) => void;
}

const EventsGrid = ({ events, onEdit }: EventsGridProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <div className="relative">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}
            {event.is_featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="bg-white/80">
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
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
              {event.category && (
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              )}
            </div>
            
            {event.description && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {event.description}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {formatEventDate(event.event_date, event.time_start)}
              </div>
              
              {event.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
              )}

              {event.time_start && event.time_end && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.time_start} - {event.time_end}
                </div>
              )}

              {event.price_range && (
                <div className="text-sm font-medium text-green-600">
                  {event.price_range}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
              {event.is_recurring && (
                <Badge variant="outline" className="text-xs">
                  Recurring
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsGrid;