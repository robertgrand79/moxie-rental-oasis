
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventsAllFieldsGeneratorProps {
  onEventsGenerated: (events: any[]) => void;
  existingEvents: EugeneEvent[];
}

const EventsAllFieldsGenerator = ({ onEventsGenerated, existingEvents }: EventsAllFieldsGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [numberOfEvents, setNumberOfEvents] = useState(3);
  const [eventType, setEventType] = useState('');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for event generation',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ai', {
        body: {
          prompt: `Generate ${numberOfEvents} ${eventType ? eventType + ' ' : ''}events for Eugene, Oregon based on this request: ${prompt}. 
          
          Time frame: ${timeframe}
          
          Please return a JSON array of events with these fields:
          - title: string (event name)
          - description: string (detailed description)
          - event_date: string (YYYY-MM-DD format)
          - end_date: string (YYYY-MM-DD format, optional)
          - time_start: string (e.g., "7:00 PM")
          - time_end: string (e.g., "10:00 PM")
          - location: string (venue or address in Eugene)
          - category: string (festival, sports, arts, food, outdoor, music, or seasonal)
          - image_url: string (relevant Unsplash URL)
          - website_url: string (optional)
          - ticket_url: string (optional)
          - price_range: string (e.g., "Free", "$20-50", "$100+")
          - is_featured: boolean
          - is_active: boolean (default true)
          - is_recurring: boolean
          - recurrence_pattern: string (if recurring)
          
          Make sure events are diverse, realistic for Eugene, and include local venues when possible.`,
          type: 'events',
          context: {
            existingEventsCount: existingEvents.length,
            recentEvents: existingEvents.slice(0, 5).map(e => ({ title: e.title, category: e.category }))
          }
        }
      });

      if (error) throw error;

      // Ensure we have a valid array and filter out any undefined/null items
      let events = Array.isArray(data.generatedContent) ? data.generatedContent : [data.generatedContent];
      events = events.filter(event => event && typeof event === 'object' && event.title);
      
      if (events.length === 0) {
        throw new Error('No valid events were generated');
      }

      setGeneratedEvents(events);
      
      toast({
        title: 'Success',
        description: `Generated ${events.length} events successfully!`
      });
    } catch (error) {
      console.error('Error generating events:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate events. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAll = () => {
    onEventsGenerated(generatedEvents);
    setGeneratedEvents([]);
    toast({
      title: 'Success',
      description: `Applied ${generatedEvents.length} events to your collection!`
    });
  };

  const handleApplySelected = (event: any) => {
    onEventsGenerated([event]);
    setGeneratedEvents(prev => prev.filter(e => e !== event));
    toast({
      title: 'Success',
      description: 'Event added to your collection!'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Multiple Events with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numberOfEvents">Number of Events</Label>
            <Input
              id="numberOfEvents"
              type="number"
              min="1"
              max="10"
              value={numberOfEvents}
              onChange={(e) => setNumberOfEvents(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="eventType">Event Type (Optional)</Label>
            <Input
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g., music festivals, art shows, food events"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timeframe">Timeframe</Label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="upcoming">Upcoming events</option>
            <option value="seasonal">Seasonal events</option>
            <option value="recurring">Recurring events</option>
            <option value="special">Special occasions</option>
          </select>
        </div>

        <div>
          <Label htmlFor="prompt">Event Generation Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the types of events you want to generate for Eugene, Oregon..."
            rows={4}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Events...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {numberOfEvents} Events
            </>
          )}
        </Button>

        {generatedEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Events</h3>
              <Button onClick={handleApplyAll} variant="default">
                Apply All {generatedEvents.length} Events
              </Button>
            </div>
            
            <div className="grid gap-4">
              {generatedEvents.map((event, index) => {
                // Safety check for each event object
                if (!event || typeof event !== 'object') {
                  return null;
                }

                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{event.title || 'Untitled Event'}</h4>
                          <Badge variant="outline">{event.category || 'Uncategorized'}</Badge>
                          {event.is_featured && <Badge>Featured</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description || 'No description available'}</p>
                        <div className="text-sm text-gray-500">
                          <p>📅 {event.event_date || 'Date TBD'} {event.time_start && `at ${event.time_start}`}</p>
                          {event.location && <p>📍 {event.location}</p>}
                          {event.price_range && <p>💰 {event.price_range}</p>}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleApplySelected(event)}
                        variant="outline"
                      >
                        Add This Event
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsAllFieldsGenerator;
