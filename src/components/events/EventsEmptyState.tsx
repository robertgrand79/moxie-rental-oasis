
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventsEmptyStateProps {
  onClearFilters: () => void;
}

const EventsEmptyState = ({ onClearFilters }: EventsEmptyStateProps) => {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
        <Calendar className="h-9 w-9" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-foreground mt-4">No Events Found</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
        No events found matching your criteria.
      </p>
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="rounded-full shadow-sm hover:-translate-y-0.5 transition-all"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default EventsEmptyState;
