
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPostSummary } from '@/services/optimizedBlogService';

interface BlogSidebarProps {
  featuredPost: BlogPostSummary | null;
  showFeatured: boolean;
}

const BlogSidebar = ({ featuredPost, showFeatured }: BlogSidebarProps) => {
  return (
    <div className="lg:col-span-1 space-y-8">
      {/* Featured Post */}
      {featuredPost && showFeatured && (
        <Card className="bg-muted border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Featured Story</CardTitle>
          </CardHeader>
          <CardContent>
            {featuredPost.image_url && (
              <img
                src={featuredPost.image_url}
                alt={featuredPost.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
                loading="lazy"
              />
            )}
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
              {featuredPost.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {featuredPost.excerpt}
            </p>
            <Link 
              to={`/blog/${featuredPost.slug}`}
              className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center"
            >
              Read Featured Story
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Blog Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link 
            to="/blog?view=all" 
            className="block text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View All Blog Posts →
          </Link>
          <Link to="/experiences" className="block text-primary hover:text-primary/80 text-sm">
            Local Experiences →
          </Link>
          <Link to="/events" className="block text-primary hover:text-primary/80 text-sm">
            Upcoming Events →
          </Link>
          <Link to="/properties" className="block text-primary hover:text-primary/80 text-sm">
            Our Properties →
          </Link>
          <Link to="/about" className="block text-primary hover:text-primary/80 text-sm">
            About Our Hosts →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogSidebar;
