
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Filter } from 'lucide-react';
import { BlogPost } from '@/types/blogPost';

interface BlogStatusFilterProps {
  posts: BlogPost[];
  activeFilter: 'all' | 'draft' | 'published';
  onFilterChange: (filter: 'all' | 'draft' | 'published') => void;
}

const BlogStatusFilter = ({ posts, activeFilter, onFilterChange }: BlogStatusFilterProps) => {
  const draftCount = posts.filter(post => post.status === 'draft').length;
  const publishedCount = posts.filter(post => post.status === 'published').length;
  
  return (
    <div className="flex items-center gap-2 mb-6">
      <Filter className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Filter by status:</span>
      
      <Button
        variant={activeFilter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className="flex items-center gap-2"
      >
        <FileText className="h-3 w-3" />
        All
        <Badge variant="secondary" className="ml-1">
          {posts.length}
        </Badge>
      </Button>
      
      <Button
        variant={activeFilter === 'draft' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('draft')}
        className="flex items-center gap-2"
      >
        <FileText className="h-3 w-3" />
        Drafts
        <Badge variant="outline" className="ml-1 border-orange-300 text-orange-700">
          {draftCount}
        </Badge>
      </Button>
      
      <Button
        variant={activeFilter === 'published' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('published')}
        className="flex items-center gap-2"
      >
        <Eye className="h-3 w-3" />
        Published
        <Badge variant="outline" className="ml-1 border-green-300 text-green-700">
          {publishedCount}
        </Badge>
      </Button>
    </div>
  );
};

export default BlogStatusFilter;
