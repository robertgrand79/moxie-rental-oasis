import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, Calendar, User, Eye, Tag, ExternalLink, Copy, EyeOff } from 'lucide-react';
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

interface BlogsListViewProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish?: (postId: string) => void;
  onUnpublish?: (postId: string) => void;
  onViewDetails?: (post: BlogPost) => void;
}

const BlogsListView = ({ posts, onEdit, onDelete, onPublish, onUnpublish, onViewDetails }: BlogsListViewProps) => {
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
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-stretch border rounded-lg bg-card overflow-hidden hover:shadow-sm transition-shadow"
          >
            {/* Status Stripe */}
            <div className={`w-1 ${getStatusStripeColor(post.status)}`} />
            
            <div className="flex items-center justify-between p-4 flex-1 gap-4">
              {/* Left: Image and Content */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {post.image_url ? (
                  <ThumbnailImage
                    src={post.image_url}
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge className={getStatusColor(post.status)} variant="secondary">
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                    {post.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={getContentTypeColor(post.content_type)} variant="secondary">
                      {CONTENT_TYPE_LABELS[post.content_type as keyof typeof CONTENT_TYPE_LABELS] || post.content_type}
                    </Badge>
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    className="font-semibold text-base truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onViewDetails?.(post)}
                  >
                    {post.title}
                  </h3>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{post.tags.slice(0, 2).join(', ')}</span>
                        {post.tags.length > 2 && <span>+{post.tags.length - 2}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default BlogsListView;
