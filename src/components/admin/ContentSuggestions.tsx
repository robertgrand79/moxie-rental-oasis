
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Image, ExternalLink } from 'lucide-react';
import { ContentSuggestion } from '@/hooks/useCrossContentIntegration';

interface ContentSuggestionsProps {
  suggestions: ContentSuggestion[];
  title: string;
  onSuggestionClick?: (suggestion: ContentSuggestion) => void;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  suggestions,
  title,
  onSuggestionClick
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'poi':
        return <MapPin className="h-4 w-4" />;
      case 'lifestyle':
        return <Image className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'poi':
        return 'bg-green-100 text-green-800';
      case 'lifestyle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={`${suggestion.type}-${suggestion.id}`}
            className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-1">
                {getTypeIcon(suggestion.type)}
                <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                  {suggestion.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{suggestion.title}</p>
                {suggestion.location && (
                  <p className="text-xs text-gray-500 truncate">{suggestion.location}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {suggestion.category}
              </Badge>
            </div>
            {onSuggestionClick && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSuggestionClick(suggestion)}
                className="ml-2 flex-shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContentSuggestions;
