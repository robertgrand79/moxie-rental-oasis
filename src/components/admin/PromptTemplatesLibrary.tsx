
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Sparkles, 
  Calendar, 
  Star, 
  MapPin, 
  FileText, 
  Mail, 
  Share2,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  variables: string[];
  icon: React.ReactNode;
}

interface PromptTemplatesLibraryProps {
  onUseTemplate: (prompt: string, category: string) => void;
}

const PromptTemplatesLibrary = ({ onUseTemplate }: PromptTemplatesLibraryProps) => {
  const { toast } = useToast();
  const { settings } = useTenantSettings();
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Dynamic values from tenant settings
  const siteName = settings.site_name || 'our vacation rentals';
  const locationText = settings.heroLocationText || 'your destination';

  const promptTemplates: PromptTemplate[] = [
    // Weekly Content Sprint
    {
      id: 'weekly-sprint',
      title: 'Weekly Content Sprint',
      description: 'Generate a complete week of content across all channels',
      category: 'workflow',
      icon: <Calendar className="h-5 w-5" />,
      variables: [],
      prompt: `Generate this week's content sprint for ${siteName}. Include:

1 blog post idea with outline
1 newsletter idea with subject line and content  
3 social media post ideas with captions and hashtags
1 local event or lifestyle feature to spotlight

Style: friendly, upscale, and local-first approach that showcases ${locationText} as a premier vacation destination.`
    },
    
    // Testimonial Conversion
    {
      id: 'testimonial-conversion',
      title: 'Testimonial Conversion',
      description: 'Transform guest reviews into compelling testimonials',
      category: 'content',
      icon: <Star className="h-5 w-5" />,
      variables: ['GUEST_REVIEW'],
      prompt: `Turn this guest review into a compelling testimonial formatted for use on our website and Instagram:

"{GUEST_REVIEW}"

Format it as:
- A powerful quote excerpt
- Guest name and stay details
- Property featured
- Call-to-action to book

Style it to match our brand: friendly, upscale, and trustworthy.`
    },

    // Point of Interest Page Builder
    {
      id: 'poi-builder',
      title: 'Point of Interest Page Builder',
      description: `Create detailed POI pages for ${locationText} attractions`,
      category: 'poi',
      icon: <MapPin className="h-5 w-5" />,
      variables: ['PLACE_NAME'],
      prompt: `Write a 'Point of Interest' page for {PLACE_NAME} in ${locationText}. Include:

- A catchy intro that hooks readers
- Why it's special and unique
- How close it is to our rentals (with specific distance/time)
- When to go / insider tips from locals
- A compelling call-to-action to book with ${siteName}

Style: Informative yet exciting, positioning us as the local expert for the best ${locationText} experience.`
    },

    // Blog Post Generator
    {
      id: 'blog-generator',
      title: 'Blog Post Generator',
      description: 'Create engaging blog posts on any topic',
      category: 'content',
      icon: <FileText className="h-5 w-5" />,
      variables: ['TOPIC'],
      prompt: `Write a 500–700 word blog post on {TOPIC}. Include:

- Compelling headline that includes SEO keywords
- Introduction that hooks the reader
- 3-4 subheadings with valuable content
- Local ${locationText} connections where relevant
- Call-to-action encouraging bookings

Style: Match our brand - friendly, upscale, and local-first. Write for travelers who appreciate authentic, high-quality experiences.`
    },

    // Content Calendar Creation
    {
      id: 'content-calendar',
      title: 'Content Calendar Creation',
      description: 'Plan a month of strategic content',
      category: 'workflow',
      icon: <Calendar className="h-5 w-5" />,
      variables: ['SEASON_THEME'],
      prompt: `Create a 4-week content calendar for our blog, newsletter, and social media. Focus on:

- Seasonally relevant content for {SEASON_THEME}
- Local ${locationText} events and attractions
- Travel/lifestyle inspiration
- Property showcases
- Guest testimonials and stories

Format as a week-by-week breakdown with specific content types, topics, and publishing schedule. Include hashtag strategies and cross-promotion opportunities.`
    },

    // Newsletter Draft
    {
      id: 'newsletter-draft',
      title: 'Newsletter Draft',
      description: 'Create engaging newsletters for guests',
      category: 'content',
      icon: <Mail className="h-5 w-5" />,
      variables: ['NEWSLETTER_TOPIC'],
      prompt: `Create a newsletter for ${siteName}. The theme is {NEWSLETTER_TOPIC}. Write:

- Compelling subject line (under 50 characters)
- Preview text that teases the content
- Engaging intro paragraph
- 2-3 short stories or features related to ${locationText}/travel
- Local event spotlights
- Property highlights
- Strong call-to-action to book or learn more

Style: Warm, personal, and informative. Make readers excited about visiting ${locationText} and staying with us.`
    },

    // Social Caption Template
    {
      id: 'social-caption',
      title: 'Social Media Caption',
      description: 'Create engaging social media posts',
      category: 'social',
      icon: <Share2 className="h-5 w-5" />,
      variables: ['HOOK_LINE', 'MAIN_MESSAGE'],
      prompt: `Create a social media caption using this format:

🌟 {HOOK_LINE}

{MAIN_MESSAGE}

📍 Stay local. Stay with us.

Include relevant hashtags for ${locationText} vacation rentals and the specific content topic. Keep it engaging and on-brand.`
    },

    // Local Event Snapshot
    {
      id: 'event-snapshot',
      title: 'Local Event Snapshot',
      description: 'Create event features for marketing',
      category: 'events',
      icon: <Calendar className="h-5 w-5" />,
      variables: ['EVENT_NAME', 'EVENT_DATE', 'EVENT_VENUE'],
      prompt: `Create a local event snapshot for {EVENT_NAME}:

Event Name: {EVENT_NAME}
When: {EVENT_DATE}
Where: {EVENT_VENUE}
Why You'll Love It: [Write a compelling hook that connects to the ${siteName} experience]
Perfect For: [Target audience - families, couples, etc.]
Book Your Stay: Include compelling call-to-action

Style: Exciting and informative, positioning our properties as the perfect base for experiencing ${locationText}'s best events.`
    }
  ];

  const categories = [
    { key: 'workflow', label: 'Workflows', icon: <Wand2 className="h-4 w-4" /> },
    { key: 'content', label: 'Content', icon: <FileText className="h-4 w-4" /> },
    { key: 'poi', label: 'Points of Interest', icon: <MapPin className="h-4 w-4" /> },
    { key: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
    { key: 'social', label: 'Social Media', icon: <Share2 className="h-4 w-4" /> }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template copied to clipboard.",
    });
  };

  const fillTemplate = (template: PromptTemplate) => {
    let filledPrompt = template.prompt;
    
    Object.entries(templateVariables).forEach(([key, value]) => {
      filledPrompt = filledPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return filledPrompt;
  };

  const useTemplate = (template: PromptTemplate) => {
    const filledPrompt = fillTemplate(template);
    onUseTemplate(filledPrompt, template.category);
    
    toast({
      title: "Template Applied",
      description: `${template.title} template is ready to use.`,
    });
  };

  const getTemplatesByCategory = (category: string) => {
    return promptTemplates.filter(template => template.category === category);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Content Prompt Templates
          </CardTitle>
          <CardDescription>
            Pre-built prompts for consistent, brand-aligned content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workflow" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.key} value={category.key} className="flex items-center space-x-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.key} value={category.key}>
                <div className="grid gap-4">
                  {getTemplatesByCategory(category.key).map((template) => (
                    <Card key={template.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {template.icon}
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                          </div>
                          <Badge variant="outline">{category.label}</Badge>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {template.variables.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Template Variables:</Label>
                            <div className="grid gap-3">
                              {template.variables.map((variable) => (
                                <div key={variable}>
                                  <Label htmlFor={`${template.id}-${variable}`} className="text-xs text-gray-600">
                                    {variable.replace(/_/g, ' ').toLowerCase()}
                                  </Label>
                                  <Input
                                    id={`${template.id}-${variable}`}
                                    placeholder={`Enter ${variable.replace(/_/g, ' ').toLowerCase()}`}
                                    value={templateVariables[variable] || ''}
                                    onChange={(e) => setTemplateVariables(prev => ({
                                      ...prev,
                                      [variable]: e.target.value
                                    }))}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => useTemplate(template)}
                            className="flex-1"
                            disabled={template.variables.some(v => !templateVariables[v])}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(fillTemplate(template))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            View Template
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-xs whitespace-pre-wrap">
                            {fillTemplate(template)}
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptTemplatesLibrary;
