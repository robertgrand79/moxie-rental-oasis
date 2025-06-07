
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIContentGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const generateContent = async (
    type: 'poi' | 'events' | 'lifestyle',
    prompt: string,
    category: string,
    count: number
  ) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type,
          prompt,
          category,
          count,
          location: 'Eugene, Oregon'
        }
      });

      if (error) throw error;

      toast({
        title: "Content Generated",
        description: `Generated ${count} ${type} items successfully`,
      });

      return data.content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceContent = async (
    type: 'poi' | 'events' | 'lifestyle',
    item: any
  ) => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-content-ai', {
        body: {
          type,
          item,
          location: 'Eugene, Oregon'
        }
      });

      if (error) throw error;

      toast({
        title: "Content Enhanced",
        description: "Item has been enhanced with AI suggestions",
      });

      return data.enhanced;
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance content",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    generateContent,
    enhanceContent,
    isGenerating,
    isEnhancing
  };
};
