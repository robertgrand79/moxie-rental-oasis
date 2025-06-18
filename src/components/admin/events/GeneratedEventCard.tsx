
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface GeneratedEventCardProps {
  event: any;
  onApplySelected: (event: any) => void;
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
