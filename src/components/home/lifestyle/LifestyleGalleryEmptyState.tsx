
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LifestyleGalleryEmptyStateProps {
  onClearFilters: () => void;
}

const LifestyleGalleryEmptyState = ({ onClearFilters }: LifestyleGalleryEmptyStateProps) => {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-8">
        <Search className="h-9 w-9 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-foreground mb-3">No Experiences Found</h3>
      <p className="text-muted-foreground/70 text-sm mb-6">No experiences found matching your criteria.</p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
};

export default LifestyleGalleryEmptyState;
