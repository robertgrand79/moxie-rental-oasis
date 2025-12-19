import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, Calendar, User, Eye, Tag, ExternalLink, Copy, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BlogPost, CONTENT_TYPE_LABELS } from '@/types/blogPost';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import { toast } from 'sonner';

interface BlogsGridProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish?: (postId: string) => void;
  onUnpublish?: (postId: string) => void;
  onViewDetails?: (post: BlogPost) => void;
}

const BlogsGrid = ({ posts, onEdit, onDelete, onPublish, onUnpublish, onViewDetails }: BlogsGridProps) => {
  const handleDelete = (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  const getContentTypeColor = (contentType: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      poi: 'bg-green-100 text-green-800',
      lifestyle: 'bg-orange-100 text-orange-800',
    };
    return colors[contentType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusStripeColor = (status: string) => {
    return status === 'published' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCopyLink = (post: BlogPost) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleViewPost = (post: BlogPost) => {
    window.open(`/blog/${post.slug}`, '_blank');
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No blog posts found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {/* Status Stripe */}
            <div className={`h-1 ${getStatusStripeColor(post.status)}`} />
            
            {/* Header with Badges */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(post.status)} variant="secondary">
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                {post.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <Badge className={getContentTypeColor(post.content_type)} variant="secondary">
                {CONTENT_TYPE_LABELS[post.content_type as keyof typeof CONTENT_TYPE_LABELS] || post.content_type}
              </Badge>
            </div>

            {/* Image */}
            <div className="px-4">
              {post.image_url ? (
                <ThumbnailImage
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col">
              <h3 
                className="font-semibold text-lg line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => onViewDetails?.(post)}
              >
                {post.title}
              </h3>
              
              <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                </div>
                {post.category && (
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                )}
              </div>

              {post.excerpt && (
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto mb-3">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="truncate">{post.tags.slice(0, 2).join(', ')}</span>
                  {post.tags.length > 2 && <span>+{post.tags.length - 2}</span>}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t mt-auto">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewPost(post)}
                        disabled={post.status === 'draft'}
                        className="h-8"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {post.status === 'draft' ? 'Publish first to view' : 'Open post in new tab'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCopyLink(post)}
                        className="h-8"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy post link</TooltipContent>
                  </Tooltip>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails?.(post)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {post.status === 'draft' && onPublish && (
                      <DropdownMenuItem onClick={() => onPublish(post.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    {post.status === 'published' && onUnpublish && (
                      <DropdownMenuItem onClick={() => onUnpublish(post.id)}>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(post)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default BlogsGrid;
