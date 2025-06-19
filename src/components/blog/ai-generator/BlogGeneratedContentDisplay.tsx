
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';

interface BlogGeneratedContentDisplayProps {
  generatedContent: string;
  selectedField: 'title' | 'excerpt' | 'content' | 'tags';
  onApply: () => void;
  onClear: () => void;
}

const BlogGeneratedContentDisplay = ({
  generatedContent,
  selectedField,
  onApply,
  onClear
}: BlogGeneratedContentDisplayProps) => {
  if (!generatedContent) return null;

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case 'title': return 'Title';
      case 'excerpt': return 'Excerpt';
      case 'content': return 'Content';
      case 'tags': return 'Tags';
      default: return field;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          Generated {getFieldDisplayName(selectedField)}
        </CardTitle>
        <CardDescription>
          Review the generated content and apply it to your blog post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectedField === 'content' ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onApply} className="flex-1">
            Apply to {getFieldDisplayName(selectedField)}
          </Button>
          <Button variant="outline" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogGeneratedContentDisplay;
