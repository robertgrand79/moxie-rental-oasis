
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { usePOIGeneration } from './usePOIGeneration';
import POIGenerationForm from './POIGenerationForm';
import POIGeneratedItemsList from './POIGeneratedItemsList';

interface POIAllFieldsGeneratorProps {
  onItemsGenerated: (items: any[]) => void;
  existingItems: PointOfInterest[];
  categories: string[];
}

const POIAllFieldsGenerator = ({ 
  onItemsGenerated, 
  existingItems, 
  categories 
}: POIAllFieldsGeneratorProps) => {
  const {
    isGenerating,
    generatedItems,
    generateItems,
    setGeneratedItems
  } = usePOIGeneration({
    existingItems,
    categories
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Multiple POI Items with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <POIGenerationForm
          onGenerate={generateItems}
          isGenerating={isGenerating}
          categories={categories}
        />

        <POIGeneratedItemsList
          generatedItems={generatedItems}
          onItemsGenerated={onItemsGenerated}
          setGeneratedItems={setGeneratedItems}
        />
      </CardContent>
    </Card>
  );
};

export default POIAllFieldsGenerator;
