
import React from 'react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import LifestyleGalleryCard from './LifestyleGalleryCard';
import { Image } from 'lucide-react';

interface LifestyleGalleryGridProps {
  galleryItems: LifestyleGalleryItem[];
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: LifestyleGalleryItem) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: LifestyleGalleryItem) => any[];
}

const LifestyleGalleryGrid = ({ 
  galleryItems, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId, 
  getSuggestions 
}: LifestyleGalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleryItems.map((item) => (
        <LifestyleGalleryCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onEnhance={onEnhance}
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
  );
};

export default LifestyleGalleryGrid;
