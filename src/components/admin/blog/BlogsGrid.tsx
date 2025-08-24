import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, Calendar, User, Eye, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface BlogsGridProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish?: (postId: string) => void;
}

const BlogsGrid = ({ posts, onEdit, onDelete, onPublish }: BlogsGridProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            {post.image_url ? (
              <ThumbnailImage
                src={post.image_url}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm">No image</span>
                </div>
              </div>
            )}
            {post.is_featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="bg-white/80">
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
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
              <Badge className={getContentTypeColor(post.content_type)}>
                {post.content_type}
              </Badge>
            </div>
            
            {post.excerpt && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                {post.author}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1" />
                  <span className="truncate">{post.tags.slice(0, 2).join(', ')}</span>
                  {post.tags.length > 2 && <span>...</span>}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
              {post.category && (
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogsGrid;