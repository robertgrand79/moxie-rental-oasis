
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';
import { debug } from '@/utils/debug';

export const useLifestyleEditorHandlers = (
  setEditingItem: (item: LifestyleGalleryItem | null) => void,
  setFormData: (data: LifestyleGalleryFormData) => void,
  setActiveTab: (tab: string) => void,
  resetForm: () => void,
  onSubmit: (data: LifestyleGalleryFormData) => Promise<void>
) => {
  const { user } = useAuth();

  const handleEdit = (item: LifestyleGalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category,
      location: item.location || '',
      activity_type: item.activity_type || '',
      display_order: item.display_order || 0,
      is_featured: item.is_featured || false,
      is_active: item.is_active !== false,
      status: item.status || 'draft',
      created_by: item.created_by
    });
    setActiveTab('editor');
  };

  const handleAddNew = () => {
    setEditingItem(null);
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
      status: 'draft',
      created_by: ''
    });
    setActiveTab('editor');
  };

  const handleSubmit = async (data: LifestyleGalleryFormData) => {
    await onSubmit(data);
    setActiveTab('list');
  };

  const handleAIGenerated = async (generatedItems: any[]) => {
    debug.log('Processing AI generated items:', generatedItems);
    
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create lifestyle items',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Process each generated item individually for better error handling
      for (const item of generatedItems) {
        debug.log('Processing item:', item);
        
        // Map AI generated item to form data structure
        const formattedItem: LifestyleGalleryFormData = {
          title: item.title || '',
          description: item.description || '',
          image_url: item.image_url || '',
          category: item.category || 'outdoor',
          location: item.location || '',
          activity_type: item.activity_type || 'sightseeing',
          display_order: item.display_order || 0,
          is_featured: item.is_featured || false,
          is_active: item.is_active !== false,
          status: 'draft', // AI generated items start as drafts
          created_by: user.id // Set the current user as creator
        };

        debug.log('Formatted item for submission:', formattedItem);
        
        // Submit the item
        await onSubmit(formattedItem);
      }

      toast({
        title: 'Success',
        description: `Added ${generatedItems.length} lifestyle items to your gallery!`
      });
    } catch (error) {
      debug.error('Error processing AI generated items:', error);
      toast({
        title: 'Error',
        description: `Failed to add lifestyle items: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  return {
    handleEdit,
    handleAddNew,
    handleSubmit,
    handleAIGenerated
  };
};
