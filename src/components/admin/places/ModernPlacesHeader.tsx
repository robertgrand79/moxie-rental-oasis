import React from 'react';
import { Plus, Search, RefreshCw, Settings, Navigation, Loader2, LayoutGrid, List } from 'lucide-react';
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
import { Place } from '@/hooks/usePlaces';

interface PlaceCategory {
  value: string;
  label: string;
  icon: string;
}

interface ModernPlacesHeaderProps {
  places: Place[];
  categories: PlaceCategory[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddPlace: () => void;
  onManageCategories: () => void;
  onRefresh: () => void;
  placesWithoutCoords: number;
  onBatchGeocode: () => void;
  isBatchGeocoding: boolean;
}

const ModernPlacesHeader = ({
  places,
  categories,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onAddPlace,
  onManageCategories,
  onRefresh,
  placesWithoutCoords,
  onBatchGeocode,
  isBatchGeocoding,
}: ModernPlacesHeaderProps) => {
  // Calculate stats
  const totalPlaces = places.length;
  const publishedCount = places.filter(p => p.status === 'published').length;
  const draftCount = places.filter(p => p.status === 'draft').length;
  const featuredCount = places.filter(p => p.is_featured).length;
  
  // Find top category
  const categoryCounts = places.reduce((acc, place) => {
    acc[place.category] = (acc[place.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const topCategoryLabel = topCategory 
    ? categories.find(c => c.value === topCategory[0])?.label || topCategory[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Title row with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{totalPlaces}</span> Total
            <span className="mx-2">•</span>
            <span className="font-medium text-foreground">{publishedCount}</span> Published
            <span className="mx-2">•</span>
            <span className="font-medium text-foreground">{draftCount}</span> Draft
            <span className="mx-2">•</span>
            <span className="font-medium text-foreground">{featuredCount}</span> Featured
            {topCategoryLabel && (
              <>
                <span className="mx-2">•</span>
                Top: <span className="font-medium text-foreground">{topCategoryLabel}</span>
              </>
            )}
          </p>
        </div>
        <Button onClick={onAddPlace} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Place
        </Button>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.filter(c => c.value !== 'all').map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
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

          <Button variant="outline" size="icon" onClick={onManageCategories} title="Manage Categories">
            <Settings className="h-4 w-4" />
          </Button>

          {placesWithoutCoords > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onBatchGeocode}
              disabled={isBatchGeocoding}
              title={`Geocode ${placesWithoutCoords} places`}
            >
              {isBatchGeocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span className="ml-2">{placesWithoutCoords}</span>
            </Button>
          )}

          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernPlacesHeader;
