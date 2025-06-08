
import React from 'react';
import LifestyleGalleryCard from './LifestyleGalleryCard';

interface LifestyleGalleryGridProps {
  items: any[];
  onItemClick: (item: any) => void;
}

const LifestyleGalleryGrid = ({ items, onItemClick }: LifestyleGalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <LifestyleGalleryCard
          key={item.id}
          item={item}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default LifestyleGalleryGrid;
