import React from 'react';
import { CardContent } from '@/components/ui/card';
import { LocalEvent } from '@/hooks/useLocalEvents';
import EventCard from './EventCard';

interface EventsListProps {
  events: LocalEvent[];
  categories: Array<{ value: string; label: string }>;
  onEdit: (event: LocalEvent) => void;
  onDelete: (id: string) => void;
  onEnhance: (event: LocalEvent) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (event: LocalEvent) => any[];
}

const EventsList = ({ 
  events, 
  categories, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId, 
  getSuggestions 
}: EventsListProps) => {
  return (
    <CardContent>
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events found. Add your first event to get started.
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
              suggestions={getSuggestions(event)}
            />
          ))
        )}
      </div>
    </CardContent>
  );
};

export default EventsList;
