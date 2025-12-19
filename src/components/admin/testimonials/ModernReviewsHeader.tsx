import React from 'react';
import { Plus, Search, RefreshCw, LayoutGrid, List, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Testimonial } from '@/hooks/useTestimonials';

interface PropertyTab {
  value: string;
  label: string;
}

interface ModernReviewsHeaderProps {
  testimonials: Testimonial[];
  propertyTabs: PropertyTab[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddReview: () => void;
  onRefresh: () => void;
}

const ModernReviewsHeader = ({
  testimonials,
  propertyTabs,
  searchQuery,
  onSearchChange,
  propertyFilter,
  onPropertyFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onAddReview,
  onRefresh,
}: ModernReviewsHeaderProps) => {
  // Calculate stats
  const totalReviews = testimonials.length;
  const activeCount = testimonials.filter(t => t.is_active !== false).length;
  const featuredCount = testimonials.filter(t => t.is_featured).length;
  
  // Calculate average rating
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';
  
  // Find top platform
  const platformCounts = testimonials.reduce((acc, t) => {
    const platform = t.booking_platform || 'direct';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
  const topPlatformLabel = topPlatform 
    ? topPlatform[0].charAt(0).toUpperCase() + topPlatform[0].slice(1)
    : null;

  return (
    <div className="space-y-4">
      {/* Title row with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{totalReviews}</span> Total
            <span className="mx-2">•</span>
            <span className="font-medium text-foreground">{activeCount}</span> Active
            <span className="mx-2">•</span>
            <span className="font-medium text-foreground">{featuredCount}</span> Featured
            <span className="mx-2">•</span>
            <Star className="inline h-3.5 w-3.5 text-yellow-400 fill-yellow-400 -mt-0.5" />
            <span className="font-medium text-foreground ml-1">{avgRating}</span> Avg
            {topPlatformLabel && (
              <>
                <span className="mx-2">•</span>
                Top: <span className="font-medium text-foreground">{topPlatformLabel}</span>
              </>
            )}
          </p>
        </div>
        <Button onClick={onAddReview} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Review
        </Button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={propertyFilter} onValueChange={onPropertyFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Property" />
          </SelectTrigger>
          <SelectContent>
            {propertyTabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && onViewModeChange(v as 'grid' | 'list')}>
            <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" size="sm">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernReviewsHeader;
