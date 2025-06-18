
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BlogSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
  totalCount: number;
}

const BlogSearchBar = ({ searchQuery, onSearchChange, loading, totalCount }: BlogSearchBarProps) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search travel stories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background focus:bg-background"
          disabled={loading}
        />
      </div>
      
      {totalCount > 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          {totalCount} {totalCount === 1 ? 'post' : 'posts'} found
        </p>
      )}
    </div>
  );
};

export default BlogSearchBar;
