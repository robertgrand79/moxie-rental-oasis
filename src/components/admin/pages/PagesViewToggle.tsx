import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PagesViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const PagesViewToggle = ({ view, onViewChange }: PagesViewToggleProps) => {
  return (
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PagesViewToggle;