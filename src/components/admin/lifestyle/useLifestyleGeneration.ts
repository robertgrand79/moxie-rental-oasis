
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { debug } from '@/utils/debug';

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
  const [generatedItems, setGeneratedItems] = useState<Partial<LifestyleGalleryItem>[]>([]);

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
    debug.log('Starting lifestyle generation with:', {
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

      debug.log('Supabase function response:', { data, error });

      if (error) {
        debug.error('Supabase function error:', error);
        throw new Error(`Function call failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from function');
      }

      const items = data.content || [];
      debug.log('Parsed items from response:', items);
      
      if (!Array.isArray(items)) {
        debug.error('Invalid response format - content is not an array:', data);
        throw new Error('Invalid response format from AI service');
      }

      const validItems = items.filter((item: unknown): item is Partial<LifestyleGalleryItem> => {
        const isValid = item !== null && 
          typeof item === 'object' && 
          'title' in item &&
          typeof (item as Record<string, unknown>).title === 'string' &&
          'description' in item &&
          typeof (item as Record<string, unknown>).description === 'string';
        
        if (!isValid) {
          debug.warn('Filtered out invalid item:', item);
        }
        return isValid;
      });

      debug.log('Valid items after filtering:', validItems);

      if (validItems.length === 0) {
        throw new Error('No valid lifestyle items were generated');
      }

      setGeneratedItems(validItems);
      
      toast({
        title: 'Success',
        description: `Generated ${validItems.length} lifestyle items successfully!`
      });
    } catch (error: unknown) {
      debug.error('Error generating lifestyle items:', error);
      toast({
        title: 'Error',
        description: `Failed to generate lifestyle items: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
