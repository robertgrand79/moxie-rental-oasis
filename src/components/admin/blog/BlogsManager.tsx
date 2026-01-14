import React, { useState, useMemo } from 'react';
import { BlogPost } from '@/types/blogPost';
import { useOptimizedBlogPosts, BlogPostSummary } from '@/hooks/useOptimizedBlogPosts';
import { blogPostService } from '@/services/blogPostService';
import ModernBlogsHeader from './ModernBlogsHeader';
import BlogsGrid from './BlogsGrid';
import BlogsListView from './BlogsListView';
import BlogDetailPanel from './BlogDetailPanel';
import BlogForm from '@/components/BlogForm';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BlogFormSubmitData } from '@/hooks/useBlogForm';

interface BlogsManagerProps {
  onEdit?: (post: BlogPost) => void;
  onAddNew?: () => void;
  showForm?: boolean;
  editingPost?: BlogPost | null;
  onCloseForm?: () => void;
}

const BlogsManager = ({ 
  onEdit, 
  onAddNew, 
  showForm = false, 
  editingPost = null, 
  onCloseForm 
}: BlogsManagerProps) => {
  const { user } = useAuth();
  
  // Use optimized hook that excludes content field for fast loading
  const { 
    posts: blogPosts, 
    loading,
    error,
    refetch, 
    totalCount,
    hasMore,
    loadMore,
    isLoadingMore 
  } = useOptimizedBlogPosts({ 
    publishedOnly: false,
    pageSize: 50, // Load more posts for admin view
    loadMoreSize: 50
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  // Handle form submission with actual save
  const handleFormSubmit = async (data: BlogFormSubmitData) => {
    try {
      if (editingPost || data.id) {
        const postId = editingPost?.id || data.id!;
        await blogPostService.updateBlogPost(postId, data);
      } else if (user) {
        await blogPostService.createBlogPost(data as Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>, user.id);
      }
      
      toast.success(data.status === 'published' 
        ? 'Blog post published successfully!' 
        : 'Blog post saved as draft!');
      refetch();
      if (onCloseForm) onCloseForm();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      toast.error('Failed to save blog post');
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const published = blogPosts.filter(p => p.status === 'published').length;
    const draft = blogPosts.filter(p => p.status === 'draft').length;
    const featured = blogPosts.filter(p => p.is_featured).length;
    
    // Find top content type
    const typeCounts = blogPosts.reduce((acc, post) => {
      acc[post.content_type] = (acc[post.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    return {
      total: totalCount || blogPosts.length,
      published,
      draft,
      featured,
      topType,
    };
  }, [blogPosts, totalCount]);

  // Filter posts (client-side filtering for already loaded posts)
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          post.title.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Content type filter
      if (contentTypeFilter !== 'all' && post.content_type !== contentTypeFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && post.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [blogPosts, searchQuery, contentTypeFilter, statusFilter]);

  // Convert BlogPostSummary to BlogPost-like object for components that expect it
  const postsForDisplay = useMemo(() => {
    return filteredPosts.map(post => ({
      ...post,
      content: '', // Empty content since we don't load it for list view
      metadata: {},
      display_order: 0,
    })) as BlogPost[];
  }, [filteredPosts]);

  const handleEdit = async (post: BlogPost) => {
    if (onEdit) {
      // Fetch full content when editing
      try {
        const fullPost = await blogPostService.fetchBlogPostBySlug(post.slug);
        if (fullPost) {
          onEdit(fullPost);
        } else {
          // Fallback: fetch directly by ID if slug doesn't work (draft posts)
          const allPosts = await blogPostService.fetchBlogPosts(false);
          const found = allPosts.find(p => p.id === post.id);
          if (found) {
            onEdit(found);
          } else {
            toast.error('Failed to load post content');
          }
        }
      } catch (error) {
        console.error('Error loading full post:', error);
        toast.error('Failed to load post content');
      }
    }
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await blogPostService.deleteBlogPost(postId);
      refetch();
      toast.success('Blog post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      await blogPostService.updateBlogPost(postId, { 
        status: 'published',
        published_at: new Date().toISOString()
      });
      refetch();
      toast.success('Blog post published successfully');
    } catch (error) {
      toast.error('Failed to publish blog post');
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      await blogPostService.updateBlogPost(postId, { 
        status: 'draft',
        published_at: null
      });
      refetch();
      toast.success('Blog post unpublished');
    } catch (error) {
      toast.error('Failed to unpublish blog post');
    }
  };

  const handleViewDetails = async (post: BlogPost) => {
    // Fetch full content for detail view
    try {
      const fullPost = await blogPostService.fetchBlogPostBySlug(post.slug);
      if (fullPost) {
        setViewingPost(fullPost);
      } else {
        // Fallback for draft posts
        const allPosts = await blogPostService.fetchBlogPosts(false);
        const found = allPosts.find(p => p.id === post.id);
        if (found) {
          setViewingPost(found);
        } else {
          // Use the summary data if we can't fetch full content
          setViewingPost(post);
        }
      }
    } catch (error) {
      console.error('Error loading full post:', error);
      setViewingPost(post);
    }
  };

  const handleCloseDetails = () => {
    setViewingPost(null);
  };

  const handleEditFromDetails = () => {
    if (viewingPost) {
      if (onEdit) {
        onEdit(viewingPost);
      }
      setViewingPost(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Blog posts refreshed');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading blog posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Couldn’t load blog posts</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ModernBlogsHeader
        totalPosts={stats.total}
        publishedPosts={stats.published}
        draftPosts={stats.draft}
        featuredPosts={stats.featured}
        topContentType={stats.topType}
        onAddPost={handleAddNew}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        contentTypeFilter={contentTypeFilter}
        onContentTypeFilterChange={setContentTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={handleRefresh}
      />

      {postsForDisplay.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">No blog posts found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || contentTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Create your first blog post to get started.'}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Add Blog Post
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <BlogsGrid 
          posts={postsForDisplay} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <BlogsListView 
          posts={postsForDisplay} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onViewDetails={handleViewDetails}
        />
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={loadMore} 
            disabled={isLoadingMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {viewingPost && (
        <BlogDetailPanel
          post={viewingPost}
          onClose={handleCloseDetails}
          onEdit={handleEditFromDetails}
        />
      )}

      {showForm && onCloseForm && (
        <BlogForm
          post={editingPost}
          onSubmit={handleFormSubmit}
          onCancel={onCloseForm}
        />
      )}
    </div>
  );
};

export default BlogsManager;
