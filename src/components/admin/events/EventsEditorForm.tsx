
import React from 'react';
import { Button } from '@/components/ui/button';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { useAuth } from '@/contexts/AuthContext';
import EventFormFields, { EventFormData } from './EventFormFields';

interface EventsEditorFormProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  categories: Array<{ value: string; label: string }>;
  editingEvent: EugeneEvent | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
}

const EventsEditorForm = ({
  formData,
  setFormData,
  categories,
  editingEvent,
  onSubmit,
  onCancel
}: EventsEditorFormProps) => {
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      created_by: formData.created_by || user?.id || ''
    });
  };

  const handleLocationChange = (location: string) => {
    setFormData({ ...formData, location });
  };

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <EventFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onLocationChange={handleLocationChange}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventsEditorForm;
