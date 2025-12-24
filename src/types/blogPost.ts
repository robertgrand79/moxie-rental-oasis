export type ContentType = 'article' | 'event' | 'poi' | 'lifestyle';
export type BlogPostStatus = 'draft' | 'published';

// Type-specific metadata interfaces (defined early for use in BlogPostMetadata)
// These use index signatures for JSON compatibility
export interface EventMetadata {
  venue?: string;
  organizer?: string;
  capacity?: number;
  registration_required?: boolean;
  age_restriction?: string;
  accessibility_info?: string;
}

export interface POIMetadata {
  hours?: Record<string, string>;
  price_level?: number;
  amenities?: string[];
  accessibility?: string[];
  parking_info?: string;
  payment_methods?: string[];
}

export interface LifestyleMetadata {
  difficulty_level?: 'easy' | 'moderate' | 'challenging' | 'expert';
  duration?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  equipment_needed?: string[];
  group_size?: string;
  fitness_level?: string;
}

// Empty metadata for articles
export type ArticleMetadata = Record<string, never>;

// Union type for blog post metadata based on content type
export type BlogPostMetadata = EventMetadata | POIMetadata | LifestyleMetadata | ArticleMetadata;

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
  status: BlogPostStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // New unified content fields
  content_type: ContentType;
  metadata: BlogPostMetadata;
  category?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  
  // Location fields (for POI and Events)
  location?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  
  // Event-specific fields
  event_date?: string;
  end_date?: string;
  time_start?: string;
  time_end?: string;
  ticket_url?: string;
  price_range?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  
  // POI-specific fields
  rating?: number;
  phone?: string;
  website_url?: string;
  
  // Lifestyle-specific fields
  activity_type?: string;
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
  
  // New unified content fields
  content_type: string;
  metadata: BlogPostMetadata;
  category?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  
  // Location fields
  location?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  
  // Event-specific fields
  event_date?: string;
  end_date?: string;
  time_start?: string;
  time_end?: string;
  ticket_url?: string;
  price_range?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  
  // POI-specific fields
  rating?: number;
  phone?: string;
  website_url?: string;
  
  // Lifestyle-specific fields
  activity_type?: string;
}

// Content type specific interfaces
export interface EventPost extends BlogPost {
  content_type: 'event';
  metadata: EventMetadata;
  event_date: string;
  location: string;
}

export interface POIPost extends BlogPost {
  content_type: 'poi';
  metadata: POIMetadata;
  location: string;
  latitude: number;
  longitude: number;
}

export interface LifestylePost extends BlogPost {
  content_type: 'lifestyle';
  metadata: LifestyleMetadata;
  activity_type: string;
}

export interface ArticlePost extends BlogPost {
  content_type: 'article';
}

// Union type for all content types
export type UnifiedContent = EventPost | POIPost | LifestylePost | ArticlePost;

// Helper type guards
export const isEventPost = (post: BlogPost): post is EventPost => post.content_type === 'event';
export const isPOIPost = (post: BlogPost): post is POIPost => post.content_type === 'poi';
export const isLifestylePost = (post: BlogPost): post is LifestylePost => post.content_type === 'lifestyle';
export const isArticlePost = (post: BlogPost): post is ArticlePost => post.content_type === 'article';

// Content type display names
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  event: 'Event',
  poi: 'Point of Interest',
  lifestyle: 'Lifestyle'
};

// Content type categories for each type
export const CONTENT_TYPE_CATEGORIES: Record<ContentType, string[]> = {
  article: ['Travel', 'Tips', 'Destinations', 'Luxury', 'Sustainability'],
  event: ['Music', 'Arts', 'Food', 'Sports', 'Festivals', 'Community'],
  poi: ['Restaurants', 'Attractions', 'Shopping', 'Entertainment', 'Services', 'Outdoors'],
  lifestyle: ['Outdoor Activities', 'Cultural Experiences', 'Food & Drink', 'Wellness', 'Arts & Crafts', 'Adventure']
};
