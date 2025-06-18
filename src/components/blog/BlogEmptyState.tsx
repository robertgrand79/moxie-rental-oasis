
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

const BlogEmptyState = ({ searchQuery, onClearSearch }: BlogEmptyStateProps) => {
  return (
    <div className="text-center py-16">
      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        {searchQuery ? 'No posts found' : 'No blog posts yet'}
      </h3>
      <p className="text-muted-foreground mb-6">
        {searchQuery 
          ? 'Try adjusting your search terms or browse all posts.' 
          : 'Check back soon for exciting travel content and Eugene adventures!'
        }
      </p>
      {searchQuery && (
        <Button 
          variant="outline" 
          onClick={onClearSearch}
          className="bg-card hover:bg-accent"
        >
          Clear Search
        </Button>
      )}
    </div>
  );
};

export default BlogEmptyState;
