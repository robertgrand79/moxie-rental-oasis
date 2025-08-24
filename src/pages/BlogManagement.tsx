
import React, { useState } from 'react';
import { BlogPost } from '@/types/blogPost';
import BlogsManager from '@/components/admin/blog/BlogsManager';
import BlogForm from '@/components/BlogForm';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const BlogManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const resetToDefaultState = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  // Hook to handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: resetToDefaultState
  });

  const handleAddPost = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  return showForm ? (
    <BlogForm
      post={editingPost}
      onSubmit={handleFormClose}
      onCancel={handleFormClose}
    />
  ) : (
    <BlogsManager
      onEdit={handleEditPost}
      onAddNew={handleAddPost}
      showForm={showForm}
      editingPost={editingPost}
      onCloseForm={handleFormClose}
    />
  );
};

export default BlogManagement;
