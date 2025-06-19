import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Zap, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { newsletterTemplates, quickPrompts } from './NewsletterTemplates';
import TemplateSelector from './TemplateSelector';
import QuickPrompts from './QuickPrompts';
import CustomPromptInput from './CustomPromptInput';
import GeneratedContentDisplay from './GeneratedContentDisplay';
import { marked } from 'marked';
import { extractContentFromHTML, isFullHTMLDocument } from '@/utils/htmlContentExtractor';

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
  const [selectedField, setSelectedField] = useState<'subject' | 'content'>('content');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentWasFiltered, setContentWasFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  // Convert markdown to HTML and clean it up with better width handling
  const convertMarkdownToHtml = (markdownText: string): string => {
    // Configure marked to not add paragraph tags around single lines
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    let html = marked(markdownText) as string;
    
    // Clean up common markdown artifacts and add width constraints
    html = html
      .replace(/\*\*/g, '') // Remove any remaining ** 
      .replace(/##\s*/g, '') // Remove any remaining ##
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Convert *text* to <em>
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Convert `code` to <code>
      .replace(/<img/g, '<img style="max-width: 100%; height: auto;"') // Constrain images
      .replace(/<table/g, '<table style="width: 100%; table-layout: fixed;"') // Constrain tables
      .trim();

    return html;
  };

  // Validate and clean content before setting
  const validateAndCleanContent = (content: string): string => {
    if (!content) return '';
    
    // Remove excessively wide elements that could break layout
    const cleanedContent = content
      .replace(/style="[^"]*width:\s*[0-9]+px[^"]*"/gi, 'style="max-width: 100%;"')
      .replace(/width="[0-9]+"/gi, 'style="max-width: 100%;"')
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>'); // Remove excessive line breaks
    
    return cleanedContent;
  };

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
    setContentWasFiltered(false);

    try {
      const enhancedPrompt = selectedField === 'content' 
        ? `${promptToUse}

**IMPORTANT: GENERATE ONLY CONTENT FRAGMENTS FOR EDITOR**
- Generate ONLY the newsletter content that goes inside an email body
- DO NOT include <!DOCTYPE>, <html>, <head>, <body> tags or any full document structure
- DO NOT include <style> tags or CSS stylesheets
- Generate clean HTML content fragments using only: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <br>
- Structure content with clear HTML sections using proper heading tags
- Keep content width-constrained and responsive for email display
- Avoid fixed widths, use percentage-based or relative sizing
- Write in an engaging, professional tone suitable for vacation rental guests
- Include specific Eugene, Oregon references and local knowledge
- Focus on experiences that vacation rental guests would appreciate
- Make content scannable with clear paragraph breaks using <p> tags
- Include calls-to-action using <strong> tags for emphasis
- Use <h2> and <h3> for section headings (NOT ## or ###)
- Use <strong> for emphasis (NOT **)
- Use <em> for italics (NOT *)
- Ensure content is appropriate for email newsletter format
- NO markdown syntax allowed - only clean HTML fragments
- Keep images and tables responsive with max-width: 100%
- DO NOT create a complete email template - only the content that will go inside the template

**MOXIE BRAND CONTEXT:**
- We are Moxie Vacation Rentals, Eugene's premier vacation rental company
- Our tagline: "Your Home Base for Living Like a Local in Eugene"
- We specialize in helping guests experience Eugene like locals
- Our expertise is in Eugene, Oregon attractions, dining, and experiences
- We offer premium vacation rental properties throughout Eugene
- Our guests value authentic local experiences and quality accommodations`
        : promptToUse;

      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: enhancedPrompt,
          context: {
            businessType: 'vacation rental newsletter',
            currentContent: {
              siteName: 'Moxie Vacation Rentals',
              subject: currentSubject,
              content: currentContent
            },
            field: selectedField,
            category: 'newsletter'
          }
        }
      });

      if (error) throw error;

      // Convert any markdown to HTML and validate
      let cleanContent = selectedField === 'content' 
        ? convertMarkdownToHtml(data.content)
        : data.content;
      
      // Extract content if it's a full HTML document
      const extractionResult = extractContentFromHTML(cleanContent);
      cleanContent = extractionResult.content;
      
      if (extractionResult.wasFullDocument) {
        setContentWasFiltered(true);
        console.log('Filtered full HTML document to content fragment');
      }

      // Validate and clean the content
      cleanContent = validateAndCleanContent(cleanContent);

      setGeneratedContent(cleanContent);
      
      toast({
        title: "Content Generated!",
        description: extractionResult.wasFullDocument 
          ? "AI content was filtered to extract only the newsletter content for the editor."
          : "AI has created well-formatted, responsive content with Moxie's branding and style.",
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

  const generateCompleteNewsletter = async () => {
    setSelectedField('content');
    const completePrompt = `Create newsletter content for Moxie Vacation Rentals with clean HTML formatting.

**IMPORTANT: Generate ONLY content fragments, NOT a full email template**

Generate newsletter content using these sections with HTML formatting:

<h2>Welcome Section:</h2>
<p>Engaging opening that welcomes readers with brief overview of newsletter content</p>

<h2>Featured Content (choose 2-3 main topics):</h2>
<p>Property highlight with compelling description</p>
<p>Local Eugene events and attractions</p>
<p>Seasonal activities and recommendations</p>
<p>Guest experience story or testimonials</p>

<h2>Local Expertise Section:</h2>
<p>Insider tips for experiencing Eugene like a local</p>
<p>Hidden gems or lesser-known attractions</p>
<p>Dining recommendations from local favorites</p>

<h2>Call-to-Action Section:</h2>
<p>Encourage bookings with specific benefits</p>
<p>Mention available properties and special offers</p>
<p>Invite engagement and social media follows</p>

**CONTENT REQUIREMENTS:**
- Generate ONLY the content fragments (no full HTML document structure)
- Use <h2> and <h3> for headings (NOT ## or ###)
- Use <p> tags for paragraphs
- Use <strong> for emphasis (NOT **)
- Use <em> for italics (NOT *)
- Use <ul> and <li> for lists
- Make each section substantive with 2-3 paragraphs
- Include specific Eugene locations and details
- Use warm, welcoming tone that reflects local expertise
- Structure with clear HTML section breaks for easy reading
- Focus on experiences that vacation rental guests value
- Include practical information mixed with inspirational content
- End with strong call-to-action for bookings
- Ensure all content is responsive and width-constrained
- NO fixed widths or elements that could break email layout

**STYLE GUIDELINES:**
- Professional yet friendly tone
- Locally-focused content showcasing Eugene expertise
- Scannable HTML format with clear paragraph breaks
- Engaging content that makes readers excited about Eugene
- Include specific details rather than generic tourism information
- NO MARKDOWN SYNTAX - only clean HTML fragments
- NO full document structure - content fragments only`;

    await generateContent(completePrompt);
  };

  const useTemplate = async (template: any) => {
    console.log('Using template:', template);
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

    // Final validation before applying
    const finalContent = validateAndCleanContent(generatedContent);
    onContentGenerated(selectedField, finalContent);

    toast({
      title: "Content Applied",
      description: `Updated ${selectedField} with responsive, well-formatted content. You can now edit it in the editor.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
    setContentWasFiltered(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          Enhanced AI Newsletter Generator
        </CardTitle>
        <CardDescription>
          Generate professionally designed, responsive newsletters with Moxie's branding and Eugene expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {contentWasFiltered && (
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Content Automatically Filtered</h4>
              <p className="text-sm text-blue-700 mt-1">
                The AI generated a full email template, but we've extracted just the content for the editor. 
                The full professional template will be applied when you send the newsletter.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={generateCompleteNewsletter}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Complete Newsletter Content"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Professional Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Moxie Newsletter Templates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose from professionally designed templates with Moxie branding and Eugene expertise
                </p>
              </div>
              
              <TemplateSelector
                templates={newsletterTemplates}
                onTemplateSelect={useTemplate}
                isGenerating={isGenerating}
              />
              
              <div className="border-t pt-6">
                <h4 className="text-md font-medium mb-3">Quick Design Ideas</h4>
                <QuickPrompts
                  prompts={quickPrompts}
                  onPromptSelect={useQuickPrompt}
                  isGenerating={isGenerating}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomPromptInput
              selectedField={selectedField}
              onFieldChange={setSelectedField}
              aiPrompt={aiPrompt}
              onPromptChange={setAiPrompt}
              onGenerate={() => generateContent()}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>

        <GeneratedContentDisplay
          generatedContent={generatedContent}
          selectedField={selectedField}
          onApply={applyGeneratedContent}
          onClear={() => {
            setGeneratedContent('');
            setContentWasFiltered(false);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default NewsletterAIGenerator;
