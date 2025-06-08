
import { BlogPost, BlogPostDB } from '@/types/blogPost';

export const transformDbPost = (dbPost: BlogPostDB): BlogPost => ({
  ...dbPost,
  status: (dbPost.status === 'published' ? 'published' : 'draft') as 'draft' | 'published'
});

export const getTagColor = (tag: string) => {
  if (tag === "Robert & Shelly's Travels") {
    return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 hover:from-indigo-200 hover:to-purple-200';
  }
  
  switch (tag.toLowerCase()) {
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
      return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 hover:from-green-200 hover:to-green-100';
    case 'eco-tourism':
      return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 hover:from-green-200 hover:to-green-100';
    case 'environment':
      return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-200 hover:from-green-200 hover:to-green-100';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 hover:from-gray-200 hover:to-gray-100';
  }
};
