
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, BookOpen, Plane, MapPin, Loader2 } from 'lucide-react';
import { useOptimizedBlogPosts } from '@/hooks/useOptimizedBlogPosts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import { getTagColor } from '@/utils/blogPostUtils';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingState from '@/components/ui/loading-state';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const { 
    posts: blogPosts, 
    loading, 
    hasMore, 
    totalCount,
    loadMore,
    isLoadingMore,
    error
  } = useOptimizedBlogPosts({ 
    publishedOnly: true,
    searchQuery: debouncedSearchQuery,
    category: selectedCategory,
    pageSize: 12
  });

  console.log('🎯 Blog page - posts:', blogPosts.length, 'loading:', loading, 'hasMore:', hasMore);

  // Memoize expensive calculations
  const { robertShellyPosts, featuredPost } = useMemo(() => {
    const robertShellyPosts = blogPosts.filter(post => 
      post.tags?.includes("Robert & Shelly's Travels")
    );
    const featuredPost = blogPosts.find(post => post.tags?.includes('featured')) || blogPosts[0];
    
    return { robertShellyPosts, featuredPost };
  }, [blogPosts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen },
    { id: 'eugene', name: 'Eugene Local', icon: MapPin },
    { id: 'robert-shelly', name: "Robert & Shelly's Travels", icon: Plane },
    { id: 'travel', name: 'Travel Tips', icon: MapPin },
    { id: 'destinations', name: 'Destinations', icon: MapPin }
  ];

  // Show loading state only for initial load
  if (loading && blogPosts.length === 0) {
    return <LoadingState variant="page" message="Loading travel stories..." />;
  }

  // Show error state
  if (error && blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-xl text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 flex items-center justify-center gap-4">
            <BookOpen className="h-12 w-12 text-primary" />
            Moxie Travel Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            Your gateway to Eugene adventures, travel insights, and stories from the heart of Oregon. 
            Discover hidden gems, local favorites, and travel inspiration from our hosts and guests.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.id 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'bg-card hover:bg-accent'
                  }`}
                  disabled={loading}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search travel stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background focus:bg-background"
                disabled={loading}
              />
            </div>
          </div>

          {/* Results count */}
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {totalCount} {totalCount === 1 ? 'post' : 'posts'} found
            </p>
          )}
        </div>

        {/* Robert & Shelly's Featured Section */}
        {robertShellyPosts.length > 0 && selectedCategory === 'all' && !searchQuery && (
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
                  onClick={() => setSelectedCategory('robert-shelly')}
                  className="bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  View All Travel Adventures
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Blog Posts */}
          <div className="lg:col-span-3">
            {blogPosts.length === 0 && !loading ? (
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
                    onClick={() => setSearchQuery('')}
                    className="bg-card hover:bg-accent"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {selectedCategory !== 'robert-shelly' && (
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedCategory === 'all' ? 'Latest Posts' : `${categories.find(c => c.id === selectedCategory)?.name} Posts`}
                  </h2>
                )}
                
                {/* Blog posts grid */}
                <div className="space-y-6">
                  {blogPosts.map((post) => (
                    <Card key={post.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border hover:shadow-lg">
                      <div className="md:flex">
                        {post.image_url && (
                          <div className="md:w-1/3 overflow-hidden">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
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
                      onClick={loadMore}
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
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Featured Post */}
            {featuredPost && selectedCategory === 'all' && !searchQuery && (
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
                <CardTitle className="text-lg">Explore Eugene</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
        </div>

        {/* Newsletter Signup Section */}
        <div className="border-t border-border pt-16">
          <div className="max-w-2xl mx-auto text-center">
            <TravelNewsletterSignup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
