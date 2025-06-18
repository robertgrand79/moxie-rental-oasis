
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface BlogGenerationActionsProps {
  onGenerateCompleteBlogPost: () => Promise<void>;
  isGenerating: boolean;
}

const BlogGenerationActions = ({ 
  onGenerateCompleteBlogPost, 
  isGenerating 
}: BlogGenerationActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onGenerateCompleteBlogPost}
        disabled={isGenerating}
        className="flex-1"
        size="lg"
        variant="outline"
      >
        <Zap className="h-4 w-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate Content Only"}
      </Button>
    </div>
  );
};

export default BlogGenerationActions;
