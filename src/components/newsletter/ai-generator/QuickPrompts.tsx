
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface QuickPromptsProps {
  prompts: string[];
  onPromptSelect: (prompt: string) => void;
  isGenerating: boolean;
}

const QuickPrompts = ({ prompts, onPromptSelect, isGenerating }: QuickPromptsProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Design Ideas</Label>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onPromptSelect(prompt)}
            disabled={isGenerating}
            className="text-xs"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
