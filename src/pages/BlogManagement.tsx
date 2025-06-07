
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogForm from '@/components/BlogForm';
import NewsletterManager from '@/components/NewsletterManager';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BlogManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { blogPosts, loading, addBlogPost, updateBlogPost, deleteBlogPost } = useBlogPosts();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 mt-2">Create and manage your blog posts and newsletters</p>
          </div>
          {!showAddForm && (
            <Button onClick={handleAddPost} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Blog Posts</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {showAddForm && (
              <div className="mb-8">
                <BlogForm 
                  post={editingPost}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            )}

            {!showAddForm && (
              <div className="grid grid-cols-1 gap-6">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <CardDescription className="flex items-center text-sm mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                          </CardDescription>
                          <p className="text-sm text-gray-600">{post.excerpt}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Post
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {blogPosts.length === 0 && !showAddForm && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No blog posts created yet</p>
                <Button onClick={handleAddPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlogManagement;
