
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdvancedOptimizedImage from '@/components/ui/advanced-optimized-image';
import { BlogPostSummary } from '@/services/optimizedBlogService';
import {

 getTagColor } from '@/utils/blogPostUtils';

interface BlogPostsGridProps {
  posts: BlogPostSummary[];
  selectedCategory: string;
  categories: Array<{ id: string; name: string }>;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  showViewAllHint?: boolean;
}

const BlogPostsGrid = ({ 
  posts, 
  selectedCategory, 
  categories, 
  hasMore, 
  isLoadingMore, 
  onLoadMore,
  showViewAllHint = false
}: BlogPostsGridProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {selectedCategory !== 'robert-shelly' && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCategory === 'all' ? 'Latest Posts' : `${categories.find(c => c.id === selectedCategory)?.name} Posts`}
          </h2>
          {showViewAllHint && (
            <Link 
              to="/blog?view=all"
              className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View All Posts
            </Link>
          )}
        </div>
      )}
      
      {/* Blog posts grid */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border hover:shadow-lg">
            <div className="md:flex">
              {post.image_url && (
                <div className="md:w-1/3 overflow-hidden">
                  <AdvancedOptimizedImage
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-48 md:h-full group-hover:scale-105 transition-transform duration-300"
                    aspectRatio="16:9"
                    enableAnalytics={true}
                    transformParams={{
                      quality: 85,
                      format: 'webp',
                      sharp: true
                    }}
                  />
                </div>
              )}
              <div className={`${post.image_url ? 'md:w-2/3' : 'w-full'}`}>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(post.published_at || post.created_at)}
                    <User className="h-4 w-4 ml-4 mr-1" />
                    {post.author}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className={`text-xs transition-colors ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group-hover:gap-2 transition-all"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                  </Link>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="bg-card hover:bg-accent"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading more posts...
              </>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPostsGrid;
