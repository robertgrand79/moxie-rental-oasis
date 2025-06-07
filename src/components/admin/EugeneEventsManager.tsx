import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, ExternalLink, Ticket, Wand2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEugeneEvents, EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { format } from 'date-fns';
import AIGenerationDialog from '@/components/admin/AIGenerationDialog';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import ContentSuggestions from '@/components/admin/ContentSuggestions';

const EugeneEventsManager = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEugeneEvents();
  const { user } = useAuth();
  const { enhanceContent, isEnhancing } = useAIContentGeneration();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EugeneEvent | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

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
    created_by: user?.id || ''
  });

  const categories = [
    { value: 'festival', label: 'Festival' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'music', label: 'Music' },
    { value: 'seasonal', label: 'Seasonal' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      created_by: user?.id || ''
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: EugeneEvent) => {
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

  const formatEventDate = (dateStr: string, endDateStr?: string) => {
    if (!dateStr) return '';
    try {
      const startDate = new Date(dateStr);
      if (endDateStr && endDateStr !== dateStr) {
        const endDate = new Date(endDateStr);
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
      return format(startDate, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleLocationChange = (location: string) => {
    setFormData({ ...formData, location });
    if (location.length > 2) {
      const suggestions = getLocationBasedSuggestions(location, editingEvent?.id, 'event');
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
    const suggestions = getCategoryBasedSuggestions(category, editingEvent?.id, 'event');
    setCategorySuggestions(suggestions);
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="title">Event Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="event_date">Start Date *</Label>
                          <Input
                            id="event_date"
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="time_start">Start Time</Label>
                          <Input
                            id="time_start"
                            placeholder="e.g., 7:00 PM"
                            value={formData.time_start}
                            onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="time_end">End Time</Label>
                          <Input
                            id="time_end"
                            placeholder="e.g., 10:00 PM"
                            value={formData.time_end}
                            onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            placeholder="Venue name or address"
                            value={formData.location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={handleCategoryChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="price_range">Price Range</Label>
                          <Input
                            id="price_range"
                            placeholder="e.g., Free, $20-50, $100+"
                            value={formData.price_range}
                            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            type="url"
                            placeholder="https://..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="website_url">Website URL</Label>
                          <Input
                            id="website_url"
                            type="url"
                            placeholder="https://..."
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="ticket_url">Ticket URL</Label>
                          <Input
                            id="ticket_url"
                            type="url"
                            placeholder="https://..."
                            value={formData.ticket_url}
                            onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                          />
                          <Label htmlFor="is_featured">Featured Event</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_recurring"
                            checked={formData.is_recurring}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                          />
                          <Label htmlFor="is_recurring">Recurring Event</Label>
                        </div>
                      </div>

                      {formData.is_recurring && (
                        <div>
                          <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                          <Input
                            id="recurrence_pattern"
                            placeholder="e.g., Every Saturday, Monthly, etc."
                            value={formData.recurrence_pattern}
                            onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingEvent ? 'Update Event' : 'Create Event'}
                        </Button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="lg:col-span-1">
                    {showSuggestions && (
                      <ContentSuggestions
                        suggestions={locationSuggestions}
                        title="Similar Location Content"
                      />
                    )}
                    
                    {categorySuggestions.length > 0 && (
                      <ContentSuggestions
                        suggestions={categorySuggestions}
                        title="Same Category Content"
                      />
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <div className="flex gap-1">
                          {event.is_featured && (
                            <Badge className="bg-blue-600 text-white">Featured</Badge>
                          )}
                          {!event.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {event.is_recurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Badge variant="secondary" className="mr-3">
                          {categories.find(c => c.value === event.category)?.label || event.category}
                        </Badge>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">{formatEventDate(event.event_date, event.end_date)}</span>
                        {event.time_start && (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="mr-4">
                              {event.time_start}
                              {event.time_end && ` - ${event.time_end}`}
                            </span>
                          </>
                        )}
                        {event.location && (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                      )}

                      {(event.website_url || event.ticket_url) && (
                        <div className="flex gap-2">
                          {event.website_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.website_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Website
                              </a>
                            </Button>
                          )}
                          {event.ticket_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                                <Ticket className="h-3 w-3 mr-1" />
                                Tickets
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnhanceItem(event)}
                        disabled={isEnhancing && enhancingId === event.id}
                      >
                        {isEnhancing && enhancingId === event.id ? (
                          <Sparkles className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(event.location || event.category) && (
                    <div className="mt-4">
                      <ContentSuggestions
                        suggestions={[
                          ...getLocationBasedSuggestions(event.location || '', event.id, 'event'),
                          ...getCategoryBasedSuggestions(event.category || '', event.id, 'event')
                        ].slice(0, 3)}
                        title="Related Content"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>

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

export default EugeneEventsManager;
