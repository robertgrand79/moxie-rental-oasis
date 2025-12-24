import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Represents a generated event from AI or external sources
 */
export interface GeneratedEvent {
  title?: string;
  description?: string;
  category?: string;
  event_date?: string;
  time_start?: string;
  time_end?: string;
  location?: string;
  price_range?: string;
  is_featured?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  ticket_url?: string;
  website_url?: string;
  image_url?: string;
}

interface GeneratedEventCardProps {
  event: GeneratedEvent;
  onApplySelected: (event: GeneratedEvent) => void;
}

const GeneratedEventCard = ({ event, onApplySelected }: GeneratedEventCardProps) => {
  // Safety check for event object
  if (!event || typeof event !== 'object') {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{event.title || 'Untitled Event'}</h4>
            <Badge variant="outline">{event.category || 'Uncategorized'}</Badge>
            {event.is_featured && <Badge>Featured</Badge>}
          </div>
          <p className="text-sm text-gray-600 mb-2">{event.description || 'No description available'}</p>
          <div className="text-sm text-gray-500">
            <p>📅 {event.event_date || 'Date TBD'} {event.time_start && `at ${event.time_start}`}</p>
            {event.location && <p>📍 {event.location}</p>}
            {event.price_range && <p>💰 {event.price_range}</p>}
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => onApplySelected(event)}
          variant="outline"
        >
          Add This Event
        </Button>
      </div>
    </Card>
  );
};

export default GeneratedEventCard;
