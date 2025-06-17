
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface BlogQuickPromptsProps {
  prompts: string[];
  onPromptSelect: (prompt: string) => void;
  isGenerating: boolean;
}

const BlogQuickPrompts = ({ prompts, onPromptSelect, isGenerating }: BlogQuickPromptsProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Blog Ideas</Label>
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onPromptSelect(prompt)}
            disabled={isGenerating}
            className="text-xs text-left justify-start h-auto py-2 px-3 whitespace-normal"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlogQuickPrompts;
