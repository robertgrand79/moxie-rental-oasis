import React, { useState, useMemo } from 'react';
import { useEvents, Event } from '@/hooks/useEvents';
import { useQueryClient } from '@tanstack/react-query';
import EventsGrid from './EventsGrid';
import EventsListView from './EventsListView';
import EventForm from './EventForm';
import EventDetailPanel from './EventDetailPanel';
import ModernEventsHeader from './ModernEventsHeader';
import { isEventPast, isEventUpcoming } from '@/utils/eventDateUtils';

const EventsManager = () => {
  const { events, isLoading } = useEvents();
  const queryClient = useQueryClient();
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'archived'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Split events into upcoming and archived
  const { upcomingEvents, archivedEvents, featuredCount, topCategory } = useMemo(() => {
    const upcoming = events.filter(isEventUpcoming);
    const archived = events.filter(isEventPast);
    const featured = events.filter(e => e.is_featured).length;
    
    // Find top category
    const categoryCounts = events.reduce((acc, event) => {
      if (event.category) {
        acc[event.category] = (acc[event.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topCat = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    return { 
      upcomingEvents: upcoming, 
      archivedEvents: archived,
      featuredCount: featured,
      topCategory: topCat
    };
  }, [events]);

  // Get events based on time filter
  const timeFilteredEvents = timeFilter === 'upcoming' ? upcomingEvents : archivedEvents;

  // Apply search and category filters
  const filteredEvents = useMemo(() => {
    let filtered = timeFilteredEvents;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [timeFilteredEvents, categoryFilter, searchQuery]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleView = (event: Event) => {
    setViewingEvent(event);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleCloseView = () => {
    setViewingEvent(null);
  };

  const handleSwitchToEdit = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      setViewingEvent(null);
      setIsFormOpen(true);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ModernEventsHeader
        totalEvents={events.length}
        upcomingEvents={upcomingEvents.length}
        archivedEvents={archivedEvents.length}
        featuredEvents={featuredCount}
        topCategory={topCategory}
        onAddEvent={handleAddNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={handleRefresh}
      />

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || categoryFilter !== 'all'
            ? 'No events match your filters.'
            : timeFilter === 'upcoming' 
              ? 'No upcoming events.' 
              : 'No archived events.'}
        </div>
      ) : viewMode === 'grid' ? (
        <EventsGrid events={filteredEvents} onEdit={handleEdit} onView={handleView} />
      ) : (
        <EventsListView events={filteredEvents} onEdit={handleEdit} onView={handleView} />
      )}

      {/* Event Form Modal */}
      {isFormOpen && (
        <EventForm
          event={editingEvent}
          onClose={handleCloseForm}
        />
      )}

      {/* Event Detail Panel */}
      {viewingEvent && (
        <EventDetailPanel
          event={viewingEvent}
          onClose={handleCloseView}
          onEdit={handleSwitchToEdit}
        />
      )}
    </div>
  );
};

export default EventsManager;
