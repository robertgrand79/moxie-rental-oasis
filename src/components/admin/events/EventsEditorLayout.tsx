
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Sparkles } from 'lucide-react';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import EventsEditorForm from './EventsEditorForm';
import EventsPreview from './EventsPreview';
import EventsAllFieldsGenerator from './EventsAllFieldsGenerator';
import EventsList from './EventsList';

interface EventsEditorLayoutProps {
  events: EugeneEvent[];
  categories: Array<{ value: string; label: string }>;
  isLoading: boolean;
  onSubmit: (data: any) => Promise<void>;
  onEdit: (event: EugeneEvent) => void;
  onDelete: (id: string) => void;
  onEnhance: (event: EugeneEvent) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (event: EugeneEvent) => any[];
}

const EventsEditorLayout = ({
  events,
  categories,
  isLoading,
  onSubmit,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions
}: EventsEditorLayoutProps) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingEvent, setEditingEvent] = useState<EugeneEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    time_start: '',
    time_end: '',
    location: '',
    category: 'festival',
    image_url: '',
    website_url: '',
    ticket_url: '',
    price_range: '',
    is_featured: false,
    is_active: true,
    is_recurring: false,
    recurrence_pattern: '',
    created_by: ''
  });

  const handleEdit = (event: EugeneEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      end_date: event.end_date || '',
      time_start: event.time_start || '',
      time_end: event.time_end || '',
      location: event.location || '',
      category: event.category || 'festival',
      image_url: event.image_url || '',
      website_url: event.website_url || '',
      ticket_url: event.ticket_url || '',
      price_range: event.price_range || '',
      is_featured: event.is_featured || false,
      is_active: event.is_active !== false,
      is_recurring: event.is_recurring || false,
      recurrence_pattern: event.recurrence_pattern || '',
      created_by: event.created_by
    });
    setActiveTab('editor');
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      time_start: '',
      time_end: '',
      location: '',
      category: 'festival',
      image_url: '',
      website_url: '',
      ticket_url: '',
      price_range: '',
      is_featured: false,
      is_active: true,
      is_recurring: false,
      recurrence_pattern: '',
      created_by: ''
    });
    setActiveTab('editor');
  };

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    setActiveTab('list');
  };

  const handleAIGenerated = (generatedEvents: any[]) => {
    // Handle multiple generated events
    generatedEvents.forEach(event => {
      onSubmit(event);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Eugene Events</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('list')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Events List
            </Button>
            <Button
              variant={activeTab === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={handleAddNew}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generator
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="list">
            <EventsList
              events={events}
              categories={categories}
              onEdit={handleEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
              getSuggestions={getSuggestions}
            />
            <div className="mt-4">
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <EventsEditorForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              editingEvent={editingEvent}
              onSubmit={handleSubmit}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>

          <TabsContent value="ai">
            <EventsAllFieldsGenerator
              onEventsGenerated={handleAIGenerated}
              existingEvents={events}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EventsEditorLayout;
