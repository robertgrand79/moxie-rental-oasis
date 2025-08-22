import React from 'react';
import { Button } from '@/components/ui/button';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import POIFormFields, { POIFormData } from './POIFormFields';
import { Save, X } from 'lucide-react';

interface POIInlineEditorProps {
  formData: POIFormData;
  setFormData: (data: POIFormData) => void;
  categories: Array<{ value: string; label: string }>;
  poi: PointOfInterest;
  onSubmit: (data: POIFormData & { created_by: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const POIInlineEditor = ({
  formData,
  setFormData,
  categories,
  poi,
  onSubmit,
  onCancel,
  isSubmitting = false
}: POIInlineEditorProps) => {
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
    <div className="bg-muted/10 p-4 rounded-lg border border-muted animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <POIFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onAddressChange={handleAddressChange}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            size="sm"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default POIInlineEditor;