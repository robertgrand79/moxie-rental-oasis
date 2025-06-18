
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';
import { useLifestyleEditorState } from './useLifestyleEditorState';
import { useLifestyleEditorHandlers } from './useLifestyleEditorHandlers';
import LifestyleEditorTabs from './LifestyleEditorTabs';
import LifestyleGalleryTab from './LifestyleGalleryTab';
import LifestyleEditorTab from './LifestyleEditorTab';
import LifestyleAITab from './LifestyleAITab';

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
  const {
    activeTab,
    setActiveTab,
    editingItem,
    setEditingItem,
    statusFilter,
    setStatusFilter,
    formData,
    setFormData,
    filteredItems,
    itemCounts,
    resetForm
  } = useLifestyleEditorState(galleryItems);

  const {
    handleEdit,
    handleAddNew,
    handleSubmit,
    handleAIGenerated
  } = useLifestyleEditorHandlers(
    setEditingItem,
    setFormData,
    setActiveTab,
    resetForm,
    onSubmit
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lifestyle Gallery</CardTitle>
          <LifestyleEditorTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddNew={handleAddNew}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="list">
            <LifestyleGalleryTab
              filteredItems={filteredItems}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              itemCounts={itemCounts}
              onEdit={handleEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
              getSuggestions={getSuggestions}
              onAddNew={handleAddNew}
            />
          </TabsContent>

          <TabsContent value="editor">
            <LifestyleEditorTab
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
            <LifestyleAITab
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
