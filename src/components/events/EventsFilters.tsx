
import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryLabels = {
  festival: 'Festival',
  sports: 'Sports',
  arts: 'Arts & Culture',
  food: 'Food & Drink',
  outdoor: 'Outdoor'
};

interface EventsFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
}

const EventsFilters = ({ 
  selectedCategory, 
  setSelectedCategory, 
  timeFilter, 
  setTimeFilter 
}: EventsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventsFilters;
