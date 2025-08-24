
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface POIStatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  itemCounts: {
    all: number;
    draft: number;
    published: number;
  };
}

const POIStatusFilter = ({ selectedStatus, onStatusChange, itemCounts }: POIStatusFilterProps) => {
  const filters = [
    { key: 'all', label: 'All', count: itemCounts.all },
    { key: 'draft', label: 'Draft', count: itemCounts.draft },
    { key: 'published', label: 'Published', count: itemCounts.published },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={selectedStatus === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(filter.key)}
          className="flex items-center space-x-2 min-w-0"
        >
          <span className="whitespace-nowrap">{filter.label}</span>
          <Badge variant="secondary" className="ml-1 text-xs">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

export default POIStatusFilter;
