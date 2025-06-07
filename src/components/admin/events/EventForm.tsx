
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import ContentSuggestions from '@/components/admin/ContentSuggestions';
import EventFormFields, { EventFormData } from './EventFormFields';

interface EventFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: EugeneEvent | null;
  onSubmit: (formData: EventFormData) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
}

const EventForm = ({ isOpen, onOpenChange, editingEvent, onSubmit, categories }: EventFormProps) => {
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  const [formData, setFormData] = useState<EventFormData>({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    event_date: editingEvent?.event_date || '',
    end_date: editingEvent?.end_date || '',
    time_start: editingEvent?.time_start || '',
    time_end: editingEvent?.time_end || '',
    location: editingEvent?.location || '',
    category: editingEvent?.category || 'festival',
    image_url: editingEvent?.image_url || '',
    website_url: editingEvent?.website_url || '',
    ticket_url: editingEvent?.ticket_url || '',
    price_range: editingEvent?.price_range || '',
    is_featured: editingEvent?.is_featured || false,
    is_active: editingEvent?.is_active !== false,
    is_recurring: editingEvent?.is_recurring || false,
    recurrence_pattern: editingEvent?.recurrence_pattern || '',
    created_by: editingEvent?.created_by || user?.id || ''
  });

  React.useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        event_date: editingEvent.event_date,
        end_date: editingEvent.end_date || '',
        time_start: editingEvent.time_start || '',
        time_end: editingEvent.time_end || '',
        location: editingEvent.location || '',
        category: editingEvent.category || 'festival',
        image_url: editingEvent.image_url || '',
        website_url: editingEvent.website_url || '',
        ticket_url: editingEvent.ticket_url || '',
        price_range: editingEvent.price_range || '',
        is_featured: editingEvent.is_featured || false,
        is_active: editingEvent.is_active !== false,
        is_recurring: editingEvent.is_recurring || false,
        recurrence_pattern: editingEvent.recurrence_pattern || '',
        created_by: editingEvent.created_by
      });
    } else {
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
    }
  }, [editingEvent, user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <EventFormFields
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onLocationChange={handleLocationChange}
                onCategoryChange={handleCategoryChange}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  );
};

export default EventForm;
