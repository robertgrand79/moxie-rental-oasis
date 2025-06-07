
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wand2 } from 'lucide-react';
import { useEugeneEvents, EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import AIGenerationDialog from '@/components/admin/AIGenerationDialog';
import EventForm from './EventForm';
import EventCard from './EventCard';
import { EventFormData } from './EventFormFields';

const EventsManager = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEugeneEvents();
  const { user } = useAuth();
  const { enhanceContent, isEnhancing } = useAIContentGeneration();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EugeneEvent | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const categories = [
    { value: 'festival', label: 'Festival' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'music', label: 'Music' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const handleSubmit = async (formData: EventFormData) => {
    if (!formData.title || !formData.event_date) {
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, ...formData });
      } else {
        await createEvent.mutateAsync(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
  };

  const handleEdit = (event: EugeneEvent) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const eventCategories = categories.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  const handleAIGeneration = async (content: any[]) => {
    for (const item of content) {
      try {
        const defaultImageUrl = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
        
        await createEvent.mutateAsync({
          title: item.title,
          description: item.description,
          event_date: item.event_date || new Date().toISOString().split('T')[0],
          end_date: item.end_date || '',
          time_start: item.time_start || '',
          time_end: item.time_end || '',
          location: item.location || 'Eugene, Oregon',
          category: item.category || 'festival',
          image_url: item.image_url || defaultImageUrl,
          website_url: item.website_url || '',
          ticket_url: item.ticket_url || '',
          price_range: item.price_range || '',
          is_featured: false,
          is_active: true,
          is_recurring: false,
          recurrence_pattern: '',
          created_by: user?.id || ''
        });
      } catch (error) {
        console.error('Error saving AI-generated event:', error);
      }
    }
  };

  const handleEnhanceItem = async (item: EugeneEvent) => {
    setEnhancingId(item.id);
    try {
      const enhanced = await enhanceContent('events', item);
      if (enhanced) {
        await updateEvent.mutateAsync({
          id: item.id,
          ...enhanced
        });
      }
    } finally {
      setEnhancingId(null);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eugene Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Eugene Events</CardTitle>
            <CardDescription>
              Manage local events and activities to showcase to guests
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAIDialogOpen(true)}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </CardHeader>

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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onEnhance={handleEnhanceItem}
                isEnhancing={isEnhancing}
                enhancingId={enhancingId}
                suggestions={[
                  ...getLocationBasedSuggestions(event.location || '', event.id, 'event'),
                  ...getCategoryBasedSuggestions(event.category || '', event.id, 'event')
                ].slice(0, 3)}
              />
            ))
          )}
        </div>
      </CardContent>

      <EventForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingEvent={editingEvent}
        onSubmit={handleSubmit}
        categories={categories}
      />

      <AIGenerationDialog
        isOpen={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        type="events"
        categories={eventCategories}
        onContentGenerated={handleAIGeneration}
      />
    </Card>
  );
};

export default EventsManager;
