
import React, { useState } from 'react';
import { BlogPost } from '@/types/blogPost';
import BlogsManager from '@/components/admin/blog/BlogsManager';
import BlogForm from '@/components/BlogForm';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';
import { blogPostService } from '@/services/blogPostService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BlogFormSubmitData } from '@/hooks/useBlogForm';

const BlogManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { user } = useAuth();

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
      handleFormClose();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      toast.error('Failed to save blog post');
    }
  };

  return showForm ? (
    <BlogForm
      post={editingPost}
      onSubmit={handleFormSubmit}
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
