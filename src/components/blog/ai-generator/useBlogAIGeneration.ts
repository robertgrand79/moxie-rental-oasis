
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseBlogAIGenerationProps {
  currentTitle: string;
  currentExcerpt: string;
  currentContent: string;
  onContentGenerated: (field: 'title' | 'excerpt' | 'content', content: string) => void;
}

export const useBlogAIGeneration = ({
  currentTitle,
  currentExcerpt,
  currentContent,
  onContentGenerated
}: UseBlogAIGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<'title' | 'excerpt' | 'content'>('content');
  const [generatedContent, setGeneratedContent] = useState('');
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

**PARAGRAPH STRUCTURE REQUIREMENTS:**
- Create distinct, well-structured paragraphs for maximum readability
- Each paragraph should focus on ONE main topic or idea
- Use double line breaks between paragraphs to create clear separation
- Write 2-4 sentences per paragraph for optimal readability
- Create natural transitions between paragraphs
- Structure content with clear topic progression
- Make content easily scannable with proper paragraph spacing
- Start new paragraphs when introducing new concepts or ideas

**MOXIE BLOG CONTENT REQUIREMENTS:**
- Create engaging blog post content with natural flow between topics
- Use conversational tone appropriate for travel blog readers
- Include specific Eugene, Oregon details and local expertise
- Write in well-structured paragraph format with clear section breaks
- Include actionable tips and practical information
- Make content naturally scannable with excellent paragraph structure
- End with a compelling call-to-action encouraging bookings
- Ensure content is SEO-friendly and engaging for vacation rental guests

**CONTENT FLOW STRUCTURE:**
Write content in distinct, well-spaced paragraphs that flow like this:

Opening paragraph that introduces the topic and captures reader interest.

Second paragraph that expands on the main theme with specific details.

Additional paragraphs that each cover individual aspects, locations, or experiences, with each paragraph being a complete thought.

Include practical information paragraphs that provide actionable advice.

Conclude with strong closing paragraphs that encourage engagement and bookings.

**MOXIE BRAND VOICE:**
- We are Moxie Vacation Rentals, Eugene's premier local experts
- Our mission: "Your Home Base for Living Like a Local in Eugene"
- We provide authentic local experiences and insider knowledge
- Our guests value quality accommodations and authentic local experiences
- We specialize in helping visitors experience Eugene like locals do

Write clean, well-structured prose with excellent paragraph breaks that will work perfectly with rich text editors - absolutely no formatting syntax allowed.`
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

  const generateAllFields = async (topicPrompt: string) => {
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

**PARAGRAPH STRUCTURE REQUIREMENTS:**
- Create distinct, well-structured paragraphs for maximum readability
- Each paragraph should focus on ONE main topic or idea
- Use double line breaks between paragraphs to create clear separation
- Write 2-4 sentences per paragraph for optimal readability
- Create natural transitions between paragraphs
- Structure content with clear topic progression
- Make content easily scannable with proper paragraph spacing
- Start new paragraphs when introducing new concepts or ideas

**MOXIE BLOG CONTENT REQUIREMENTS:**
- Create engaging blog post content with natural flow between topics
- Use conversational tone appropriate for travel blog readers
- Include specific Eugene, Oregon details and local expertise
- Write in well-structured paragraph format with clear section breaks
- Include actionable tips and practical information
- Make content naturally scannable with excellent paragraph structure
- End with a compelling call-to-action encouraging bookings
- Ensure content is SEO-friendly and engaging for vacation rental guests

**CONTENT FLOW STRUCTURE:**
Write content in distinct, well-spaced paragraphs that flow like this:

Opening paragraph that introduces the topic and captures reader interest.

Second paragraph that expands on the main theme with specific details.

Additional paragraphs that each cover individual aspects, locations, or experiences, with each paragraph being a complete thought.

Include practical information paragraphs that provide actionable advice.

Conclude with strong closing paragraphs that encourage engagement and bookings.

**MOXIE BRAND VOICE:**
- We are Moxie Vacation Rentals, Eugene's premier local experts
- Our mission: "Your Home Base for Living Like a Local in Eugene"
- We provide authentic local experiences and insider knowledge
- Our guests value quality accommodations and authentic local experiences
- We specialize in helping visitors experience Eugene like locals do

Write clean, well-structured prose with excellent paragraph breaks that will work perfectly with rich text editors - absolutely no formatting syntax allowed.`;

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

**PARAGRAPH STRUCTURE REQUIREMENTS:**
- Create distinct, well-structured paragraphs for maximum readability
- Each paragraph should focus on ONE main topic or idea
- Use double line breaks between paragraphs to create clear separation
- Write 2-4 sentences per paragraph for optimal readability
- Create natural transitions between paragraphs
- Structure content with clear topic progression
- Make content easily scannable with proper paragraph spacing
- Start new paragraphs when introducing new concepts or ideas

**Blog Post Content Structure:**
Create a comprehensive blog post with natural flow between topics, including:

Engaging opening paragraph that captures reader attention and introduces the topic with clear value for Eugene visitors.

Main content sections that flow naturally from one topic to the next, each in separate, well-structured paragraphs containing specific Eugene details, local insights, and practical information.

Include authentic local expertise covering Eugene attractions, dining, activities, and cultural experiences that vacation rental guests would appreciate, with each major topic in its own paragraph.

Practical travel information woven naturally into distinct paragraphs, including tips for getting around, seasonal considerations, and insider knowledge.

Personal touches and storytelling elements in separate paragraphs that make the content engaging and memorable.

Strong closing paragraph with compelling reasons to choose Moxie Vacation Rentals and encouragement to explore available properties.

**Content Guidelines:**
- Target 1,500-2,000 words for comprehensive coverage
- Use engaging, conversational tone suitable for travel blog
- Balance inspirational content with actionable advice
- Include specific Eugene locations, restaurants, and attractions
- Make content naturally scannable through excellent paragraph structure
- Optimize for SEO while maintaining excellent readability
- Write from the perspective of local Eugene experts sharing insider knowledge

Write clean, flowing prose with excellent paragraph structure that will work perfectly in rich text editors without any formatting syntax.`;

    await generateContent(completePrompt);
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

  return {
    isGenerating,
    aiPrompt,
    setAiPrompt,
    selectedField,
    setSelectedField,
    generatedContent,
    setGeneratedContent,
    isGeneratingAll,
    generationProgress,
    generateContent,
    generateAllFields,
    generateCompleteBlogPost,
    applyGeneratedContent
  };
};
