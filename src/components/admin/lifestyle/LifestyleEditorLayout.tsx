import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Sparkles } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import LifestyleEditorForm from './LifestyleEditorForm';
import LifestylePreview from './LifestylePreview';
import LifestyleAllFieldsGenerator from './LifestyleAllFieldsGenerator';
import LifestyleGalleryGrid from './LifestyleGalleryGrid';
import LifestyleStatusFilter from './LifestyleStatusFilter';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

interface LifestyleEditorLayoutProps {
  galleryItems: LifestyleGalleryItem[];
  categories: Array<{ value: string; label: string }>;
  activityTypes: Array<{ value: string; label: string }>;
  isLoading: boolean;
  onSubmit: (data: LifestyleGalleryFormData) => Promise<void>;
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: LifestyleGalleryItem) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: LifestyleGalleryItem) => any[];
}

const LifestyleEditorLayout = ({
  galleryItems,
  categories,
  activityTypes,
  isLoading,
  onSubmit,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions
}: LifestyleEditorLayoutProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<LifestyleGalleryFormData>({
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

  // Filter items based on status
  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return galleryItems;
    return galleryItems.filter(item => item.status === statusFilter);
  }, [galleryItems, statusFilter]);

  // Calculate item counts for filter badges
  const itemCounts = useMemo(() => ({
    all: galleryItems.length,
    draft: galleryItems.filter(item => item.status === 'draft').length,
    published: galleryItems.filter(item => item.status === 'published').length,
  }), [galleryItems]);

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
    console.log('Processing AI generated items:', generatedItems);
    
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
        console.log('Processing item:', item);
        
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

        console.log('Formatted item for submission:', formattedItem);
        
        // Submit the item
        await onSubmit(formattedItem);
      }

      toast({
        title: 'Success',
        description: `Added ${generatedItems.length} lifestyle items to your gallery!`
      });
    } catch (error) {
      console.error('Error processing AI generated items:', error);
      toast({
        title: 'Error',
        description: `Failed to add lifestyle items: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lifestyle Gallery</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('list')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Gallery
            </Button>
            <Button
              variant={activeTab === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={handleAddNew}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generator
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="list">
            <div className="mb-4">
              <LifestyleStatusFilter
                selectedStatus={statusFilter}
                onStatusChange={setStatusFilter}
                itemCounts={itemCounts}
              />
            </div>
            <LifestyleGalleryGrid
              galleryItems={filteredItems}
              onEdit={handleEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
              getSuggestions={getSuggestions}
            />
            <div className="mt-4">
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Gallery Item
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <LifestyleEditorForm
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  activityTypes={activityTypes}
                  editingItem={editingItem}
                  onSubmit={handleSubmit}
                  onCancel={() => setActiveTab('list')}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <LifestylePreview
                  item={formData}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <LifestyleAllFieldsGenerator
              onItemsGenerated={handleAIGenerated}
              existingItems={galleryItems}
              categories={categories.map(c => c.value)}
              activityTypes={activityTypes.map(a => a.value)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LifestyleEditorLayout;
