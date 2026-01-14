
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Eye, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { BlogPost } from '@/types/blogPost';
import { getTagColor, getContentTypeColor } from '@/utils/blogPostUtils';
import { format } from 'date-fns';
import { debug } from '@/utils/debug';

interface BlogPostsListProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onAddPost: () => void;
  onPublish?: (post: BlogPost) => void;
}

const BlogPostsList = ({ posts, onEdit, onDelete, onAddPost, onPublish }: BlogPostsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'article' | 'event' | 'poi' | 'lifestyle'>('all');

  debug.blog('BlogPostsList - Total posts received:', posts.length);
  debug.blog('BlogPostsList - Posts by content type:', {
    article: posts.filter(p => p.content_type === 'article').length,
    event: posts.filter(p => p.content_type === 'event').length,
    poi: posts.filter(p => p.content_type === 'poi').length,
    lifestyle: posts.filter(p => p.content_type === 'lifestyle').length
  });

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (post.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesContentType = contentTypeFilter === 'all' || post.content_type === contentTypeFilter;
    
    return matchesSearch && matchesStatus && matchesContentType;
  });

  debug.blog('BlogPostsList - Filtered posts:', filteredPosts.length);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <p className="text-lg">No blog posts found</p>
          <p className="text-sm">This could indicate a data loading issue</p>
        </div>
        <Button onClick={onAddPost} className="bg-blue-600 hover:bg-blue-700">
          Create Your First Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select 
            value={statusFilter} 
            onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={contentTypeFilter} 
            onValueChange={(value: 'all' | 'article' | 'event' | 'poi' | 'lifestyle') => setContentTypeFilter(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">📝 Article</SelectItem>
              <SelectItem value="event">📅 Event</SelectItem>
              <SelectItem value="poi">📍 POI</SelectItem>
              <SelectItem value="lifestyle">🎨 Lifestyle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <Badge className={getContentTypeColor(post.content_type)}>
                      {post.content_type === 'article' && '📝'}
                      {post.content_type === 'event' && '📅'}
                      {post.content_type === 'poi' && '📍'}
                      {post.content_type === 'lifestyle' && '🎨'}
                      {post.content_type}
                    </Badge>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                    {post.is_featured && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {post.author}</span>
                    <span>Created: {formatDate(post.created_at)}</span>
                    {post.published_at && (
                      <span>Published: {formatDate(post.published_at)}</span>
                    )}
                    {post.content_type === 'event' && post.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.event_date)}
                      </span>
                    )}
                    {(post.content_type === 'event' || post.content_type === 'poi') && post.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(post)}
                    className="hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {post.status === 'draft' && onPublish && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPublish(post)}
                      className="hover:bg-green-50 text-green-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(post.id)}
                    className="hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className={getTagColor(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Show content type specific details */}
              {post.content_type === 'event' && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {post.event_date && (
                    <div>Event Date: {formatDate(post.event_date)}</div>
                  )}
                  {post.time_start && (
                    <div>Time: {post.time_start}{post.time_end && ` - ${post.time_end}`}</div>
                  )}
                  {post.price_range && (
                    <div>Price: {post.price_range}</div>
                  )}
                  {post.ticket_url && (
                    <div>
                      <a href={post.ticket_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Tickets
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {post.content_type === 'poi' && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {post.rating && (
                    <div>Rating: {post.rating}/5</div>
                  )}
                  {post.phone && (
                    <div>Phone: {post.phone}</div>
                  )}
                  {post.website_url && (
                    <div>
                      <a href={post.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {post.content_type === 'lifestyle' && post.activity_type && (
                <div className="mt-2 text-xs text-gray-500">
                  Activity: {post.activity_type}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogPostsList;
