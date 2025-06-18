
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import LifestyleGalleryGrid from './LifestyleGalleryGrid';
import LifestyleStatusFilter from './LifestyleStatusFilter';

interface LifestyleGalleryTabProps {
  filteredItems: LifestyleGalleryItem[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  itemCounts: {
    all: number;
    draft: number;
    published: number;
  };
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: LifestyleGalleryItem) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: LifestyleGalleryItem) => any[];
  onAddNew: () => void;
}

const LifestyleGalleryTab = ({
  filteredItems,
  statusFilter,
  setStatusFilter,
  itemCounts,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions,
  onAddNew
}: LifestyleGalleryTabProps) => {
  return (
    <>
      <div className="mb-4">
        <LifestyleStatusFilter
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          itemCounts={itemCounts}
        />
      </div>
      <LifestyleGalleryGrid
        galleryItems={filteredItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onEnhance={onEnhance}
        isEnhancing={isEnhancing}
        enhancingId={enhancingId}
        getSuggestions={getSuggestions}
      />
      <div className="mt-4">
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Gallery Item
        </Button>
      </div>
    </>
  );
};

export default LifestyleGalleryTab;
