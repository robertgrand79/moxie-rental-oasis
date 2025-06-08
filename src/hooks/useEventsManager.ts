
import { useState } from 'react';
import { useEugeneEvents, EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import { EventFormData } from '@/components/admin/events/EventFormFields';

export const useEventsManager = () => {
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

  const getSuggestions = (event: EugeneEvent) => {
    return [
      ...getLocationBasedSuggestions(event.location || '', event.id, 'event'),
      ...getCategoryBasedSuggestions(event.category || '', event.id, 'event')
    ].slice(0, 3);
  };

  return {
    events,
    isLoading,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    isAIDialogOpen,
    setIsAIDialogOpen,
    editingEvent,
    enhancingId,
    isEnhancing,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleAIGeneration,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  };
};
