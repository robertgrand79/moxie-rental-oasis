
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterAIGeneratorProps {
  currentSubject: string;
  currentContent: string;
  onContentGenerated: (field: 'subject' | 'content', content: string) => void;
}

const NewsletterAIGenerator = ({ 
  currentSubject, 
  currentContent, 
  onContentGenerated 
}: NewsletterAIGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'subject' | 'content'>('subject');
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
            businessType: 'vacation rental newsletter',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              subject: currentSubject,
              content: currentContent
            },
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

    onContentGenerated(selectedField, generatedContent);

    toast({
      title: "Content Applied",
      description: `Updated ${selectedField}.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Newsletter Generator
        </CardTitle>
        <CardDescription>
          Generate newsletter content with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Content Field to Generate</Label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value as 'subject' | 'content')}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="subject">Subject Line</option>
            <option value="content">Newsletter Content</option>
          </select>
        </div>

        <div>
          <Label htmlFor="aiPrompt">AI Prompt</Label>
          <Textarea
            id="aiPrompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe what kind of newsletter content you want AI to generate..."
            rows={3}
            className="mt-1"
          />
        </div>

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

export default NewsletterAIGenerator;
