
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

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
      {event.image_url && (
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {categoryLabels[event.category as keyof typeof categoryLabels] || event.category}
            </Badge>
          </div>
          {event.is_featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 text-white">Featured</Badge>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

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
          {event.ticket_url && (
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
            <Button size="sm" variant="outline" className="flex-1" asChild>
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
