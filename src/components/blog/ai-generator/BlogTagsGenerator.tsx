
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags, Sparkles } from 'lucide-react';

interface BlogTagsGeneratorProps {
  currentTitle: string;
  currentContent: string;
  onTagsGenerated: (tags: string) => void;
  isGenerating: boolean;
}

const BlogTagsGenerator = ({ 
  currentTitle, 
  currentContent, 
  onTagsGenerated, 
  isGenerating 
}: BlogTagsGeneratorProps) => {
  const [customTopic, setCustomTopic] = useState('');

  const tagSuggestions = [
    'eugene oregon, travel, vacation rental',
    'eugene restaurants, local dining, food guide',
    'eugene attractions, things to do, sightseeing',
    'eugene outdoors, hiking, nature, recreation',
    'eugene events, local culture, entertainment',
    'eugene accommodation, where to stay, lodging',
    'eugene family activities, kids friendly, family fun',
    'eugene shopping, local businesses, retail'
  ];

  const generateTagsFromSuggestion = (suggestion: string) => {
    onTagsGenerated(suggestion);
  };

  const generateCustomTags = () => {
    if (customTopic.trim()) {
      // Create tags based on custom topic
      const baseTags = 'eugene, oregon, travel';
      const customTags = customTopic.toLowerCase()
        .split(/[,\s]+/)
        .filter(tag => tag.trim())
        .slice(0, 5)
        .join(', ');
      
      const combinedTags = `${customTags}, ${baseTags}`;
      onTagsGenerated(combinedTags);
      setCustomTopic('');
    }
  };

  const generateSmartTags = () => {
    // Generate tags based on current title and content
    let smartTags = 'eugene, oregon, travel';
    
    if (currentTitle) {
      if (currentTitle.toLowerCase().includes('restaurant') || currentTitle.toLowerCase().includes('food')) {
        smartTags += ', restaurants, dining, food';
      }
      if (currentTitle.toLowerCase().includes('hike') || currentTitle.toLowerCase().includes('outdoor')) {
        smartTags += ', hiking, outdoors, nature';
      }
      if (currentTitle.toLowerCase().includes('event') || currentTitle.toLowerCase().includes('festival')) {
        smartTags += ', events, entertainment, local culture';
      }
      if (currentTitle.toLowerCase().includes('family') || currentTitle.toLowerCase().includes('kids')) {
        smartTags += ', family friendly, activities, kids';
      }
    }
    
    onTagsGenerated(smartTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tags className="h-5 w-5 mr-2" />
          Smart Tags Generator
        </CardTitle>
        <CardDescription>
          Generate relevant, SEO-friendly tags for your Eugene travel blog post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Smart Tag Generation */}
        <div className="space-y-2">
          <Button 
            onClick={generateSmartTags}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Smart Tags (Based on Title)
          </Button>
        </div>

        {/* Custom Topic Tags */}
        <div className="space-y-2">
          <Label htmlFor="custom-topic">Or Enter Custom Topic</Label>
          <div className="flex gap-2">
            <Input
              id="custom-topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., coffee shops, hiking trails, local events"
              disabled={isGenerating}
            />
            <Button 
              onClick={generateCustomTags}
              disabled={isGenerating || !customTopic.trim()}
              size="sm"
            >
              Generate
            </Button>
          </div>
        </div>

        {/* Quick Tag Suggestions */}
        <div className="space-y-2">
          <Label>Quick Tag Suggestions</Label>
          <div className="grid grid-cols-1 gap-2">
            {tagSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => generateTagsFromSuggestion(suggestion)}
                disabled={isGenerating}
                className="justify-start text-left h-auto p-2 text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogTagsGenerator;
