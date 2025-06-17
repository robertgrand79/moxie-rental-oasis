
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface BlogCustomPromptInputProps {
  selectedField: 'title' | 'excerpt' | 'content';
  onFieldChange: (field: 'title' | 'excerpt' | 'content') => void;
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
        <Label>Content Field to Generate</Label>
        <select
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value as 'title' | 'excerpt' | 'content')}
          className="w-full p-2 border rounded-md mt-1"
        >
          <option value="title">Blog Post Title</option>
          <option value="excerpt">Blog Post Excerpt</option>
          <option value="content">Blog Post Content</option>
        </select>
      </div>

      <div>
        <Label htmlFor="blogAiPrompt">Custom AI Prompt</Label>
        <Textarea
          id="blogAiPrompt"
          value={aiPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what kind of blog post content you want AI to generate..."
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
        {isGenerating ? "Generating..." : "Generate Blog Content"}
      </Button>
    </div>
  );
};

export default BlogCustomPromptInput;
