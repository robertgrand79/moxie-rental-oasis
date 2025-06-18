
import React from 'react';
import { Button } from '@/components/ui/button';
import GeneratedEventCard from './GeneratedEventCard';

interface GeneratedEventsListProps {
  events: any[];
  onApplyAll: () => void;
  onApplySelected: (event: any) => void;
}

const GeneratedEventsList = ({ events, onApplyAll, onApplySelected }: GeneratedEventsListProps) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Events</h3>
        <Button onClick={onApplyAll} variant="default">
          Apply All {events.length} Events
        </Button>
      </div>
      
      <div className="grid gap-4">
        {events.map((event, index) => (
          <GeneratedEventCard
            key={index}
            event={event}
            onApplySelected={onApplySelected}
          />
        ))}
      </div>
    </div>
  );
};

export default GeneratedEventsList;
