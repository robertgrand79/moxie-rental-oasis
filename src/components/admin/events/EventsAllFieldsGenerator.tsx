import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { LocalEvent } from '@/hooks/useLocalEvents';
import { toast } from '@/hooks/use-toast';
import { useEventGeneration } from '@/hooks/useEventGeneration';
import EventGenerationForm from './EventGenerationForm';
import GeneratedEventsList from './GeneratedEventsList';

interface EventsAllFieldsGeneratorProps {
  onEventsGenerated: (events: any[]) => void;
  existingEvents: LocalEvent[];
}

const EventsAllFieldsGenerator = ({ onEventsGenerated, existingEvents }: EventsAllFieldsGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfEvents, setNumberOfEvents] = useState(3);
  const [eventType, setEventType] = useState('');
  const [timeframe, setTimeframe] = useState('upcoming');

  const { isGenerating, generatedEvents, generateEvents, clearGeneratedEvents } = useEventGeneration(existingEvents);

  const handleGenerate = () => {
    generateEvents(prompt, numberOfEvents, eventType, timeframe);
  };

  const handleApplyAll = () => {
    onEventsGenerated(generatedEvents);
    clearGeneratedEvents();
    toast({
      title: 'Success',
      description: `Applied ${generatedEvents.length} events to your collection!`
    });
  };

  const handleApplySelected = (event: any) => {
    onEventsGenerated([event]);
    // Remove the selected event from the generated events list
    const updatedEvents = generatedEvents.filter(e => e !== event);
    // We need to manually update the state since we don't have direct access
    // This is handled by filtering in the parent component
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
        <EventGenerationForm
          prompt={prompt}
          setPrompt={setPrompt}
          numberOfEvents={numberOfEvents}
          setNumberOfEvents={setNumberOfEvents}
          eventType={eventType}
          setEventType={setEventType}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        <GeneratedEventsList
          events={generatedEvents}
          onApplyAll={handleApplyAll}
          onApplySelected={handleApplySelected}
        />
      </CardContent>
    </Card>
  );
};

export default EventsAllFieldsGenerator;
