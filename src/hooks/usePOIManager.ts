
import { useState, useMemo } from 'react';
import { usePointsOfInterest, PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import { POIFormData } from '@/components/admin/poi/POIFormFields';

export const usePOIManager = () => {
  const { pointsOfInterest, isLoading, createPointOfInterest, updatePointOfInterest, deletePointOfInterest } = usePointsOfInterest();
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PointOfInterest | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const categories = [
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'cafes', label: 'Cafes' },
    { value: 'bars', label: 'Bars' },
    { value: 'museums', label: 'Museums' },
    { value: 'parks', label: 'Parks' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'attractions', label: 'Attractions' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (formData: POIFormData & { created_by: string }) => {
    try {
      if (editingItem) {
        await updatePointOfInterest.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createPointOfInterest.mutateAsync(formData);
      }
      setEditingItem(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving POI:', error);
    }
  };

  const handleEdit = (item: PointOfInterest) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this point of interest?')) {
      try {
        await deletePointOfInterest.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting POI:', error);
      }
    }
  };

  const handleEnhanceItem = async (item: PointOfInterest) => {
    setEnhancingId(item.id);
    setIsEnhancing(true);
    
    // Simulate AI enhancement
    setTimeout(() => {
      setIsEnhancing(false);
      setEnhancingId(null);
    }, 2000);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const getSuggestions = (item: PointOfInterest) => {
    return [
      ...getLocationBasedSuggestions(item.address || '', item.id, 'poi'),
      ...getCategoryBasedSuggestions(item.category || '', item.id, 'poi')
    ].slice(0, 2);
  };

  return {
    pointsOfInterest,
    isLoading,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    enhancingId,
    isEnhancing,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  };
};
