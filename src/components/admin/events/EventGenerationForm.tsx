
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface EventGenerationFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  numberOfEvents: number;
  setNumberOfEvents: (count: number) => void;
  eventType: string;
  setEventType: (type: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const EventGenerationForm = ({
  prompt,
  setPrompt,
  numberOfEvents,
  setNumberOfEvents,
  eventType,
  setEventType,
  timeframe,
  setTimeframe,
  isGenerating,
  onGenerate
}: EventGenerationFormProps) => {
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'your area';

  return (
    <div className="space-y-6">
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
          placeholder={`Describe the types of events you want to generate for ${locationText}...`}
          rows={4}
        />
      </div>

      <Button 
        onClick={onGenerate} 
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
    </div>
  );
};

export default EventGenerationForm;
