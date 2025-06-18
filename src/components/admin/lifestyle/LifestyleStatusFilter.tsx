
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LifestyleStatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  itemCounts: {
    all: number;
    draft: number;
    published: number;
  };
}

const LifestyleStatusFilter = ({ 
  selectedStatus, 
  onStatusChange, 
  itemCounts 
}: LifestyleStatusFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              All Items
              <Badge variant="secondary">{itemCounts.all}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="published">
            <div className="flex items-center gap-2">
              Published
              <Badge className="bg-green-600 text-white">{itemCounts.published}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="draft">
            <div className="flex items-center gap-2">
              Draft
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                {itemCounts.draft}
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LifestyleStatusFilter;
