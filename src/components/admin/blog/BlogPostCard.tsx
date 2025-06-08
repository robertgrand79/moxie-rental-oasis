
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { BlogPost } from '@/hooks/useBlogPosts';
import BlogPostActions from './BlogPostActions';

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}

const BlogPostCard = ({ post, onEdit, onDelete }: BlogPostCardProps) => {
  return (
    <Card className="overflow-hidden">
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
          <BlogPostActions 
            post={post}
            onEdit={onEdit}
            onDelete={onDelete}
          />
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
  );
};

export default BlogPostCard;
