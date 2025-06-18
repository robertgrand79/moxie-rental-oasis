
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Sparkles } from 'lucide-react';
import AutoSaveIndicator from './AutoSaveIndicator';
import { BlogPost } from '@/types/blogPost';

interface BlogEditorHeaderProps {
  viewMode: 'editor' | 'preview' | 'ai';
  onViewModeChange: (mode: 'editor' | 'preview' | 'ai') => void;
  autoSavedPost?: BlogPost | null;
  lastSaved?: Date | null;
}

const BlogEditorHeader = ({ 
  viewMode, 
  onViewModeChange,
  autoSavedPost,
  lastSaved
}: BlogEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'editor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('editor')}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editor
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('preview')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          variant={viewMode === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('ai')}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Content Assistant
        </Button>
      </div>
      
      <AutoSaveIndicator
        lastSaved={lastSaved}
        hasUnsavedChanges={false}
      />
    </div>
  );
};

export default BlogEditorHeader;
