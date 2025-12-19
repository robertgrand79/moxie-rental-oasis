import React, { useState, useMemo } from 'react';
import { BlogPost } from '@/types/blogPost';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import ModernBlogsHeader from './ModernBlogsHeader';
import BlogsGrid from './BlogsGrid';
import BlogsListView from './BlogsListView';
import BlogDetailPanel from './BlogDetailPanel';
import BlogForm from '@/components/BlogForm';
import { toast } from 'sonner';

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
  const { blogPosts, loading, deleteBlogPost, updateBlogPost, refetch } = useBlogPosts({ publishedOnly: false });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

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
      total: blogPosts.length,
      published,
      draft,
      featured,
      topType,
    };
  }, [blogPosts]);

  // Filter posts
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

  const handleEdit = (post: BlogPost) => {
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteBlogPost(postId);
      toast.success('Blog post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      await updateBlogPost(postId, { 
        status: 'published',
        published_at: new Date().toISOString()
      });
      toast.success('Blog post published successfully');
    } catch (error) {
      toast.error('Failed to publish blog post');
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      await updateBlogPost(postId, { 
        status: 'draft',
        published_at: null
      });
      toast.success('Blog post unpublished');
    } catch (error) {
      toast.error('Failed to unpublish blog post');
    }
  };

  const handleViewDetails = (post: BlogPost) => {
    setViewingPost(post);
  };

  const handleCloseDetails = () => {
    setViewingPost(null);
  };

  const handleEditFromDetails = () => {
    if (viewingPost) {
      handleEdit(viewingPost);
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

      {viewMode === 'grid' ? (
        <BlogsGrid 
          posts={filteredPosts} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <BlogsListView 
          posts={filteredPosts} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onViewDetails={handleViewDetails}
        />
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
          onSubmit={onCloseForm}
          onCancel={onCloseForm}
        />
      )}
    </div>
  );
};

export default BlogsManager;
