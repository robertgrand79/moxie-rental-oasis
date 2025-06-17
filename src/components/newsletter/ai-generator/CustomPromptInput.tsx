
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface CustomPromptInputProps {
  selectedField: 'subject' | 'content';
  onFieldChange: (field: 'subject' | 'content') => void;
  aiPrompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const CustomPromptInput = ({
  selectedField,
  onFieldChange,
  aiPrompt,
  onPromptChange,
  onGenerate,
  isGenerating
}: CustomPromptInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Content Field to Generate</Label>
        <select
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value as 'subject' | 'content')}
          className="w-full p-2 border rounded-md mt-1"
        >
          <option value="subject">Subject Line</option>
          <option value="content">Newsletter Content (Designed)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="aiPrompt">Custom AI Prompt</Label>
        <Textarea
          id="aiPrompt"
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what kind of professionally designed newsletter content you want AI to generate..."
          rows={4}
          className="mt-1"
        />
      </div>

      <Button 
        onClick={onGenerate}
        disabled={isGenerating || !aiPrompt.trim()}
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate Designed Content"}
      </Button>
    </div>
  );
};

export default CustomPromptInput;
