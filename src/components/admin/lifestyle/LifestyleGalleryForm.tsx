
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import LifestyleGalleryFormFields, { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

interface LifestyleGalleryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: LifestyleGalleryItem | null;
  onSubmit: (formData: LifestyleGalleryFormData & { created_by: string }) => Promise<void>;
  categories: string[];
  activityTypes: string[];
}

const LifestyleGalleryForm = ({ 
  isOpen, 
  onOpenChange, 
  editingItem, 
  onSubmit, 
  categories, 
  activityTypes 
}: LifestyleGalleryFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LifestyleGalleryFormData>({
    title: editingItem?.title || '',
    description: editingItem?.description || '',
    image_url: editingItem?.image_url || '',
    category: editingItem?.category || '',
    location: editingItem?.location || '',
    activity_type: editingItem?.activity_type || '',
    display_order: editingItem?.display_order || 0,
    is_featured: editingItem?.is_featured || false,
    is_active: editingItem?.is_active !== false
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
        is_featured: editingItem.is_featured,
        is_active: editingItem.is_active
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
        is_active: true
      });
    }
  }, [editingItem]);

  const handleSubmit = async () => {
    await onSubmit({
      ...formData,
      created_by: user?.id || ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
          </DialogTitle>
          <DialogDescription>
            Add lifestyle photos and activities to showcase Eugene
          </DialogDescription>
        </DialogHeader>
        
        <LifestyleGalleryFormFields
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          activityTypes={activityTypes}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Create'} Gallery Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LifestyleGalleryForm;
