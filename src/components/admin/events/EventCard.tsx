
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Edit, Trash2, ExternalLink, Ticket, Sparkles } from 'lucide-react';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { format } from 'date-fns';
import ContentSuggestions from '@/components/admin/ContentSuggestions';

interface EventCardProps {
  event: EugeneEvent;
  categories: Array<{ value: string; label: string }>;
  onEdit: (event: EugeneEvent) => void;
  onDelete: (id: string) => void;
  onEnhance: (event: EugeneEvent) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  suggestions: Array<any>;
}

const EventCard = ({ 
  event, 
  categories, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId, 
  suggestions 
}: EventCardProps) => {
  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    if (!dateStr) return '';
    try {
      const startDate = new Date(dateStr);
      if (endDateStr && endDateStr !== dateStr) {
        const endDate = new Date(endDateStr);
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
      return format(startDate, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{event.title}</h4>
              <div className="flex gap-1">
                {event.is_featured && (
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                )}
                {!event.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {event.is_recurring && (
                  <Badge variant="outline">Recurring</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Badge variant="secondary" className="mr-3">
                {categories.find(c => c.value === event.category)?.label || event.category}
              </Badge>
              <Calendar className="h-4 w-4 mr-1" />
              <span className="mr-4">{formatEventDate(event.event_date, event.end_date)}</span>
              {event.time_start && (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-4">
                    {event.time_start}
                    {event.time_end && ` - ${event.time_end}`}
                  </span>
                </>
              )}
              {event.location && (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </>
              )}
            </div>

            {event.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
            )}

            {(event.website_url || event.ticket_url) && (
              <div className="flex gap-2">
                {event.website_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={event.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
                {event.ticket_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-3 w-3 mr-1" />
                      Tickets
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEnhance(event)}
              disabled={isEnhancing && enhancingId === event.id}
            >
              {isEnhancing && enhancingId === event.id ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="mt-4">
            <ContentSuggestions
              suggestions={suggestions}
              title="Related Content"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
