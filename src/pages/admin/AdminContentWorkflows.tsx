
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Sparkles, 
  Calendar, 
  FileText, 
  Zap,
  Rocket,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PromptTemplatesLibrary from '@/components/admin/PromptTemplatesLibrary';
import AIContentGenerators from '@/components/admin/AIContentGenerators';

const AdminContentWorkflows = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('content');

  const handleUseTemplate = (prompt: string, category: string) => {
    setCurrentPrompt(prompt);
    setSelectedCategory(category);
  };

  const generateContent = async () => {
    if (!currentPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please select a template or enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Determine the best function based on category
      let functionName = 'generate-site-content';
      let requestBody: any = {
        prompt: currentPrompt,
        context: {
          businessType: 'vacation rental',
          location: 'Eugene, Oregon'
        }
      };

      // Use specific AI functions for certain categories
      if (['poi', 'events', 'social'].includes(selectedCategory)) {
        functionName = 'generate-content-ai';
        requestBody = {
          type: selectedCategory === 'social' ? 'lifestyle' : selectedCategory,
          prompt: currentPrompt,
          category: selectedCategory,
          count: 1,
          location: 'Eugene, Oregon'
        };
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) throw error;

      // Handle different response formats
      let content = '';
      if (functionName === 'generate-content-ai') {
        if (data.content && data.content.length > 0) {
          const generated = data.content[0];
          content = generated.description || generated.content || JSON.stringify(generated, null, 2);
        }
      } else {
        content = data.content || 'No content generated';
      }

      setGeneratedContent(content);
      
      toast({
        title: "Content Generated!",
        description: "Your content workflow has been completed successfully.",
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

  const quickWorkflows = [
    {
      title: "Weekly Sprint",
      description: "Generate a complete week of content",
      icon: <Calendar className="h-6 w-6" />,
      action: () => handleUseTemplate(`Generate this week's content sprint for Moxie Vacation Rentals. Include:

1 blog post idea with outline
1 newsletter idea with subject line and content  
3 social media post ideas with captions and hashtags
1 local event or lifestyle feature to spotlight

Style: friendly, upscale, and local-first approach that showcases Eugene, Oregon as a premier vacation destination.`, 'workflow')
    },
    {
      title: "Social Media Burst",
      description: "Create 5 social media posts instantly",
      icon: <Zap className="h-6 w-6" />,
      action: () => handleUseTemplate(`Create 5 engaging social media posts for Moxie Vacation Rentals featuring:

1. A property highlight
2. A local Eugene attraction  
3. A guest testimonial showcase
4. A seasonal travel tip
5. A behind-the-scenes look

Each post should include captions and relevant hashtags. Style: friendly, upscale, authentic.`, 'social')
    },
    {
      title: "SEO Blog Package",
      description: "Generate SEO-optimized blog content",
      icon: <Target className="h-6 w-6" />,
      action: () => handleUseTemplate(`Create an SEO-optimized blog post package for Eugene vacation rentals:

- Main article: "Best Things to Do in Eugene, Oregon" (800 words)
- Meta title and description
- 5 internal linking opportunities
- 10 relevant keywords to target
- Social media preview text

Focus on vacation rental guests and local experiences.`, 'content')
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Workflows</h1>
        <p className="text-gray-600">
          Streamlined content creation with pre-built templates and AI assistance
        </p>
      </div>

      {/* Quick Action Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="h-5 w-5 mr-2" />
            Quick Action Workflows
          </CardTitle>
          <CardDescription>
            One-click content generation for common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickWorkflows.map((workflow, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      {workflow.icon}
                    </div>
                    <h3 className="font-semibold">{workflow.title}</h3>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    <Button onClick={workflow.action} className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Template Library
          </TabsTrigger>
          <TabsTrigger value="generator">
            <Wand2 className="h-4 w-4 mr-2" />
            Content Generator
          </TabsTrigger>
          <TabsTrigger value="ai-tools">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <PromptTemplatesLibrary onUseTemplate={handleUseTemplate} />
        </TabsContent>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Custom Content Generator</CardTitle>
              <CardDescription>
                Generate content with your selected template or custom prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="current-prompt">Current Prompt</Label>
                <Textarea
                  id="current-prompt"
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="Use a template from the library or write your own prompt..."
                  rows={6}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={generateContent} 
                disabled={isGenerating || !currentPrompt.trim()}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>

              {generatedContent && (
                <div className="space-y-4">
                  <div>
                    <Label>Generated Content</Label>
                    <div className="mt-1 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{generatedContent}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    variant="outline"
                    className="w-full"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools">
          <AIContentGenerators />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentWorkflows;
