
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PropertyAIGeneratorProps {
  onContentGenerated: (field: 'title' | 'description' | 'amenities', content: string) => void;
  propertyData: {
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    pricePerNight?: number;
  };
}

const PropertyAIGenerator = ({ onContentGenerated, propertyData }: PropertyAIGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'title' | 'description' | 'amenities'>('title');
  const [generatedContent, setGeneratedContent] = useState('');
  const { toast } = useToast();

  const generateContent = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare the prompt based on selected field and property data
      const { location, bedrooms, bathrooms, maxGuests, pricePerNight } = propertyData;
      const propertyInfo = `${bedrooms || 0} bedroom, ${bathrooms || 0} bathroom property in ${location || 'a great location'} that sleeps ${maxGuests || 2} guests at $${pricePerNight || 100}/night`;
      
      let enhancedPrompt = '';
      if (selectedField === 'title') {
        enhancedPrompt = `Create a compelling property title for a ${propertyInfo}. ${aiPrompt}`;
      } else if (selectedField === 'description') {
        enhancedPrompt = `Write an engaging property description for a ${propertyInfo}. ${aiPrompt}`;
      } else if (selectedField === 'amenities') {
        enhancedPrompt = `List amenities and features for a ${propertyInfo}. ${aiPrompt}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type: 'poi', // Using poi type as it generates descriptive content
          prompt: enhancedPrompt,
          category: 'property',
          count: 1,
          location: location || 'Eugene, Oregon'
        }
      });

      if (error) throw error;

      // Extract the generated content from the response
      let content = '';
      if (data.content && data.content.length > 0) {
        const generated = data.content[0];
        if (selectedField === 'title') {
          content = generated.name || generated.title || 'Generated Property Title';
        } else if (selectedField === 'description') {
          content = generated.description || 'Generated property description';
        } else if (selectedField === 'amenities') {
          // Extract amenities-like content from the generated data
          const amenities = [];
          if (generated.amenities) amenities.push(generated.amenities);
          if (generated.features) amenities.push(generated.features);
          if (generated.description && selectedField === 'amenities') {
            // For amenities, create a list format
            content = generated.description.split('.').filter(item => item.trim()).map(item => `• ${item.trim()}`).join('\n');
          } else {
            content = amenities.join(', ') || generated.description || 'Generated amenities list';
          }
        }
      }

      setGeneratedContent(content);
      
      toast({
        title: "Content Generated!",
        description: "AI has generated new property content based on your prompt.",
      });
    } catch (error: unknown) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = () => {
    if (!generatedContent) return;

    onContentGenerated(selectedField, generatedContent);

    toast({
      title: "Content Applied",
      description: `Updated property ${selectedField}.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  const getFieldPromptSuggestion = () => {
    const { location, bedrooms, bathrooms } = propertyData;
    const baseInfo = `${bedrooms || 0} bedroom, ${bathrooms || 0} bathroom property in ${location || 'a great location'}`;
    
    switch (selectedField) {
      case 'title':
        return `Create an appealing title for a ${baseInfo}`;
      case 'description':
        return `Write a detailed, engaging description for a ${baseInfo}. Highlight unique features and guest benefits.`;
      case 'amenities':
        return `List amenities for a ${baseInfo}. Include both basic necessities and luxury features.`;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Property Content Generator
        </CardTitle>
        <CardDescription>
          Generate compelling property content with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Content Field to Generate</Label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value as 'title' | 'description' | 'amenities')}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="title">Property Title</option>
            <option value="description">Property Description</option>
            <option value="amenities">Amenities List</option>
          </select>
        </div>

        <div>
          <Label htmlFor="aiPrompt">AI Prompt</Label>
          <Textarea
            id="aiPrompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={getFieldPromptSuggestion()}
            rows={3}
            className="mt-1"
          />
        </div>

        <Button 
          onClick={() => setAiPrompt(getFieldPromptSuggestion())}
          variant="outline"
          className="w-full"
        >
          Use Suggested Prompt
        </Button>

        <Button 
          onClick={generateContent} 
          disabled={isGenerating || !aiPrompt.trim()}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>

        {generatedContent && (
          <div className="space-y-4">
            <div>
              <Label>Generated Content</Label>
              <div className="mt-1 p-4 border rounded-md bg-gray-50">
                <p className="whitespace-pre-wrap">{generatedContent}</p>
              </div>
            </div>
            
            <Button onClick={applyGeneratedContent} className="w-full">
              Apply to {selectedField}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyAIGenerator;
