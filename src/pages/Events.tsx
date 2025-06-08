
import React, { useState } from 'react';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import EventsHeader from '@/components/events/EventsHeader';
import EventsFilters from '@/components/events/EventsFilters';
import EventsGrid from '@/components/events/EventsGrid';
import EventsEmptyState from '@/components/events/EventsEmptyState';
import EventsLoadingState from '@/components/events/EventsLoadingState';
import ChatWidget from '@/components/chat/ChatWidget';

const Events = () => {
  const { events, isLoading } = useEugeneEvents();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all'); // Changed from 'upcoming' to 'all'

  // Filter events based on selected criteria
  const filteredEvents = events.filter(event => {
    if (!event.is_active) return false;
    
    const eventDate = new Date(event.event_date);
    const now = new Date();
    
    // Time filter
    if (timeFilter === 'upcoming' && eventDate < now) return false;
    if (timeFilter === 'past' && eventDate >= now) return false;
    
    // Category filter
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setTimeFilter('all');
  };

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
          <div className="container mx-auto px-4 py-16">
            <EventsLoadingState />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
            <EventsHeader />
            
            <EventsFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />

            {filteredEvents.length > 0 ? (
              <EventsGrid events={filteredEvents} />
            ) : (
              <EventsEmptyState onClearFilters={handleClearFilters} />
            )}
          </div>
        </div>
        <Footer />
      </div>
      <ChatWidget />
    </>
  );
};

export default Events;
