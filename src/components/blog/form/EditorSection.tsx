
import React from 'react';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import ReactQuillEditor from '@/components/ReactQuillEditor';
import { ContentType } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface EditorSectionProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  isEditing: boolean;
}

const EditorSection = ({ form, content, onContentChange, isEditing }: EditorSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Content *</Label>
        <div className="mt-2">
          <ReactQuillEditor
            initialValue={content}
            onChange={onContentChange}
            placeholder={isEditing ? "Edit your content..." : "Start writing your content..."}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorSection;
