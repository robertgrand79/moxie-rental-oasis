import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { LocalEvent } from '@/hooks/useLocalEvents';
import EventsEditorForm from './EventsEditorForm';
import EventsPreview from './EventsPreview';
import EventsAllFieldsGenerator from './EventsAllFieldsGenerator';
import EventsList from './EventsList';
import EventsStatusFilter from './EventsStatusFilter';

interface EventsEditorLayoutProps {
  events: LocalEvent[];
  categories: Array<{ value: string; label: string }>;
  isLoading: boolean;
  onSubmit: (data: any) => Promise<void>;
  onEdit: (event: LocalEvent) => void;
  onDelete: (id: string) => void;
  onEnhance: (event: LocalEvent) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (event: LocalEvent) => any[];
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
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
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
    status: 'draft',
    created_by: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset function for navigation
  const resetToDefaultState = () => {
    setActiveTab('list');
    setEditingEvent(null);
    setStatusFilter('all');
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
      status: 'draft',
      created_by: ''
    });
    setHasUnsavedChanges(false);
    toast.success('Events editor reset to default view');
  };

  // Listen for reset events from navigation
  useEffect(() => {
    window.addEventListener('resetEventsManager', resetToDefaultState);
    return () => window.removeEventListener('resetEventsManager', resetToDefaultState);
  }, []);

  // Filter events based on status
  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return events;
    return events.filter(event => event.status === statusFilter);
  }, [events, statusFilter]);

  // Calculate event counts for filter badges
  const eventCounts = useMemo(() => ({
    all: events.length,
    draft: events.filter(event => event.status === 'draft').length,
    published: events.filter(event => event.status === 'published').length,
  }), [events]);

  const handleEdit = (event: LocalEvent) => {
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
      status: event.status || 'draft',
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
      status: 'draft',
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
      onSubmit({
        ...event,
        status: 'draft' // AI generated events start as drafts
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Local Events</CardTitle>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaultState}
              title="Reset to default view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="list">
            <div className="mb-4">
              <EventsStatusFilter
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                eventCounts={eventCounts}
              />
            </div>
            <EventsList
              events={filteredEvents}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <EventsEditorForm
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  editingEvent={editingEvent}
                  onSubmit={handleSubmit}
                  onCancel={() => setActiveTab('list')}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <EventsPreview
                  formData={formData}
                  categories={categories}
                />
              </div>
            </div>
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
