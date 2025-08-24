import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, FileText, Clock, DollarSign } from 'lucide-react';
import { BlogPost } from '@/types/blogPost';
import { EugeneEvent } from '@/hooks/useEugeneEvents';
import { Place } from '@/hooks/usePlaces';
import { format } from 'date-fns';

interface ContentSelectionListProps {
  items: (BlogPost | EugeneEvent | Place)[];
  selectedIds: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  loading: boolean;
  type: 'blog_posts' | 'events' | 'places';
  emptyMessage: string;
}

const ContentSelectionList = ({ 
  items, 
  selectedIds, 
  onSelectionChange, 
  loading, 
  type, 
  emptyMessage 
}: ContentSelectionListProps) => {
  
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const getItemId = (item: BlogPost | EugeneEvent | Place): string => {
    if (type === 'blog_posts') {
      return (item as BlogPost).slug;
    }
    return item.id;
  };

  const getItemTitle = (item: BlogPost | EugeneEvent | Place): string => {
    if ('title' in item) return item.title;
    return item.name;
  };

  const getItemImage = (item: BlogPost | EugeneEvent | Place): string | undefined => {
    return item.image_url;
  };

  const getItemDescription = (item: BlogPost | EugeneEvent | Place): string => {
    if (type === 'blog_posts') {
      return (item as BlogPost).excerpt;
    }
    if (type === 'events') {
      return (item as EugeneEvent).description || '';
    }
    return (item as Place).description || '';
  };

  const renderItemMetadata = (item: BlogPost | EugeneEvent | Place) => {
    if (type === 'blog_posts') {
      const post = item as BlogPost;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-3 w-3" />
          {post.content_type}
          {post.category && <Badge variant="outline" className="text-xs">{post.category}</Badge>}
        </div>
      );
    }
    
    if (type === 'events') {
      const event = item as EugeneEvent;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(event.event_date), 'MMM d, yyyy')}
          {event.time_start && (
            <>
              <Clock className="h-3 w-3" />
              {event.time_start}
            </>
          )}
          {event.category && <Badge variant="outline" className="text-xs">{event.category}</Badge>}
        </div>
      );
    }
    
    if (type === 'places') {
      const place = item as Place;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {place.category}
          {place.price_level && (
            <>
              <DollarSign className="h-3 w-3" />
              {'$'.repeat(place.price_level)}
            </>
          )}
          {place.rating && <Badge variant="outline" className="text-xs">★ {place.rating}</Badge>}
        </div>
      );
    }
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {items.map((item) => {
        const itemId = getItemId(item);
        const isSelected = selectedIds.includes(itemId);
        
        return (
          <Card key={itemId} className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}>
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectionChange(itemId, checked as boolean)}
                className="mt-1"
              />
              
              {getItemImage(item) && (
                <img
                  src={getItemImage(item)}
                  alt={getItemTitle(item)}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {getItemTitle(item)}
                </h4>
                
                {renderItemMetadata(item)}
                
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {getItemDescription(item)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ContentSelectionList;