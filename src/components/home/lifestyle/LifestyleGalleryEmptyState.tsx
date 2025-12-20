
import React from 'react';
import { Button } from '@/components/ui/button';

interface LifestyleGalleryEmptyStateProps {
  onClearFilters: () => void;
}

const LifestyleGalleryEmptyState = ({ onClearFilters }: LifestyleGalleryEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No experiences found matching your criteria.</p>
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

export default LifestyleGalleryEmptyState;
