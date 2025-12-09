
import { BlogPost, BlogPostDB, ContentType, CONTENT_TYPE_LABELS } from '@/types/blogPost';

export const transformDbPost = (dbPost: BlogPostDB): BlogPost => ({
  ...dbPost,
  status: (dbPost.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
  content_type: dbPost.content_type as ContentType
});

export const getTagColor = (tag: string) => {
  const tagLower = tag.toLowerCase();
  
  switch (tagLower) {
    case 'travel':
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-blue-100';
    case 'destinations':
      return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100';
    case 'luxury':
      return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-purple-100';
    case 'tips':
      return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200 hover:from-amber-200 hover:to-amber-100';
    case 'vacation rentals':
      return 'bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 border-teal-200 hover:from-teal-200 hover:to-teal-100';
    case 'sustainability':
    case 'eco-tourism':
    case 'environment':
      return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 hover:from-green-200 hover:to-green-100';
    case 'local':
    case 'local guides':
      return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200 hover:from-orange-200 hover:to-orange-100';
    case 'featured':
      return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 hover:from-indigo-200 hover:to-purple-200';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 hover:from-gray-200 hover:to-gray-100';
  }
};

export const getContentTypeColor = (contentType: ContentType) => {
  switch (contentType) {
    case 'article':
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200';
    case 'event':
      return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200';
    case 'poi':
      return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200';
    case 'lifestyle':
      return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200';
  }
};

export const getContentTypeLabel = (contentType: ContentType): string => {
  return CONTENT_TYPE_LABELS[contentType] || 'Unknown';
};

// Extract snippet from full blog post content for display in cards
export const extractContentSnippet = (content: string, maxLength: number = 150): string => {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleanText = textContent.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last complete word within the limit
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

// Generate SEO-friendly slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Format date for display
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for display
export const formatDisplayTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Handle different time formats
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }
  
  return timeString;
};

// Get the appropriate routing path for different content types
export const getContentPath = (post: BlogPost): string => {
  switch (post.content_type) {
    case 'article':
      return `/blog/${post.slug}`;
    case 'event':
      return `/blog/${post.slug}`; // Events will also be full blog posts
    case 'poi':
      return `/blog/${post.slug}`;
    case 'lifestyle':
      return `/blog/${post.slug}`;
    default:
      return `/blog/${post.slug}`;
  }
};
