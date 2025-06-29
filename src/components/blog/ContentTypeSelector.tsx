
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentType, CONTENT_TYPE_LABELS } from '@/types/blogPost';
import { getContentTypeColor } from '@/utils/blogPostUtils';
import { Badge } from '@/components/ui/badge';

interface ContentTypeSelectorProps {
  value: ContentType;
  onValueChange: (value: ContentType) => void;
  disabled?: boolean;
}

const ContentTypeSelector = ({ value, onValueChange, disabled = false }: ContentTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="content-type" className="text-sm font-medium">
        Content Type
      </Label>
      <div className="flex items-center gap-3">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="article">
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span>Article</span>
              </div>
            </SelectItem>
            <SelectItem value="event">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Event</span>
              </div>
            </SelectItem>
            <SelectItem value="poi">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Point of Interest</span>
              </div>
            </SelectItem>
            <SelectItem value="lifestyle">
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Lifestyle</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Badge className={getContentTypeColor(value)}>
          {CONTENT_TYPE_LABELS[value]}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {value === 'article' && 'Traditional blog article with rich content'}
        {value === 'event' && 'Event with date, time, location, and ticketing information'}
        {value === 'poi' && 'Point of interest with location, rating, and contact details'}
        {value === 'lifestyle' && 'Lifestyle content with activity type and difficulty level'}
      </p>
    </div>
  );
};

export default ContentTypeSelector;
