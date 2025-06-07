
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
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: aiPrompt,
          context: {
            businessType: 'vacation rental property',
            propertyData: {
              location: propertyData.location || '',
              bedrooms: propertyData.bedrooms || 0,
              bathrooms: propertyData.bathrooms || 0,
              maxGuests: propertyData.maxGuests || 0,
              pricePerNight: propertyData.pricePerNight || 0
            },
            field: selectedField
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has generated new property content based on your prompt.",
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
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
