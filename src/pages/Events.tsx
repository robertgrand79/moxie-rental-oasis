import React, { useState } from 'react';
import EventsHeader from '@/components/events/EventsHeader';
import EventsGrid from '@/components/events/EventsGrid';
import EventsLoadingState from '@/components/events/EventsLoadingState';
import EventsEmptyState from '@/components/events/EventsEmptyState';
import EventsFilters from '@/components/events/EventsFilters';
import { useTenantLocalEvents } from '@/hooks/useTenantLocalEvents';

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  
  const { events, isLoading } = useTenantLocalEvents(timeFilter, selectedCategory);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setTimeFilter('upcoming');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <EventsHeader />
        
        <EventsFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
        
        {isLoading ? (
          <EventsLoadingState />
        ) : events.length === 0 ? (
          <EventsEmptyState onClearFilters={handleClearFilters} />
        ) : (
          <EventsGrid events={events} />
        )}
      </div>
    </div>
  );
};

export default Events;
