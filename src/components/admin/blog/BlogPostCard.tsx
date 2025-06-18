
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Eye, EyeOff, Edit3 } from 'lucide-react';
import { BlogPost } from '@/types/blogPost';
import BlogPostActions from './BlogPostActions';

interface BlogPostCardProps {
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}

const BlogPostCard = ({ post, onEdit, onDelete }: BlogPostCardProps) => {
  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return (
        <div className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
          <Eye className="h-3 w-3" />
          Published
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 border border-orange-200">
          <Edit3 className="h-3 w-3" />
          Draft
        </div>
      );
    }
  };

  const getDateDisplay = () => {
    if (post.status === 'published' && post.published_at) {
      return (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-3 w-3 mr-1" />
          Published {new Date(post.published_at).toLocaleDateString()}
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          Created {new Date(post.created_at).toLocaleDateString()}
        </div>
      );
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
      post.status === 'draft' ? 'border-orange-200 bg-orange-50/30' : 'border-green-200 bg-green-50/30'
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{post.title}</CardTitle>
              {getStatusBadge(post.status)}
            </div>
            {getDateDisplay()}
            <CardDescription className="mt-2">
              {post.excerpt}
            </CardDescription>
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
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
            >
              {tag}
            </span>
          ))}
          {(!post.tags || post.tags.length === 0) && (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard;
