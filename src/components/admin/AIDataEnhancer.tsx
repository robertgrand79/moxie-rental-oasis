
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Loader2, CheckCircle, AlertCircle, MapPin, Calendar, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { useLifestyleGallery } from '@/hooks/useLifestyleGallery';

const AIDataEnhancer = () => {
  const { toast } = useToast();
  const { pointsOfInterest } = usePointsOfInterest();
  const { events } = useEugeneEvents();
  const { galleryItems } = useLifestyleGallery();
  
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [enhancedItems, setEnhancedItems] = useState<Set<string>>(new Set());

  const enhanceItem = async (type: 'poi' | 'events' | 'lifestyle', item: any) => {
    const itemKey = `${type}-${item.id}`;
    setEnhancing(itemKey);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-content-ai', {
        body: {
          type,
          item,
          location: 'Eugene, Oregon'
        }
      });

      if (error) throw error;

      // Update the item in the database with enhanced data
      let updateResult;
      if (type === 'poi') {
        updateResult = await supabase
          .from('points_of_interest')
          .update(data.enhanced)
          .eq('id', item.id);
      } else if (type === 'events') {
        updateResult = await supabase
          .from('eugene_events')
          .update(data.enhanced)
          .eq('id', item.id);
      } else if (type === 'lifestyle') {
        updateResult = await supabase
          .from('lifestyle_gallery')
          .update(data.enhanced)
          .eq('id', item.id);
      }

      if (updateResult?.error) throw updateResult.error;

      setEnhancedItems(prev => new Set([...prev, itemKey]));

      toast({
        title: "Content Enhanced",
        description: `Successfully enhanced ${item.name || item.title}`,
      });
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance content",
        variant: "destructive"
      });
    } finally {
      setEnhancing(null);
    }
  };

  const bulkEnhance = async (type: 'poi' | 'events' | 'lifestyle', items: any[]) => {
    setEnhancing(`bulk-${type}`);
    let successCount = 0;

    try {
      for (const item of items.slice(0, 5)) { // Limit to 5 items to avoid rate limits
        try {
          await enhanceItem(type, item);
          successCount++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to enhance ${item.name || item.title}:`, error);
        }
      }

      toast({
        title: "Bulk Enhancement Complete",
        description: `Successfully enhanced ${successCount} out of ${Math.min(5, items.length)} items`,
      });
    } catch (error) {
      console.error('Bulk enhancement error:', error);
      toast({
        title: "Bulk Enhancement Failed",
        description: "Some items could not be enhanced",
        variant: "destructive"
      });
    } finally {
      setEnhancing(null);
    }
  };

  const needsEnhancement = (item: any, type: string) => {
    if (type === 'poi') {
      return !item.description || !item.phone || !item.website_url || item.description.length < 100;
    } else if (type === 'events') {
      return !item.description || !item.website_url || item.description.length < 100;
    } else if (type === 'lifestyle') {
      return !item.description || item.description.length < 100;
    }
    return false;
  };

  const poiNeedsEnhancement = pointsOfInterest.filter(poi => needsEnhancement(poi, 'poi'));
  const eventsNeedsEnhancement = events.filter(event => needsEnhancement(event, 'events'));
  const lifestyleNeedsEnhancement = galleryItems.filter(item => needsEnhancement(item, 'lifestyle'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Data Enhancer</h2>
        <p className="text-gray-600">
          Automatically enhance existing content with missing information, better descriptions, and SEO optimization.
        </p>
      </div>

      <Tabs defaultValue="poi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="poi">
            <MapPin className="h-4 w-4 mr-2" />
            POI ({poiNeedsEnhancement.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events ({eventsNeedsEnhancement.length})
          </TabsTrigger>
          <TabsTrigger value="lifestyle">
            <Camera className="h-4 w-4 mr-2" />
            Lifestyle ({lifestyleNeedsEnhancement.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="poi">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enhance Points of Interest</CardTitle>
                  <CardDescription>
                    {poiNeedsEnhancement.length} items need enhancement
                  </CardDescription>
                </div>
                {poiNeedsEnhancement.length > 0 && (
                  <Button
                    onClick={() => bulkEnhance('poi', poiNeedsEnhancement)}
                    disabled={enhancing === 'bulk-poi'}
                    variant="outline"
                  >
                    {enhancing === 'bulk-poi' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Enhance All (5 max)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {poiNeedsEnhancement.map((poi) => {
                  const itemKey = `poi-${poi.id}`;
                  const isEnhanced = enhancedItems.has(itemKey);
                  const isEnhancing = enhancing === itemKey;

                  return (
                    <div key={poi.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{poi.name}</h4>
                          <Badge variant="outline">{poi.category}</Badge>
                          {isEnhanced && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {!poi.description && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing description</div>}
                          {!poi.phone && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing phone</div>}
                          {!poi.website_url && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing website</div>}
                          {poi.description && poi.description.length < 100 && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Description too short</div>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => enhanceItem('poi', poi)}
                        disabled={isEnhancing || isEnhanced}
                        variant={isEnhanced ? "outline" : "default"}
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEnhanced ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
                {poiNeedsEnhancement.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All POI items are fully enhanced!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enhance Events</CardTitle>
                  <CardDescription>
                    {eventsNeedsEnhancement.length} items need enhancement
                  </CardDescription>
                </div>
                {eventsNeedsEnhancement.length > 0 && (
                  <Button
                    onClick={() => bulkEnhance('events', eventsNeedsEnhancement)}
                    disabled={enhancing === 'bulk-events'}
                    variant="outline"
                  >
                    {enhancing === 'bulk-events' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Enhance All (5 max)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsNeedsEnhancement.map((event) => {
                  const itemKey = `events-${event.id}`;
                  const isEnhanced = enhancedItems.has(itemKey);
                  const isEnhancing = enhancing === itemKey;

                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline">{event.category}</Badge>
                          {isEnhanced && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {!event.description && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing description</div>}
                          {!event.website_url && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing website</div>}
                          {event.description && event.description.length < 100 && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Description too short</div>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => enhanceItem('events', event)}
                        disabled={isEnhancing || isEnhanced}
                        variant={isEnhanced ? "outline" : "default"}
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEnhanced ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
                {eventsNeedsEnhancement.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All events are fully enhanced!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enhance Lifestyle Content</CardTitle>
                  <CardDescription>
                    {lifestyleNeedsEnhancement.length} items need enhancement
                  </CardDescription>
                </div>
                {lifestyleNeedsEnhancement.length > 0 && (
                  <Button
                    onClick={() => bulkEnhance('lifestyle', lifestyleNeedsEnhancement)}
                    disabled={enhancing === 'bulk-lifestyle'}
                    variant="outline"
                  >
                    {enhancing === 'bulk-lifestyle' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Enhance All (5 max)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lifestyleNeedsEnhancement.map((item) => {
                  const itemKey = `lifestyle-${item.id}`;
                  const isEnhanced = enhancedItems.has(itemKey);
                  const isEnhancing = enhancing === itemKey;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant="outline">{item.category}</Badge>
                          {isEnhanced && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enhanced
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {!item.description && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Missing description</div>}
                          {item.description && item.description.length < 100 && <div className="flex items-center"><AlertCircle className="h-3 w-3 mr-1 text-amber-500" />Description too short</div>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => enhanceItem('lifestyle', item)}
                        disabled={isEnhancing || isEnhanced}
                        variant={isEnhanced ? "outline" : "default"}
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isEnhanced ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
                {lifestyleNeedsEnhancement.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All lifestyle content is fully enhanced!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIDataEnhancer;
