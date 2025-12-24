import { BlogPostSummary } from './types';
import { BlogPost, ContentType } from '@/types/blogPost';
import type { Database } from '@/integrations/supabase/types';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

export const transformToBlogPostSummary = (post: BlogPostRow): BlogPostSummary => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  author: post.author,
  published_at: post.published_at,
  image_url: post.image_url ?? undefined,
  slug: post.slug,
  status: post.status as 'published' | 'draft',
  content_type: (post.content_type as ContentType) || 'article',
  category: post.category ?? undefined,
  is_featured: post.is_featured || false,
  is_active: post.is_active !== false,
  tags: Array.isArray(post.tags) ? post.tags : [],
  created_at: post.created_at,
  updated_at: post.updated_at,
  created_by: post.created_by ?? '',
  organization_id: post.organization_id ?? undefined
});

export const transformToFullBlogPost = (post: BlogPostRow): BlogPost => ({
  id: post.id,
  title: post.title,
  content: post.content,
  excerpt: post.excerpt,
  author: post.author,
  published_at: post.published_at,
  image_url: post.image_url ?? undefined,
  image_credit: post.image_credit ?? undefined,
  slug: post.slug,
  status: post.status as 'published' | 'draft',
  content_type: (post.content_type as ContentType) || 'article',
  category: post.category ?? undefined,
  is_featured: post.is_featured || false,
  is_active: post.is_active !== false,
  tags: Array.isArray(post.tags) ? post.tags : [],
  created_at: post.created_at,
  updated_at: post.updated_at,
  created_by: post.created_by ?? '',
  display_order: post.display_order ?? 0,
  metadata: {},
  // Location fields
  location: post.location ?? undefined,
  latitude: post.latitude ?? undefined,
  longitude: post.longitude ?? undefined,
  address: post.address ?? undefined,
  // Event fields
  event_date: post.event_date ?? undefined,
  end_date: post.end_date ?? undefined,
  time_start: post.time_start ?? undefined,
  time_end: post.time_end ?? undefined,
  ticket_url: post.ticket_url ?? undefined,
  price_range: post.price_range ?? undefined,
  is_recurring: post.is_recurring ?? undefined,
  recurrence_pattern: post.recurrence_pattern ?? undefined,
  // POI fields
  rating: post.rating ?? undefined,
  phone: post.phone ?? undefined,
  website_url: post.website_url ?? undefined,
  // Lifestyle fields
  activity_type: post.activity_type ?? undefined
});
