
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, MapPin, Compass, Plane } from 'lucide-react';
import { useOptimizedBlogPosts } from '@/hooks/useOptimizedBlogPosts';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingState from '@/components/ui/loading-state';
import BlogHero from '@/components/blog/BlogHero';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import BlogPostsGrid from '@/components/blog/BlogPostsGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogEmptyState from '@/components/blog/BlogEmptyState';
import BlogErrorState from '@/components/blog/BlogErrorState';
import OwnerTravelsSection from '@/components/blog/OwnerTravelsSection';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { debug } from '@/utils/debug';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { tenantId } = useTenant();
  const { settings } = useTenantSettings();
  const founderNames = settings?.founderNames || 'Our Hosts';
  
  // Check for category in URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);
  
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

  debug.blog('🎯 Blog page - posts:', blogPosts.length, 'loading:', loading, 'hasMore:', hasMore);

  // Memoize expensive calculations
  const { featuredPost, regularPosts, hasOwnerTravelsPosts } = useMemo(() => {
    const featuredPost = blogPosts.find(post => post.tags?.includes('featured')) || blogPosts[0];
    // Check if any posts have the owner-travels tag
    const hasOwnerTravelsPosts = blogPosts.some(post => 
      post.tags?.includes('owner-travels') || post.category === 'owner-travels'
    );
    return { featuredPost, regularPosts: blogPosts, hasOwnerTravelsPosts };
  }, [blogPosts]);

  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen },
    { id: 'local', name: 'Local Guides', icon: MapPin },
    { id: 'travel', name: 'Travel Tips', icon: Compass },
    { id: 'destinations', name: 'Destinations', icon: MapPin },
    { id: 'owner-travels', name: `${founderNames}'s Travels`, icon: Plane }
  ];

  // Show loading state only for initial load
  if (loading && blogPosts.length === 0) {
    return <LoadingState variant="page" message="Loading blog posts..." />;
  }

  // Show error state
  if (error && blogPosts.length === 0) {
    return <BlogErrorState error={error} />;
  }

  const handleClearSearch = () => setSearchQuery('');

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Blog Posts */}
          <div className="lg:col-span-3">
            {/* Owner Travels Section Header */}
            {selectedCategory === 'owner-travels' && (
              <OwnerTravelsSection />
            )}
            
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
            hasOwnerTravelsPosts={hasOwnerTravelsPosts}
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
