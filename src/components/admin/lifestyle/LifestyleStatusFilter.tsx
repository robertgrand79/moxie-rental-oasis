
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LifestyleStatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const LifestyleStatusFilter = ({ selectedStatus, onStatusChange }: LifestyleStatusFilterProps) => {
  return (
    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="draft">Draft</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LifestyleStatusFilter;
