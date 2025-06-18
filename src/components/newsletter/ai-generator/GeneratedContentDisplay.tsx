
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface GeneratedContentDisplayProps {
  generatedContent: string;
  selectedField: 'subject' | 'content';
  onApply: () => void;
  onClear: () => void;
}

const GeneratedContentDisplay = ({
  generatedContent,
  selectedField,
  onApply,
  onClear
}: GeneratedContentDisplayProps) => {
  if (!generatedContent) return null;

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <Label>Generated Professional Content (Ready for Editor)</Label>
        <div className="mt-1 p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50 max-h-60 overflow-y-auto">
          {selectedField === 'content' ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          Apply to {selectedField === 'subject' ? 'Subject' : 'Editor'} - Ready to Edit
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
      
      <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          ✨ This content is formatted as clean HTML and will be fully editable in the TiptapEditor 
          after you apply it. No more markdown syntax issues!
        </p>
      </div>
    </div>
  );
};

export default GeneratedContentDisplay;
