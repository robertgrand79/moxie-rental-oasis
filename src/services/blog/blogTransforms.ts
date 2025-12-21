import { BlogPostSummary } from './types';
import { BlogPost, ContentType } from '@/types/blogPost';

export const transformToBlogPostSummary = (post: any): BlogPostSummary => ({
  ...post,
  status: post.status as 'published' | 'draft',
  content_type: (post.content_type as ContentType) || 'article',
  is_featured: post.is_featured || false,
  is_active: post.is_active !== false,
  tags: Array.isArray(post.tags) ? post.tags : []
});

export const transformToFullBlogPost = (post: any): BlogPost => ({
  ...post,
  status: post.status as 'published' | 'draft',
  content_type: (post.content_type as ContentType) || 'article',
  is_featured: post.is_featured || false,
  is_active: post.is_active !== false,
  tags: Array.isArray(post.tags) ? post.tags : []
});
