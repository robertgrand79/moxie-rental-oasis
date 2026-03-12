
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

const BlogEmptyState = ({ searchQuery, onClearSearch }: BlogEmptyStateProps) => {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-8">
        <BookOpen className="h-9 w-9 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight text-foreground mb-3">
        {searchQuery ? 'No posts found' : 'No blog posts yet'}
      </h3>
      <p className="text-muted-foreground/70 text-sm mb-6">
        {searchQuery 
          ? 'Try adjusting your search terms or browse all posts.' 
          : 'Check back soon for new content!'
        }
      </p>
      {searchQuery && (
        <Button variant="outline" onClick={onClearSearch}>
          Clear Search
        </Button>
      )}
    </div>
  );
};

export default BlogEmptyState;
