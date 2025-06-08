
import { BlogPost, BlogPostDB } from '@/types/blogPost';

export const transformDbPost = (dbPost: BlogPostDB): BlogPost => ({
  ...dbPost,
  status: (dbPost.status === 'published' ? 'published' : 'draft') as 'draft' | 'published'
});
