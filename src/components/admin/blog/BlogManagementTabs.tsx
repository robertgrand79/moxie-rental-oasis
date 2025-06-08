
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogForm from '@/components/BlogForm';
import NewsletterManager from '@/components/NewsletterManager';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import BlogPostsList from './BlogPostsList';

const BlogManagementTabs = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useBlogPosts();

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
    <Tabs defaultValue="posts" className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>
        {!showAddForm && (
          <Button onClick={handleAddPost} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      <TabsContent value="posts">
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
      </TabsContent>

      <TabsContent value="newsletter">
        <NewsletterManager />
      </TabsContent>
    </Tabs>
  );
};

export default BlogManagementTabs;
