
import React from 'react';
import { Card } from '@/components/ui/card';
import { useEventsManager } from '@/hooks/useEventsManager';
import { useEventsUrlParams } from '@/hooks/useEventsUrlParams';
import AIGenerationDialog from '@/components/admin/AIGenerationDialog';
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
  } = useEventsManager();

  useEventsUrlParams(handleAddNew);

  const eventCategories = categories.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  if (isLoading) {
    return (
      <Card>
        <EventsHeader 
          onAddNew={handleAddNew}
          onOpenAIDialog={() => setIsAIDialogOpen(true)}
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
        onOpenAIDialog={() => setIsAIDialogOpen(true)}
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
