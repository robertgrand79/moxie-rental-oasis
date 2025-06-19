
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

interface BlogCustomPromptInputProps {
  selectedField: 'title' | 'excerpt' | 'content' | 'tags';
  onFieldChange: (field: 'title' | 'excerpt' | 'content' | 'tags') => void;
  aiPrompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const BlogCustomPromptInput = ({
  selectedField,
  onFieldChange,
  aiPrompt,
  onPromptChange,
  onGenerate,
  isGenerating
}: BlogCustomPromptInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field-select">Generate Content For</Label>
        <Select value={selectedField} onValueChange={onFieldChange}>
          <SelectTrigger id="field-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="excerpt">Excerpt</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="tags">Tags</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="custom-prompt">Custom Prompt</Label>
        <Textarea
          id="custom-prompt"
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={`Enter your custom prompt for generating ${selectedField}...`}
          rows={4}
          disabled={isGenerating}
        />
      </div>

      <Button 
        onClick={onGenerate}
        disabled={isGenerating || !aiPrompt.trim()}
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {isGenerating ? 'Generating...' : `Generate ${selectedField}`}
      </Button>
    </div>
  );
};

export default BlogCustomPromptInput;
