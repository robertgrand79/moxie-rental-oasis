
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [numberOfItems, setNumberOfItems] = useState(5);
  const [focusArea, setFocusArea] = useState('');
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);

  const handleGenerate = async () => {
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
      location: 'Eugene, Oregon',
      category: focusArea || 'lifestyle'
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type: 'lifestyle',
          prompt: `Generate ${numberOfItems} lifestyle gallery items for Eugene, Oregon based on this request: ${prompt}. 
          
          Focus area: ${focusArea || 'General lifestyle activities'}
          
          Please return a JSON object with a "content" array of lifestyle items with these fields:
          - title: string (activity or experience name)
          - description: string (detailed description of the activity)
          - image_url: string (relevant Unsplash URL)
          - category: string (one of: ${categories.join(', ')})
          - location: string (specific location in Eugene area)
          - activity_type: string (one of: ${activityTypes.join(', ')})
          - display_order: number (ascending order)
          - is_featured: boolean
          - is_active: boolean (default true)
          
          Make sure activities are diverse, realistic for Eugene, and include local venues/areas when possible.`,
          count: numberOfItems,
          location: 'Eugene, Oregon',
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

      // Handle the response structure from the edge function
      const items = data.content || [];
      console.log('Parsed items from response:', items);
      
      if (!Array.isArray(items)) {
        console.error('Invalid response format - content is not an array:', data);
        throw new Error('Invalid response format from AI service');
      }

      // Filter out any undefined or invalid items and ensure they have required properties
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

  const handleApplyAll = () => {
    onItemsGenerated(generatedItems);
    setGeneratedItems([]);
    toast({
      title: 'Success',
      description: `Applied ${generatedItems.length} lifestyle items to your gallery!`
    });
  };

  const handleApplySelected = (item: any) => {
    onItemsGenerated([item]);
    setGeneratedItems(prev => prev.filter(i => i !== item));
    toast({
      title: 'Success',
      description: 'Lifestyle item added to your gallery!'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Multiple Lifestyle Items with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numberOfItems">Number of Items</Label>
            <Input
              id="numberOfItems"
              type="number"
              min="1"
              max="15"
              value={numberOfItems}
              onChange={(e) => setNumberOfItems(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="focusArea">Focus Area (Optional)</Label>
            <Input
              id="focusArea"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., outdoor activities, cultural events, dining"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="prompt">Lifestyle Generation Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the types of lifestyle activities you want to generate for Eugene, Oregon..."
            rows={4}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Items...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {numberOfItems} Lifestyle Items
            </>
          )}
        </Button>

        {generatedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Items</h3>
              <Button onClick={handleApplyAll} variant="default">
                Apply All {generatedItems.length} Items
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedItems.map((item, index) => {
                // Additional safety check to ensure item has required properties
                if (!item || !item.title) {
                  return null;
                }
                
                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          {item.category && <Badge variant="outline">{item.category}</Badge>}
                          {item.is_featured && <Badge>Featured</Badge>}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                          {item.location && <p>📍 {item.location}</p>}
                          {item.activity_type && <p>🏃 {item.activity_type}</p>}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleApplySelected(item)}
                        variant="outline"
                      >
                        Add This Item
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LifestyleAllFieldsGenerator;
