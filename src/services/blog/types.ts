import { ContentType } from '@/types/blogPost';

// Lightweight blog post type for listings (without full content)
export interface BlogPostSummary {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  published_at: string | null;
  image_url?: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
  content_type: ContentType;
  category?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization_id?: string;
}

export interface PaginatedBlogResponse {
  posts: BlogPostSummary[];
  totalCount: number;
  hasMore: boolean;
}

export interface BlogStats {
  total: number;
  published: number;
  drafts: number;
}
