
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import BlogForm from '@/components/BlogForm';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
}

const BlogManagement = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Top 5 Vacation Destinations for 2024',
      excerpt: 'Discover the most sought-after vacation spots that offer unforgettable experiences and luxury accommodations.',
      content: 'Full blog post content here...',
      author: 'Sarah Johnson',
      publishedAt: '2024-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
      tags: ['Travel', 'Destinations', 'Luxury'],
      slug: 'top-5-vacation-destinations-2024',
      status: 'published'
    },
    {
      id: '2',
      title: 'Making the Most of Your Vacation Rental Experience',
      excerpt: 'Essential tips and tricks to ensure your vacation rental stay exceeds all expectations.',
      content: 'Full blog post content here...',
      author: 'Mike Chen',
      publishedAt: '2024-01-10',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
      tags: ['Tips', 'Vacation Rentals', 'Travel'],
      slug: 'making-most-vacation-rental-experience',
      status: 'published'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const handleAddPost = () => {
    setEditingPost(null);
    setShowAddForm(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowAddForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log('Blog form submitted:', data);
    
    if (editingPost) {
      // Update existing post
      setBlogPosts(prev => prev.map(post => 
        post.id === editingPost.id 
          ? { ...post, ...data, updatedAt: new Date().toISOString() }
          : post
      ));
      toast({
        title: "Post Updated",
        description: "Your blog post has been successfully updated.",
      });
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: Date.now().toString(),
        ...data,
        author: 'Admin User', // This would come from auth context
        publishedAt: data.status === 'published' ? new Date().toISOString() : '',
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      };

      setBlogPosts(prev => [...prev, newPost]);
      toast({
        title: "Post Created",
        description: "Your blog post has been successfully created.",
      });
    }

    setShowAddForm(false);
    setEditingPost(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    setBlogPosts(blogPosts.filter(post => post.id !== id));
    toast({
      title: "Post Deleted",
      description: "The blog post has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 mt-2">Create and manage your blog posts</p>
          </div>
          {!showAddForm && (
            <Button onClick={handleAddPost} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>

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
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
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
      </div>
    </div>
  );
};

export default BlogManagement;
