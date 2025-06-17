
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, Calendar, MapPin, Home, Star, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'weekly' | 'property' | 'events' | 'seasonal';
  icon: React.ReactNode;
}

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

  const newsletterTemplates: NewsletterTemplate[] = [
    {
      id: 'weekly-digest',
      title: 'Weekly Local Digest',
      description: 'Curated local events and attractions for guests',
      category: 'weekly',
      icon: <Calendar className="h-4 w-4" />,
      prompt: `Create a weekly newsletter for Moxie Vacation Rentals guests featuring:

- Welcome message for new and returning guests
- 3-4 must-visit local Eugene attractions this week
- 2-3 upcoming events happening in Eugene
- One hidden gem or local secret
- Weather forecast and what to pack
- Special dining recommendations
- A call-to-action to book or extend stays

Style: Warm, welcoming, and locally-focused. Make guests excited about exploring Eugene during their stay.`
    },
    {
      id: 'property-spotlight',
      title: 'Property Spotlight',
      description: 'Showcase a specific property with local context',
      category: 'property',
      icon: <Home className="h-4 w-4" />,
      prompt: `Create a property spotlight newsletter for Moxie Vacation Rentals featuring:

- Hero section highlighting one of our featured properties
- What makes this property special and unique
- Nearby attractions within walking/short driving distance
- Perfect guest personas for this property (couples, families, business travelers)
- Guest testimonial or review highlight
- Seasonal activities accessible from this location
- Booking incentive or special offer
- Cross-sell other properties for different experiences

Style: Aspirational and detailed, helping readers envision their perfect Eugene getaway.`
    },
    {
      id: 'seasonal-guide',
      title: 'Seasonal Eugene Guide',
      description: 'Seasonal activities and experiences guide',
      category: 'seasonal',
      icon: <MapPin className="h-4 w-4" />,
      prompt: `Create a seasonal guide newsletter for Moxie Vacation Rentals featuring:

- Current season highlights in Eugene, Oregon
- Top 5 seasonal activities and experiences
- Local festivals and events happening this season
- Weather tips and what to pack
- Seasonal dining and local food specialties
- Outdoor activities perfect for this time of year
- Photography spots and Instagram-worthy locations
- Exclusive seasonal packages or recommendations

Style: Informative and inspiring, positioning Moxie as the local expert for seasonal Eugene experiences.`
    },
    {
      id: 'guest-story',
      title: 'Guest Story & Reviews',
      description: 'Feature guest experiences and testimonials',
      category: 'weekly',
      icon: <Star className="h-4 w-4" />,
      prompt: `Create a guest story newsletter for Moxie Vacation Rentals featuring:

- Featured guest story or experience highlight
- What they loved most about their Eugene stay
- Local places they discovered during their visit
- Photos or quotes from their experience (if available)
- Similar experiences other guests can have
- Recommendations based on their travel style
- Invitation for other guests to share their stories
- Call-to-action encouraging bookings and reviews

Style: Personal and authentic, showcasing real guest experiences to inspire future visitors.`
    },
    {
      id: 'events-roundup',
      title: 'Eugene Events Roundup',
      description: 'Comprehensive local events and activities',
      category: 'events',
      icon: <Calendar className="h-4 w-4" />,
      prompt: `Create an events roundup newsletter for Moxie Vacation Rentals featuring:

- This month's can't-miss events in Eugene
- Art shows, concerts, and cultural happenings
- Farmers markets and local food events
- Outdoor activities and recreational opportunities
- Family-friendly events and activities
- Date night and romantic experience ideas
- Free and budget-friendly local activities
- How to book stays that align with these events

Style: Comprehensive and exciting, positioning our properties as the perfect base for experiencing Eugene's vibrant event scene.`
    }
  ];

  const quickPrompts = [
    "Create a welcome newsletter for first-time Eugene visitors",
    "Write about hidden gems only locals know",
    "Feature upcoming weekend events in Eugene", 
    "Highlight outdoor activities for families",
    "Showcase Eugene's food and dining scene",
    "Create a romantic getaway guide for couples"
  ];

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
      const { data, error } = await supabase.functions.invoke('generate-site-content', {
        body: {
          prompt: promptToUse,
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

  const generateCompleteNewsletter = async () => {
    setSelectedField('content');
    const completePrompt = `Create a complete newsletter for Moxie Vacation Rentals including:

1. An engaging subject line
2. A full newsletter with multiple sections covering:
   - Welcome message
   - Local Eugene highlights
   - Property recommendations
   - Upcoming events
   - Call-to-action

Make it comprehensive, engaging, and ready to send to our vacation rental guests.`;

    await generateContent(completePrompt);
  };

  const useTemplate = async (template: NewsletterTemplate) => {
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
      description: `Updated ${selectedField}.`,
    });

    setGeneratedContent('');
    setAiPrompt('');
  };

  const getTemplatesByCategory = (category: string) => {
    return newsletterTemplates.filter(template => template.category === category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Newsletter Generator
        </CardTitle>
        <CardDescription>
          Generate newsletter content with AI assistance using templates or custom prompts
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
            {isGenerating ? "Generating..." : "Generate Complete Newsletter"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Newsletter Templates</Label>
                <p className="text-sm text-gray-600 mt-1">Choose a pre-built template for quick newsletter generation</p>
              </div>
              
              <div className="grid gap-3">
                {newsletterTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">{template.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{template.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => useTemplate(template)}
                          disabled={isGenerating}
                          size="sm"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Ideas</Label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => useQuickPrompt(prompt)}
                      disabled={isGenerating}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
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
                rows={4}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={() => generateContent()}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          </TabsContent>
        </Tabs>

        {generatedContent && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label>Generated Content</Label>
              <div className="mt-1 p-4 border rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={applyGeneratedContent} className="flex-1">
                Apply to {selectedField}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedContent('')}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterAIGenerator;
