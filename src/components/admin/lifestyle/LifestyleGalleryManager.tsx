
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { useLifestyleGalleryManager } from '@/hooks/useLifestyleGalleryManager';
import LifestyleGalleryCard from './LifestyleGalleryCard';
import LifestyleGalleryForm from './LifestyleGalleryForm';
import LifestyleStatusFilter from './LifestyleStatusFilter';

const LifestyleGalleryManager = () => {
  const {
    galleryItems,
    isLoading,
    categories,
    activityTypes,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    enhancingId,
    isEnhancing,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew
  } = useLifestyleGalleryManager();

  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredItems = useMemo(() => {
    if (selectedStatus === 'all') return galleryItems;
    return galleryItems.filter(item => item.status === selectedStatus);
  }, [galleryItems, selectedStatus]);

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
          <div className="flex gap-2 items-center">
            <LifestyleStatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Gallery Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
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
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {selectedStatus === 'all' ? 'No gallery items found' : `No ${selectedStatus} items found`}
              </p>
              <p>
                {selectedStatus === 'all' 
                  ? 'Add your first lifestyle gallery item to get started'
                  : `Try changing the status filter or create a new ${selectedStatus} item`
                }
              </p>
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
