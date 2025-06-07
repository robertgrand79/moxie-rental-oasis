
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Sparkles, RefreshCw, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AISiteEditorProps {
  siteData: any;
  onUpdateSiteData: (data: any) => void;
}

const AISiteEditor = ({ siteData, onUpdateSiteData }: AISiteEditorProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedField, setSelectedField] = useState('heroTitle');
  const { toast } = useToast();

  const contentFields = [
    { key: 'heroTitle', label: 'Hero Title', placeholder: 'Main headline for the homepage' },
    { key: 'heroSubtitle', label: 'Hero Subtitle', placeholder: 'Supporting text for the headline' },
    { key: 'description', label: 'Site Description', placeholder: 'Description of your business' },
    { key: 'tagline', label: 'Tagline', placeholder: 'Short, catchy phrase' },
  ];

  const promptSuggestions = [
    "Write a compelling hero title for a luxury vacation rental business",
    "Create an engaging tagline for a premium property rental service",
    "Generate a professional description for a vacation rental company",
    "Write welcoming homepage content for a boutique rental business",
    "Create SEO-friendly content for a vacation property website"
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
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
          prompt: prompt,
          context: {
            businessType: 'vacation rental',
            currentContent: siteData,
            field: selectedField
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has generated new content based on your prompt.",
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

    onUpdateSiteData({
      ...siteData,
      [selectedField]: generatedContent
    });

    toast({
      title: "Content Applied",
      description: `Updated ${contentFields.find(f => f.key === selectedField)?.label}.`,
    });

    setGeneratedContent('');
    setPrompt('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Site Editor
          </CardTitle>
          <CardDescription>
            Use AI to generate compelling content for your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Content Field to Update</Label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full p-2 border rounded-md mt-1"
            >
              {contentFields.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="prompt">AI Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what kind of content you want AI to generate..."
              rows={4}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={generateContent} 
            disabled={isGenerating || !prompt.trim()}
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
              
              <div className="flex gap-2">
                <Button onClick={applyGeneratedContent} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply to Site
                </Button>
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt Suggestions</CardTitle>
          <CardDescription>
            Click on any suggestion to use it as your prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {promptSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useSuggestion(suggestion)}
                className="w-full text-left justify-start h-auto p-3"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentFields.map(field => (
              <div key={field.key} className="p-3 border rounded">
                <Label className="font-semibold">{field.label}:</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {siteData[field.key] || `No ${field.label.toLowerCase()} set`}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISiteEditor;
