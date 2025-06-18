
import React from 'react';
import { Button } from '@/components/ui/button';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import POIFormFields, { POIFormData } from './POIFormFields';

interface POIEditorFormProps {
  formData: POIFormData;
  setFormData: (data: POIFormData) => void;
  categories: Array<{ value: string; label: string }>;
  editingItem: PointOfInterest | null;
  onSubmit: (data: POIFormData & { created_by: string }) => Promise<void>;
  onCancel: () => void;
}

const POIEditorForm = ({
  formData,
  setFormData,
  categories,
  editingItem,
  onSubmit,
  onCancel
}: POIEditorFormProps) => {
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      created_by: user?.id || ''
    });
  };

  const handleAddressChange = (address: string) => {
    setFormData({ ...formData, address });
  };

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {editingItem ? 'Edit Point of Interest' : 'Create New Point of Interest'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <POIFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onAddressChange={handleAddressChange}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editingItem ? 'Update Point of Interest' : 'Create Point of Interest'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default POIEditorForm;
