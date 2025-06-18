
import React from 'react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import LifestyleAllFieldsGenerator from './LifestyleAllFieldsGenerator';

interface LifestyleAITabProps {
  onItemsGenerated: (items: any[]) => Promise<void>;
  existingItems: LifestyleGalleryItem[];
  categories: Array<{ value: string; label: string }>;
  activityTypes: Array<{ value: string; label: string }>;
}

const LifestyleAITab = ({
  onItemsGenerated,
  existingItems,
  categories,
  activityTypes
}: LifestyleAITabProps) => {
  return (
    <LifestyleAllFieldsGenerator
      onItemsGenerated={onItemsGenerated}
      existingItems={existingItems}
      categories={categories.map(c => c.value)}
      activityTypes={activityTypes.map(a => a.value)}
    />
  );
};

export default LifestyleAITab;
