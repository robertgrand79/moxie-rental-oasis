
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import TiptapEditor from '@/components/TiptapEditor';
import ImageUploader from '@/components/ImageUploader';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
}

interface BlogEditorFormProps {
  form: UseFormReturn<BlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const BlogEditorForm = ({
  form,
  content,
  onContentChange,
  uploadedImage,
  onImageChange,
  onSubmit,
  isEditing,
  onCancel
}: BlogEditorFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = form;

  const handleEditorChange = (newContent: string) => {
    console.log('📝 TiptapEditor content changed:', newContent);
    onContentChange(newContent);
    setValue('content', newContent);
  };

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter blog post title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register('excerpt')}
              placeholder="Brief description of the post..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="travel, eugene, accommodation"
            />
          </div>

          <div>
            <ImageUploader
              uploadedImage={uploadedImage}
              onImageChange={onImageChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-lg overflow-hidden">
              <TiptapEditor
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
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button 
            type="button"
            onClick={handlePublish}
          >
            {isEditing ? 'Update Post' : 'Publish Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorForm;
