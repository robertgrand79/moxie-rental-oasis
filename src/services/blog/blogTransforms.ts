
import { BlogPostSummary } from './types';
import { BlogPost } from '@/types/blogPost';

export const transformToBlogPostSummary = (post: any): BlogPostSummary => ({
  ...post,
  status: post.status as 'published' | 'draft',
  tags: Array.isArray(post.tags) ? post.tags : []
});

export const transformToFullBlogPost = (post: any): BlogPost => ({
  ...post,
  status: post.status as 'published' | 'draft',
  tags: Array.isArray(post.tags) ? post.tags : []
});
