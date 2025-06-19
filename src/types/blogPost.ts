
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string | null;
  image_url?: string;
  image_credit?: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Database response type that matches Supabase
export interface BlogPostDB {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string | null;
  image_url?: string;
  image_credit?: string;
  tags: string[];
  slug: string;
  status: string; // This comes as string from DB
  created_at: string;
  updated_at: string;
  created_by: string;
}
