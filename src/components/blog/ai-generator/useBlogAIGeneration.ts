
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseBlogAIGenerationProps {
  currentTitle: string;
  currentExcerpt: string;
  currentContent: string;
  onContentGenerated: (field: 'title' | 'excerpt' | 'content' | 'tags', content: string) => void;
}

export const useBlogAIGeneration = ({
  currentTitle,
  currentExcerpt,
  currentContent,
  onContentGenerated
}: UseBlogAIGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'title' | 'excerpt' | 'content' | 'tags'>('content');
  const [generatedContent, setGeneratedContent] = useState('');

  const generateContent = async (promptOverride?: string) => {
    const prompt = promptOverride || aiPrompt;
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🤖 Generating content for field:', selectedField, 'with prompt:', prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt,
          context: {
            category: 'blog',
            field: selectedField,
            currentTitle: currentTitle || '',
            currentExcerpt: currentExcerpt || '',
            currentContent: currentContent || '',
            location: 'Eugene, Oregon',
            businessType: 'Vacation Rental Business'
          }
        }
      });

      if (error) throw error;

      if (data?.content) {
        console.log('✅ AI generated content:', data.content.substring(0, 100));
        setGeneratedContent(data.content);
        
        toast({
          title: 'Content Generated!',
          description: `AI has generated ${selectedField} content for your blog post.`
        });
      }
    } catch (error) {
      console.error('❌ AI generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllFields = async (topicPrompt: string) => {
    if (!topicPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic for the blog post.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress('Starting generation...');

    try {
      // Generate Title
      setGenerationProgress('Generating title...');
      const titlePrompt = `Create an engaging, SEO-friendly blog post title about: ${topicPrompt}. Focus on Eugene, Oregon and vacation rentals/travel. Make it compelling and click-worthy.`;
      
      const { data: titleData, error: titleError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: titlePrompt,
          context: {
            category: 'blog',
            field: 'title',
            location: 'Eugene, Oregon',
            businessType: 'Vacation Rental Business',
            currentTitle: '',
            currentExcerpt: '',
            currentContent: ''
          }
        }
      });

      if (titleError) throw titleError;
      const generatedTitle = titleData?.content || 'Untitled Post';
      onContentGenerated('title', generatedTitle);

      // Generate Tags with specific context
      setGenerationProgress('Generating tags...');
      const tagsPrompt = `Generate SEO-friendly tags for a blog post about: ${topicPrompt}. Focus on Eugene, Oregon, vacation rentals, and travel keywords.`;
      
      const { data: tagsData, error: tagsError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: tagsPrompt,
          context: {
            category: 'blog',
            field: 'tags',
            location: 'Eugene, Oregon',
            businessType: 'Vacation Rental Business',
            currentTitle: generatedTitle,
            currentExcerpt: '',
            currentContent: ''
          }
        }
      });

      if (tagsError) throw tagsError;
      const generatedTags = tagsData?.content || 'eugene, oregon, travel';
      onContentGenerated('tags', generatedTags);

      // Generate Excerpt
      setGenerationProgress('Generating excerpt...');
      const excerptPrompt = `Create a compelling 2-3 sentence excerpt for a blog post titled "${generatedTitle}" about: ${topicPrompt}. Make it engaging and informative for travelers interested in Eugene, Oregon.`;
      
      const { data: excerptData, error: excerptError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: excerptPrompt,
          context: {
            category: 'blog',
            field: 'excerpt',
            location: 'Eugene, Oregon',
            businessType: 'Vacation Rental Business',
            currentTitle: generatedTitle,
            currentExcerpt: '',
            currentContent: ''
          }
        }
      });

      if (excerptError) throw excerptError;
      const generatedExcerpt = excerptData?.content || 'A great post about Eugene, Oregon.';
      onContentGenerated('excerpt', generatedExcerpt);

      // Generate Content
      setGenerationProgress('Generating main content...');
      const contentPrompt = `Write a comprehensive, engaging blog post titled "${generatedTitle}" about: ${topicPrompt}. 
      
The post should:
- Be 800-1200 words
- Focus on Eugene, Oregon and surrounding areas
- Be helpful for vacation rental guests and travelers
- Include practical tips and local insights
- Use a friendly, informative tone
- Include specific locations, attractions, or experiences when relevant
- Be well-structured with clear paragraphs
      
Make it valuable for people visiting Eugene or considering vacation rentals in the area.`;
      
      const { data: contentData, error: contentError } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: contentPrompt,
          context: {
            category: 'blog',
            field: 'content',
            location: 'Eugene, Oregon',
            businessType: 'Vacation Rental Business',
            currentTitle: generatedTitle,
            currentExcerpt: generatedExcerpt,
            currentContent: ''
          }
        }
      });

      if (contentError) throw contentError;
      const generatedContent = contentData?.content || 'Blog content could not be generated.';
      onContentGenerated('content', generatedContent);

      setGenerationProgress('Complete!');
      
      toast({
        title: 'Complete Blog Post Generated!',
        description: 'AI has generated title, excerpt, tags, and content for your blog post.',
      });

    } catch (error) {
      console.error('❌ Complete blog generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate complete blog post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingAll(false);
      setGenerationProgress('');
    }
  };

  const applyGeneratedContent = () => {
    if (generatedContent) {
      onContentGenerated(selectedField, generatedContent);
      setGeneratedContent('');
      
      toast({
        title: 'Content Applied!',
        description: `The generated ${selectedField} has been applied to your blog post.`
      });
    }
  };

  return {
    isGenerating,
    isGeneratingAll,
    generationProgress,
    aiPrompt,
    setAiPrompt,
    selectedField,
    setSelectedField,
    generatedContent,
    setGeneratedContent,
    generateContent,
    generateAllFields,
    applyGeneratedContent
  };
};
