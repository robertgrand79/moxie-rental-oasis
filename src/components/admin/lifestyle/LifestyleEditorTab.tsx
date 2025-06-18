
import React from 'react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import LifestyleEditorForm from './LifestyleEditorForm';
import LifestylePreview from './LifestylePreview';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

interface LifestyleEditorTabProps {
  formData: LifestyleGalleryFormData;
  setFormData: (data: LifestyleGalleryFormData) => void;
  categories: Array<{ value: string; label: string }>;
  activityTypes: Array<{ value: string; label: string }>;
  editingItem: LifestyleGalleryItem | null;
  onSubmit: (data: LifestyleGalleryFormData) => Promise<void>;
  onCancel: () => void;
}

const LifestyleEditorTab = ({
  formData,
  setFormData,
  categories,
  activityTypes,
  editingItem,
  onSubmit,
  onCancel
}: LifestyleEditorTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <LifestyleEditorForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          activityTypes={activityTypes}
          editingItem={editingItem}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <LifestylePreview item={formData} />
      </div>
    </div>
  );
};

export default LifestyleEditorTab;
