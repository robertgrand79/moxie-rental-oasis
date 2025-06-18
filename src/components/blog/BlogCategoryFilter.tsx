
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, MapPin, Plane } from 'lucide-react';

interface BlogCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  loading: boolean;
}

const BlogCategoryFilter = ({ selectedCategory, onCategoryChange, loading }: BlogCategoryFilterProps) => {
  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen },
    { id: 'eugene', name: 'Eugene Local', icon: MapPin },
    { id: 'robert-shelly', name: "Robert & Shelly's Travels", icon: Plane },
    { id: 'travel', name: 'Travel Tips', icon: MapPin },
    { id: 'destinations', name: 'Destinations', icon: MapPin }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 ${
              selectedCategory === category.id 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                : 'bg-card hover:bg-accent'
            }`}
            disabled={loading}
          >
            <IconComponent className="h-4 w-4" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default BlogCategoryFilter;
