
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureInput } from '@/hooks/useSecureInput';
import { createRateLimiter } from '@/utils/security';

interface AIContentGeneratorProps {
  onContentGenerated: (field: 'title' | 'excerpt' | 'content', content: string) => void;
  currentContent: {
    title: string;
    excerpt: string;
    content: string;
  };
}

// Rate limiter: 5 requests per minute
const rateLimiter = createRateLimiter(60000, 5);

const AIContentGenerator = ({ onContentGenerated, currentContent }: AIContentGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedField, setSelectedField] = useState<'title' | 'excerpt' | 'content'>('title');
  const [generatedContent, setGeneratedContent] = useState('');

  const aiPrompt = useSecureInput('', {
    required: true,
    minLength: 10,
    maxLength: 500,
    custom: (value: string) => {
      if (value.includes('<script>') || value.includes('javascript:')) {
        return 'Prompt contains potentially unsafe content';
      }
      return null;
    }
  });

  const generateContent = async () => {
    if (!aiPrompt.validate()) {
      return;
    }

    // Rate limiting check
    const userIdentifier = 'ai-content-generator'; // In a real app, use user ID
    if (!rateLimiter(userIdentifier)) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait before generating more content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: aiPrompt.value,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: currentContent.title,
              excerpt: currentContent.excerpt,
              content: currentContent.content
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
    aiPrompt.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate blog content with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Content Field to Generate</Label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value as 'title' | 'excerpt' | 'content')}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="title">Title</option>
            <option value="excerpt">Excerpt</option>
            <option value="content">Content</option>
          </select>
        </div>

        <div>
          <Label htmlFor="aiPrompt">AI Prompt</Label>
          <Textarea
            id="aiPrompt"
            value={aiPrompt.value}
            onChange={(e) => aiPrompt.setValue(e.target.value)}
            placeholder="Describe what kind of content you want AI to generate..."
            rows={3}
            className={`mt-1 ${aiPrompt.error ? 'border-red-500' : ''}`}
          />
          {aiPrompt.error && (
            <p className="text-sm text-red-600 mt-1">{aiPrompt.error}</p>
          )}
        </div>

        <Button 
          onClick={generateContent} 
          disabled={isGenerating || !aiPrompt.isValid}
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

export default AIContentGenerator;
