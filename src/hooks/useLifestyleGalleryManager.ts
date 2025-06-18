
import { useState } from 'react';
import { useLifestyleGallery, LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import { LifestyleGalleryFormData } from '@/components/admin/lifestyle/LifestyleGalleryFormFields';

export const useLifestyleGalleryManager = () => {
  const { galleryItems, isLoading, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useLifestyleGallery();
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);

  const categories = [
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'dining', label: 'Dining' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'culture', label: 'Culture' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'nature', label: 'Nature' },
    { value: 'sports', label: 'Sports' }
  ];

  const activityTypes = [
    { value: 'hiking', label: 'Hiking' },
    { value: 'dining', label: 'Dining' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'sightseeing', label: 'Sightseeing' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'relaxation', label: 'Relaxation' }
  ];

  const handleSubmit = async (formData: LifestyleGalleryFormData & { created_by: string }) => {
    if (!formData.title || !formData.image_url) {
      return;
    }

    try {
      if (editingItem) {
        await updateGalleryItem.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createGalleryItem.mutateAsync(formData);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving lifestyle item:', error);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
  };

  const handleEdit = (item: LifestyleGalleryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lifestyle item?')) {
      try {
        await deleteGalleryItem.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting lifestyle item:', error);
      }
    }
  };

  const handleEnhanceItem = async (item: LifestyleGalleryItem) => {
    // Enhancement functionality can be handled through the unified AI chat
    console.log('Enhancement can be done through the AI Assistant', item);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getSuggestions = (item: LifestyleGalleryItem) => {
    return [
      ...getLocationBasedSuggestions(item.location || '', item.id, 'lifestyle'),
      ...getCategoryBasedSuggestions(item.category || '', item.id, 'lifestyle')
    ].slice(0, 3);
  };

  return {
    galleryItems,
    isLoading,
    categories,
    activityTypes,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    enhancingId: null,
    isEnhancing: false,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  };
};
