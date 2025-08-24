
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvents, Event } from '@/hooks/useEvents';
import EventsGrid from './EventsGrid';
import EventsListView from './EventsListView';
import EventsViewToggle from './EventsViewToggle';
import EventForm from './EventForm';

const EventsManager = () => {
  const { events, isLoading } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'dining', label: 'Dining' },
    { value: 'culture', label: 'Culture' },
    { value: 'sports', label: 'Sports' },
    { value: 'community', label: 'Community' },
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

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
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                {view === 'grid' ? (
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
