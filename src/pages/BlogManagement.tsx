
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import BlogManagementTabs from '@/components/admin/blog/BlogManagementTabs';

const BlogManagement = () => {
  const { loading } = useBlogPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenAdd, setAutoOpenAdd] = useState(false);

  // Check for action parameter
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setAutoOpenAdd(true);
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

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
        <BlogManagementTabs autoOpenAdd={autoOpenAdd} />
      </div>
    </AdminPageWrapper>
  );
};

export default BlogManagement;
