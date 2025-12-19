import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Calendar, 
  Archive,
  Star,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModernEventsHeaderProps {
  totalEvents: number;
  upcomingEvents: number;
  archivedEvents: number;
  featuredEvents: number;
  topCategory: string | null;
  onAddEvent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  timeFilter: 'upcoming' | 'archived';
  onTimeFilterChange: (filter: 'upcoming' | 'archived') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh: () => void;
  onExport?: () => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'dining', label: 'Dining' },
  { value: 'culture', label: 'Culture' },
  { value: 'sports', label: 'Sports' },
  { value: 'community', label: 'Community' },
];

const ModernEventsHeader = ({
  totalEvents,
  upcomingEvents,
  archivedEvents,
  featuredEvents,
  topCategory,
  onAddEvent,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  timeFilter,
  onTimeFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
}: ModernEventsHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Title, Stats, and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          {/* Inline Stats */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalEvents}</span> Total
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{upcomingEvents}</span> Upcoming
            </span>
            <span className="flex items-center gap-1.5">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{archivedEvents}</span> Archived
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-600">{featuredEvents}</span> Featured
            </span>
            {topCategory && (
              <span className="flex items-center gap-1.5">
                Top: <span className="font-medium text-foreground capitalize">{topCategory}</span>
              </span>
            )}
          </div>
        </div>
        <Button onClick={onAddEvent} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Left side: Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={(v) => onTimeFilterChange(v as 'upcoming' | 'archived')}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right side: View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1 bg-background">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernEventsHeader;
