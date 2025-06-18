
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import ContentSuggestions from '@/components/admin/ContentSuggestions';
import LifestyleGalleryFormFields, { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

interface LifestyleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: LifestyleGalleryItem | null;
  onSubmit: (formData: LifestyleGalleryFormData & { created_by: string }) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  activityTypes: Array<{ value: string; label: string }>;
}

const LifestyleForm = ({ isOpen, onOpenChange, editingItem, onSubmit, categories, activityTypes }: LifestyleFormProps) => {
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  const [formData, setFormData] = useState<LifestyleGalleryFormData>({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    image_url: editingItem?.image_url || '',
    category: editingItem?.category || '',
    location: editingItem?.location || '',
    activity_type: editingItem?.activity_type || '',
    display_order: editingItem?.display_order || 0,
    is_featured: editingItem?.is_featured || false,
    is_active: editingItem?.is_active !== false,
    status: editingItem?.status || 'draft'
  });

  React.useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description || '',
        image_url: editingItem.image_url,
        category: editingItem.category,
        location: editingItem.location || '',
        activity_type: editingItem.activity_type || '',
        display_order: editingItem.display_order || 0,
        is_featured: editingItem.is_featured || false,
        is_active: editingItem.is_active !== false,
        status: editingItem.status || 'published'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        category: '',
        location: '',
        activity_type: '',
        display_order: 0,
        is_featured: false,
        is_active: true,
        status: 'draft'
      });
    }
  }, [editingItem]);

  const handleLocationChange = (location: string) => {
    if (location.length > 2) {
      const suggestions = getLocationBasedSuggestions(location, editingItem?.id, 'lifestyle');
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    const suggestions = getCategoryBasedSuggestions(category, editingItem?.id, 'lifestyle');
    setCategorySuggestions(suggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      created_by: user?.id || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Lifestyle Item' : 'Add New Lifestyle Item'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <LifestyleGalleryFormFields
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                activityTypes={activityTypes}
                onLocationChange={handleLocationChange}
                onCategoryChange={handleCategoryChange}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update Item' : 'Create Item'}
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

export default LifestyleForm;
