
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EugeneEvent } from '@/hooks/useEugeneEvents';

export const useEventGeneration = (existingEvents: EugeneEvent[]) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);

  const generateEvents = async (
    prompt: string,
    numberOfEvents: number,
    eventType: string,
    timeframe: string
  ) => {
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
          type: 'events',
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
          count: numberOfEvents,
          location: 'Eugene, Oregon',
          category: eventType || 'events',
          context: {
            existingEventsCount: existingEvents.length,
            recentEvents: existingEvents.slice(0, 5).map(e => ({ title: e.title, category: e.category }))
          }
        }
      });

      if (error) throw error;

      // Handle the consistent response structure from the edge function
      let events = data.content || [];
      
      // Ensure we have a valid array and filter out any undefined/null items
      if (!Array.isArray(events)) {
        events = [events];
      }
      events = events.filter((event: any) => event && typeof event === 'object' && event.title);
      
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

  const clearGeneratedEvents = () => {
    setGeneratedEvents([]);
  };

  return {
    isGenerating,
    generatedEvents,
    generateEvents,
    clearGeneratedEvents
  };
};
