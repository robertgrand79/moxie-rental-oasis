import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  FileText,
  Star,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONTENT_TYPE_LABELS, ContentType } from '@/types/blogPost';

interface ModernBlogsHeaderProps {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  topContentType: string | null;
  onAddPost: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contentTypeFilter: string;
  onContentTypeFilterChange: (type: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh: () => void;
  onExport?: () => void;
}

const contentTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'article', label: CONTENT_TYPE_LABELS.article },
  { value: 'event', label: CONTENT_TYPE_LABELS.event },
  { value: 'poi', label: CONTENT_TYPE_LABELS.poi },
  { value: 'lifestyle', label: CONTENT_TYPE_LABELS.lifestyle },
];

const ModernBlogsHeader = ({
  totalPosts,
  publishedPosts,
  draftPosts,
  featuredPosts,
  topContentType,
  onAddPost,
  searchQuery,
  onSearchChange,
  contentTypeFilter,
  onContentTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
}: ModernBlogsHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Title, Stats, and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          {/* Inline Stats */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-foreground">{totalPosts}</span> Total
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{publishedPosts}</span> Published
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-600">{draftPosts}</span> Draft
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-600">{featuredPosts}</span> Featured
            </span>
            {topContentType && (
              <span className="flex items-center gap-1.5">
                Top: <span className="font-medium text-foreground capitalize">{topContentType}</span>
              </span>
            )}
          </div>
        </div>
        <Button onClick={onAddPost} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Blog Post
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
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={contentTypeFilter} onValueChange={onContentTypeFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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

export default ModernBlogsHeader;
