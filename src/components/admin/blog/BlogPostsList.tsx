
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/types/blogPost';
import BlogPostCard from './BlogPostCard';
import BlogStatusFilter from './BlogStatusFilter';

interface BlogPostsListProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onAddPost: () => void;
}

const BlogPostsList = ({ posts, onEdit, onDelete, onAddPost }: BlogPostsListProps) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  const filteredPosts = posts.filter(post => {
    if (statusFilter === 'all') return true;
    return post.status === statusFilter;
  });

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No blog posts created yet</p>
        <Button onClick={onAddPost}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlogStatusFilter 
        posts={posts}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg mb-4">
            No {statusFilter === 'all' ? '' : statusFilter} posts found
          </p>
          {statusFilter !== 'all' && (
            <Button 
              variant="outline" 
              onClick={() => setStatusFilter('all')}
            >
              Show All Posts
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((post) => (
            <BlogPostCard 
              key={post.id}
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostsList;
