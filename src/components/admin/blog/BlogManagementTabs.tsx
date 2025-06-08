
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BlogForm from '@/components/BlogForm';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import BlogPostsList from './BlogPostsList';

interface BlogManagementTabsProps {
  autoOpenAdd?: boolean;
}

const BlogManagementTabs = ({ autoOpenAdd }: BlogManagementTabsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useBlogPosts();

  // Auto-open add form when autoOpenAdd prop is true
  useEffect(() => {
    if (autoOpenAdd) {
      setEditingPost(null);
      setShowAddForm(true);
    }
  }, [autoOpenAdd]);

  const handleAddPost = () => {
    setEditingPost(null);
    setShowAddForm(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    console.log('Blog form submitted:', data);
    
    if (editingPost) {
      await updateBlogPost(editingPost.id, data);
    } else {
      await addBlogPost(data);
    }
    
    setShowAddForm(false);
    setEditingPost(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (id: string) => {
    await deleteBlogPost(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        {!showAddForm && (
          <Button onClick={handleAddPost} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {showAddForm ? (
        <div className="mb-8">
          <BlogForm 
            post={editingPost}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <BlogPostsList 
          posts={blogPosts}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onAddPost={handleAddPost}
        />
      )}
    </div>
  );
};

export default BlogManagementTabs;
