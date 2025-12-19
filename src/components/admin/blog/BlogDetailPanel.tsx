import React from 'react';
import { X, Edit, Calendar, User, Tag, MapPin, Clock, Link as LinkIcon, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlogPost, CONTENT_TYPE_LABELS } from '@/types/blogPost';
import ThumbnailImage from '@/components/ui/thumbnail-image';

interface BlogDetailPanelProps {
  post: BlogPost;
  onClose: () => void;
  onEdit: () => void;
}

const BlogDetailPanel = ({ post, onClose, onEdit }: BlogDetailPanelProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getContentTypeColor = (contentType: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-100 text-blue-800 border-blue-200',
      event: 'bg-purple-100 text-purple-800 border-purple-200',
      poi: 'bg-green-100 text-green-800 border-green-200',
      lifestyle: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[contentType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const postUrl = post.status === 'published' ? `/blog/${post.slug}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Post Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Image */}
            {post.image_url && (
              <div className="rounded-lg overflow-hidden">
                <ThumbnailImage
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                {post.image_credit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Photo: {post.image_credit}
                  </p>
                )}
              </div>
            )}

            {/* Title and Status */}
            <div>
              <div className="flex items-start gap-2 flex-wrap mb-2">
                <Badge className={getStatusColor(post.status)}>
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                <Badge className={getContentTypeColor(post.content_type)}>
                  {CONTENT_TYPE_LABELS[post.content_type as keyof typeof CONTENT_TYPE_LABELS] || post.content_type}
                </Badge>
                {post.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
              </div>
              {post.category && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{post.category}</span>
                </div>
              )}
              {postUrl && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="h-4 w-4" />
                  <a 
                    href={postUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Post <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <Separator />

            {/* Excerpt */}
            {post.excerpt && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Excerpt</h4>
                <p className="text-foreground">{post.excerpt}</p>
              </div>
            )}

            {/* Content Type Specific Info */}
            {post.content_type === 'event' && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Event Details</h4>
                {post.event_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Date: {formatDate(post.event_date)}</span>
                  </div>
                )}
                {(post.time_start || post.time_end) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Time: {post.time_start}{post.time_end && ` - ${post.time_end}`}</span>
                  </div>
                )}
                {post.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
            )}

            {(post.content_type === 'poi' || post.content_type === 'lifestyle') && post.location && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{post.location}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            {post.content && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Content Preview</h4>
                <div 
                  className="prose prose-sm max-w-none text-foreground bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {formatDate(post.created_at)}</p>
              <p>Updated: {formatDate(post.updated_at)}</p>
              <p>Slug: {post.slug}</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default BlogDetailPanel;
