
import { useState } from 'react';
import { usePointsOfInterest, PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import { POIFormData } from '@/components/admin/poi/POIFormFields';
import { toast } from '@/hooks/use-toast';

export const usePOIManager = () => {
  const { pointsOfInterest, isLoading, createPointOfInterest, updatePointOfInterest, deletePointOfInterest } = usePointsOfInterest();
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<PointOfInterest | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const categories = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'culture', label: 'Culture' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (formData: POIFormData) => {
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive'
      });
      return;
    }

    // Ensure created_by is always set
    const dataWithCreatedBy = {
      ...formData,
      created_by: formData.created_by || user?.id || ''
    };

    if (!dataWithCreatedBy.created_by) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create or edit POIs',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingPOI) {
        await updatePointOfInterest.mutateAsync({ id: editingPOI.id, ...dataWithCreatedBy });
        toast({
          title: 'Success',
          description: 'Point of interest updated successfully'
        });
      } else {
        await createPointOfInterest.mutateAsync(dataWithCreatedBy);
        toast({
          title: 'Success',
          description: 'Point of interest created successfully'
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving POI:', error);
      toast({
        title: 'Error',
        description: 'Failed to save point of interest. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setEditingPOI(null);
  };

  const handleEdit = (poi: PointOfInterest) => {
    setEditingPOI(poi);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this point of interest?')) {
      try {
        await deletePointOfInterest.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Point of interest deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting POI:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete point of interest. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEnhanceItem = async (poi: PointOfInterest) => {
    setIsEnhancing(true);
    setEnhancingId(poi.id);
    
    try {
      // Enhancement functionality can be handled through the unified AI chat
      console.log('Enhancement can be done through the AI Assistant', poi);
      toast({
        title: 'Info',
        description: 'Use the AI Assistant chat to enhance this POI with more details'
      });
    } catch (error) {
      console.error('Error enhancing POI:', error);
      toast({
        title: 'Error',
        description: 'Failed to enhance POI. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsEnhancing(false);
      setEnhancingId(null);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getSuggestions = (poi: PointOfInterest) => {
    return [
      ...getLocationBasedSuggestions(poi.address || '', poi.id, 'poi'),
      ...getCategoryBasedSuggestions(poi.category || '', poi.id, 'poi')
    ].slice(0, 3);
  };

  return {
    pointsOfInterest,
    isLoading,
    categories,
    isDialogOpen,
    setIsDialogOpen,
    editingPOI,
    isEnhancing,
    enhancingId,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions
  };
};
