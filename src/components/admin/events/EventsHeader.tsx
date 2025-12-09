
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EventsHeaderProps {
  onAddNew: () => void;
}

const EventsHeader = ({ onAddNew }: EventsHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Local Events</CardTitle>
          <CardDescription>
            Manage local events and activities to showcase to guests
          </CardDescription>
        </div>
        <div className="flex gap-2">
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
