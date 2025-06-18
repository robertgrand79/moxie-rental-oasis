
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import BlogForm from '@/components/BlogForm';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import BlogPostsList from './BlogPostsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { blogPostService } from '@/services/blogPostService';

interface BlogManagementTabsProps {
  autoOpenAdd?: boolean;
}

const BlogManagementTabs = ({ autoOpenAdd }: BlogManagementTabsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, refetch } = useBlogPosts();
  const isMobile = useIsMobile();

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
    
    if (editingPost || data.id) {
      await updateBlogPost(data.id || editingPost!.id, data);
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

  const handleCleanupDrafts = async () => {
    const success = await blogPostService.deleteOldAutoSavedDrafts(7);
    if (success) {
      refetch();
    }
  };

  // Count auto-saved drafts
  const autoSavedDrafts = blogPosts.filter(post => 
    post.status === 'draft' && post.title.includes('Untitled Draft')
  );

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Blog Posts</h2>
        <div className="flex gap-2">
          {autoSavedDrafts.length > 0 && (
            <Button 
              variant="outline"
              onClick={handleCleanupDrafts}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean up {autoSavedDrafts.length} auto-saved drafts
            </Button>
          )}
          {!showAddForm && (
            <Button 
              onClick={handleAddPost} 
              className={`flex items-center ${isMobile ? 'w-full min-h-[44px] justify-center' : ''}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
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
