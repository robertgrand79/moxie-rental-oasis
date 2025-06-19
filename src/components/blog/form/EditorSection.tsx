
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import ReactQuillEditor from '@/components/ReactQuillEditor';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
}

interface EditorSectionProps {
  form: UseFormReturn<BlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  isEditing: boolean;
}

const EditorSection = ({ form, content, onContentChange, isEditing }: EditorSectionProps) => {
  const { formState: { errors }, setValue } = form;
  const [isOpen, setIsOpen] = useState(isEditing); // Collapsed for new posts, expanded for editing

  const handleEditorChange = (newContent: string) => {
    console.log('📝 ReactQuill content changed:', newContent.substring(0, 100));
    onContentChange(newContent);
    setValue('content', newContent);
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            type="button"
          >
            <div className="flex items-center space-x-2">
              <Label>Content Editor</Label>
              {content && (
                <span className="text-sm text-muted-foreground">
                  ({content.replace(/<[^>]*>/g, '').length} characters)
                </span>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          <div>
            <div className="border rounded-lg overflow-hidden">
              <ReactQuillEditor
                content={content}
                onChange={handleEditorChange}
                placeholder="Start writing your blog post..."
                className="min-h-[400px]"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EditorSection;
