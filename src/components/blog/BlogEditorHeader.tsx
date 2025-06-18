
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Edit3, Eye, Wand2 } from 'lucide-react';

interface BlogEditorHeaderProps {
  viewMode: 'editor' | 'preview' | 'ai';
  onViewModeChange: (mode: 'editor' | 'preview' | 'ai') => void;
}

const BlogEditorHeader = ({ viewMode, onViewModeChange }: BlogEditorHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>Blog Post Editor</CardTitle>
        <CardDescription>
          Create and preview your blog post with our visual editor and AI assistance
        </CardDescription>
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'editor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('editor')}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Editor
        </Button>
        <Button
          variant={viewMode === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('ai')}
        >
          <Wand2 className="h-4 w-4 mr-1" />
          AI Generator
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('preview')}
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
      </div>
    </div>
  );
};

export default BlogEditorHeader;
