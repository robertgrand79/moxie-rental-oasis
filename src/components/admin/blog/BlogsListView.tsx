import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, Calendar, User, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlogPost } from '@/types/blogPost';
import ThumbnailImage from '@/components/ui/thumbnail-image';

interface BlogsListViewProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish?: (postId: string) => void;
}

const BlogsListView = ({ posts, onEdit, onDelete, onPublish }: BlogsListViewProps) => {
  const handleDelete = (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  const getContentTypeColor = (contentType: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      poi: 'bg-green-100 text-green-800',
      lifestyle: 'bg-orange-100 text-orange-800',
    };
    return colors[contentType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No blog posts found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-4 flex-1">
            {post.image_url ? (
              <ThumbnailImage
                src={post.image_url}
                alt={post.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                {post.is_featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge className={getContentTypeColor(post.content_type)}>
                  {post.content_type}
                </Badge>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </div>
              
              {post.excerpt && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <span className="truncate">{post.tags.slice(0, 2).join(', ')}</span>
                    {post.tags.length > 2 && <span>...</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {post.category && (
              <Badge variant="outline" className="text-xs">
                {post.category}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(post)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {post.status === 'draft' && onPublish && (
                  <DropdownMenuItem onClick={() => onPublish(post.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleDelete(post)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogsListView;