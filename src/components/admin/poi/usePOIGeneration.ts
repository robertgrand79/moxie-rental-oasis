
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';

interface UsePOIGenerationProps {
  existingItems: PointOfInterest[];
  categories: string[];
}

export const usePOIGeneration = ({
  existingItems,
  categories
}: UsePOIGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);

  const generateItems = async (
    prompt: string,
    numberOfItems: number,
    category: string
  ) => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for POI generation',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    console.log('Starting POI generation with:', {
      type: 'poi',
      prompt,
      count: numberOfItems,
      location: 'Eugene, Oregon',
      category
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type: 'poi',
          prompt: `Generate ${numberOfItems} points of interest for Eugene, Oregon based on this request: ${prompt}. 
          
          Category focus: ${category || 'General points of interest'}
          
          Please return a JSON object with a "content" array of POI items with these fields:
          - name: string (POI name)
          - description: string (detailed description)
          - address: string (specific address in Eugene area)
          - category: string (one of: ${categories.join(', ')})
          - phone: string (realistic local phone number)
          - website_url: string (realistic website URL)
          - image_url: string (relevant Unsplash URL)
          - rating: number (3.5-5.0)
          - price_level: number (1-4)
          - distance_from_properties: number (0.5-15 miles)
          - driving_time: number (2-30 minutes)
          - walking_time: number (5-60 minutes)
          - latitude: number (Eugene area coordinates)
          - longitude: number (Eugene area coordinates)
          - display_order: number (ascending order)
          - is_featured: boolean
          - is_active: boolean (default true)
          - status: string (default "draft")
          
          Make sure POIs are diverse, realistic for Eugene, and include local venues/areas when possible.`,
          count: numberOfItems,
          location: 'Eugene, Oregon',
          category: category || 'restaurants',
          context: {
            existingItemsCount: existingItems.length,
            recentItems: existingItems.slice(0, 5).map(i => ({ name: i.name, category: i.category }))
          }
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function call failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from function');
      }

      const items = data.content || [];
      console.log('Parsed items from response:', items);
      
      if (!Array.isArray(items)) {
        console.error('Invalid response format - content is not an array:', data);
        throw new Error('Invalid response format from AI service');
      }

      const validItems = items.filter((item: any) => {
        const isValid = item && 
          typeof item === 'object' && 
          item.name && 
          typeof item.name === 'string' &&
          item.description &&
          typeof item.description === 'string';
        
        if (!isValid) {
          console.warn('Filtered out invalid item:', item);
        }
        return isValid;
      });

      console.log('Valid items after filtering:', validItems);

      if (validItems.length === 0) {
        throw new Error('No valid POI items were generated');
      }

      setGeneratedItems(validItems);
      
      toast({
        title: 'Success',
        description: `Generated ${validItems.length} POI items successfully!`
      });
    } catch (error) {
      console.error('Error generating POI items:', error);
      toast({
        title: 'Error',
        description: `Failed to generate POI items: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGeneratedItems = () => {
    setGeneratedItems([]);
  };

  return {
    isGenerating,
    generatedItems,
    generateItems,
    clearGeneratedItems,
    setGeneratedItems
  };
};
