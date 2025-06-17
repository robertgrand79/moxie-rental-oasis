
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BlogGeneratedContentDisplayProps {
  generatedContent: string;
  selectedField: 'title' | 'excerpt' | 'content';
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

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <Label>Generated Blog Content</Label>
        <div className="mt-1 p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50 max-h-60 overflow-y-auto">
          <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          Apply to {selectedField === 'title' ? 'Title' : selectedField === 'excerpt' ? 'Excerpt' : 'Content'}
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
      
      <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          ✨ This content will be formatted and styled with your blog's clean, modern design 
          when applied to your blog post.
        </p>
      </div>
    </div>
  );
};

export default BlogGeneratedContentDisplay;
