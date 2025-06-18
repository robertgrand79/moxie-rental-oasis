
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useLifestyleGeneration } from './useLifestyleGeneration';
import LifestyleGenerationForm from './LifestyleGenerationForm';
import LifestyleGeneratedItemsList from './LifestyleGeneratedItemsList';

interface LifestyleAllFieldsGeneratorProps {
  onItemsGenerated: (items: any[]) => void;
  existingItems: LifestyleGalleryItem[];
  categories: string[];
  activityTypes: string[];
}

const LifestyleAllFieldsGenerator = ({ 
  onItemsGenerated, 
  existingItems, 
  categories, 
  activityTypes 
}: LifestyleAllFieldsGeneratorProps) => {
  const {
    isGenerating,
    generatedItems,
    generateItems,
    setGeneratedItems
  } = useLifestyleGeneration({
    existingItems,
    categories,
    activityTypes
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Multiple Lifestyle Items with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <LifestyleGenerationForm
          onGenerate={generateItems}
          isGenerating={isGenerating}
        />

        <LifestyleGeneratedItemsList
          generatedItems={generatedItems}
          onItemsGenerated={onItemsGenerated}
          setGeneratedItems={setGeneratedItems}
        />
      </CardContent>
    </Card>
  );
};

export default LifestyleAllFieldsGenerator;
