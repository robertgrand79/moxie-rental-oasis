
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Music, Trees, UtensilsCrossed, Palette, Trophy, Users, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvents, Event } from '@/hooks/useEvents';
import EventsGrid from './EventsGrid';
import EventsListView from './EventsListView';
import EventsViewToggle from './EventsViewToggle';
import EventForm from './EventForm';
import { isEventPast, isEventUpcoming } from '@/utils/eventDateUtils';

const EventsManager = () => {
  const { events, isLoading } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'archived'>('upcoming');

  const categories = [
    { value: 'all', label: 'All Events', icon: Calendar, shortLabel: 'All' },
    { value: 'entertainment', label: 'Entertainment', icon: Music, shortLabel: 'Shows' },
    { value: 'outdoor', label: 'Outdoor', icon: Trees, shortLabel: 'Outdoor' },
    { value: 'dining', label: 'Dining', icon: UtensilsCrossed, shortLabel: 'Food' },
    { value: 'culture', label: 'Culture', icon: Palette, shortLabel: 'Culture' },
    { value: 'sports', label: 'Sports', icon: Trophy, shortLabel: 'Sports' },
    { value: 'community', label: 'Community', icon: Users, shortLabel: 'Community' },
  ];

  // Split events into upcoming and archived
  const { upcomingEvents, archivedEvents } = useMemo(() => {
    const upcoming = events.filter(isEventUpcoming);
    const archived = events.filter(isEventPast);
    return { upcomingEvents: upcoming, archivedEvents: archived };
  }, [events]);

  // Get events based on time filter
  const timeFilteredEvents = timeFilter === 'upcoming' ? upcomingEvents : archivedEvents;

  // Apply category filter
  const filteredEvents = selectedCategory === 'all' 
    ? timeFilteredEvents 
    : timeFilteredEvents.filter(event => event.category === selectedCategory);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Events Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage all local events, festivals, and community activities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <EventsViewToggle view={view} onViewChange={setView} />
            <Button onClick={handleAddNew} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time-based tabs (Upcoming / Archived) */}
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as 'upcoming' | 'archived')}>
            <TabsList className="w-auto">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Upcoming Events</span>
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {upcomingEvents.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span>Archived</span>
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {archivedEvents.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category filter tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7 h-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <category.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {timeFilter === 'upcoming' 
                      ? 'No upcoming events in this category.' 
                      : 'No archived events in this category.'}
                  </div>
                ) : view === 'grid' ? (
                  <EventsGrid events={filteredEvents} onEdit={handleEdit} />
                ) : (
                  <EventsListView events={filteredEvents} onEdit={handleEdit} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {isFormOpen && (
        <EventForm
          event={editingEvent}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default EventsManager;
