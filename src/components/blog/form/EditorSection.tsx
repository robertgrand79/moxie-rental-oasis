
import React from 'react';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
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
}

const EditorSection = ({ form, content, onContentChange }: EditorSectionProps) => {
  const { formState: { errors }, setValue } = form;

  const handleEditorChange = (newContent: string) => {
    console.log('📝 ReactQuill content changed:', newContent.substring(0, 100));
    onContentChange(newContent);
    setValue('content', newContent);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">Content</Label>
        <div className="border rounded-lg overflow-hidden">
          <ReactQuillEditor
            content={content}
            onChange={handleEditorChange}
            placeholder="Start writing your blog post..."
            className="min-h-[500px]"
          />
        </div>
        {errors.content && (
          <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
        )}
      </div>
    </div>
  );
};

export default EditorSection;
