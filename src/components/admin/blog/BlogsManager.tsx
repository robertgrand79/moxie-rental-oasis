import React, { useState } from 'react';
import { Plus, FileText, Calendar, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPost, ContentType, CONTENT_TYPE_LABELS } from '@/types/blogPost';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogsGrid from './BlogsGrid';
import BlogsListView from './BlogsListView';
import BlogsViewToggle from './BlogsViewToggle';
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
  const { blogPosts, loading, deleteBlogPost, updateBlogPost } = useBlogPosts({ publishedOnly: false });
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const contentTypes = [
    { value: 'all', label: 'All Posts', icon: FileText },
    { value: 'article', label: CONTENT_TYPE_LABELS.article, icon: FileText },
    { value: 'event', label: CONTENT_TYPE_LABELS.event, icon: Calendar },
    { value: 'poi', label: CONTENT_TYPE_LABELS.poi, icon: MapPin },
    { value: 'lifestyle', label: CONTENT_TYPE_LABELS.lifestyle, icon: Heart },
  ];

  const filteredPosts = selectedContentType === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.content_type === selectedContentType);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Blog Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage all your blog posts, articles, events, places, and lifestyle content
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <BlogsViewToggle view={view} onViewChange={setView} />
            <Button 
              onClick={handleAddNew} 
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add Blog Post</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedContentType} onValueChange={setSelectedContentType}>
            <TabsList className="grid w-full grid-cols-5 h-auto">
              {contentTypes.map((contentType) => (
                <TabsTrigger 
                  key={contentType.value} 
                  value={contentType.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <contentType.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{contentType.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {contentTypes.map((contentType) => (
              <TabsContent key={contentType.value} value={contentType.value} className="mt-6">
                {view === 'grid' ? (
                  <BlogsGrid 
                    posts={filteredPosts} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                  />
                ) : (
                  <BlogsListView 
                    posts={filteredPosts} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

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