
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
  
  // Inline editing state
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<POIFormData | null>(null);
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);
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

  // Inline editing handlers
  const handleToggleInlineEdit = (poi: PointOfInterest) => {
    if (editingInlineId === poi.id) {
      // Close inline editing
      setEditingInlineId(null);
      setEditFormData(null);
    } else {
      // Open inline editing
      setEditingInlineId(poi.id);
      
      // Initialize form data with POI values
      const formData: POIFormData = {
        name: poi.name,
        description: poi.description || '',
        address: poi.address || '',
        latitude: poi.latitude || 0,
        longitude: poi.longitude || 0,
        category: poi.category || '',
        phone: poi.phone || '',
        website_url: poi.website_url || '',
        image_url: poi.image_url || '',
        rating: poi.rating || 0,
        price_level: poi.price_level || 1,
        distance_from_properties: poi.distance_from_properties || 0,
        driving_time: poi.driving_time || 0,
        walking_time: poi.walking_time || 0,
        is_featured: poi.is_featured || false,
        is_active: poi.is_active !== false,
        display_order: poi.display_order || 0,
        status: poi.status || 'draft',
        show_on_map: poi.show_on_map !== false,
        created_by: poi.created_by || user?.id || ''
      };
      
      setEditFormData(formData);
    }
  };

  const handleSubmitInlineEdit = async (formData: POIFormData & { created_by: string }) => {
    if (!editingInlineId) return;
    
    setIsSubmittingInline(true);
    try {
      await updatePointOfInterest.mutateAsync({
        id: editingInlineId,
        ...formData
      });
      
      // Close inline editing on success
      setEditingInlineId(null);
      setEditFormData(null);
      
      toast({
        title: "Success",
        description: "Point of interest updated successfully.",
      });
    } catch (error) {
      console.error('Error updating POI:', error);
      toast({
        title: "Error",
        description: "Failed to update point of interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInline(false);
    }
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
    getSuggestions,
    // Inline editing
    editingInlineId,
    handleToggleInlineEdit,
    editFormData,
    setEditFormData,
    handleSubmitInlineEdit,
    isSubmittingInline
  };
};
