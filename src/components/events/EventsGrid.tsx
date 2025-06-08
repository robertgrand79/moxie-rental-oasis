
import React from 'react';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import EventCard from './EventCard';

interface EventsGridProps {
  events: EugeneEvent[];
}

const EventsGrid = ({ events }: EventsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventsGrid;
