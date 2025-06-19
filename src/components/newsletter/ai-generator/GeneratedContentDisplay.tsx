
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import SecureContentRenderer from '@/components/SecureContentRenderer';
import { isFullHTMLDocument } from '@/utils/htmlContentExtractor';

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

  const isFullDocument = isFullHTMLDocument(generatedContent);

  return (
    <div className="space-y-4 border-t pt-4">
      <div>
        <Label>Generated Professional Content (Ready for Editor)</Label>
        {isFullDocument && (
          <div className="flex items-start space-x-2 mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              This appears to be a full HTML document. When you apply it, only the content will be extracted for the editor.
            </p>
          </div>
        )}
        <div className="mt-2 p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50 max-h-60 overflow-y-auto">
          {selectedField === 'content' ? (
            <div className="max-w-none overflow-hidden">
              <SecureContentRenderer
                content={generatedContent}
                className="prose prose-sm max-w-none break-words"
                maxLength={10000}
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm break-words">{generatedContent}</p>
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
          ✨ This content is formatted as clean HTML and will be fully editable in the editor 
          after you apply it. The content is properly constrained and sanitized for display.
          {isFullDocument && " Full email templates will be applied during newsletter sending."}
        </p>
      </div>
    </div>
  );
};

export default GeneratedContentDisplay;
