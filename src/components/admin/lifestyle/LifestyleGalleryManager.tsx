
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useLifestyleGallery, LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);

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
              onEnhance={() => {}}
              isEnhancing={false}
              enhancingId={null}
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
    </Card>
  );
};

export default LifestyleGalleryManager;
