import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Zap, PenTool, Sparkles } from 'lucide-react';
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
  const [topicPrompt, setTopicPrompt] = useState('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
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

**CRITICAL: NO MARKDOWN FORMATTING ALLOWED**
- Write in clean, flowing prose without any markdown syntax
- NEVER use ### or ## for headings - write descriptive section titles as regular text
- NEVER use *** or ** for bold text - write naturally
- NEVER use * for italic text - write naturally  
- NEVER use - or * for bullet points - write in paragraph form
- Focus on storytelling and engaging narrative
- Write as if you're writing directly in a word processor
- Use natural paragraph breaks and flowing sentences

**MOXIE BLOG CONTENT REQUIREMENTS:**
- Create engaging blog post content with natural flow between topics
- Use conversational tone appropriate for travel blog readers
- Include specific Eugene, Oregon details and local expertise
- Write in paragraph format with clear section breaks
- Include actionable tips and practical information
- Make content naturally scannable with good paragraph structure
- End with a compelling call-to-action encouraging bookings
- Ensure content is SEO-friendly and engaging for vacation rental guests

**MOXIE BRAND VOICE:**
- We are Moxie Vacation Rentals, Eugene's premier local experts
- Our mission: "Your Home Base for Living Like a Local in Eugene"
- We provide authentic local experiences and insider knowledge
- Our guests value quality accommodations and authentic local experiences
- We specialize in helping visitors experience Eugene like locals do

Write clean prose that will work perfectly with rich text editors - absolutely no formatting syntax allowed.`
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
        description: "AI has created clean, editor-friendly blog content with Moxie's branding and local expertise.",
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

  const generateAllFields = async () => {
    if (!topicPrompt.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate all blog fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAll(true);

    try {
      // Step 1: Generate title
      setGenerationProgress('Generating title...');
      const titlePrompt = `Create an engaging, SEO-friendly blog post title for: ${topicPrompt}

**Title Guidelines:**
- Keep under 60 characters for SEO optimization
- Include "Eugene" or local references when relevant
- Make it compelling and click-worthy
- Appeal to vacation rental guests and travelers
- Reflect Moxie's local expertise and premium positioning`;

      const { data: titleData, error: titleError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: titlePrompt,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: currentTitle,
              excerpt: currentExcerpt,
              content: currentContent
            },
            field: 'title',
            category: 'blog'
          }
        }
      });

      if (titleError) throw titleError;
      const generatedTitle = titleData.content;

      // Step 2: Generate excerpt
      setGenerationProgress('Generating excerpt...');
      const excerptPrompt = `Create a compelling blog post excerpt (150-160 characters) for a blog post titled: "${generatedTitle}"

Topic: ${topicPrompt}

**Excerpt Guidelines:**
- Engaging preview that entices readers to continue
- Include key benefits or highlights
- Appeal to vacation rental guests
- Professional yet approachable tone
- Include local Eugene context when relevant`;

      const { data: excerptData, error: excerptError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: excerptPrompt,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: generatedTitle,
              excerpt: currentExcerpt,
              content: currentContent
            },
            field: 'excerpt',
            category: 'blog'
          }
        }
      });

      if (excerptError) throw excerptError;
      const generatedExcerpt = excerptData.content;

      // Step 3: Generate content
      setGenerationProgress('Generating content...');
      const contentPrompt = `Create a comprehensive blog post about: ${topicPrompt}

Title: ${generatedTitle}
Excerpt: ${generatedExcerpt}

**CRITICAL: NO MARKDOWN FORMATTING ALLOWED**
- Write in clean, flowing prose without any markdown syntax
- NEVER use ### or ## for headings - write descriptive section titles as regular text
- NEVER use *** or ** for bold text - write naturally
- NEVER use * for italic text - write naturally  
- NEVER use - or * for bullet points - write in paragraph form
- Focus on storytelling and engaging narrative
- Write as if you're writing directly in a word processor
- Use natural paragraph breaks and flowing sentences

**MOXIE BLOG CONTENT REQUIREMENTS:**
- Create engaging blog post content with natural flow between topics
- Use conversational tone appropriate for travel blog readers
- Include specific Eugene, Oregon details and local expertise
- Write in paragraph format with clear section breaks
- Include actionable tips and practical information
- Make content naturally scannable with good paragraph structure
- End with a compelling call-to-action encouraging bookings
- Ensure content is SEO-friendly and engaging for vacation rental guests

**MOXIE BRAND VOICE:**
- We are Moxie Vacation Rentals, Eugene's premier local experts
- Our mission: "Your Home Base for Living Like a Local in Eugene"
- We provide authentic local experiences and insider knowledge
- Our guests value quality accommodations and authentic local experiences
- We specialize in helping visitors experience Eugene like locals do

Write clean prose that will work perfectly with rich text editors - absolutely no formatting syntax allowed.`;

      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: contentPrompt,
          context: {
            businessType: 'vacation rental blog',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              title: generatedTitle,
              excerpt: generatedExcerpt,
              content: currentContent
            },
            field: 'content',
            category: 'blog'
          }
        }
      });

      if (contentError) throw contentError;

      // Apply all generated content
      onContentGenerated('title', generatedTitle);
      onContentGenerated('excerpt', generatedExcerpt);
      onContentGenerated('content', contentData.content);

      toast({
        title: "All Fields Generated!",
        description: "Successfully generated title, excerpt, and content for your blog post.",
      });

      // Clear the topic prompt after successful generation
      setTopicPrompt('');
      
    } catch (error: any) {
      console.error('All fields generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAll(false);
      setGenerationProgress('');
    }
  };

  const generateCompleteBlogPost = async () => {
    setSelectedField('content');
    const completePrompt = `Create a complete, professionally written blog post for Moxie Vacation Rentals with clean, flowing prose:

**CRITICAL FORMATTING REQUIREMENTS:**
- Write in clean, natural prose without any markdown syntax
- NEVER use ### or ## for headings - write descriptive introductory sentences
- NEVER use *** or ** for bold - write naturally and let the editor handle emphasis
- NEVER use * for italic - write naturally
- NEVER use - or * for bullet points - write in flowing paragraph form
- Focus on storytelling and engaging narrative flow
- Write as if you're writing directly in a word processor

**Blog Post Content Structure:**
Create a comprehensive blog post with natural flow between topics, including:

Engaging opening that captures reader attention and introduces the topic with clear value for Eugene visitors.

Main content sections that flow naturally from one topic to the next, each containing 2-3 substantial paragraphs with specific Eugene details, local insights, and practical information.

Include authentic local expertise covering Eugene attractions, dining, activities, and cultural experiences that vacation rental guests would appreciate.

Practical travel information woven naturally into the narrative, including tips for getting around, seasonal considerations, and insider knowledge.

Personal touches and storytelling elements that make the content engaging and memorable.

Strong closing with compelling reasons to choose Moxie Vacation Rentals and encouragement to explore available properties.

**Content Guidelines:**
- Target 1,500-2,000 words for comprehensive coverage
- Use engaging, conversational tone suitable for travel blog
- Balance inspirational content with actionable advice
- Include specific Eugene locations, restaurants, and attractions
- Make content naturally scannable through good paragraph structure
- Optimize for SEO while maintaining excellent readability
- Write from the perspective of local Eugene experts sharing insider knowledge

Write clean, flowing prose that will work perfectly in rich text editors without any formatting syntax.`;

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
        {/* Generate All Fields Section */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Generate Complete Blog Post</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="topic-prompt">Blog Topic</Label>
              <Input
                id="topic-prompt"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="e.g., Best coffee shops in Eugene, Eugene food scene, Hiking trails near Eugene"
                disabled={isGeneratingAll}
              />
            </div>
            
            <Button 
              onClick={generateAllFields}
              disabled={isGeneratingAll || !topicPrompt.trim()}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingAll ? generationProgress || "Generating..." : "Generate All Fields (Title + Excerpt + Content)"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateCompleteBlogPost}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Content Only"}
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
