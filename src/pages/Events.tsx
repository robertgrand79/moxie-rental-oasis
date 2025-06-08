
import React from 'react';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import EventsHeader from '@/components/events/EventsHeader';
import EventsGrid from '@/components/events/EventsGrid';
import EventsEmptyState from '@/components/events/EventsEmptyState';
import EventsLoadingState from '@/components/events/EventsLoadingState';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Events = () => {
  const { events, loading, error } = useEugeneEvents();

  if (loading) return <EventsLoadingState />;

  return (
    <BackgroundWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
            <EventsHeader />
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading events: {error}</p>
              </div>
            ) : events.length > 0 ? (
              <EventsGrid events={events} />
            ) : (
              <EventsEmptyState />
            )}
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Events;
