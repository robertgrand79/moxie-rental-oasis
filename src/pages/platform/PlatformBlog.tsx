import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Calendar,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react';
import { usePlatformBlogPosts } from '@/hooks/usePlatformBlogPosts';
import { usePlatform } from '@/contexts/PlatformContext';

const PlatformBlog: React.FC = () => {
  const { posts, isLoading, error } = usePlatformBlogPosts(true);
  const { isPlatformSite } = usePlatform();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Determine path prefix for links
  const isInPlatformPath = location.pathname.startsWith('/platform');
  const pathPrefix = isPlatformSite ? '' : (isInPlatformPath ? '/platform' : '');

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)] as string[];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
              Blog
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white font-fraunces">
            StayMoxie Blog
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Insights, strategies, and tips to help vacation rental hosts succeed with direct bookings.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={category === selectedCategory ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load blog posts. Please try again later.</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`${pathPrefix}/blog/${post.slug}`}
                  className="group"
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                    {/* Image */}
                    {post.image_url ? (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg" />
                    )}
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {post.category}
                          </Badge>
                        )}
                        {post.is_featured && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {post.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {post.read_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.read_time}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-fraunces">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get the latest vacation rental insights, tips, and strategies delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
              Subscribe
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-fraunces">
            Ready to Grow Your Direct Bookings?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Start your free trial and see how StayMoxie can transform your vacation rental business.
          </p>
          
          <Link to={`${pathPrefix}/auth?tab=signup`}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PlatformBlog;
