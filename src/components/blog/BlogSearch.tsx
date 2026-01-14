
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { BlogPost } from '@/hooks/useBlogPosts';

interface BlogSearchProps {
  posts: BlogPost[];
  onFilteredPosts: (posts: BlogPost[]) => void;
}

const BlogSearch = ({ posts, onFilteredPosts }: BlogSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags || []))
  ).sort();

  const handleSearch = () => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        (post.title?.toLowerCase() || '').includes(lowerSearch) ||
        (post.excerpt?.toLowerCase() || '').includes(lowerSearch) ||
        ((post as any).content?.toLowerCase() || '').includes(lowerSearch)
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags?.includes(selectedTag)
      );
    }

    onFilteredPosts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    onFilteredPosts(posts);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedTag, posts]);

  const getTagColor = (tag: string) => {
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
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200 hover:from-gray-200 hover:to-gray-100';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/90 backdrop-blur-xl border-white/30 focus:border-gradient-from"
          />
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedTag) && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
                  selectedTag === tag 
                    ? 'bg-gradient-to-r from-gradient-from to-gradient-accent-from text-white border-transparent' 
                    : getTagColor(tag)
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSearch;
