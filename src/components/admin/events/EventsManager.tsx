
import React, { useEffect } from 'react';
import { useEventsManager } from '@/hooks/useEventsManager';
import { useEventsUrlParams } from '@/hooks/useEventsUrlParams';
import EventsEditorLayout from './EventsEditorLayout';

const EventsManager = () => {
  const {
    events,
    isLoading,
    categories,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions,
    enhancingId,
    isEnhancing
  } = useEventsManager();

  useEventsUrlParams(handleAddNew);

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      // Reset to default state - this will cause useEventsManager to refresh
      window.location.reload();
    };

    window.addEventListener('resetEventsManager', handleReset);
    return () => window.removeEventListener('resetEventsManager', handleReset);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading events...</div>
      </div>
    );
  }

  return (
    <EventsEditorLayout
      events={events}
      categories={categories}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onEnhance={handleEnhanceItem}
      isEnhancing={isEnhancing}
      enhancingId={enhancingId}
      getSuggestions={getSuggestions}
    />
  );
};

export default EventsManager;
