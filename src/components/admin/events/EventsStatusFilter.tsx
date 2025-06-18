
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EventsStatusFilterProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  eventCounts: {
    all: number;
    draft: number;
    published: number;
  };
}

const EventsStatusFilter = ({ 
  statusFilter, 
  onStatusFilterChange, 
  eventCounts 
}: EventsStatusFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              All Events
              <Badge variant="secondary">{eventCounts.all}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="published">
            <div className="flex items-center gap-2">
              Published
              <Badge className="bg-green-600 text-white">{eventCounts.published}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="draft">
            <div className="flex items-center gap-2">
              Draft
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                {eventCounts.draft}
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventsStatusFilter;
