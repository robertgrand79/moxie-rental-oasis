import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, MapPin, Calendar, Camera, Loader2, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIGeneratedContent {
  id: string;
  content: any;
  approved: boolean;
}

const AIContentGenerators = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent[]>([]);

  // POI Generator State
  const [poiPrompt, setPoiPrompt] = useState('');
  const [poiCategory, setPoiCategory] = useState('restaurants');
  const [poiCount, setPoiCount] = useState(5);

  // Events Generator State
  const [eventsPrompt, setEventsPrompt] = useState('');
  const [eventsCategory, setEventsCategory] = useState('festival');
  const [eventsCount, setEventsCount] = useState(3);

  // Lifestyle Generator State
  const [lifestylePrompt, setLifestylePrompt] = useState('');
  const [lifestyleCategory, setLifestyleCategory] = useState('outdoor');
  const [lifestyleCount, setLifestyleCount] = useState(4);

  const poiCategories = [
    'restaurants', 'attractions', 'entertainment', 'shopping', 
    'outdoor', 'culture', 'nightlife', 'services'
  ];

  const eventCategories = [
    'festival', 'sports', 'arts', 'food', 'outdoor', 'music', 'cultural', 'seasonal'
  ];

  const lifestyleCategories = [
    'outdoor', 'dining', 'entertainment', 'culture', 'shopping', 
    'recreation', 'nature', 'sports', 'adventure', 'relaxation'
  ];

  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const quickTemplates = {
    poi: [
      "Generate family-friendly restaurants with outdoor seating in Eugene",
      "Create outdoor activity spots perfect for vacation rental guests",
      "List unique shopping destinations that locals love in Eugene",
      "Find cultural attractions that showcase Eugene's character"
    ],
    events: [
      "Generate summer outdoor festivals and events in Eugene",
      "Create family-friendly seasonal events happening this month",
      "List arts and culture events perfect for weekend visitors",
      "Find food and drink events that showcase local flavor"
    ],
    lifestyle: [
      "Generate outdoor adventure activities around Eugene",
      "Create romantic date ideas for couples visiting Eugene",
      "List family activities that create lasting memories",
      "Find Instagram-worthy spots for vacation photos"
    ]
  };

  const generateAIContent = async (type: 'poi' | 'events' | 'lifestyle', prompt: string, category: string, count: number) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          type,
          prompt,
          category,
          count,
          location: 'Eugene, Oregon'
        }
      });

      if (error) throw error;

      const newContent = data.content.map((item: any, index: number) => ({
        id: `${type}-${Date.now()}-${index}`,
        content: { ...item, type },
        approved: false
      }));

      setGeneratedContent(prev => [...prev, ...newContent]);

      toast({
        title: "Content Generated",
        description: `Generated ${count} ${type} items successfully`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const approveAndSave = async (contentItem: AIGeneratedContent) => {
    try {
      const { content } = contentItem;
      let result;

      if (content.type === 'poi') {
        result = await supabase.from('points_of_interest').insert([{
          name: content.name,
          description: content.description,
          address: content.address,
          category: content.category,
          phone: content.phone,
          website_url: content.website_url,
          rating: content.rating,
          price_level: content.price_level,
          distance_from_properties: content.distance_from_properties,
          driving_time: content.driving_time,
          is_active: true,
          created_by: user?.id
        }]);
      } else if (content.type === 'events') {
        result = await supabase.from('eugene_events').insert([{
          title: content.title,
          description: content.description,
          event_date: content.event_date,
          end_date: content.end_date,
          time_start: content.time_start,
          time_end: content.time_end,
          location: content.location,
          category: content.category,
          price_range: content.price_range,
          is_active: true,
          created_by: user?.id
        }]);
      } else if (content.type === 'lifestyle') {
        // Add default image_url for lifestyle content
        const defaultImageUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
        
        result = await supabase.from('lifestyle_gallery').insert([{
          title: content.title,
          description: content.description,
          category: content.category,
          location: content.location,
          activity_type: content.activity_type,
          image_url: content.image_url || defaultImageUrl,
          is_active: true,
          created_by: user?.id
        }]);
      }

      if (result?.error) throw result.error;

      setGeneratedContent(prev => prev.filter(item => item.id !== contentItem.id));

      toast({
        title: "Content Saved",
        description: "AI-generated content has been saved to the database",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content to database",
        variant: "destructive"
      });
    }
  };

  const removeContent = (id: string) => {
    setGeneratedContent(prev => prev.filter(item => item.id !== id));
  };

  const useQuickTemplate = (template: string, type: 'poi' | 'events' | 'lifestyle') => {
    if (type === 'poi') {
      setPoiPrompt(template);
    } else if (type === 'events') {
      setEventsPrompt(template);
    } else if (type === 'lifestyle') {
      setLifestylePrompt(template);
    }

    toast({
      title: "Template Applied",
      description: "Quick template has been applied to your prompt.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Content Generators</h2>
        <p className="text-gray-600">
          Use AI to quickly generate Points of Interest, Events, and Lifestyle content for your site.
        </p>
      </div>

      <Tabs defaultValue="poi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <MapPin className="h-4 w-4 mr-2" />
            Points of Interest
          
          <Calendar className="h-4 w-4 mr-2" />
            Events
          
          <Camera className="h-4 w-4 mr-2" />
            Lifestyle
          
        </TabsList>

        <TabsContent value="poi">
          <Card>
            <CardHeader>
              <CardTitle>Generate Points of Interest</CardTitle>
              <CardDescription>
                Create POI entries for Eugene, Oregon using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates Section */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {quickTemplates.poi.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickTemplate(template, 'poi')}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
                
                  Description Prompt
                  
                  
                    e.g., Generate family-friendly restaurants with outdoor seating
                    
                  
                
                
                  
                    
                      Category
                      
                      
                        
                          
                        
                        
                          {poiCategories.map((cat) => (
                            
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            
                          ))}
                        
                      
                    
                  
                  
                    
                      Number to Generate
                      
                      
                        
                      
                    
                  
                
                
                  
                    
                      
                        
                          
                            
                              
                            
                            Generating...
                          
                        
                      
                      
                        
                          
                            
                          
                          Generate POI Content
                        
                      
                    
                  
                
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Generate Events</CardTitle>
              <CardDescription>
                Create event listings for Eugene, Oregon using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates Section */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {quickTemplates.events.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickTemplate(template, 'events')}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
                
                  Description Prompt
                  
                  
                    e.g., Generate summer outdoor festivals in Eugene
                    
                  
                
                
                  
                    
                      Category
                      
                      
                        
                          
                        
                        
                          {eventCategories.map((cat) => (
                            
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            
                          ))}
                        
                      
                    
                  
                  
                    
                      Number to Generate
                      
                      
                        
                      
                    
                  
                
                
                  
                    
                      
                        
                          
                            
                              
                            
                            Generating...
                          
                        
                      
                      
                        
                          
                            
                          
                          Generate Events
                        
                      
                    
                  
                
              
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle">
          <Card>
            <CardHeader>
              <CardTitle>Generate Lifestyle Content</CardTitle>
              <CardDescription>
                Create lifestyle gallery items showcasing Eugene activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates Section */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {quickTemplates.lifestyle.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickTemplate(template, 'lifestyle')}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
                
                  Description Prompt
                  
                  
                    e.g., Generate outdoor hiking and nature activities around Eugene
                    
                  
                
                
                  
                    
                      Category
                      
                      
                        
                          
                        
                        
                          {lifestyleCategories.map((cat) => (
                            
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            
                          ))}
                        
                      
                    
                  
                  
                    
                      Number to Generate
                      
                      
                        
                      
                    
                  
                
                
                  
                    
                      
                        
                          
                            
                              
                            
                            Generating...
                          
                        
                      
                      
                        
                          
                            
                          
                          Generate Lifestyle Content
                        
                      
                    
                  
                
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Content Preview */}
      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content ({generatedContent.length})</CardTitle>
            <CardDescription>
              Review and approve AI-generated content before adding to your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedContent.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  
                    
                      {item.content.name || item.content.title}
                    
                    
                      
                        {item.content.type}
                      
                      
                        {item.content.category}
                      
                    
                  
                  {item.content.description && (
                    
                      {item.content.description}
                    
                  )}
                  
                    
                      Remove
                    
                    
                      
                        
                          
                        
                        Approve & Save
                      
                    
                  
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIContentGenerators;
