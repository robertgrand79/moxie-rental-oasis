
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Ticket } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { format, parseISO } from 'date-fns';

const categoryLabels = {
  festival: 'Festival',
  sports: 'Sports',
  arts: 'Arts & Culture',
  food: 'Food & Drink',
  outdoor: 'Outdoor'
};

interface EventCardProps {
  event: EugeneEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    const startDate = parseISO(dateStr);
    if (endDateStr && endDateStr !== dateStr) {
      const endDate = parseISO(endDateStr);
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    return format(startDate, 'MMM d, yyyy');
  };

  // Check if event is in the past
  const isPastEvent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const isEventPast = isPastEvent();

  return (
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white ${isEventPast ? 'opacity-75' : ''}`}>
      {event.image_url && (
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={event.image_url}
            alt={event.title}
            className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${isEventPast ? 'grayscale-[30%]' : ''}`}
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {categoryLabels[event.category as keyof typeof categoryLabels] || event.category}
            </Badge>
            {isEventPast && (
              <Badge variant="outline" className="bg-white/90 text-gray-600 border-gray-300">
                Past Event
              </Badge>
            )}
          </div>
          {event.is_featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 text-white">Featured</Badge>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold group-hover:text-blue-600 transition-colors ${isEventPast ? 'text-gray-600' : 'text-gray-900'}`}>
            {event.title}
          </h3>
          {isEventPast && !event.image_url && (
            <Badge variant="outline" className="text-gray-600 border-gray-300 ml-2">
              Past Event
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatEventDate(event.event_date, event.end_date)}</span>
          </div>

          {event.time_start && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {event.time_start}
                {event.time_end && ` - ${event.time_end}`}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.price_range && (
            <div className="flex items-center">
              <Ticket className="h-4 w-4 mr-2" />
              <span>{event.price_range}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {/* Hide ticket button for past events */}
          {event.ticket_url && !isEventPast && (
            <Button size="sm" className="flex-1" asChild>
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ticket className="h-4 w-4 mr-1" />
                Tickets
              </a>
            </Button>
          )}
          {event.website_url && (
            <Button 
              size="sm" 
              variant="outline" 
              className={`${event.ticket_url && !isEventPast ? 'flex-1' : 'w-full'}`} 
              asChild
            >
              <a
                href={event.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Details
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
