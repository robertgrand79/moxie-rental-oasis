
import React from 'react';
import { Card } from '@/components/ui/card';
import { useEventsManager } from '@/hooks/useEventsManager';
import { useEventsUrlParams } from '@/hooks/useEventsUrlParams';
import EventForm from './EventForm';
import EventsHeader from './EventsHeader';
import EventsList from './EventsList';

const EventsManager = () => {
  const {
    events,
    isLoading,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    editingEvent,
    enhancingId,
    isEnhancing,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  } = useEventsManager();

  useEventsUrlParams(handleAddNew);

  if (isLoading) {
    return (
      <Card>
        <EventsHeader 
          onAddNew={handleAddNew}
        />
        <div className="p-6">
          <div className="text-center py-8">Loading events...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <EventsHeader 
        onAddNew={handleAddNew}
      />

      <EventsList
        events={events}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnhance={handleEnhanceItem}
        isEnhancing={isEnhancing}
        enhancingId={enhancingId}
        getSuggestions={getSuggestions}
      />

      <EventForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingEvent={editingEvent}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </Card>
  );
};

export default EventsManager;
