
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/hooks/useBlogPosts';
import BlogPostCard from './BlogPostCard';

interface BlogPostsListProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onAddPost: () => void;
}

const BlogPostsList = ({ posts, onEdit, onDelete, onAddPost }: BlogPostsListProps) => {
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
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => (
        <BlogPostCard 
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BlogPostsList;
