
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image, Wand2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useLifestyleGallery, LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import AIGenerationDialog from '@/components/admin/AIGenerationDialog';
import LifestyleGalleryCard from './LifestyleGalleryCard';
import LifestyleGalleryForm from './LifestyleGalleryForm';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

const categories = [
  'outdoor',
  'dining',
  'entertainment',
  'culture',
  'shopping',
  'recreation',
  'nature',
  'sports'
];

const activityTypes = [
  'hiking',
  'dining',
  'shopping',
  'sightseeing',
  'entertainment',
  'recreation',
  'cultural',
  'adventure',
  'relaxation'
];

const LifestyleGalleryManager = () => {
  const { galleryItems, isLoading, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useLifestyleGallery();
  const { user } = useAuth();
  const { enhanceContent, isEnhancing } = useAIContentGeneration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingItem(null);
  };

  const handleEdit = (item: LifestyleGalleryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: LifestyleGalleryFormData & { created_by: string }) => {
    try {
      if (editingItem) {
        await updateGalleryItem.mutateAsync({
          id: editingItem.id,
          ...formData
        });
      } else {
        if (!user?.id) {
          console.error('User not authenticated');
          return;
        }
        await createGalleryItem.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving gallery item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      await deleteGalleryItem.mutateAsync(id);
    }
  };

  const lifestyleCategories = categories.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const handleAIGeneration = async (content: any[]) => {
    for (const item of content) {
      try {
        const defaultImageUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
        
        await createGalleryItem.mutateAsync({
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          activity_type: item.activity_type,
          image_url: item.image_url || defaultImageUrl,
          is_active: true,
          is_featured: false,
          display_order: 0,
          created_by: user?.id || ''
        });
      } catch (error) {
        console.error('Error saving AI-generated item:', error);
      }
    }
  };

  const handleEnhanceItem = async (item: LifestyleGalleryItem) => {
    setEnhancingId(item.id);
    try {
      const enhanced = await enhanceContent('lifestyle', item);
      if (enhanced) {
        await updateGalleryItem.mutateAsync({
          id: item.id,
          ...enhanced
        });
      }
    } finally {
      setEnhancingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lifestyle Gallery</CardTitle>
            <CardDescription>
              Manage photos and activities showcasing Eugene's lifestyle
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAIDialogOpen(true)}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {resetForm(); setIsDialogOpen(true)}}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gallery Item
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <LifestyleGalleryCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEnhance={handleEnhanceItem}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
            />
          ))}
          {galleryItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No gallery items found</p>
              <p>Add your first lifestyle gallery item to get started</p>
            </div>
          )}
        </div>
      </CardContent>

      <LifestyleGalleryForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        categories={categories}
        activityTypes={activityTypes}
      />

      <AIGenerationDialog
        isOpen={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        type="lifestyle"
        categories={lifestyleCategories}
        onContentGenerated={handleAIGeneration}
      />
    </Card>
  );
};

export default LifestyleGalleryManager;
