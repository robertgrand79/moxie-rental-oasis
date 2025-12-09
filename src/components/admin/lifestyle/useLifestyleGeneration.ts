
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';

interface UseLifestyleGenerationProps {
  existingItems: LifestyleGalleryItem[];
  categories: string[];
  activityTypes: string[];
  location?: string;
}

export const useLifestyleGeneration = ({
  existingItems,
  categories,
  activityTypes,
  location = 'the local area'
}: UseLifestyleGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);

  const generateItems = async (
    prompt: string,
    numberOfItems: number,
    focusArea: string
  ) => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for lifestyle item generation',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    console.log('Starting lifestyle generation with:', {
      type: 'lifestyle',
      prompt,
      count: numberOfItems,
      location,
      category: focusArea || 'lifestyle'
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type: 'lifestyle',
          prompt: `Generate ${numberOfItems} lifestyle gallery items for ${location} based on this request: ${prompt}. 
          
          Focus area: ${focusArea || 'General lifestyle activities'}
          
          Please return a JSON object with a "content" array of lifestyle items with these fields:
          - title: string (activity or experience name)
          - description: string (detailed description of the activity)
          - image_url: string (relevant Unsplash URL)
          - category: string (one of: ${categories.join(', ')})
          - location: string (specific location in the area)
          - activity_type: string (one of: ${activityTypes.join(', ')})
          - display_order: number (ascending order)
          - is_featured: boolean
          - is_active: boolean (default true)
          
          Make sure activities are diverse, realistic for the area, and include local venues/areas when possible.`,
          count: numberOfItems,
          location,
          category: focusArea || 'lifestyle',
          context: {
            existingItemsCount: existingItems.length,
            recentItems: existingItems.slice(0, 5).map(i => ({ title: i.title, category: i.category }))
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
          item.title && 
          typeof item.title === 'string' &&
          item.description &&
          typeof item.description === 'string';
        
        if (!isValid) {
          console.warn('Filtered out invalid item:', item);
        }
        return isValid;
      });

      console.log('Valid items after filtering:', validItems);

      if (validItems.length === 0) {
        throw new Error('No valid lifestyle items were generated');
      }

      setGeneratedItems(validItems);
      
      toast({
        title: 'Success',
        description: `Generated ${validItems.length} lifestyle items successfully!`
      });
    } catch (error) {
      console.error('Error generating lifestyle items:', error);
      toast({
        title: 'Error',
        description: `Failed to generate lifestyle items: ${error.message}`,
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
