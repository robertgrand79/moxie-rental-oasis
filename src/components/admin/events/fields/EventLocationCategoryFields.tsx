
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventLocationCategoryFieldsProps {
  location: string;
  category: string;
  priceRange: string;
  status: string;
  categories: Array<{ value: string; label: string }>;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (price: string) => void;
  onStatusChange: (status: string) => void;
}

const EventLocationCategoryFields = ({
  location,
  category,
  priceRange,
  status,
  categories,
  onLocationChange,
  onCategoryChange,
  onPriceRangeChange,
  onStatusChange
}: EventLocationCategoryFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Venue name or address"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price_range">Price Range</Label>
        <Input
          id="price_range"
          placeholder="e.g., Free, $20-50, $100+"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={onStatusChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default EventLocationCategoryFields;
