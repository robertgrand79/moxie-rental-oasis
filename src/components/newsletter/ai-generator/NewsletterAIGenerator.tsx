
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { newsletterTemplates, quickPrompts } from './NewsletterTemplates';
import TemplateSelector from './TemplateSelector';
import QuickPrompts from './QuickPrompts';
import CustomPromptInput from './CustomPromptInput';
import GeneratedContentDisplay from './GeneratedContentDisplay';

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

**IMPORTANT FORMATTING INSTRUCTIONS:**
- Structure the content with clear, distinct sections
- Use line breaks between different topics/sections
- Write in an engaging, professional tone suitable for vacation rental guests
- Include specific Eugene, Oregon references and local knowledge
- Focus on experiences that vacation rental guests would appreciate
- Make the content scannable with clear paragraph breaks
- Include calls-to-action that encourage engagement and bookings
- Ensure content is appropriate for email newsletter format

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

      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: "AI has created beautifully formatted content with Moxie's branding and style.",
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
    const completePrompt = `Create a complete, professionally formatted newsletter for Moxie Vacation Rentals including:

**Newsletter Structure:**

**Welcome Section:**
- Engaging opening that welcomes readers
- Brief overview of what's included in this newsletter

**Featured Content (choose 2-3 main topics):**
- Property highlight with compelling description
- Local Eugene events and attractions
- Seasonal activities and recommendations
- Guest experience story or testimonial

**Local Expertise Section:**
- Insider tips for experiencing Eugene like a local
- Hidden gems or lesser-known attractions
- Dining recommendations from local favorites

**Call-to-Action Section:**
- Encourage bookings with specific benefits
- Mention available properties and special offers
- Invite engagement and social media follows

**CONTENT REQUIREMENTS:**
- Make each section substantive with 2-3 paragraphs
- Include specific Eugene locations and details
- Use warm, welcoming tone that reflects our local expertise
- Structure with clear section breaks for easy reading
- Focus on experiences that vacation rental guests value
- Include practical information mixed with inspirational content
- End with strong call-to-action for bookings

**STYLE GUIDELINES:**
- Professional yet friendly tone
- Locally-focused content that showcases Eugene expertise
- Scannable format with clear paragraph breaks
- Engaging content that makes readers excited about Eugene
- Include specific details rather than generic tourism information`;

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
      description: `Updated ${selectedField} with professionally designed content.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          Enhanced AI Newsletter Generator
        </CardTitle>
        <CardDescription>
          Generate professionally designed newsletters with Moxie's branding and Eugene expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button 
            onClick={generateCompleteNewsletter}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Complete Designed Newsletter"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Professional Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Moxie Newsletter Templates</p>
                <p className="text-sm text-gray-600 mt-1">Choose from professionally designed templates with Moxie branding</p>
              </div>
              
              <TemplateSelector
                templates={newsletterTemplates}
                onTemplateSelect={useTemplate}
                isGenerating={isGenerating}
              />
              
              <QuickPrompts
                prompts={quickPrompts}
                onPromptSelect={useQuickPrompt}
                isGenerating={isGenerating}
              />
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
          onClear={() => setGeneratedContent('')}
        />
      </CardContent>
    </Card>
  );
};

export default NewsletterAIGenerator;
