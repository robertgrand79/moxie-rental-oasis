
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface QuickPromptsProps {
  prompts: string[];
  onPromptSelect: (prompt: string) => void;
  isGenerating: boolean;
}

const QuickPrompts = ({ prompts, onPromptSelect, isGenerating }: QuickPromptsProps) => {
  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No quick prompts available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {prompts.map((prompt, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Using quick prompt:', prompt);
                onPromptSelect(prompt);
              }}
              disabled={isGenerating}
              className="flex-shrink-0"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
