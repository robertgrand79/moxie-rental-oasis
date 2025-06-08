
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wand2 } from 'lucide-react';

interface EventsHeaderProps {
  onAddNew: () => void;
  onOpenAIDialog: () => void;
}

const EventsHeader = ({ onAddNew, onOpenAIDialog }: EventsHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Eugene Events</CardTitle>
          <CardDescription>
            Manage local events and activities to showcase to guests
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onOpenAIDialog}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default EventsHeader;
