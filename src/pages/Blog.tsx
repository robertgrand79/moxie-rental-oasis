
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, MapPin, Plane } from 'lucide-react';
import { useOptimizedBlogPosts } from '@/hooks/useOptimizedBlogPosts';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingState from '@/components/ui/loading-state';
import BlogHero from '@/components/blog/BlogHero';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import RobertShellyTravelSection from '@/components/blog/RobertShellyTravelSection';
import BlogPostsGrid from '@/components/blog/BlogPostsGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogEmptyState from '@/components/blog/BlogEmptyState';
import BlogErrorState from '@/components/blog/BlogErrorState';
import { useTenant } from '@/contexts/TenantContext';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { tenantId } = useTenant();
  
  // Check if user wants to view all posts initially
  const viewAll = searchParams.get('view') === 'all';
  const initialPageSize = viewAll ? 12 : 4;
  const loadMoreSize = 4;
  
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
    pageSize: initialPageSize,
    loadMoreSize: loadMoreSize,
    organizationId: tenantId
  });

  console.log('🎯 Blog page - posts:', blogPosts.length, 'loading:', loading, 'hasMore:', hasMore);

  // Memoize expensive calculations
  const { robertShellyPosts, featuredPost, regularPosts } = useMemo(() => {
    const robertShellyPosts = blogPosts.filter(post => 
      post.tags?.includes("Robert & Shelly's Travels")
    );
    const featuredPost = blogPosts.find(post => post.tags?.includes('featured')) || blogPosts[0];
    
    // For the main posts grid, exclude Robert & Shelly posts when showing "all" view
    // to avoid duplication with the featured section
    const regularPosts = selectedCategory === 'all' && !searchQuery 
      ? blogPosts.filter(post => !post.tags?.includes("Robert & Shelly's Travels"))
      : blogPosts;
    
    return { robertShellyPosts, featuredPost, regularPosts };
  }, [blogPosts, selectedCategory, searchQuery]);

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
    return <BlogErrorState error={error} />;
  }

  const handleClearSearch = () => setSearchQuery('');
  const handleViewAllTravels = () => setSelectedCategory('robert-shelly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <BlogHero />
        
        {/* Category Filter */}
        <BlogCategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          loading={loading}
        />

        {/* Search Bar */}
        <BlogSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          totalCount={totalCount}
        />

        {/* Robert & Shelly's Featured Section - only show on "all" view without search */}
        {robertShellyPosts.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <RobertShellyTravelSection 
            robertShellyPosts={robertShellyPosts}
            onViewAll={handleViewAllTravels}
            loading={loading}
          />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Blog Posts */}
          <div className="lg:col-span-3">
            {regularPosts.length === 0 && !loading ? (
              <BlogEmptyState 
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
              />
            ) : (
              <BlogPostsGrid 
                posts={regularPosts}
                selectedCategory={selectedCategory}
                categories={categories}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
                showViewAllHint={!viewAll && selectedCategory === 'all' && !searchQuery && regularPosts.length >= initialPageSize}
              />
            )}
          </div>

          {/* Sidebar */}
          <BlogSidebar 
            featuredPost={featuredPost}
            showFeatured={selectedCategory === 'all' && !searchQuery}
          />
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
