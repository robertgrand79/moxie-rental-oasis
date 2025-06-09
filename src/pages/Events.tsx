
import React from 'react';
import EventsHeader from '@/components/events/EventsHeader';
import EventsGrid from '@/components/events/EventsGrid';
import EventsLoadingState from '@/components/events/EventsLoadingState';
import EventsEmptyState from '@/components/events/EventsEmptyState';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';

const Events = () => {
  const { events, isLoading } = useEugeneEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <EventsHeader />
        
        {isLoading ? (
          <EventsLoadingState />
        ) : events.length === 0 ? (
          <EventsEmptyState />
        ) : (
          <EventsGrid events={events} />
        )}
      </div>
    </div>
  );
};

export default Events;
