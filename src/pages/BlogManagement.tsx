
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePaginatedBlogPosts } from '@/hooks/usePaginatedBlogPosts';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import BlogForm from '@/components/BlogForm';
import BlogPostList from '@/components/BlogPostList';
import PaginationControls from '@/components/ui/pagination-controls';
import LoadingState from '@/components/ui/loading-state';

const BlogManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const {
    posts,
    loading,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  } = usePaginatedBlogPosts(false);

  const handleAddPost = () => {
    setEditingPost(null);
    setShowAddForm(true);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingPost(null);
    refetch();
  };

  const pageActions = !showAddForm ? (
    <EnhancedButton 
      onClick={handleAddPost} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
    >
      Add Blog Post
    </EnhancedButton>
  ) : null;

  if (loading && currentPage === 1) {
    return <LoadingState variant="page" message="Loading blog posts..." />;
  }

  return (
    <AdminPageWrapper
      title="Blog Management"
      description={`Manage your blog posts and content (${totalCount} posts)`}
      actions={pageActions}
    >
      <div className="p-6">
        {showAddForm ? (
          <BlogForm
            initialData={editingPost}
            isEditing={!!editingPost}
            onClose={handleFormClose}
          />
        ) : (
          <div className="space-y-6">
            <BlogPostList
              posts={posts}
              onEdit={handleEditPost}
              loading={loading}
            />
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={20}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              loading={loading}
              itemName="posts"
            />
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default BlogManagement;
