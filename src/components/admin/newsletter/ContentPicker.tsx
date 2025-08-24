import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Calendar, MapPin } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useEugeneEvents } from '@/hooks/useEugeneEvents';
import { usePlaces } from '@/hooks/usePlaces';
import { BlogPost } from '@/types/blogPost';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { Place } from '@/hooks/usePlaces';
import ContentSelectionList from './ContentSelectionList';

export interface SelectedContent {
  blog_posts: string[];
  events: string[];
  places: string[];
  [key: string]: string[];
}

interface ContentPickerProps {
  selectedContent: SelectedContent;
  onContentChange: (content: SelectedContent) => void;
  onImportContent: (contentType: 'blog_posts' | 'events' | 'places', items: (BlogPost | EugeneEvent | Place)[]) => void;
}

const ContentPicker = ({ selectedContent, onContentChange, onImportContent }: ContentPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('blog_posts');
  
  const { blogPosts, loading: blogLoading } = useBlogPosts();
  const { events, isLoading: eventsLoading } = useEugeneEvents();
  const { places, isLoading: placesLoading } = usePlaces();

  const publishedBlogPosts = blogPosts.filter(post => post.status === 'published');
  const activeEvents = events.filter(event => event.is_active);
  const publishedPlaces = places.filter(place => place.status === 'published' && place.is_active);

  const filterContent = <T extends { title?: string; name?: string }>(content: T[], search: string): T[] => {
    if (!search) return content;
    return content.filter(item => {
      const searchableText = (item.title || item.name || '').toLowerCase();
      return searchableText.includes(search.toLowerCase());
    });
  };

  const handleContentSelection = (type: 'blog_posts' | 'events' | 'places', id: string, isSelected: boolean) => {
    const newSelectedContent = { ...selectedContent };
    if (isSelected) {
      newSelectedContent[type] = [...newSelectedContent[type], id];
    } else {
      newSelectedContent[type] = newSelectedContent[type].filter(item => item !== id);
    }
    onContentChange(newSelectedContent);
  };

  const handleImportSelected = () => {
    console.log('🔄 Import Selected clicked');
    console.log('🔄 Active tab:', activeTab);
    console.log('🔄 Selected content:', selectedContent);
    
    const contentType = activeTab as 'blog_posts' | 'events' | 'places';
    const selectedIds = selectedContent[contentType];
    
    console.log('🔄 Content type:', contentType);
    console.log('🔄 Selected IDs:', selectedIds);
    
    let items: (BlogPost | EugeneEvent | Place)[] = [];
    
    if (contentType === 'blog_posts') {
      items = publishedBlogPosts.filter(post => selectedIds.includes(post.slug));
      console.log('🔄 Available blog posts:', publishedBlogPosts.map(p => ({ slug: p.slug, title: p.title })));
    } else if (contentType === 'events') {
      items = activeEvents.filter(event => selectedIds.includes(event.id));
      console.log('🔄 Available events:', activeEvents.map(e => ({ id: e.id, title: e.title })));
    } else if (contentType === 'places') {
      items = publishedPlaces.filter(place => selectedIds.includes(place.id));
      console.log('🔄 Available places:', publishedPlaces.map(p => ({ id: p.id, name: p.name })));
    }
    
    console.log('🔄 Filtered items to import:', items);
    
    if (items.length > 0) {
      console.log('🔄 Calling onImportContent with:', { contentType, items });
      onImportContent(contentType, items);
    } else {
      console.warn('⚠️ No items to import');
    }
  };

  const getSelectedCount = (type: 'blog_posts' | 'events' | 'places') => selectedContent[type].length;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Library</h3>
        <Button 
          onClick={handleImportSelected}
          disabled={getSelectedCount(activeTab as 'blog_posts' | 'events' | 'places') === 0}
          size="sm"
        >
          Import Selected ({getSelectedCount(activeTab as 'blog_posts' | 'events' | 'places')})
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog_posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts ({getSelectedCount('blog_posts')})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events ({getSelectedCount('events')})
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Places ({getSelectedCount('places')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog_posts" className="mt-4">
          <ContentSelectionList
            items={filterContent(publishedBlogPosts, searchTerm)}
            selectedIds={selectedContent.blog_posts}
            onSelectionChange={(id, isSelected) => handleContentSelection('blog_posts', id, isSelected)}
            loading={blogLoading}
            type="blog_posts"
            emptyMessage="No published blog posts found"
          />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <ContentSelectionList
            items={filterContent(activeEvents, searchTerm)}
            selectedIds={selectedContent.events}
            onSelectionChange={(id, isSelected) => handleContentSelection('events', id, isSelected)}
            loading={eventsLoading}
            type="events"
            emptyMessage="No active events found"
          />
        </TabsContent>

        <TabsContent value="places" className="mt-4">
          <ContentSelectionList
            items={filterContent(publishedPlaces, searchTerm)}
            selectedIds={selectedContent.places}
            onSelectionChange={(id, isSelected) => handleContentSelection('places', id, isSelected)}
            loading={placesLoading}
            type="places"
            emptyMessage="No published places found"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPicker;