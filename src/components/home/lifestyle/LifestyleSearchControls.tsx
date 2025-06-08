
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const categoryLabels = {
  downtown: 'Downtown',
  nature: 'Nature & Outdoors',
  food: 'Food & Drink',
  events: 'Events & Culture'
};

interface LifestyleSearchControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const LifestyleSearchControls = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory
}: LifestyleSearchControlsProps) => {
  const categories = ['all', ...Object.keys(categoryLabels)];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search experiences..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All' : categoryLabels[category as keyof typeof categoryLabels]}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default LifestyleSearchControls;
