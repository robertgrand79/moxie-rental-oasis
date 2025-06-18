
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plane, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlogPostSummary } from '@/services/optimizedBlogService';

interface RobertShellyTravelSectionProps {
  robertShellyPosts: BlogPostSummary[];
  onViewAll: () => void;
  loading: boolean;
}

const RobertShellyTravelSection = ({ robertShellyPosts, onViewAll, loading }: RobertShellyTravelSectionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (robertShellyPosts.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Plane className="h-8 w-8 text-icon-indigo" />
          Robert & Shelly's Travel Adventures
        </h2>
        <p className="text-lg text-muted-foreground">
          Follow our hosts' personal journeys and discover new destinations through their eyes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {robertShellyPosts.slice(0, 3).map((post) => (
          <Card key={post.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to border-border hover:shadow-lg">
            {post.image_url && (
              <div className="overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.published_at || post.created_at)}
                <Plane className="h-4 w-4 ml-4 mr-1" />
                Travel Adventure
              </div>
              <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/blog/${post.slug}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium group-hover:gap-2 transition-all"
              >
                Read Travel Story
                <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {robertShellyPosts.length > 3 && (
        <div className="text-center">
          <Button 
            onClick={onViewAll}
            className="bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            View All Travel Adventures
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RobertShellyTravelSection;
