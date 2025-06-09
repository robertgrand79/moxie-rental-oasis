
import { useState } from 'react';
import { useEugeneEvents, EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import { EventFormData } from '@/components/admin/events/EventFormFields';

export const useEventsManager = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEugeneEvents();
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EugeneEvent | null>(null);

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

  const handleEnhanceItem = async (item: EugeneEvent) => {
    // Enhancement functionality can be handled through the unified AI chat
    console.log('Enhancement can be done through the AI Assistant', item);
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
    editingEvent,
    enhancingId: null,
    isEnhancing: false,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  };
};
