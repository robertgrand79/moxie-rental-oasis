
import React from 'react';
import { Button } from '@/components/ui/button';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import LifestyleGalleryFormFields, { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

interface LifestyleEditorFormProps {
  formData: LifestyleGalleryFormData;
  setFormData: (data: LifestyleGalleryFormData) => void;
  categories: Array<{ value: string; label: string }>;
  activityTypes: Array<{ value: string; label: string }>;
  editingItem: LifestyleGalleryItem | null;
  onSubmit: (data: LifestyleGalleryFormData) => Promise<void>;
  onCancel: () => void;
}

const LifestyleEditorForm = ({
  formData,
  setFormData,
  categories,
  activityTypes,
  editingItem,
  onSubmit,
  onCancel
}: LifestyleEditorFormProps) => {
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
          {editingItem ? 'Edit Lifestyle Item' : 'Create New Lifestyle Item'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <LifestyleGalleryFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          activityTypes={activityTypes}
          onLocationChange={handleLocationChange}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editingItem ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LifestyleEditorForm;
