
import React from 'react';
import { Button } from '@/components/ui/button';

interface EventsEmptyStateProps {
  onClearFilters: () => void;
}

const EventsEmptyState = ({ onClearFilters }: EventsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default EventsEmptyState;
