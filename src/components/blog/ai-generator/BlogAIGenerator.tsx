
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Zap, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { blogTemplates, blogQuickPrompts } from './BlogTemplates';
import BlogTemplateSelector from './BlogTemplateSelector';
import BlogQuickPrompts from './BlogQuickPrompts';
import BlogCustomPromptInput from './BlogCustomPromptInput';
import BlogGeneratedContentDisplay from './BlogGeneratedContentDisplay';

interface BlogAIGeneratorProps {
  currentTitle: string;
  currentExcerpt: string;
  currentContent: string;
  onContentGenerated: (field: 'title' | 'excerpt' | 'content', content: string) => void;
}

const BlogAIGenerator = ({ 
  currentTitle, 
  currentExcerpt,
  currentContent, 
  onContentGenerated 
}: BlogAIGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'title' | 'excerpt' | 'content'>('content');
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  const generateContent = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt;
    
    if (!promptToUse.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt or select a template to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = selectedField === 'content' 
        ? `${promptToUse}

**IMPORTANT BLOG FORMATTING INSTRUCTIONS:**
- Create well-structured blog post content with clear headings and subheadings
- Use engaging, conversational tone appropriate for travel blog readers
- Include specific Eugene, Oregon details and local expertise
- Write in paragraph format with clear section breaks
- Include actionable tips and practical information
- Make content scannable with bullet points where appropriate
- End with a compelling call-to-action encouraging bookings
- Ensure content is SEO-friendly and engaging for vacation rental guests

**MOXIE BRAND VOICE:**
- We are Moxie Vacation Rentals, Eugene's premier local experts
- Our mission: "Your Home Base for Living Like a Local in Eugene"
- We provide authentic local experiences and insider knowledge
- Our guests value quality accommodations and authentic local experiences
- We specialize in helping visitors experience Eugene like locals do`
        : selectedField === 'title'
        ? `Create an engaging, SEO-friendly blog post title for: ${promptToUse}

**Title Guidelines:**
- Keep under 60 characters for SEO optimization
- Include "Eugene" or local references when relevant
- Make it compelling and click-worthy
- Appeal to vacation rental guests and travelers
- Reflect Moxie's local expertise and premium positioning`
        : `Create a compelling blog post excerpt (150-160 characters) for: ${promptToUse}

**Excerpt Guidelines:**
- Engaging preview that entices readers to continue
- Include key benefits or highlights
- Appeal to vacation rental guests
- Professional yet approachable tone
- Include local Eugene context when relevant`;

      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: enhancedPrompt,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: currentTitle,
              excerpt: currentExcerpt,
              content: currentContent
            },
            field: selectedField,
            category: 'blog'
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has created professional blog content with Moxie's branding and local expertise.",
      });
    } catch (error: any) {
      console.error('Blog content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompleteBlogPost = async () => {
    setSelectedField('content');
    const completePrompt = `Create a complete, professionally written blog post for Moxie Vacation Rentals featuring:

**Blog Post Requirements:**

**Engaging Title & Introduction:**
- Compelling headline that captures reader attention
- Opening paragraphs that hook readers and set expectations
- Clear value proposition for Eugene visitors

**Well-Structured Content:**
- 5-7 main sections with descriptive subheadings
- Each section should be 2-3 paragraphs with substantial content
- Mix of practical information and inspirational storytelling
- Include specific Eugene locations, attractions, and local details

**Local Expertise Elements:**
- Insider tips and local secrets only residents would know
- Specific restaurant, attraction, and activity recommendations
- Seasonal considerations and best times to visit
- Local culture and community insights

**Practical Travel Information:**
- Transportation and logistics advice
- Budget considerations and value options
- Packing and preparation recommendations
- Safety and local etiquette tips

**Visual Content Suggestions:**
- Describe photo opportunities and Instagram-worthy spots
- Mention scenic locations and best photography times
- Include references to experiences that create lasting memories

**Call-to-Action & Booking Incentive:**
- Compelling reasons to choose Moxie Vacation Rentals
- Specific benefits of vacation rentals over hotels
- Encourage property exploration and booking
- Mention available properties and local expertise

**Content Style Guidelines:**
- Engaging, conversational tone suitable for travel blog
- Balance inspirational content with actionable advice
- Include personal touches and storytelling elements
- Make content easily scannable with clear formatting
- Target 1,500-2,000 words for comprehensive coverage
- Optimize for SEO while maintaining readability`;

    await generateContent(completePrompt);
  };

  const useTemplate = async (template: any) => {
    setAiPrompt(template.prompt);
    setSelectedField('content');
    await generateContent(template.prompt);
  };

  const useQuickPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    await generateContent(prompt);
  };

  const applyGeneratedContent = () => {
    if (!generatedContent) return;

    onContentGenerated(selectedField, generatedContent);

    toast({
      title: "Content Applied",
      description: `Updated ${selectedField} with professionally generated content.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenTool className="h-5 w-5 mr-2" />
          AI Blog Generator
        </CardTitle>
        <CardDescription>
          Generate professional blog posts with Moxie's branding and Eugene local expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button 
            onClick={generateCompleteBlogPost}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Complete Blog Post"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Blog Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Professional Blog Templates</p>
                <p className="text-sm text-gray-600 mt-1">Choose from expert-crafted blog post templates with Moxie branding</p>
              </div>
              
              <BlogTemplateSelector
                templates={blogTemplates}
                onTemplateSelect={useTemplate}
                isGenerating={isGenerating}
              />
              
              <BlogQuickPrompts
                prompts={blogQuickPrompts}
                onPromptSelect={useQuickPrompt}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <BlogCustomPromptInput
              selectedField={selectedField}
              onFieldChange={setSelectedField}
              aiPrompt={aiPrompt}
              onPromptChange={setAiPrompt}
              onGenerate={() => generateContent()}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>

        <BlogGeneratedContentDisplay
          generatedContent={generatedContent}
          selectedField={selectedField}
          onApply={applyGeneratedContent}
          onClear={() => setGeneratedContent('')}
        />
      </CardContent>
    </Card>
  );
};

export default BlogAIGenerator;
