
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, MapPin, Calendar, Camera, Loader2, Plus, RefreshCw } from 'lucide-react';
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
          <TabsTrigger value="poi">
            <MapPin className="h-4 w-4 mr-2" />
            Points of Interest
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="lifestyle">
            <Camera className="h-4 w-4 mr-2" />
            Lifestyle
          </TabsTrigger>
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
              <div>
                <Label htmlFor="poi-prompt">Description Prompt</Label>
                <Textarea
                  id="poi-prompt"
                  value={poiPrompt}
                  onChange={(e) => setPoiPrompt(e.target.value)}
                  placeholder="e.g., Generate family-friendly restaurants with outdoor seating"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poi-category">Category</Label>
                  <Select value={poiCategory} onValueChange={setPoiCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {poiCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="poi-count">Number to Generate</Label>
                  <Input
                    id="poi-count"
                    type="number"
                    min="1"
                    max="10"
                    value={poiCount}
                    onChange={(e) => setPoiCount(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() => generateAIContent('poi', poiPrompt, poiCategory, poiCount)}
                disabled={isGenerating || !poiPrompt}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate POI Content
                  </>
                )}
              </Button>
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
              <div>
                <Label htmlFor="events-prompt">Description Prompt</Label>
                <Textarea
                  id="events-prompt"
                  value={eventsPrompt}
                  onChange={(e) => setEventsPrompt(e.target.value)}
                  placeholder="e.g., Generate summer outdoor festivals in Eugene"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="events-category">Category</Label>
                  <Select value={eventsCategory} onValueChange={setEventsCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="events-count">Number to Generate</Label>
                  <Input
                    id="events-count"
                    type="number"
                    min="1"
                    max="8"
                    value={eventsCount}
                    onChange={(e) => setEventsCount(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() => generateAIContent('events', eventsPrompt, eventsCategory, eventsCount)}
                disabled={isGenerating || !eventsPrompt}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Events
                  </>
                )}
              </Button>
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
              <div>
                <Label htmlFor="lifestyle-prompt">Description Prompt</Label>
                <Textarea
                  id="lifestyle-prompt"
                  value={lifestylePrompt}
                  onChange={(e) => setLifestylePrompt(e.target.value)}
                  placeholder="e.g., Generate outdoor hiking and nature activities around Eugene"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lifestyle-category">Category</Label>
                  <Select value={lifestyleCategory} onValueChange={setLifestyleCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lifestyleCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lifestyle-count">Number to Generate</Label>
                  <Input
                    id="lifestyle-count"
                    type="number"
                    min="1"
                    max="8"
                    value={lifestyleCount}
                    onChange={(e) => setLifestyleCount(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() => generateAIContent('lifestyle', lifestylePrompt, lifestyleCategory, lifestyleCount)}
                disabled={isGenerating || !lifestylePrompt}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Lifestyle Content
                  </>
                )}
              </Button>
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{item.content.name || item.content.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{item.content.type}</Badge>
                      <Badge variant="outline">{item.content.category}</Badge>
                    </div>
                  </div>
                  {item.content.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.content.description}
                    </p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeContent(item.id)}
                    >
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveAndSave(item)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Approve & Save
                    </Button>
                  </div>
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
