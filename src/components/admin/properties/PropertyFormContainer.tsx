
import React from 'react';
import PropertyForm from '@/components/PropertyForm';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';

interface PropertyFormContainerProps {
  editingProperty: Property | null;
  isSubmitting: boolean;
  onFormSubmit: (data: PropertyFormData & { photos: File[]; selectedCoverIndex?: number; featuredPhotos?: string[] }) => Promise<void>;
  onFormCancel: () => void;
}

const PropertyFormContainer = ({
  editingProperty,
  isSubmitting,
  onFormSubmit,
  onFormCancel
}: PropertyFormContainerProps) => {
  return (
    <div className="animate-fade-in">
      <PropertyForm 
        initialData={editingProperty || undefined}
        isEditing={!!editingProperty}
        onSubmit={onFormSubmit}
        onCancel={onFormCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PropertyFormContainer;
