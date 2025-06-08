
import React from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import BlogManagementTabs from '@/components/admin/blog/BlogManagementTabs';

const BlogManagement = () => {
  const { loading } = useBlogPosts();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Blog Management"
        description="Create and manage your blog posts and newsletters"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Blog Management"
      description="Create and manage your blog posts and newsletters"
    >
      <div className="p-6">
        <BlogManagementTabs />
      </div>
    </AdminPageWrapper>
  );
};

export default BlogManagement;
