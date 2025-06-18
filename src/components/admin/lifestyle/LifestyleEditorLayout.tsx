
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Sparkles } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import LifestyleEditorForm from './LifestyleEditorForm';
import LifestyleAllFieldsGenerator from './LifestyleAllFieldsGenerator';
import LifestyleGalleryGrid from './LifestyleGalleryGrid';

interface LifestyleEditorLayoutProps {
  galleryItems: LifestyleGalleryItem[];
  categories: string[];
  activityTypes: string[];
  isLoading: boolean;
  onSubmit: (data: any) => Promise<void>;
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
}

const LifestyleEditorLayout = ({
  galleryItems,
  categories,
  activityTypes,
  isLoading,
  onSubmit,
  onEdit,
  onDelete
}: LifestyleEditorLayoutProps) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);
  const [formData, setFormData] = useState({
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
      is_featured: item.is_featured,
      is_active: item.is_active
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
      is_active: true
    });
    setActiveTab('editor');
  };

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    setActiveTab('list');
  };

  const handleAIGenerated = (generatedItems: any[]) => {
    generatedItems.forEach(item => {
      onSubmit(item);
    });
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
            <LifestyleGalleryGrid
              galleryItems={galleryItems}
              onEdit={handleEdit}
              onDelete={onDelete}
            />
            <div className="mt-4">
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Gallery Item
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <LifestyleEditorForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              activityTypes={activityTypes}
              editingItem={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>

          <TabsContent value="ai">
            <LifestyleAllFieldsGenerator
              onItemsGenerated={handleAIGenerated}
              existingItems={galleryItems}
              categories={categories}
              activityTypes={activityTypes}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LifestyleEditorLayout;
